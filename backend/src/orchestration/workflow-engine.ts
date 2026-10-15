import {
  Workflow,
  WorkflowTask,
  AgentType,
  PlanTask
} from '@flowpilot/shared';
import { db } from '../database/store.js';
import { logger } from '../logging/logger.js';
import { geminiClient } from '../ai/gemini.client.js';
import { toolRegistry } from '../tools/registry.js';
import { validateDependencyGraph } from './dependency-validator.js';
import { workflowEvents } from './events.js';

class WorkflowEngine {
  private activeExecutions: Set<string> = new Set();

  /**
   * Generates a structured execution plan for a workflow
   */
  async planWorkflow(workspaceId: string, workflowId: string): Promise<Workflow> {
    const wf = db.getWorkflowById(workspaceId, workflowId);
    if (!wf) throw new Error(`Workflow ${workflowId} not found`);

    logger.info(`Starting planning phase for workflow [${wf.id}]: "${wf.title}"`);
    workflowEvents.emitWorkflowEvent(workflowId, 'workflow_planning_started', { workflowId });

    // Gather business context for planning
    const orders = db.getOrders(workspaceId);
    const inventory = db.getInventory(workspaceId);
    const suppliers = db.getSuppliers(workspaceId);

    const contextData = `Orders in system: ${orders.length} (Delayed: ${orders.filter(o => o.status === 'delayed').map(o => o.order_number).join(', ') || 'None'})
Inventory items: ${inventory.length} (Low stock: ${inventory.filter(i => i.quantity <= i.reorder_threshold).map(i => `${i.sku} (${i.quantity}/${i.reorder_threshold})`).join(', ') || 'None'})
Suppliers: ${suppliers.map(s => `${s.name} [status: ${s.status}]`).join('; ')}`;

    // Generate plan via Gemini or deterministic engine
    const plan = await geminiClient.generateWorkflowPlan({
      title: wf.title,
      objective: wf.objective,
      category: wf.category,
      priority: wf.priority,
      constraints: (wf as any).constraints || [],
      contextData
    });

    // Validate Task Graph
    const nodes = plan.tasks.map(t => ({
      key: t.task_key,
      dependencies: t.dependencies
    }));

    const graphValidation = validateDependencyGraph(nodes);
    if (!graphValidation.valid) {
      const err = graphValidation.error || 'Invalid dependency graph';
      logger.error(`Plan dependency graph validation failed: ${err}`);
      db.updateWorkflow(workspaceId, workflowId, {
        error_summary: err,
        status: 'failed'
      });
      throw new Error(`Plan validation failed: ${err}`);
    }

    // Persist plan in workflow
    const updatedWf = db.updateWorkflow(workspaceId, workflowId, {
      plan,
      status: 'planned'
    })!;

    // Create workflow_tasks and task_dependencies
    const agentMap = new Map(db.getAgents().map(a => [a.agent_type, a.id]));
    const keyToTaskId = new Map<string, string>();

    for (const planTask of plan.tasks) {
      const agentId = agentMap.get(planTask.agent as AgentType) || null;
      const createdTask = db.createTask({
        workflow_id: workflowId,
        agent_id: agentId,
        title: planTask.title,
        description: planTask.description,
        status: 'pending',
        priority: planTask.priority,
        input_data: {
          task_key: planTask.task_key,
          required_inputs: planTask.required_inputs,
          approval_required: planTask.approval_required
        },
        output_data: null,
        tool_names: planTask.proposed_tools,
        completion_criteria: { criteria: planTask.completion_criteria },
        attempt_count: 0,
        max_attempts: 3,
        idempotency_key: `${workflowId}_${planTask.task_key}`,
        started_at: null,
        completed_at: null,
        error_summary: null
      });
      keyToTaskId.set(planTask.task_key, createdTask.id);
    }

    // Insert task dependencies
    for (const planTask of plan.tasks) {
      const currentTaskId = keyToTaskId.get(planTask.task_key)!;
      for (const depKey of planTask.dependencies) {
        const depTaskId = keyToTaskId.get(depKey);
        if (depTaskId) {
          db.addDependency(currentTaskId, depTaskId);
        }
      }
    }

    db.logActivity(workspaceId, {
      workflow_id: workflowId,
      task_id: null,
      actor_type: 'orchestrator',
      actor_id: 'orchestrator',
      action: 'workflow_planned',
      outcome: 'success',
      metadata: { taskCount: plan.tasks.length, planSummary: plan.summary }
    });

    workflowEvents.emitWorkflowEvent(workflowId, 'workflow_planned', {
      workflowId,
      tasksCount: plan.tasks.length
    });

    return updatedWf;
  }

  /**
   * Starts executing a planned or paused workflow
   */
  async startWorkflow(workspaceId: string, workflowId: string): Promise<Workflow> {
    const wf = db.getWorkflowById(workspaceId, workflowId);
    if (!wf) throw new Error(`Workflow ${workflowId} not found`);

    if (wf.status === 'draft') {
      await this.planWorkflow(workspaceId, workflowId);
    }

    const updatedWf = db.updateWorkflow(workspaceId, workflowId, {
      status: 'running',
      started_at: wf.started_at || new Date().toISOString()
    })!;

    db.logActivity(workspaceId, {
      workflow_id: workflowId,
      task_id: null,
      actor_type: 'orchestrator',
      actor_id: 'orchestrator',
      action: 'workflow_started',
      outcome: 'success',
      metadata: { title: wf.title }
    });

    workflowEvents.emitWorkflowEvent(workflowId, 'workflow_started', { workflowId });

    // Trigger execution loop asynchronously
    this.runExecutionLoop(workspaceId, workflowId).catch(err => {
      logger.error(`Execution loop error on workflow [${workflowId}]: ${err.message}`);
    });

    return updatedWf;
  }

  async pauseWorkflow(workspaceId: string, workflowId: string): Promise<Workflow> {
    const updated = db.updateWorkflow(workspaceId, workflowId, { status: 'paused' });
    workflowEvents.emitWorkflowEvent(workflowId, 'workflow_paused', { workflowId });
    return updated!;
  }

  async resumeWorkflow(workspaceId: string, workflowId: string): Promise<Workflow> {
    const updated = db.updateWorkflow(workspaceId, workflowId, { status: 'running' })!;
    workflowEvents.emitWorkflowEvent(workflowId, 'workflow_resumed', { workflowId });
    this.runExecutionLoop(workspaceId, workflowId).catch(err => {
      logger.error(`Resume execution loop error on workflow [${workflowId}]: ${err.message}`);
    });
    return updated;
  }

  async cancelWorkflow(workspaceId: string, workflowId: string): Promise<Workflow> {
    const updated = db.updateWorkflow(workspaceId, workflowId, {
      status: 'cancelled',
      completed_at: new Date().toISOString()
    })!;
    this.activeExecutions.delete(workflowId);
    workflowEvents.emitWorkflowEvent(workflowId, 'workflow_cancelled', { workflowId });
    return updated;
  }

  /**
   * Main asynchronous execution loop
   */
  private async runExecutionLoop(workspaceId: string, workflowId: string) {
    if (this.activeExecutions.has(workflowId)) {
      logger.info(`Workflow [${workflowId}] already has active execution loop.`);
      return;
    }

    this.activeExecutions.add(workflowId);
    try {
      while (true) {
        const wf = db.getWorkflowById(workspaceId, workflowId);
        if (!wf || wf.status !== 'running') {
          logger.info(`Workflow [${workflowId}] execution loop exited (status: ${wf?.status}).`);
          break;
        }

        const tasks = db.getTasks(workspaceId, workflowId);
        const taskMap = new Map(tasks.map(t => [t.id, t]));

        // Check if all tasks are completed
        const isAllDone = tasks.every(t => t.status === 'completed');
        if (isAllDone && tasks.length > 0) {
          await this.completeWorkflow(workspaceId, workflowId);
          break;
        }

        // Check if any task failed max retries
        const hasFatalFailure = tasks.some(t => t.status === 'failed' && t.attempt_count >= t.max_attempts);
        if (hasFatalFailure) {
          db.updateWorkflow(workspaceId, workflowId, {
            status: 'failed',
            completed_at: new Date().toISOString(),
            error_summary: 'One or more tasks exceeded retry limit and failed.'
          });
          workflowEvents.emitWorkflowEvent(workflowId, 'workflow_failed', { workflowId });
          break;
        }

        // Check if any task is awaiting approval
        const awaitingApprovalTask = tasks.find(t => t.status === 'awaiting_approval');
        if (awaitingApprovalTask) {
          db.updateWorkflow(workspaceId, workflowId, { status: 'awaiting_approval' });
          workflowEvents.emitWorkflowEvent(workflowId, 'workflow_awaiting_approval', {
            workflowId,
            taskId: awaitingApprovalTask.id
          });
          break; // Stop loop until approved
        }

        // Identify ready tasks: status === 'pending' or 'ready', and all dependencies are 'completed'
        const runnableTasks: WorkflowTask[] = [];

        for (const task of tasks) {
          if (task.status === 'pending' || task.status === 'ready') {
            const deps = db.getDependencies(task.id);
            const allDepsSatisfied = deps.every(d => {
              const depTask = taskMap.get(d.depends_on_task_id);
              return depTask && depTask.status === 'completed';
            });

            const anyDepBlocked = deps.some(d => {
              const depTask = taskMap.get(d.depends_on_task_id);
              return depTask && (depTask.status === 'blocked' || (depTask.status === 'failed' && depTask.attempt_count >= depTask.max_attempts));
            });

            if (anyDepBlocked) {
              db.updateTask(workspaceId, task.id, {
                status: 'blocked',
                error_summary: 'Blocked because prerequisite dependency failed.'
              });
              workflowEvents.emitWorkflowEvent(workflowId, 'task_blocked', { taskId: task.id });
            } else if (allDepsSatisfied) {
              runnableTasks.push(task);
            }
          }
        }

        if (runnableTasks.length === 0) {
          // If tasks are still running, wait a tick
          const runningCount = tasks.filter(t => t.status === 'running').length;
          if (runningCount === 0) {
            // Check if any blocked tasks exist
            const blockedTasks = tasks.filter(t => t.status === 'blocked');
            if (blockedTasks.length > 0) {
              db.updateWorkflow(workspaceId, workflowId, {
                status: 'needs_attention',
                error_summary: `${blockedTasks.length} task(s) are blocked.`
              });
            }
            break;
          }
          await new Promise(res => setTimeout(res, 500));
          continue;
        }

        // Execute eligible tasks (independent tasks run concurrently)
        await Promise.all(
          runnableTasks.map(t => this.executeTask(workspaceId, workflowId, t))
        );

        // Pause briefly before next cycle
        await new Promise(res => setTimeout(res, 300));
      }
    } finally {
      this.activeExecutions.delete(workflowId);
    }
  }

  /**
   * Executes a single task with its assigned agent and tool executions
   */
  private async executeTask(workspaceId: string, workflowId: string, task: WorkflowTask) {
    const agent = task.agent_id ? db.getAgentById(task.agent_id) : null;
    const agentType: AgentType = (agent?.agent_type as AgentType) || 'operations';

    logger.info(`Executing task [${task.title}] via agent [${agentType}]`);
    db.updateTask(workspaceId, task.id, {
      status: 'running',
      started_at: new Date().toISOString(),
      attempt_count: task.attempt_count + 1
    });

    const executionRecord = db.createAgentExecution({
      workflow_id: workflowId,
      task_id: task.id,
      agent_id: task.agent_id || '00000000-0000-0000-0000-000000000000',
      status: 'running',
      input_summary: `Executing: ${task.title}`,
      output_data: null,
      error_summary: null,
      started_at: new Date().toISOString(),
      completed_at: null
    });

    workflowEvents.emitWorkflowEvent(workflowId, 'task_started', {
      taskId: task.id,
      agentType,
      title: task.title
    });

    try {
      let outputData: any = {};
      let requiresHumanApproval = false;

      if (agentType === 'business_analyst') {
        const orders = db.getOrders(workspaceId);
        const inventory = db.getInventory(workspaceId);
        const suppliers = db.getSuppliers(workspaceId);

        // Execute permitted read tools
        await toolRegistry.executeTool('read_order', { status: 'delayed' }, { workspaceId, workflowId, taskId: task.id, agentType });
        await toolRegistry.executeTool('read_inventory', { lowStockOnly: true }, { workspaceId, workflowId, taskId: task.id, agentType });

        const summary = `Delayed orders: ${orders.filter(o => o.status === 'delayed').map(o => `${o.order_number} (${o.notes})`).join('; ') || 'None'}
Inventory count: ${inventory.map(i => `${i.sku}: qty=${i.quantity}, threshold=${i.reorder_threshold}`).join('; ')}
Suppliers: ${suppliers.map(s => `${s.name}: ${s.status}`).join('; ')}`;

        outputData = await geminiClient.analyzeBusinessProblem({
          objective: task.description,
          recordsSummary: summary
        });
      } else if (agentType === 'operations') {
        const inventory = db.getInventory(workspaceId);
        const lowStock = inventory.filter(i => i.quantity <= i.reorder_threshold);

        outputData = await geminiClient.executeOperationsAgent({
          taskTitle: task.title,
          taskDescription: task.description,
          context: { lowStockCount: lowStock.length, lowStockItems: lowStock }
        });

        // Execute proposed tool calls
        for (const toolCall of outputData.tool_calls || []) {
          const toolRes = await toolRegistry.executeTool(
            toolCall.tool_name,
            toolCall.arguments,
            { workspaceId, workflowId, taskId: task.id, agentType }
          );

          if (toolCall.tool_name === 'request_approval') {
            requiresHumanApproval = true;
          }
        }
      } else if (agentType === 'customer_communication') {
        const orders = db.getOrders(workspaceId);
        const delayedOrder = orders.find(o => o.status === 'delayed') || orders[0];
        const customers = db.getCustomers(workspaceId);
        const customer = (delayedOrder && delayedOrder.customer_id)
          ? customers.find(c => c.id === delayedOrder.customer_id)
          : customers[0];

        outputData = await geminiClient.prepareCustomerCommunication({
          customerName: customer?.name || 'Valued Customer',
          customerEmail: customer?.email || 'customer@example.com',
          orderNumber: delayedOrder?.order_number || 'ORD-2025-089',
          orderNotes: delayedOrder?.notes || 'Shipment delay due to supplier component shortage'
        });

        // Draft message tool call
        await toolRegistry.executeTool('draft_customer_communication', {
          recipient: outputData.recipient_reference,
          subject: outputData.subject,
          message: outputData.message
        }, { workspaceId, workflowId, taskId: task.id, agentType });

        if (outputData.requires_approval) {
          // Gate customer communication behind approval
          await toolRegistry.executeTool('request_approval', {
            actionType: 'send_customer_email',
            actionPayload: {
              recipient: outputData.recipient_reference,
              subject: outputData.subject,
              message: outputData.message
            },
            reason: 'Customer-facing delay notification requires human review and confirmation before delivery.',
            riskLevel: 'medium'
          }, { workspaceId, workflowId, taskId: task.id, agentType });

          requiresHumanApproval = true;
        }
      } else if (agentType === 'quality_risk') {
        const tasksSummary = db.getTasks(workspaceId, workflowId);
        const executions = db.getToolExecutions(workspaceId, workflowId);

        outputData = await geminiClient.reviewQualityAndRisk({
          objective: task.description,
          tasksSummary: tasksSummary.map(t => ({ title: t.title, status: t.status })),
          executionHistory: executions.map(e => ({ tool: e.tool_name, status: e.status }))
        });
      } else {
        // Generic fallback for any other task
        outputData = { status: 'completed', message: `Executed by ${agentType}` };
      }

      if (requiresHumanApproval) {
        db.updateTask(workspaceId, task.id, {
          status: 'awaiting_approval',
          output_data: outputData
        });
        db.updateAgentExecution(executionRecord.id, {
          status: 'completed',
          output_data: outputData,
          completed_at: new Date().toISOString()
        });
        workflowEvents.emitWorkflowEvent(workflowId, 'task_awaiting_approval', { taskId: task.id });
      } else {
        db.updateTask(workspaceId, task.id, {
          status: 'completed',
          output_data: outputData,
          completed_at: new Date().toISOString()
        });
        db.updateAgentExecution(executionRecord.id, {
          status: 'completed',
          output_data: outputData,
          completed_at: new Date().toISOString()
        });
        workflowEvents.emitWorkflowEvent(workflowId, 'task_completed', {
          taskId: task.id,
          output: outputData
        });
      }
    } catch (err: any) {
      logger.error(`Task execution error on [${task.id}]: ${err.message}`);
      const shouldRetry = task.attempt_count + 1 < task.max_attempts;

      db.updateTask(workspaceId, task.id, {
        status: shouldRetry ? 'ready' : 'failed',
        error_summary: err.message
      });

      db.updateAgentExecution(executionRecord.id, {
        status: 'failed',
        error_summary: err.message,
        completed_at: new Date().toISOString()
      });

      workflowEvents.emitWorkflowEvent(workflowId, 'task_failed', {
        taskId: task.id,
        error: err.message,
        willRetry: shouldRetry
      });
    }
  }

  /**
   * Finalizes the workflow and generates the final completion report
   */
  private async completeWorkflow(workspaceId: string, workflowId: string) {
    const wf = db.getWorkflowById(workspaceId, workflowId)!;
    const tasks = db.getTasks(workspaceId, workflowId);
    const approvals = db.getApprovals(workspaceId).filter(a => a.workflow_id === workflowId);
    const toolExecs = db.getToolExecutions(workspaceId, workflowId);

    const completedTasks = tasks.filter(t => t.status === 'completed').map(t => t.title);
    const pendingTasks = tasks.filter(t => t.status === 'pending' || t.status === 'ready').map(t => t.title);
    const failedTasks = tasks.filter(t => t.status === 'failed').map(t => t.title);
    const actionsExecuted = toolExecs.map(te => `${te.tool_name} (${te.status})`);

    const finalReport = await geminiClient.generateFinalReport({
      objective: wf.objective,
      completedTasks,
      pendingTasks,
      failedTasks,
      approvalsCount: approvals.length,
      actionsExecuted
    });

    db.updateWorkflow(workspaceId, workflowId, {
      status: 'completed',
      final_report: finalReport,
      completed_at: new Date().toISOString()
    });

    db.logActivity(workspaceId, {
      workflow_id: workflowId,
      task_id: null,
      actor_type: 'orchestrator',
      actor_id: 'orchestrator',
      action: 'workflow_completed',
      outcome: 'success',
      metadata: { finalReport }
    });

    db.createNotification(workspaceId, {
      user_id: null,
      workflow_id: workflowId,
      title: `Workflow Completed: ${wf.title}`,
      message: `All multi-agent tasks verified and completed. Final report generated.`
    });

    workflowEvents.emitWorkflowEvent(workflowId, 'workflow_completed', {
      workflowId,
      finalReport
    });
  }
}

export const workflowEngine = new WorkflowEngine();
