import { Router } from 'express';
import { db, DEMO_WORKSPACE_ID } from '../database/store.js';
import { AuthenticatedRequest } from '../middleware/auth.middleware.js';
import { getParam } from '../utils/params.js';

export const analyticsRouter = Router();

// GET /api/analytics/overview
analyticsRouter.get('/overview', (req: AuthenticatedRequest, res) => {
  const wsId = req.workspaceId || DEMO_WORKSPACE_ID;
  const workflows = db.getWorkflows(wsId);
  const tasks = db.getTasks(wsId);
  const approvals = db.getApprovals(wsId);

  const totalWorkflows = workflows.length;
  const completedWorkflows = workflows.filter(w => w.status === 'completed').length;
  const completionRate = totalWorkflows > 0 ? Math.round((completedWorkflows / totalWorkflows) * 100) : 100;
  const pendingApprovals = approvals.filter(a => a.status === 'pending').length;
  const completedTasks = tasks.filter(t => t.status === 'completed').length;
  const timeSavedMinutes = completedTasks * 15;

  const categoryBreakdown = workflows.reduce((acc, wf) => {
    acc[wf.category] = (acc[wf.category] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const priorityBreakdown = workflows.reduce((acc, wf) => {
    acc[wf.priority] = (acc[wf.priority] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  res.json({
    totalWorkflows,
    completedWorkflows,
    completionRate,
    pendingApprovals,
    completedTasks,
    timeSavedMinutes,
    categoryBreakdown,
    priorityBreakdown
  });
});

// GET /api/analytics/workflows
analyticsRouter.get('/workflows', (req: AuthenticatedRequest, res) => {
  const wsId = req.workspaceId || DEMO_WORKSPACE_ID;
  const workflows = db.getWorkflows(wsId);

  // Group by day for the last 7 days
  const days: { date: string; completed: number; failed: number; total: number }[] = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date(Date.now() - 86400000 * i);
    const dateStr = d.toISOString().split('T')[0];
    const match = workflows.filter(w => w.created_at.startsWith(dateStr));
    days.push({
      date: dateStr,
      completed: match.filter(w => w.status === 'completed').length,
      failed: match.filter(w => w.status === 'failed').length,
      total: match.length
    });
  }

  res.json({ trend: days });
});

// GET /api/analytics/agents
analyticsRouter.get('/agents', (req: AuthenticatedRequest, res) => {
  const agents = db.getAgents();
  const executions = db.getAgentExecutions();

  const agentStats = agents.map(agent => {
    const list = executions.filter(e => e.agent_id === agent.id);
    const completed = list.filter(e => e.status === 'completed').length;
    const failed = list.filter(e => e.status === 'failed').length;
    return {
      agentType: agent.agent_type,
      name: agent.name,
      totalExecutions: list.length,
      completed,
      failed,
      successRate: list.length > 0 ? Math.round((completed / list.length) * 100) : 100
    };
  });

  res.json({ agentStats });
});

// GET /api/activity
analyticsRouter.get('/activity', (req: AuthenticatedRequest, res) => {
  const wsId = req.workspaceId || DEMO_WORKSPACE_ID;
  const limit = parseInt(req.query.limit as string || '50', 10);
  const logs = db.getActivityLogs(wsId, limit);
  res.json({ logs });
});

// Notifications
analyticsRouter.get('/notifications', (req: AuthenticatedRequest, res) => {
  const wsId = req.workspaceId || DEMO_WORKSPACE_ID;
  const notifications = db.getNotifications(wsId);
  res.json({ notifications });
});

analyticsRouter.post('/notifications/:notificationId/read', (req: AuthenticatedRequest, res) => {
  const notifId = getParam(req.params.notificationId);
  const success = db.markNotificationRead(notifId);
  res.json({ success });
});
