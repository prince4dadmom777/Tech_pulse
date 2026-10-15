import { EventEmitter } from 'events';
import { logger } from '../logging/logger.js';
class WorkflowEventBus extends EventEmitter {
    activeStreams = new Map();
    constructor() {
        super();
        this.setMaxListeners(100);
    }
    registerClient(workflowId, res) {
        if (!this.activeStreams.has(workflowId)) {
            this.activeStreams.set(workflowId, new Set());
        }
        this.activeStreams.get(workflowId).add(res);
        logger.debug(`Client connected to event stream for workflow [${workflowId}]`);
        res.on('close', () => {
            const streamSet = this.activeStreams.get(workflowId);
            if (streamSet) {
                streamSet.delete(res);
                if (streamSet.size === 0) {
                    this.activeStreams.delete(workflowId);
                }
            }
            logger.debug(`Client disconnected from event stream for workflow [${workflowId}]`);
        });
    }
    emitWorkflowEvent(workflowId, eventType, payload) {
        const data = JSON.stringify({ type: eventType, payload, timestamp: new Date().toISOString() });
        const streamSet = this.activeStreams.get(workflowId);
        if (streamSet) {
            for (const res of streamSet) {
                res.write(`event: ${eventType}\ndata: ${data}\n\n`);
            }
        }
        this.emit(`workflow:${workflowId}`, { type: eventType, payload });
    }
}
export const workflowEvents = new WorkflowEventBus();
//# sourceMappingURL=events.js.map