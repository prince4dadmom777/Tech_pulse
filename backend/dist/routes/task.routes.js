import { Router } from 'express';
import { db, DEMO_WORKSPACE_ID } from '../database/store.js';
import { workflowEvents } from '../orchestration/events.js';
import { getParam } from '../utils/params.js';
export const taskRouter = Router();
// GET /api/tasks
taskRouter.get('/', (req, res) => {
    const wsId = req.workspaceId || DEMO_WORKSPACE_ID;
    const { workflowId, status, priority } = req.query;
    let tasks = db.getTasks(wsId, workflowId);
    if (status) {
        tasks = tasks.filter(t => t.status === status);
    }
    if (priority) {
        tasks = tasks.filter(t => t.priority === priority);
    }
    const agents = db.getAgents();
    const agentMap = new Map(agents.map(a => [a.id, a]));
    const enrichedTasks = tasks.map(t => ({
        ...t,
        agent_type: t.agent_id ? agentMap.get(t.agent_id)?.agent_type : undefined,
        agent_name: t.agent_id ? agentMap.get(t.agent_id)?.name : undefined,
        dependencies: db.getDependencies(t.id).map(d => d.depends_on_task_id)
    }));
    res.json({ tasks: enrichedTasks });
});
// GET /api/tasks/:taskId
taskRouter.get('/:taskId', (req, res) => {
    const wsId = req.workspaceId || DEMO_WORKSPACE_ID;
    const taskId = getParam(req.params.taskId);
    const task = db.getTaskById(wsId, taskId);
    if (!task) {
        return res.status(404).json({ error: 'Task not found.' });
    }
    const dependencies = db.getDependencies(task.id);
    const toolExecutions = db.getToolExecutions(wsId).filter(e => e.task_id === task.id);
    const executions = db.getAgentExecutions(task.workflow_id).filter(e => e.task_id === task.id);
    res.json({
        task: {
            ...task,
            dependencies: dependencies.map(d => d.depends_on_task_id)
        },
        dependencies,
        toolExecutions,
        executions
    });
});
// POST /api/tasks/:taskId/retry
taskRouter.post('/:taskId/retry', (req, res) => {
    const wsId = req.workspaceId || DEMO_WORKSPACE_ID;
    const taskId = getParam(req.params.taskId);
    const task = db.getTaskById(wsId, taskId);
    if (!task) {
        return res.status(404).json({ error: 'Task not found.' });
    }
    const updated = db.updateTask(wsId, task.id, {
        status: 'ready',
        error_summary: null
    });
    workflowEvents.emitWorkflowEvent(task.workflow_id, 'task_retried', { taskId: task.id });
    res.json({ task: updated });
});
// POST /api/tasks/:taskId/cancel
taskRouter.post('/:taskId/cancel', (req, res) => {
    const wsId = req.workspaceId || DEMO_WORKSPACE_ID;
    const taskId = getParam(req.params.taskId);
    const task = db.getTaskById(wsId, taskId);
    if (!task) {
        return res.status(404).json({ error: 'Task not found.' });
    }
    const updated = db.updateTask(wsId, task.id, {
        status: 'cancelled',
        completed_at: new Date().toISOString()
    });
    workflowEvents.emitWorkflowEvent(task.workflow_id, 'task_cancelled', { taskId: task.id });
    res.json({ task: updated });
});
//# sourceMappingURL=task.routes.js.map