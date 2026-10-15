import express from 'express';
import cors from 'cors';
import { authMiddleware } from './middleware/auth.middleware.js';
import { errorHandler } from './middleware/error.middleware.js';
import { rateLimiter } from './middleware/rate-limit.middleware.js';
import { authRouter } from './routes/auth.routes.js';
import { dashboardRouter } from './routes/dashboard.routes.js';
import { workflowRouter } from './routes/workflow.routes.js';
import { taskRouter } from './routes/task.routes.js';
import { agentRouter } from './routes/agent.routes.js';
import { approvalRouter } from './routes/approval.routes.js';
import { businessRouter } from './routes/business.routes.js';
import { templateRouter } from './routes/template.routes.js';
import { analyticsRouter } from './routes/analytics.routes.js';
import { demoRouter } from './routes/demo.routes.js';
export function createApp() {
    const app = express();
    // Basic CORS & Parsing
    app.use(cors({
        origin: '*',
        credentials: true,
        methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS']
    }));
    app.use(express.json({ limit: '5mb' }));
    // Global Auth context & Rate Limiter
    app.use(authMiddleware);
    app.use(rateLimiter);
    // Mount API Endpoints
    app.use('/api', authRouter);
    app.use('/api/dashboard', dashboardRouter);
    app.use('/api/workflows', workflowRouter);
    app.use('/api/tasks', taskRouter);
    app.use('/api/agents', agentRouter);
    app.use('/api/approvals', approvalRouter);
    app.use('/api', businessRouter);
    app.use('/api/templates', templateRouter);
    app.use('/api/analytics', analyticsRouter);
    app.use('/api', analyticsRouter); // for /api/activity and /api/notifications
    app.use('/api/demo', demoRouter);
    app.use('/api/settings', demoRouter);
    // Root welcome / health endpoint (handles GET /)
    app.get('/', (req, res) => {
        res.json({
            service: 'FlowPilot AI Orchestration Engine',
            version: '1.0.0',
            status: 'online',
            message: 'FlowPilot AI Backend is running successfully.',
            endpoints: {
                health: '/api/health',
                ai_status: '/api/settings/ai-status',
                supabase_status: '/api/settings/supabase-status',
                workflows: '/api/workflows',
                dashboard: '/api/dashboard/summary'
            }
        });
    });
    // Descriptive 404 handler for unknown routes
    app.use((req, res) => {
        res.status(404).json({
            error: 'Not Found',
            message: `Endpoint ${req.method} ${req.originalUrl} does not exist. Available API endpoints start with /api.`,
            health: '/api/health'
        });
    });
    // Centralized Error Handler
    app.use(errorHandler);
    return app;
}
//# sourceMappingURL=app.js.map