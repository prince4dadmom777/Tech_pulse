import { ToolName } from '@flowpilot/shared';
export interface ToolContext {
    workspaceId: string;
    workflowId: string;
    taskId?: string;
    agentType?: string;
}
export interface ToolDefinition {
    name: ToolName;
    description: string;
    parametersSchema: Record<string, string>;
    execute: (args: any, ctx: ToolContext) => Promise<{
        success: boolean;
        data?: any;
        error?: string;
    }>;
}
export declare class ToolRegistry {
    private tools;
    constructor();
    registerTool(tool: ToolDefinition): void;
    getTool(name: ToolName): ToolDefinition | undefined;
    getRegisteredToolNames(): ToolName[];
    executeTool(name: ToolName, args: any, ctx: ToolContext): Promise<{
        success: boolean;
        data?: any;
        error?: string;
        executionId: string;
    }>;
    private registerCoreTools;
}
export declare const toolRegistry: ToolRegistry;
//# sourceMappingURL=registry.d.ts.map