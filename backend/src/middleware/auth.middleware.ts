import { Request, Response, NextFunction } from 'express';
import { db, DEMO_USER_ID, DEMO_WORKSPACE_ID } from '../database/store.js';
import { logger } from '../logging/logger.js';

export interface AuthenticatedRequest extends Request {
  userId?: string;
  workspaceId?: string;
  userRole?: string;
}

export function authMiddleware(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  const workspaceHeader = (req.headers['x-workspace-id'] as string) || DEMO_WORKSPACE_ID;

  // If Authorization token provided
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.substring(7).trim();
    // In demo environment or mock auth
    if (token === 'demo-token' || token.startsWith('demo_')) {
      req.userId = DEMO_USER_ID;
      req.workspaceId = workspaceHeader;
      req.userRole = 'owner';
      return next();
    }
  }

  // Fallback to demo workspace user in demo mode
  req.userId = DEMO_USER_ID;
  req.workspaceId = workspaceHeader;
  req.userRole = 'owner';
  return next();
}
