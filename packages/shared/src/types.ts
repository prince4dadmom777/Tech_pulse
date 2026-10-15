import { z } from 'zod';
import {
  WorkflowStatusSchema,
  TaskStatusSchema,
  ApprovalStatusSchema,
  AgentTypeSchema,
  ExecutionModeSchema,
  PrioritySchema,
  RiskLevelSchema,
  ApprovalPolicySchema,
  BusinessCategorySchema,
  ToolNameSchema,
  OrchestratorPlanSchema,
  PlanTaskSchema,
  BusinessAnalystOutputSchema,
  PlanningAgentOutputSchema,
  OperationsAgentOutputSchema,
  CustomerCommunicationOutputSchema,
  QualityRiskOutputSchema,
  FinalReportSchema,
  CreateWorkflowSchema,
  BusinessCustomerSchema,
  SupplierSchema,
  InventoryItemSchema,
  BusinessOrderSchema,
  TemplateSchema
} from './schemas.js';

export type WorkflowStatus = z.infer<typeof WorkflowStatusSchema>;
export type TaskStatus = z.infer<typeof TaskStatusSchema>;
export type ApprovalStatus = z.infer<typeof ApprovalStatusSchema>;
export type AgentType = z.infer<typeof AgentTypeSchema>;
export type ExecutionMode = z.infer<typeof ExecutionModeSchema>;
export type Priority = z.infer<typeof PrioritySchema>;
export type RiskLevel = z.infer<typeof RiskLevelSchema>;
export type ApprovalPolicy = z.infer<typeof ApprovalPolicySchema>;
export type BusinessCategory = z.infer<typeof BusinessCategorySchema>;
export type ToolName = z.infer<typeof ToolNameSchema>;

export type OrchestratorPlan = z.infer<typeof OrchestratorPlanSchema>;
export type PlanTask = z.infer<typeof PlanTaskSchema>;
export type BusinessAnalystOutput = z.infer<typeof BusinessAnalystOutputSchema>;
export type PlanningAgentOutput = z.infer<typeof PlanningAgentOutputSchema>;
export type OperationsAgentOutput = z.infer<typeof OperationsAgentOutputSchema>;
export type CustomerCommunicationOutput = z.infer<typeof CustomerCommunicationOutputSchema>;
export type QualityRiskOutput = z.infer<typeof QualityRiskOutputSchema>;
export type FinalReport = z.infer<typeof FinalReportSchema>;

export type CreateWorkflowInput = z.infer<typeof CreateWorkflowSchema>;
export type BusinessCustomerInput = z.infer<typeof BusinessCustomerSchema>;
export type SupplierInput = z.infer<typeof SupplierSchema>;
export type InventoryItemInput = z.infer<typeof InventoryItemSchema>;
export type BusinessOrderInput = z.infer<typeof BusinessOrderSchema>;
export type TemplateInput = z.infer<typeof TemplateSchema>;

export interface Workspace {
  id: string;
  name: string;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface WorkspaceMember {
  workspace_id: string;
  user_id: string;
  role: 'owner' | 'admin' | 'member' | 'viewer';
  created_at: string;
}

export interface Workflow {
  id: string;
  workspace_id: string;
  created_by: string;
  title: string;
  objective: string;
  category: string;
  priority: Priority;
  status: WorkflowStatus;
  execution_mode: ExecutionMode;
  approval_policy: ApprovalPolicy;
  plan: OrchestratorPlan | null;
  final_report: FinalReport | null;
  error_summary: string | null;
  deadline: string | null;
  started_at: string | null;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface Agent {
  id: string;
  agent_type: AgentType;
  name: string;
  description: string;
  enabled: boolean;
  configuration: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface WorkflowTask {
  id: string;
  workflow_id: string;
  agent_id: string | null;
  agent_type?: AgentType;
  title: string;
  description: string;
  status: TaskStatus;
  priority: Priority;
  input_data: Record<string, any>;
  output_data: Record<string, any> | null;
  tool_names: ToolName[];
  completion_criteria: Record<string, any>;
  attempt_count: number;
  max_attempts: number;
  idempotency_key: string | null;
  started_at: string | null;
  completed_at: string | null;
  error_summary: string | null;
  created_at: string;
  updated_at: string;
  dependencies?: string[];
}

export interface TaskDependency {
  task_id: string;
  depends_on_task_id: string;
  created_at: string;
}

export interface AgentExecution {
  id: string;
  workflow_id: string;
  task_id: string | null;
  agent_id: string;
  agent_type?: AgentType;
  status: 'queued' | 'running' | 'completed' | 'failed' | 'cancelled';
  input_summary: string | null;
  output_data: Record<string, any> | null;
  error_summary: string | null;
  started_at: string | null;
  completed_at: string | null;
  created_at: string;
}

export interface BusinessCustomer {
  id: string;
  workspace_id: string;
  name: string;
  email: string | null;
  phone: string | null;
  created_at: string;
  updated_at: string;
}

export interface Supplier {
  id: string;
  workspace_id: string;
  name: string;
  email: string | null;
  status: 'active' | 'inactive' | 'delayed';
  lead_time_days: number | null;
  created_at: string;
  updated_at: string;
}

export interface InventoryItem {
  id: string;
  workspace_id: string;
  sku: string;
  name: string;
  quantity: number;
  reorder_threshold: number;
  supplier_id: string | null;
  supplier_name?: string;
  created_at: string;
  updated_at: string;
}

export interface BusinessOrder {
  id: string;
  workspace_id: string;
  customer_id: string | null;
  customer_name?: string;
  order_number: string;
  status: 'pending' | 'processing' | 'delayed' | 'shipped' | 'delivered' | 'cancelled';
  expected_delivery: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface OrderItem {
  id: string;
  order_id: string;
  inventory_item_id: string;
  item_name?: string;
  quantity: number;
  created_at: string;
}

export interface InternalTask {
  id: string;
  workspace_id: string;
  workflow_id: string | null;
  title: string;
  description: string | null;
  status: 'open' | 'in_progress' | 'completed' | 'cancelled';
  priority: Priority;
  due_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface ApprovalRequest {
  id: string;
  workspace_id: string;
  workflow_id: string;
  task_id: string | null;
  task_title?: string;
  requested_by: string | null;
  reviewed_by: string | null;
  action_type: string;
  action_payload: Record<string, any>;
  action_hash: string;
  reason: string;
  risk_level: RiskLevel;
  status: ApprovalStatus;
  review_comment: string | null;
  reviewed_at: string | null;
  expires_at: string | null;
  created_at: string;
}

export interface ToolExecution {
  id: string;
  workspace_id: string;
  workflow_id: string;
  task_id: string | null;
  tool_name: ToolName;
  input_summary: Record<string, any> | null;
  output_summary: Record<string, any> | null;
  status: 'pending' | 'running' | 'succeeded' | 'failed' | 'denied';
  idempotency_key: string | null;
  error_summary: string | null;
  started_at: string | null;
  completed_at: string | null;
  created_at: string;
}

export interface ActivityLog {
  id: string;
  workspace_id: string;
  workflow_id: string | null;
  task_id: string | null;
  actor_type: string;
  actor_id: string | null;
  action: string;
  outcome: string;
  metadata: Record<string, any>;
  created_at: string;
}

export interface WorkflowTemplate {
  id: string;
  workspace_id: string | null;
  created_by: string | null;
  name: string;
  description: string;
  category: string;
  definition: {
    objective: string;
    priority: Priority;
    constraints?: string[];
    approvalPolicy?: ApprovalPolicy;
    suggestedTasks?: string[];
  };
  is_public: boolean;
  created_at: string;
  updated_at: string;
}

export interface Notification {
  id: string;
  workspace_id: string;
  user_id: string | null;
  workflow_id: string | null;
  title: string;
  message: string;
  read_at?: string | null;
  created_at: string;
}

export interface DashboardSummary {
  totalWorkflows: number;
  activeWorkflows: number;
  completedWorkflows: number;
  failedWorkflows: number;
  pendingApprovals: number;
  tasksCompletedTotal: number;
  estimatedTimeSavedMinutes: number;
  agentPerformance: Array<{
    agent_type: AgentType;
    name: string;
    completed: number;
    failed: number;
  }>;
}
