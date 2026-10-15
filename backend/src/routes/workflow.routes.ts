import { Router } from 'express';
import { CreateWorkflowSchema, UpdateWorkflowSchema } from '@flowpilot/shared';
import { db, DEMO_USER_ID, DEMO_WORKSPACE_ID } from '../database/store.js';
import { AuthenticatedRequest } from '../middleware/auth.middleware.js';
import { workflowEngine } from '../orchestration/workflow-engine.js';
import { workflowEvents } from '../orchestration/events.js';
import { getParam } from '../utils/params.js';

export const workflowRouter = Router();

// GET /api/workflows
workflowRouter.get('/', (req: AuthenticatedRequest, res) => {
  const wsId = req.workspaceId || DEMO_WORKSPACE_ID;
  const { status, category, priority, search } = req.query;

  let workflows = db.getWorkflows(wsId);

  if (status) {
    workflows = workflows.filter(w => w.status === status);
  }
  if (category) {
    workflows = workflows.filter(w => w.category === category);
  }
  if (priority) {
    workflows = workflows.filter(w => w.priority === priority);
  }
  if (search) {
    const q = String(search).toLowerCase();
    workflows = workflows.filter(w => w.title.toLowerCase().includes(q) || w.objective.toLowerCase().includes(q));
  }

  // Include task completion counts for list UI
  const workflowsWithProgress = workflows.map(wf => {
    const tasks = db.getTasks(wsId, wf.id);
    const completed = tasks.filter(t => t.status === 'completed').length;
    return {
      ...wf,
      tasksTotal: tasks.length,
      tasksCompleted: completed,
      progressPercent: tasks.length > 0 ? Math.round((completed / tasks.length) * 100) : 0
    };
  });

  res.json({ workflows: workflowsWithProgress });
});

// POST /api/workflows
workflowRouter.post('/', async (req: AuthenticatedRequest, res, next) => {
  try {
    const wsId = req.workspaceId || DEMO_WORKSPACE_ID;
    const validated = CreateWorkflowSchema.parse(req.body);

    const workflow = db.createWorkflow({
      workspace_id: wsId,
      created_by: req.userId || DEMO_USER_ID,
      title: validated.title,
      objective: validated.objective,
      category: validated.category,
      priority: validated.priority,
      status: 'draft',
      execution_mode: validated.executionMode,
      approval_policy: validated.approvalPolicy,
      plan: null,
      final_report: null,
      error_summary: null,
      deadline: validated.deadline || null,
      started_at: null,
      completed_at: null
    });

    db.logActivity(wsId, {
      workflow_id: workflow.id,
      task_id: null,
      actor_type: 'user',
      actor_id: req.userId || DEMO_USER_ID,
      action: 'workflow_created',
      outcome: 'success',
      metadata: { title: workflow.title, category: workflow.category }
    });

    res.status(201).json({ workflow });
  } catch (err) {
    next(err);
  }
});

// GET /api/workflows/:workflowId
workflowRouter.get('/:workflowId', (req: AuthenticatedRequest, res) => {
  const wsId = req.workspaceId || DEMO_WORKSPACE_ID;
  const workflowId = getParam(req.params.workflowId);
  const wf = db.getWorkflowById(wsId, workflowId);
  if (!wf) {
    return res.status(404).json({ error: 'Workflow not found.' });
  }

  const tasks = db.getTasks(wsId, wf.id);
  const dependencies = db.getWorkflowDependencies(wf.id);
  const toolExecutions = db.getToolExecutions(wsId, wf.id);
  const approvals = db.getApprovals(wsId).filter(a => a.workflow_id === wf.id);
  const executions = db.getAgentExecutions(wf.id);

  // Attach dependencies directly to tasks for easier frontend rendering
  const tasksWithDeps = tasks.map(t => {
    const deps = dependencies.filter(d => d.task_id === t.id).map(d => d.depends_on_task_id);
    return { ...t, dependencies: deps };
  });

  res.json({
    workflow: wf,
    tasks: tasksWithDeps,
    dependencies,
    toolExecutions,
    approvals,
    executions
  });
});

// PATCH /api/workflows/:workflowId
workflowRouter.patch('/:workflowId', (req: AuthenticatedRequest, res, next) => {
  try {
    const wsId = req.workspaceId || DEMO_WORKSPACE_ID;
    const workflowId = getParam(req.params.workflowId);
    const validated = UpdateWorkflowSchema.parse(req.body);
    const updated = db.updateWorkflow(wsId, workflowId, validated);
    if (!updated) {
      return res.status(404).json({ error: 'Workflow not found.' });
    }
    res.json({ workflow: updated });
  } catch (err) {
    next(err);
  }
});

// DELETE /api/workflows/:workflowId
workflowRouter.delete('/:workflowId', (req: AuthenticatedRequest, res) => {
  const wsId = req.workspaceId || DEMO_WORKSPACE_ID;
  const workflowId = getParam(req.params.workflowId);
  const success = db.deleteWorkflow(wsId, workflowId);
  if (!success) {
    return res.status(404).json({ error: 'Workflow not found.' });
  }
  res.json({ success: true, message: 'Workflow deleted successfully.' });
});

// POST /api/workflows/:workflowId/plan
workflowRouter.post('/:workflowId/plan', async (req: AuthenticatedRequest, res, next) => {
  try {
    const wsId = req.workspaceId || DEMO_WORKSPACE_ID;
    const workflowId = getParam(req.params.workflowId);
    const planned = await workflowEngine.planWorkflow(wsId, workflowId);
    const tasks = db.getTasks(wsId, planned.id);
    res.json({ workflow: planned, tasks });
  } catch (err) {
    next(err);
  }
});

// POST /api/workflows/:workflowId/start
workflowRouter.post('/:workflowId/start', async (req: AuthenticatedRequest, res, next) => {
  try {
    const wsId = req.workspaceId || DEMO_WORKSPACE_ID;
    const workflowId = getParam(req.params.workflowId);
    const started = await workflowEngine.startWorkflow(wsId, workflowId);
    res.json({ workflow: started });
  } catch (err) {
    next(err);
  }
});

// POST /api/workflows/:workflowId/pause
workflowRouter.post('/:workflowId/pause', async (req: AuthenticatedRequest, res, next) => {
  try {
    const wsId = req.workspaceId || DEMO_WORKSPACE_ID;
    const workflowId = getParam(req.params.workflowId);
    const paused = await workflowEngine.pauseWorkflow(wsId, workflowId);
    res.json({ workflow: paused });
  } catch (err) {
    next(err);
  }
});

// POST /api/workflows/:workflowId/resume
workflowRouter.post('/:workflowId/resume', async (req: AuthenticatedRequest, res, next) => {
  try {
    const wsId = req.workspaceId || DEMO_WORKSPACE_ID;
    const workflowId = getParam(req.params.workflowId);
    const resumed = await workflowEngine.resumeWorkflow(wsId, workflowId);
    res.json({ workflow: resumed });
  } catch (err) {
    next(err);
  }
});

// POST /api/workflows/:workflowId/cancel
workflowRouter.post('/:workflowId/cancel', async (req: AuthenticatedRequest, res, next) => {
  try {
    const wsId = req.workspaceId || DEMO_WORKSPACE_ID;
    const workflowId = getParam(req.params.workflowId);
    const cancelled = await workflowEngine.cancelWorkflow(wsId, workflowId);
    res.json({ workflow: cancelled });
  } catch (err) {
    next(err);
  }
});

// GET /api/workflows/:workflowId/report
workflowRouter.get('/:workflowId/report', (req: AuthenticatedRequest, res) => {
  const wsId = req.workspaceId || DEMO_WORKSPACE_ID;
  const workflowId = getParam(req.params.workflowId);
  const wf = db.getWorkflowById(wsId, workflowId);
  if (!wf) {
    return res.status(404).json({ error: 'Workflow not found.' });
  }
  if (!wf.final_report) {
    return res.status(404).json({ error: 'Final report has not yet been generated for this workflow.' });
  }
  res.json({ report: wf.final_report });
});

// GET /api/workflows/:workflowId/events (Server-Sent Events)
workflowRouter.get('/:workflowId/events', (req: AuthenticatedRequest, res) => {
  const workflowId = getParam(req.params.workflowId);

  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders();

  // Send initial connected ping
  res.write(`event: connected\ndata: ${JSON.stringify({ workflowId, connectedAt: new Date().toISOString() })}\n\n`);

  workflowEvents.registerClient(workflowId, res);
});
