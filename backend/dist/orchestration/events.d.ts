import { EventEmitter } from 'events';
import { Response } from 'express';
declare class WorkflowEventBus extends EventEmitter {
    private activeStreams;
    constructor();
    registerClient(workflowId: string, res: Response): void;
    emitWorkflowEvent(workflowId: string, eventType: string, payload: any): void;
}
export declare const workflowEvents: WorkflowEventBus;
export {};
//# sourceMappingURL=events.d.ts.map