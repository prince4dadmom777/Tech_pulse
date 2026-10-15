import { Router } from 'express';
import { db, DEMO_WORKSPACE_ID } from '../database/store.js';
import { AuthenticatedRequest } from '../middleware/auth.middleware.js';

export const dashboardRouter = Router();

dashboardRouter.get('/summary', (req: AuthenticatedRequest, res) => {
  const wsId = req.workspaceId || DEMO_WORKSPACE_ID;
  const workflows = db.getWorkflows(wsId);
  const tasks = db.getTasks(wsId);
  const approvals = db.getApprovals(wsId);
  const agents = db.getAgents();
  const executions = db.getAgentExecutions();

  const totalWorkflows = workflows.length;
  const activeWorkflows = workflows.filter(w => w.status === 'running' || w.status === 'awaiting_approval').length;
  const completedWorkflows = workflows.filter(w => w.status === 'completed').length;
  const failedWorkflows = workflows.filter(w => w.status === 'failed').length;
  const pendingApprovals = approvals.filter(a => a.status === 'pending').length;
  const tasksCompletedTotal = tasks.filter(t => t.status === 'completed').length;

  // Calculate estimated time saved: 15 mins per completed task
  const estimatedTimeSavedMinutes = tasksCompletedTotal * 15;

  const agentPerformance = agents.map(agent => {
    const agentExecs = executions.filter(e => e.agent_id === agent.id);
    return {
      agent_type: agent.agent_type,
      name: agent.name,
      completed: agentExecs.filter(e => e.status === 'completed').length,
      failed: agentExecs.filter(e => e.status === 'failed').length
    };
  });

  res.json({
    summary: {
      totalWorkflows,
      activeWorkflows,
      completedWorkflows,
      failedWorkflows,
      pendingApprovals,
      tasksCompletedTotal,
      estimatedTimeSavedMinutes,
      agentPerformance
    }
  });
});

dashboardRouter.get('/activity', (req: AuthenticatedRequest, res) => {
  const wsId = req.workspaceId || DEMO_WORKSPACE_ID;
  const limit = parseInt(req.query.limit as string || '15', 10);
  const activity = db.getActivityLogs(wsId, limit);
  res.json({ activity });
});

dashboardRouter.get('/alerts', (req: AuthenticatedRequest, res) => {
  const wsId = req.workspaceId || DEMO_WORKSPACE_ID;
  const notifications = db.getNotifications(wsId).slice(0, 10);
  const inventory = db.getInventory(wsId);
  const lowStock = inventory.filter(i => i.quantity <= i.reorder_threshold);
  const orders = db.getOrders(wsId);
  const delayedOrders = orders.filter(o => o.status === 'delayed');

  res.json({
    notifications,
    lowStockCount: lowStock.length,
    lowStockItems: lowStock,
    delayedOrdersCount: delayedOrders.length,
    delayedOrders
  });
});
