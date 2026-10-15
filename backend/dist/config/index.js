import dotenv from 'dotenv';
import path from 'path';
// Load .env or .env.backend from current directory, parent, or root
dotenv.config({ path: path.resolve(process.cwd(), '.env.backend') });
dotenv.config({ path: path.resolve(process.cwd(), '../.env.backend') });
dotenv.config({ path: path.resolve(process.cwd(), '.env') });
dotenv.config({ path: path.resolve(process.cwd(), '../.env') });
export const config = {
    env: process.env.NODE_ENV || 'development',
    port: parseInt(process.env.PORT || '3001', 10),
    clientUrl: process.env.CLIENT_URL || 'http://localhost:5173',
    apiBaseUrl: process.env.API_BASE_URL || 'http://localhost:3001/api',
    // Google Gemini
    gemini: {
        apiKey: process.env.GEMINI_API_KEY || '',
        model: process.env.GEMINI_MODEL || 'gemini-2.5-flash',
        isConfigured: !!(process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY.trim() !== '')
    },
    // Supabase
    supabase: {
        url: process.env.SUPABASE_URL || '',
        anonKey: process.env.SUPABASE_ANON_KEY || '',
        serviceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY || '',
        databaseUrl: process.env.DATABASE_URL || '',
        isConfigured: !!(process.env.SUPABASE_URL && (process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY))
    },
    // Security & Limits
    security: {
        logLevel: process.env.LOG_LEVEL || 'info',
        rateLimitWindowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '60000', 10),
        rateLimitMaxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100', 10)
    },
    // Workflow Limits
    workflow: {
        maxTasks: parseInt(process.env.WORKFLOW_MAX_TASKS || '25', 10),
        maxSteps: parseInt(process.env.WORKFLOW_MAX_STEPS || '50', 10),
        maxRetries: parseInt(process.env.WORKFLOW_MAX_RETRIES || '3', 10),
        taskTimeoutMs: parseInt(process.env.WORKFLOW_TASK_TIMEOUT_MS || '60000', 10)
    },
    demo: {
        enabled: process.env.ENABLE_DEMO_MODE !== 'false'
    }
};
//# sourceMappingURL=index.js.map