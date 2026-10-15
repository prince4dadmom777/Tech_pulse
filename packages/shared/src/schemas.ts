import { z } from 'zod';
import {
  WORKFLOW_STATUSES,
  TASK_STATUSES,
  APPROVAL_STATUSES,
  AGENT_TYPES,
  EXECUTION_MODES,
  PRIORITIES,
  RISK_LEVELS,
  APPROVAL_POLICIES,
  BUSINESS_CATEGORIES,
  TOOL_NAMES
} from './constants.js';

export const WorkflowStatusSchema = z.enum(WORKFLOW_STATUSES);
export const TaskStatusSchema = z.enum(TASK_STATUSES);
export const ApprovalStatusSchema = z.enum(APPROVAL_STATUSES);
export const AgentTypeSchema = z.enum(AGENT_TYPES);
export const ExecutionModeSchema = z.enum(EXECUTION_MODES);
export const PrioritySchema = z.enum(PRIORITIES);
export const RiskLevelSchema = z.enum(RISK_LEVELS);
export const ApprovalPolicySchema = z.enum(APPROVAL_POLICIES);
export const BusinessCategorySchema = z.enum(BUSINESS_CATEGORIES);
export const ToolNameSchema = z.enum(TOOL_NAMES);

// 15.1 Orchestrator Plan Schema
export const PlanTaskSchema = z.object({
  task_key: z.string().min(1),
  title: z.string().min(3).max(200),
  description: z.string().min(5),
  agent: AgentTypeSchema,
  priority: PrioritySchema.default('medium'),
  dependencies: z.array(z.string()).default([]),
  required_inputs: z.array(z.string()).default([]),
  proposed_tools: z.array(ToolNameSchema).default([]),
  approval_required: z.boolean().default(false),
  completion_criteria: z.array(z.string()).min(1)
});

export const OrchestratorPlanSchema = z.object({
  objective: z.string(),
  summary: z.string(),
  assumptions: z.array(z.string()).default([]),
  missing_information: z.array(z.string()).default([]),
  risks: z.array(
    z.object({
      description: z.string(),
      severity: RiskLevelSchema,
      mitigation: z.string()
    })
  ).default([]),
  tasks: z.array(PlanTaskSchema).min(1),
  success_criteria: z.array(z.string()).min(1)
});

// 15.2 Business Analyst Schema
export const BusinessAnalystFindingSchema = z.object({
  finding: z.string(),
  evidence: z.array(z.string()),
  confidence: z.number().min(0).max(1),
  impact: z.enum(['low', 'medium', 'high', 'critical'])
});

export const BusinessAnalystOutputSchema = z.object({
  findings: z.array(BusinessAnalystFindingSchema),
  bottlenecks: z.array(z.string()),
  missing_data: z.array(z.string()),
  recommended_focus: z.array(z.string())
});

// 15.3 Planning Agent Schema
export const PlanningAgentTaskSchema = z.object({
  task_key: z.string().min(1),
  title: z.string().min(3),
  description: z.string(),
  agent: AgentTypeSchema,
  priority: PrioritySchema,
  dependencies: z.array(z.string()).default([]),
  required_tools: z.array(ToolNameSchema).default([]),
  completion_criteria: z.array(z.string()),
  approval_required: z.boolean().default(false)
});

export const PlanningAgentOutputSchema = z.object({
  plan_summary: z.string(),
  tasks: z.array(PlanningAgentTaskSchema),
  execution_notes: z.array(z.string()).default([]),
  risks: z.array(z.string()).default([])
});

// 15.4 Operations Agent Schema
export const ToolCallProposalSchema = z.object({
  tool_name: ToolNameSchema,
  arguments: z.record(z.any()),
  reason: z.string()
});

export const OperationsAgentOutputSchema = z.object({
  task_key: z.string(),
  status: z.enum(['completed', 'blocked', 'failed', 'awaiting_approval']),
  observations: z.array(z.string()),
  actions_proposed: z.array(z.string()),
  tool_calls: z.array(ToolCallProposalSchema).default([]),
  results: z.array(z.string()).default([]),
  blockers: z.array(z.string()).default([]),
  verification_required: z.boolean().default(true)
});

// 15.5 Customer Communication Agent Schema
export const CustomerCommunicationOutputSchema = z.object({
  recipient_reference: z.string(),
  subject: z.string(),
  message: z.string(),
  verified_facts: z.array(z.string()),
  unverified_information: z.array(z.string()),
  requires_approval: z.boolean().default(true),
  delivery_mode: z.enum(['draft', 'simulated', 'sent']).default('draft')
});

// 15.6 Quality and Risk Agent Schema
export const QualityIssueSchema = z.object({
  description: z.string(),
  severity: RiskLevelSchema,
  recommended_correction: z.string()
});

export const QualityCheckSchema = z.object({
  name: z.string(),
  passed: z.boolean(),
  evidence: z.string()
});

export const QualityRiskOutputSchema = z.object({
  decision: z.enum(['approved', 'flagged', 'rejected']),
  issues: z.array(QualityIssueSchema).default([]),
  checks: z.array(QualityCheckSchema).default([]),
  completion_verified: z.boolean(),
  summary: z.string()
});

// 15.7 Final Report Schema
export const FinalReportSchema = z.object({
  workflow_summary: z.string(),
  completed_actions: z.array(z.string()),
  pending_actions: z.array(z.string()),
  failed_actions: z.array(z.string()),
  verified_outcomes: z.array(z.string()),
  estimated_time_saved_minutes: z.number().nonnegative(),
  estimation_method: z.string(),
  remaining_risks: z.array(z.string()),
  recommendations: z.array(z.string()),
  overall_status: z.enum(['completed', 'failed', 'needs_attention'])
});

// 9.1 Workflow Creation Form Schema
export const CreateWorkflowSchema = z.object({
  title: z.string().min(3).max(120),
  objective: z.string().min(20).max(5000),
  category: BusinessCategorySchema.default('general'),
  priority: PrioritySchema.default('medium'),
  deadline: z.string().datetime().nullable().optional(),
  constraints: z.array(z.string()).default([]),
  executionMode: ExecutionModeSchema.default('demo'),
  approvalPolicy: ApprovalPolicySchema.default('risk_based'),
  recordIds: z.array(z.string()).default([])
});

export const UpdateWorkflowSchema = CreateWorkflowSchema.partial().extend({
  status: WorkflowStatusSchema.optional()
});

// Task Schemas
export const CreateTaskSchema = z.object({
  workflowId: z.string().uuid(),
  agentId: z.string().uuid().optional(),
  title: z.string().min(3),
  description: z.string().min(3),
  priority: PrioritySchema.default('medium'),
  toolNames: z.array(ToolNameSchema).default([]),
  inputData: z.record(z.any()).default({}),
  completionCriteria: z.record(z.any()).default({}),
  dependencies: z.array(z.string()).default([])
});

// Approval Schemas
export const CreateApprovalRequestSchema = z.object({
  workflowId: z.string().uuid(),
  taskId: z.string().uuid().optional(),
  actionType: z.string(),
  actionPayload: z.record(z.any()),
  reason: z.string().min(5),
  riskLevel: RiskLevelSchema.default('medium')
});

export const ResolveApprovalSchema = z.object({
  reviewComment: z.string().max(1000).optional()
});

// Business Data Schemas
export const BusinessCustomerSchema = z.object({
  id: z.string().uuid().optional(),
  workspaceId: z.string().uuid().optional(),
  name: z.string().min(2).max(120),
  email: z.string().email().optional().or(z.literal('')),
  phone: z.string().optional().or(z.literal(''))
});

export const SupplierSchema = z.object({
  id: z.string().uuid().optional(),
  workspaceId: z.string().uuid().optional(),
  name: z.string().min(2).max(120),
  email: z.string().email().optional().or(z.literal('')),
  status: z.enum(['active', 'inactive', 'delayed']).default('active'),
  leadTimeDays: z.number().int().nonnegative().optional()
});

export const InventoryItemSchema = z.object({
  id: z.string().uuid().optional(),
  workspaceId: z.string().uuid().optional(),
  sku: z.string().min(2).max(50),
  name: z.string().min(2).max(120),
  quantity: z.number().int().nonnegative(),
  reorderThreshold: z.number().int().nonnegative().default(5),
  supplierId: z.string().uuid().nullable().optional()
});

export const BusinessOrderSchema = z.object({
  id: z.string().uuid().optional(),
  workspaceId: z.string().uuid().optional(),
  customerId: z.string().uuid().nullable().optional(),
  orderNumber: z.string().min(2).max(50),
  status: z.enum(['pending', 'processing', 'delayed', 'shipped', 'delivered', 'cancelled']).default('pending'),
  expectedDelivery: z.string().datetime().nullable().optional(),
  notes: z.string().optional().or(z.literal(''))
});

export const TemplateSchema = z.object({
  id: z.string().uuid().optional(),
  name: z.string().min(3).max(120),
  description: z.string().default(''),
  category: BusinessCategorySchema.default('general'),
  definition: z.object({
    objective: z.string(),
    priority: PrioritySchema,
    constraints: z.array(z.string()).default([]),
    approvalPolicy: ApprovalPolicySchema.default('risk_based'),
    suggestedTasks: z.array(z.string()).default([])
  }),
  isPublic: z.boolean().default(false)
});
