"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TOOL_NAMES = exports.BUSINESS_CATEGORIES = exports.APPROVAL_POLICIES = exports.RISK_LEVELS = exports.PRIORITIES = exports.EXECUTION_MODES = exports.AGENT_TYPES = exports.APPROVAL_STATUSES = exports.TASK_STATUSES = exports.WORKFLOW_STATUSES = void 0;
exports.WORKFLOW_STATUSES = [
    'draft',
    'planned',
    'awaiting_approval',
    'running',
    'paused',
    'completed',
    'failed',
    'cancelled',
    'needs_attention'
];
exports.TASK_STATUSES = [
    'pending',
    'ready',
    'running',
    'awaiting_approval',
    'completed',
    'failed',
    'blocked',
    'cancelled'
];
exports.APPROVAL_STATUSES = [
    'pending',
    'approved',
    'rejected',
    'cancelled'
];
exports.AGENT_TYPES = [
    'orchestrator',
    'business_analyst',
    'planner',
    'operations',
    'customer_communication',
    'quality_risk'
];
exports.EXECUTION_MODES = ['demo', 'ai'];
exports.PRIORITIES = ['low', 'medium', 'high', 'critical'];
exports.RISK_LEVELS = ['low', 'medium', 'high', 'critical'];
exports.APPROVAL_POLICIES = ['required', 'risk_based', 'manual_only'];
exports.BUSINESS_CATEGORIES = [
    'order_management',
    'inventory_management',
    'supplier_coordination',
    'customer_support',
    'internal_operations',
    'general'
];
exports.TOOL_NAMES = [
    'read_order',
    'read_inventory',
    'search_customers',
    'read_supplier_records',
    'create_internal_task',
    'update_permitted_internal_records',
    'generate_inventory_alert',
    'draft_customer_communication',
    'request_approval',
    'generate_final_report'
];
//# sourceMappingURL=constants.js.map