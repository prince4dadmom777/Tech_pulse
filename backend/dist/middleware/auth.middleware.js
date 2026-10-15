import { DEMO_USER_ID, DEMO_WORKSPACE_ID } from '../database/store.js';
export function authMiddleware(req, res, next) {
    const authHeader = req.headers.authorization;
    const workspaceHeader = req.headers['x-workspace-id'] || DEMO_WORKSPACE_ID;
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
//# sourceMappingURL=auth.middleware.js.map