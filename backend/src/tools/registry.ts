import { ToolName, ToolExecution } from '@flowpilot/shared';
import { db } from '../database/store.js';
import { logger } from '../logging/logger.js';

export interface ToolContext {
  workspaceId: string;
  workflowId: string;
  taskId?: string;
  agentType?: string;
}

export interface ToolDefinition {
  name: ToolName;
  description: string;
  parametersSchema: Record<string, string>;
  execute: (args: any, ctx: ToolContext) => Promise<{ success: boolean; data?: any; error?: string }>;
}

export class ToolRegistry {
  private tools: Map<ToolName, ToolDefinition> = new Map();

  constructor() {
    this.registerCoreTools();
  }

  public registerTool(tool: ToolDefinition) {
    this.tools.set(tool.name, tool);
  }

  public getTool(name: ToolName): ToolDefinition | undefined {
    return this.tools.get(name);
  }

  public getRegisteredToolNames(): ToolName[] {
    return Array.from(this.tools.keys());
  }

  public async executeTool(
    name: ToolName,
    args: any,
    ctx: ToolContext
  ): Promise<{ success: boolean; data?: any; error?: string; executionId: string }> {
    const tool = this.tools.get(name);
    if (!tool) {
      logger.error(`Attempted to execute unregistered tool: ${name}`);
      const failedExec = db.createToolExecution(ctx.workspaceId, {
        workflow_id: ctx.workflowId,
        task_id: ctx.taskId || null,
        tool_name: name,
        input_summary: args,
        output_summary: null,
        status: 'denied',
        idempotency_key: null,
        error_summary: `Unregistered tool: ${name}`,
        started_at: new Date().toISOString(),
        completed_at: new Date().toISOString()
      });
      return { success: false, error: `Tool ${name} is not permitted or registered.`, executionId: failedExec.id };
    }

    const startTime = new Date().toISOString();
    try {
      logger.info(`Executing tool [${name}] for workflow [${ctx.workflowId}]`, { args });
      const result = await tool.execute(args, ctx);

      const toolExec = db.createToolExecution(ctx.workspaceId, {
        workflow_id: ctx.workflowId,
        task_id: ctx.taskId || null,
        tool_name: name,
        input_summary: args,
        output_summary: result.data || null,
        status: result.success ? 'succeeded' : 'failed',
        idempotency_key: null,
        error_summary: result.error || null,
        started_at: startTime,
        completed_at: new Date().toISOString()
      });

      db.logActivity(ctx.workspaceId, {
        workflow_id: ctx.workflowId,
        task_id: ctx.taskId || null,
        actor_type: ctx.agentType || 'agent',
        actor_id: ctx.agentType || 'tool_registry',
        action: `tool_executed:${name}`,
        outcome: result.success ? 'success' : 'failure',
        metadata: { input: args, result: result.data, error: result.error }
      });

      return { ...result, executionId: toolExec.id };
    } catch (err: any) {
      logger.error(`Tool execution error for [${name}]: ${err.message}`);
      const failedExec = db.createToolExecution(ctx.workspaceId, {
        workflow_id: ctx.workflowId,
        task_id: ctx.taskId || null,
        tool_name: name,
        input_summary: args,
        output_summary: null,
        status: 'failed',
        idempotency_key: null,
        error_summary: err.message,
        started_at: startTime,
        completed_at: new Date().toISOString()
      });
      return { success: false, error: err.message, executionId: failedExec.id };
    }
  }

  private registerCoreTools() {
    // 1. read_order
    this.registerTool({
      name: 'read_order',
      description: 'Read order details and items by order number or ID, or list delayed orders.',
      parametersSchema: { orderNumber: 'optional string', status: 'optional string' },
      execute: async (args, ctx) => {
        const orders = db.getOrders(ctx.workspaceId);
        if (args?.orderNumber) {
          const match = orders.find(o => o.order_number.toLowerCase() === String(args.orderNumber).toLowerCase());
          if (!match) return { success: false, error: `Order ${args.orderNumber} not found.` };
          const items = db.getOrderItems(match.id);
          return { success: true, data: { order: match, items } };
        }
        if (args?.status) {
          const filtered = orders.filter(o => o.status === args.status);
          return { success: true, data: { count: filtered.length, orders: filtered } };
        }
        return { success: true, data: { count: orders.length, orders } };
      }
    });

    // 2. read_inventory
    this.registerTool({
      name: 'read_inventory',
      description: 'Read inventory items, quantities, and reorder thresholds. Can filter by low stock or SKU.',
      parametersSchema: { sku: 'optional string', lowStockOnly: 'optional boolean' },
      execute: async (args, ctx) => {
        const items = db.getInventory(ctx.workspaceId);
        if (args?.sku) {
          const item = items.find(i => i.sku.toLowerCase() === String(args.sku).toLowerCase());
          if (!item) return { success: false, error: `SKU ${args.sku} not found.` };
          return { success: true, data: { item } };
        }
        if (args?.lowStockOnly) {
          const low = items.filter(i => i.quantity <= i.reorder_threshold);
          return { success: true, data: { count: low.length, items: low } };
        }
        return { success: true, data: { count: items.length, items } };
      }
    });

    // 3. search_customers
    this.registerTool({
      name: 'search_customers',
      description: 'Search customers by name, email, or query string.',
      parametersSchema: { query: 'optional string', customerId: 'optional string' },
      execute: async (args, ctx) => {
        const customers = db.getCustomers(ctx.workspaceId);
        if (args?.customerId) {
          const cust = customers.find(c => c.id === args.customerId);
          return cust ? { success: true, data: cust } : { success: false, error: 'Customer not found' };
        }
        if (args?.query) {
          const q = String(args.query).toLowerCase();
          const matches = customers.filter(c => c.name.toLowerCase().includes(q) || (c.email && c.email.toLowerCase().includes(q)));
          return { success: true, data: { count: matches.length, customers: matches } };
        }
        return { success: true, data: { count: customers.length, customers } };
      }
    });

    // 4. read_supplier_records
    this.registerTool({
      name: 'read_supplier_records',
      description: 'Read supplier details, statuses, and lead times.',
      parametersSchema: { status: 'optional string', supplierId: 'optional string' },
      execute: async (args, ctx) => {
        const suppliers = db.getSuppliers(ctx.workspaceId);
        if (args?.supplierId) {
          const sup = suppliers.find(s => s.id === args.supplierId);
          return sup ? { success: true, data: sup } : { success: false, error: 'Supplier not found' };
        }
        if (args?.status) {
          const filtered = suppliers.filter(s => s.status === args.status);
          return { success: true, data: { count: filtered.length, suppliers: filtered } };
        }
        return { success: true, data: { count: suppliers.length, suppliers } };
      }
    });

    // 5. create_internal_task
    this.registerTool({
      name: 'create_internal_task',
      description: 'Create an internal operations task for the business workspace.',
      parametersSchema: { title: 'string', description: 'optional string', priority: 'optional string' },
      execute: async (args, ctx) => {
        if (!args?.title) return { success: false, error: 'Task title is required.' };
        const task = db.createInternalTask(ctx.workspaceId, {
          workflow_id: ctx.workflowId,
          title: args.title,
          description: args.description || null,
          status: 'open',
          priority: args.priority || 'medium',
          due_at: args.dueAt || new Date(Date.now() + 86400000 * 2).toISOString()
        });
        return { success: true, data: task };
      }
    });

    // 6. update_permitted_internal_records
    this.registerTool({
      name: 'update_permitted_internal_records',
      description: 'Update safe permitted records (such as order notes, expected delivery, or inventory thresholds).',
      parametersSchema: { entityType: 'order | inventory', id: 'string', updates: 'object' },
      execute: async (args, ctx) => {
        if (args.entityType === 'order') {
          const updated = db.updateOrder(ctx.workspaceId, args.id, args.updates);
          return updated ? { success: true, data: updated } : { success: false, error: 'Order not found' };
        }
        if (args.entityType === 'inventory') {
          const updated = db.updateInventoryItem(ctx.workspaceId, args.id, args.updates);
          return updated ? { success: true, data: updated } : { success: false, error: 'Inventory item not found' };
        }
        return { success: false, error: `Entity type ${args.entityType} not permitted for update.` };
      }
    });

    // 7. generate_inventory_alert
    this.registerTool({
      name: 'generate_inventory_alert',
      description: 'Generate an inventory deficit alert notification in the workspace.',
      parametersSchema: { sku: 'string', currentQuantity: 'number', threshold: 'number' },
      execute: async (args, ctx) => {
        const notif = db.createNotification(ctx.workspaceId, {
          user_id: null,
          workflow_id: ctx.workflowId,
          title: `Low Stock Alert: ${args.sku}`,
          message: `Stock level for ${args.sku} is ${args.currentQuantity} (threshold: ${args.threshold}). Replenishment required.`
        });
        return { success: true, data: notif };
      }
    });

    // 8. draft_customer_communication
    this.registerTool({
      name: 'draft_customer_communication',
      description: 'Draft a customer communication grounded in verified records and save as draft.',
      parametersSchema: { recipient: 'string', subject: 'string', message: 'string' },
      execute: async (args, ctx) => {
        if (!args.recipient || !args.subject || !args.message) {
          return { success: false, error: 'Recipient, subject, and message are required.' };
        }
        return {
          success: true,
          data: {
            recipient: args.recipient,
            subject: args.subject,
            message: args.message,
            delivery_mode: 'draft',
            status: 'staged_for_review'
          }
        };
      }
    });

    // 9. request_approval
    this.registerTool({
      name: 'request_approval',
      description: 'Request explicit human approval before executing a sensitive action.',
      parametersSchema: { actionType: 'string', actionPayload: 'object', reason: 'string', riskLevel: 'string' },
      execute: async (args, ctx) => {
        if (!args.actionType || !args.actionPayload || !args.reason) {
          return { success: false, error: 'actionType, actionPayload, and reason are required.' };
        }
        const req = db.createApprovalRequest(ctx.workspaceId, {
          workflow_id: ctx.workflowId,
          task_id: ctx.taskId || null,
          requested_by: null,
          reviewed_by: null,
          action_type: args.actionType,
          action_payload: args.actionPayload,
          reason: args.reason,
          risk_level: args.riskLevel || 'medium',
          expires_at: new Date(Date.now() + 86400000 * 7).toISOString()
        });

        // Also create a notification for the approval
        db.createNotification(ctx.workspaceId, {
          user_id: null,
          workflow_id: ctx.workflowId,
          title: `Approval Required: ${args.actionType}`,
          message: args.reason
        });

        return { success: true, data: req };
      }
    });

    // 10. generate_final_report
    this.registerTool({
      name: 'generate_final_report',
      description: 'Generate and persist the authoritative final completion report for the workflow.',
      parametersSchema: { report: 'object' },
      execute: async (args, ctx) => {
        if (!args.report) return { success: false, error: 'Report object is required.' };
        db.updateWorkflow(ctx.workspaceId, ctx.workflowId, {
          final_report: args.report,
          completed_at: new Date().toISOString()
        });
        return { success: true, data: args.report };
      }
    });
  }
}

export const toolRegistry = new ToolRegistry();
