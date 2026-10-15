import { Router } from 'express';
import { db } from '../database/store.js';
import { getParam } from '../utils/params.js';
export const agentRouter = Router();
// GET /api/agents
agentRouter.get('/', (req, res) => {
    const agents = db.getAgents();
    const executions = db.getAgentExecutions();
    const enrichedAgents = agents.map(agent => {
        const agentExecs = executions.filter(e => e.agent_id === agent.id);
        const recentExecs = agentExecs.slice(0, 5);
        const completedCount = agentExecs.filter(e => e.status === 'completed').length;
        const failedCount = agentExecs.filter(e => e.status === 'failed').length;
        const activeExec = agentExecs.find(e => e.status === 'running');
        return {
            ...agent,
            currentStatus: activeExec ? 'busy' : 'idle',
            completedCount,
            failedCount,
            totalExecutions: agentExecs.length,
            recentExecutions: recentExecs
        };
    });
    res.json({ agents: enrichedAgents });
});
// GET /api/agents/:agentId
agentRouter.get('/:agentId', (req, res) => {
    const agentId = getParam(req.params.agentId);
    const agent = db.getAgentById(agentId);
    if (!agent) {
        return res.status(404).json({ error: 'Agent not found.' });
    }
    const executions = db.getAgentExecutions(undefined, agent.id);
    res.json({ agent, executions });
});
// GET /api/agents/:agentId/executions
agentRouter.get('/:agentId/executions', (req, res) => {
    const agentId = getParam(req.params.agentId);
    const executions = db.getAgentExecutions(undefined, agentId);
    res.json({ executions });
});
//# sourceMappingURL=agent.routes.js.map