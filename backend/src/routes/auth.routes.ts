import { Router } from 'express';
import { db, DEMO_USER_ID, DEMO_WORKSPACE_ID } from '../database/store.js';
import { AuthenticatedRequest } from '../middleware/auth.middleware.js';
import { getParam } from '../utils/params.js';

export const authRouter = Router();

authRouter.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    service: 'FlowPilot AI Orchestration Engine',
    version: '1.0.0'
  });
});

authRouter.get('/me', (req: AuthenticatedRequest, res) => {
  const ws = db.getWorkspaceById(req.workspaceId || DEMO_WORKSPACE_ID);
  res.json({
    user: {
      id: req.userId || DEMO_USER_ID,
      email: 'demo@flowpilot.ai',
      name: 'Demo Operations Lead',
      role: req.userRole || 'owner'
    },
    workspace: ws
  });
});

authRouter.get('/workspaces', (req: AuthenticatedRequest, res) => {
  const workspaces = db.getWorkspaces();
  res.json({ workspaces });
});

authRouter.post('/workspaces', (req: AuthenticatedRequest, res) => {
  const { name } = req.body;
  if (!name || typeof name !== 'string') {
    return res.status(400).json({ error: 'Workspace name is required.' });
  }
  const ws = db.createWorkspace(name, req.userId || DEMO_USER_ID);
  res.status(201).json({ workspace: ws });
});

authRouter.get('/workspaces/:workspaceId', (req: AuthenticatedRequest, res) => {
  const workspaceId = getParam(req.params.workspaceId);
  const ws = db.getWorkspaceById(workspaceId);
  if (!ws) {
    return res.status(404).json({ error: 'Workspace not found.' });
  }
  const members = db.getWorkspaceMembers(workspaceId);
  res.json({ workspace: ws, members });
});
