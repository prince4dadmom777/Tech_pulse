import { Router } from 'express';
import { TemplateSchema } from '@flowpilot/shared';
import { db, DEMO_USER_ID, DEMO_WORKSPACE_ID } from '../database/store.js';
import { workflowEngine } from '../orchestration/workflow-engine.js';
import { getParam } from '../utils/params.js';
export const templateRouter = Router();
// GET /api/templates
templateRouter.get('/', (req, res) => {
    const wsId = req.workspaceId || DEMO_WORKSPACE_ID;
    const templates = db.getTemplates(wsId);
    res.json({ templates });
});
// POST /api/templates
templateRouter.post('/', (req, res, next) => {
    try {
        const wsId = req.workspaceId || DEMO_WORKSPACE_ID;
        const validated = TemplateSchema.parse(req.body);
        const template = db.createTemplate(wsId, {
            workspace_id: wsId,
            created_by: req.userId || DEMO_USER_ID,
            name: validated.name,
            description: validated.description,
            category: validated.category,
            definition: validated.definition,
            is_public: validated.isPublic
        });
        res.status(201).json({ template });
    }
    catch (err) {
        next(err);
    }
});
// GET /api/templates/:templateId
templateRouter.get('/:templateId', (req, res) => {
    const templateId = getParam(req.params.templateId);
    const template = db.getTemplateById(templateId);
    if (!template)
        return res.status(404).json({ error: 'Template not found.' });
    res.json({ template });
});
// POST /api/templates/:templateId/run
templateRouter.post('/:templateId/run', async (req, res, next) => {
    try {
        const wsId = req.workspaceId || DEMO_WORKSPACE_ID;
        const templateId = getParam(req.params.templateId);
        const template = db.getTemplateById(templateId);
        if (!template)
            return res.status(404).json({ error: 'Template not found.' });
        // Instantiate workflow from template
        const workflow = db.createWorkflow({
            workspace_id: wsId,
            created_by: req.userId || DEMO_USER_ID,
            title: `${template.name} Run`,
            objective: template.definition.objective,
            category: template.category,
            priority: template.definition.priority,
            status: 'draft',
            execution_mode: 'demo',
            approval_policy: template.definition.approvalPolicy || 'risk_based',
            plan: null,
            final_report: null,
            error_summary: null,
            deadline: null,
            started_at: null,
            completed_at: null
        });
        // Plan and start the workflow
        await workflowEngine.planWorkflow(wsId, workflow.id);
        const started = await workflowEngine.startWorkflow(wsId, workflow.id);
        res.status(201).json({ workflow: started });
    }
    catch (err) {
        next(err);
    }
});
//# sourceMappingURL=template.routes.js.map