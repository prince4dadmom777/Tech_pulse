import { Router } from 'express';
import { db, DEMO_USER_ID, DEMO_WORKSPACE_ID } from '../database/store.js';
import { AuthenticatedRequest } from '../middleware/auth.middleware.js';
import { workflowEngine } from '../orchestration/workflow-engine.js';
import { geminiClient } from '../ai/gemini.client.js';
import { config } from '../config/index.js';

export const demoRouter = Router();

// POST /api/demo/run - End-to-End Hackathon Demonstration Scenario
demoRouter.post('/run', async (req: AuthenticatedRequest, res, next) => {
  try {
    const wsId = req.workspaceId || DEMO_WORKSPACE_ID;

    // 1. Create Hackathon Demo Workflow
    const workflow = db.createWorkflow({
      workspace_id: wsId,
      created_by: req.userId || DEMO_USER_ID,
      title: 'Delayed Order Resolution & Stock Shortage Mitigation',
      objective: 'Analyze delayed orders, identify inventory shortages, create internal follow-up tasks, and prepare appropriate customer updates.',
      category: 'order_management',
      priority: 'high',
      status: 'draft',
      execution_mode: 'demo',
      approval_policy: 'risk_based',
      plan: null,
      final_report: null,
      error_summary: null,
      deadline: new Date(Date.now() + 86400000 * 3).toISOString(),
      started_at: null,
      completed_at: null
    });

    // 2. Plan the workflow
    await workflowEngine.planWorkflow(wsId, workflow.id);

    // 3. Start execution
    const started = await workflowEngine.startWorkflow(wsId, workflow.id);

    res.status(201).json({
      success: true,
      message: 'Demo workflow initialized and dispatched successfully.',
      workflow: started
    });
  } catch (err) {
    next(err);
  }
});

// POST /api/demo/reset - Reset Database Store
demoRouter.post('/reset', (req: AuthenticatedRequest, res) => {
  db.resetDemoData();
  res.json({
    success: true,
    message: 'Demo workspace data reset to clean initial seed state.'
  });
});

import { checkSupabaseStatus, syncTableToSupabase } from '../database/supabase.client.js';

// GET /api/settings/ai-status
demoRouter.get('/ai-status', (req: AuthenticatedRequest, res) => {
  const status = geminiClient.getStatus();
  res.json({
    ...status,
    limits: {
      maxTasks: config.workflow.maxTasks,
      maxSteps: config.workflow.maxSteps,
      maxRetries: config.workflow.maxRetries,
      taskTimeoutMs: config.workflow.taskTimeoutMs
    },
    demoModeEnabled: config.demo.enabled
  });
});

// GET /api/settings/supabase-status
demoRouter.get('/supabase-status', async (req: AuthenticatedRequest, res) => {
  const status = await checkSupabaseStatus();
  res.json(status);
});

// POST /api/settings/supabase-sync
demoRouter.post('/supabase-sync', async (req: AuthenticatedRequest, res) => {
  const wsId = req.workspaceId || DEMO_WORKSPACE_ID;
  const syncResults: Record<string, any> = {};

  syncResults.agents = await syncTableToSupabase('agents', db.getAgents());

  // Clean virtual fields before syncing
  const cleanInventory = db.getInventory(wsId).map((item: any) => {
    const { supplier_name, ...clean } = item;
    return clean;
  });
  syncResults.inventory = await syncTableToSupabase('inventory_items', cleanInventory);

  const cleanOrders = db.getOrders(wsId).map((order: any) => {
    const { customer_name, ...clean } = order;
    return clean;
  });
  syncResults.orders = await syncTableToSupabase('business_orders', cleanOrders);

  syncResults.suppliers = await syncTableToSupabase('suppliers', db.getSuppliers(wsId));
  syncResults.customers = await syncTableToSupabase('business_customers', db.getCustomers(wsId));

  res.json({
    success: true,
    message: 'Sync to Supabase completed',
    results: syncResults
  });
});
