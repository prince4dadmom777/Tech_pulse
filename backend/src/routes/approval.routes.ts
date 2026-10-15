import { Router } from 'express';
import { ResolveApprovalSchema } from '@flowpilot/shared';
import { db, DEMO_USER_ID, DEMO_WORKSPACE_ID } from '../database/store.js';
import { AuthenticatedRequest } from '../middleware/auth.middleware.js';
import { workflowEngine } from '../orchestration/workflow-engine.js';
import { workflowEvents } from '../orchestration/events.js';
import { toolRegistry } from '../tools/registry.js';
import { logger } from '../logging/logger.js';
import { getParam } from '../utils/params.js';
import crypto from 'crypto';

export const approvalRouter = Router();

// GET /api/approvals
approvalRouter.get('/', (req: AuthenticatedRequest, res) => {
  const wsId = req.workspaceId || DEMO_WORKSPACE_ID;
  const { status } = req.query;

  let approvals = db.getApprovals(wsId);
  if (status) {
    approvals = approvals.filter(a => a.status === status);
  }

  res.json({ approvals });
});

// GET /api/approvals/:approvalId
approvalRouter.get('/:approvalId', (req: AuthenticatedRequest, res) => {
  const wsId = req.workspaceId || DEMO_WORKSPACE_ID;
  const approvalId = getParam(req.params.approvalId);
  const approval = db.getApprovalById(wsId, approvalId);
  if (!approval) {
    return res.status(404).json({ error: 'Approval request not found.' });
  }
  res.json({ approval });
});

// POST /api/approvals/:approvalId/approve
approvalRouter.post('/:approvalId/approve', async (req: AuthenticatedRequest, res, next) => {
  try {
    const wsId = req.workspaceId || DEMO_WORKSPACE_ID;
    const approvalId = getParam(req.params.approvalId);
    const body = ResolveApprovalSchema.parse(req.body || {});

    const approval = db.getApprovalById(wsId, approvalId);
    if (!approval) {
      return res.status(404).json({ error: 'Approval request not found.' });
    }
    if (approval.status !== 'pending') {
      return res.status(400).json({ error: `Approval already resolved with status "${approval.status}".` });
    }

    // Verify hash integrity of payload
    const canonicalPayload = JSON.stringify(approval.action_payload, Object.keys(approval.action_payload).sort());
    const computedHash = crypto.createHash('sha256').update(canonicalPayload).digest('hex');
    if (computedHash !== approval.action_hash) {
      return res.status(400).json({ error: 'Action payload integrity verification failed: Hash mismatch.' });
    }

    // Check expiration
    if (approval.expires_at && new Date(approval.expires_at) < new Date()) {
      return res.status(400).json({ error: 'Approval request has expired.' });
    }

    // Update approval status
    const resolved = db.resolveApproval(wsId, approvalId, 'approved', req.userId || DEMO_USER_ID, body.reviewComment);

    db.logActivity(wsId, {
      workflow_id: approval.workflow_id,
      task_id: approval.task_id,
      actor_type: 'user',
      actor_id: req.userId || DEMO_USER_ID,
      action: 'approval_granted',
      outcome: 'approved',
      metadata: { actionType: approval.action_type, comment: body.reviewComment }
    });

    // Execute the approved action
    logger.info(`Executing approved action [${approval.action_type}] for workflow [${approval.workflow_id}]`);

    if (approval.action_type === 'approve_purchase_order') {
      const payload = approval.action_payload;
      if (payload.sku) {
        const item = db.getInventoryItemById(wsId, payload.sku);
        if (item) {
          db.updateInventoryItem(wsId, item.id, {
            quantity: item.quantity + (payload.quantity || 50)
          });
        }
      }
      db.createInternalTask(wsId, {
        workflow_id: approval.workflow_id,
        title: `PO Executed: Restock ${payload.quantity} units for ${payload.sku}`,
        description: `Approved supplier purchase order of ${payload.quantity} units ($${payload.estimatedCost || 750}). Staged for inbound delivery.`,
        status: 'in_progress',
        priority: 'high',
        due_at: new Date(Date.now() + 86400000 * 5).toISOString()
      });
    } else if (approval.action_type === 'send_customer_email') {
      const payload = approval.action_payload;
      db.createNotification(wsId, {
        user_id: null,
        workflow_id: approval.workflow_id,
        title: `Email Dispatched: ${payload.subject}`,
        message: `Customer update delivered to ${payload.recipient}.`
      });
    }

    // If associated with a task in 'awaiting_approval', mark task completed and resume workflow!
    if (approval.task_id) {
      db.updateTask(wsId, approval.task_id, {
        status: 'completed',
        completed_at: new Date().toISOString()
      });
    }

    workflowEvents.emitWorkflowEvent(approval.workflow_id, 'approval_resolved', {
      approvalId,
      status: 'approved'
    });

    // Resume workflow
    workflowEngine.resumeWorkflow(wsId, approval.workflow_id).catch(err => {
      logger.error(`Error resuming workflow after approval: ${err.message}`);
    });

    res.json({ approval: resolved, success: true });
  } catch (err) {
    next(err);
  }
});

// POST /api/approvals/:approvalId/reject
approvalRouter.post('/:approvalId/reject', async (req: AuthenticatedRequest, res, next) => {
  try {
    const wsId = req.workspaceId || DEMO_WORKSPACE_ID;
    const approvalId = getParam(req.params.approvalId);
    const body = ResolveApprovalSchema.parse(req.body || {});

    const approval = db.getApprovalById(wsId, approvalId);
    if (!approval) {
      return res.status(404).json({ error: 'Approval request not found.' });
    }
    if (approval.status !== 'pending') {
      return res.status(400).json({ error: `Approval already resolved with status "${approval.status}".` });
    }

    const resolved = db.resolveApproval(wsId, approvalId, 'rejected', req.userId || DEMO_USER_ID, body.reviewComment);

    db.logActivity(wsId, {
      workflow_id: approval.workflow_id,
      task_id: approval.task_id,
      actor_type: 'user',
      actor_id: req.userId || DEMO_USER_ID,
      action: 'approval_rejected',
      outcome: 'rejected',
      metadata: { actionType: approval.action_type, comment: body.reviewComment }
    });

    // If associated with a task, mark task cancelled / blocked
    if (approval.task_id) {
      db.updateTask(wsId, approval.task_id, {
        status: 'blocked',
        error_summary: `Human reviewer rejected proposed action: ${body.reviewComment || 'No reason provided'}`
      });
    }

    workflowEvents.emitWorkflowEvent(approval.workflow_id, 'approval_resolved', {
      approvalId,
      status: 'rejected'
    });

    res.json({ approval: resolved, success: true });
  } catch (err) {
    next(err);
  }
});
