export declare const config: {
    env: string;
    port: number;
    clientUrl: string;
    apiBaseUrl: string;
    gemini: {
        apiKey: string;
        model: string;
        isConfigured: boolean;
    };
    supabase: {
        url: string;
        anonKey: string;
        serviceRoleKey: string;
        databaseUrl: string;
        isConfigured: boolean;
    };
    security: {
        logLevel: string;
        rateLimitWindowMs: number;
        rateLimitMaxRequests: number;
    };
    workflow: {
        maxTasks: number;
        maxSteps: number;
        maxRetries: number;
        taskTimeoutMs: number;
    };
    demo: {
        enabled: boolean;
    };
};
//# sourceMappingURL=index.d.ts.map