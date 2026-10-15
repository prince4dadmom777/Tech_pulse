import { Workflow } from '@flowpilot/shared';
declare class WorkflowEngine {
    private activeExecutions;
    /**
     * Generates a structured execution plan for a workflow
     */
    planWorkflow(workspaceId: string, workflowId: string): Promise<Workflow>;
    /**
     * Starts executing a planned or paused workflow
     */
    startWorkflow(workspaceId: string, workflowId: string): Promise<Workflow>;
    pauseWorkflow(workspaceId: string, workflowId: string): Promise<Workflow>;
    resumeWorkflow(workspaceId: string, workflowId: string): Promise<Workflow>;
    cancelWorkflow(workspaceId: string, workflowId: string): Promise<Workflow>;
    /**
     * Main asynchronous execution loop
     */
    private runExecutionLoop;
    /**
     * Executes a single task with its assigned agent and tool executions
     */
    private executeTask;
    /**
     * Finalizes the workflow and generates the final completion report
     */
    private completeWorkflow;
}
export declare const workflowEngine: WorkflowEngine;
export {};
//# sourceMappingURL=workflow-engine.d.ts.map