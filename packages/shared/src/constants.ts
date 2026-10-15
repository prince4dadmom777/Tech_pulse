export const WORKFLOW_STATUSES = [
  'draft',
  'planned',
  'awaiting_approval',
  'running',
  'paused',
  'completed',
  'failed',
  'cancelled',
  'needs_attention'
] as const;

export const TASK_STATUSES = [
  'pending',
  'ready',
  'running',
  'awaiting_approval',
  'completed',
  'failed',
  'blocked',
  'cancelled'
] as const;

export const APPROVAL_STATUSES = [
  'pending',
  'approved',
  'rejected',
  'cancelled'
] as const;

export const AGENT_TYPES = [
  'orchestrator',
  'business_analyst',
  'planner',
  'operations',
  'customer_communication',
  'quality_risk'
] as const;

export const EXECUTION_MODES = ['demo', 'ai'] as const;

export const PRIORITIES = ['low', 'medium', 'high', 'critical'] as const;

export const RISK_LEVELS = ['low', 'medium', 'high', 'critical'] as const;

export const APPROVAL_POLICIES = ['required', 'risk_based', 'manual_only'] as const;

export const BUSINESS_CATEGORIES = [
  'order_management',
  'inventory_management',
  'supplier_coordination',
  'customer_support',
  'internal_operations',
  'general'
] as const;

export const TOOL_NAMES = [
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
] as const;
