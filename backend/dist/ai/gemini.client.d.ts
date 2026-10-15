import { OrchestratorPlan, BusinessAnalystOutput, PlanningAgentOutput, OperationsAgentOutput, CustomerCommunicationOutput, QualityRiskOutput, FinalReport } from '@flowpilot/shared';
declare class GeminiClientService {
    private client;
    private modelName;
    constructor();
    isLiveAiAvailable(): boolean;
    getStatus(): {
        configured: boolean;
        model: string;
        provider: string;
        mode: string;
    };
    private callGeminiWithRetry;
    generateWorkflowPlan(params: {
        title: string;
        objective: string;
        category: string;
        priority: string;
        constraints?: string[];
        contextData?: string;
    }): Promise<OrchestratorPlan>;
    analyzeBusinessProblem(params: {
        objective: string;
        recordsSummary: string;
    }): Promise<BusinessAnalystOutput>;
    generateTaskPlan(findings: BusinessAnalystOutput): Promise<PlanningAgentOutput>;
    executeOperationsAgent(params: {
        taskTitle: string;
        taskDescription: string;
        context: Record<string, any>;
    }): Promise<OperationsAgentOutput>;
    prepareCustomerCommunication(params: {
        customerName: string;
        customerEmail: string;
        orderNumber: string;
        orderNotes: string;
    }): Promise<CustomerCommunicationOutput>;
    reviewQualityAndRisk(params: {
        objective: string;
        tasksSummary: any[];
        executionHistory: any[];
    }): Promise<QualityRiskOutput>;
    generateFinalReport(params: {
        objective: string;
        completedTasks: string[];
        pendingTasks: string[];
        failedTasks: string[];
        approvalsCount: number;
        actionsExecuted: string[];
    }): Promise<FinalReport>;
}
export declare const geminiClient: GeminiClientService;
export {};
//# sourceMappingURL=gemini.client.d.ts.map