"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TemplateSchema = exports.BusinessOrderSchema = exports.InventoryItemSchema = exports.SupplierSchema = exports.BusinessCustomerSchema = exports.ResolveApprovalSchema = exports.CreateApprovalRequestSchema = exports.CreateTaskSchema = exports.UpdateWorkflowSchema = exports.CreateWorkflowSchema = exports.FinalReportSchema = exports.QualityRiskOutputSchema = exports.QualityCheckSchema = exports.QualityIssueSchema = exports.CustomerCommunicationOutputSchema = exports.OperationsAgentOutputSchema = exports.ToolCallProposalSchema = exports.PlanningAgentOutputSchema = exports.PlanningAgentTaskSchema = exports.BusinessAnalystOutputSchema = exports.BusinessAnalystFindingSchema = exports.OrchestratorPlanSchema = exports.PlanTaskSchema = exports.ToolNameSchema = exports.BusinessCategorySchema = exports.ApprovalPolicySchema = exports.RiskLevelSchema = exports.PrioritySchema = exports.ExecutionModeSchema = exports.AgentTypeSchema = exports.ApprovalStatusSchema = exports.TaskStatusSchema = exports.WorkflowStatusSchema = void 0;
const zod_1 = require("zod");
const constants_js_1 = require("./constants.js");
exports.WorkflowStatusSchema = zod_1.z.enum(constants_js_1.WORKFLOW_STATUSES);
exports.TaskStatusSchema = zod_1.z.enum(constants_js_1.TASK_STATUSES);
exports.ApprovalStatusSchema = zod_1.z.enum(constants_js_1.APPROVAL_STATUSES);
exports.AgentTypeSchema = zod_1.z.enum(constants_js_1.AGENT_TYPES);
exports.ExecutionModeSchema = zod_1.z.enum(constants_js_1.EXECUTION_MODES);
exports.PrioritySchema = zod_1.z.enum(constants_js_1.PRIORITIES);
exports.RiskLevelSchema = zod_1.z.enum(constants_js_1.RISK_LEVELS);
exports.ApprovalPolicySchema = zod_1.z.enum(constants_js_1.APPROVAL_POLICIES);
exports.BusinessCategorySchema = zod_1.z.enum(constants_js_1.BUSINESS_CATEGORIES);
exports.ToolNameSchema = zod_1.z.enum(constants_js_1.TOOL_NAMES);
// 15.1 Orchestrator Plan Schema
exports.PlanTaskSchema = zod_1.z.object({
    task_key: zod_1.z.string().min(1),
    title: zod_1.z.string().min(3).max(200),
    description: zod_1.z.string().min(5),
    agent: exports.AgentTypeSchema,
    priority: exports.PrioritySchema.default('medium'),
    dependencies: zod_1.z.array(zod_1.z.string()).default([]),
    required_inputs: zod_1.z.array(zod_1.z.string()).default([]),
    proposed_tools: zod_1.z.array(exports.ToolNameSchema).default([]),
    approval_required: zod_1.z.boolean().default(false),
    completion_criteria: zod_1.z.array(zod_1.z.string()).min(1)
});
exports.OrchestratorPlanSchema = zod_1.z.object({
    objective: zod_1.z.string(),
    summary: zod_1.z.string(),
    assumptions: zod_1.z.array(zod_1.z.string()).default([]),
    missing_information: zod_1.z.array(zod_1.z.string()).default([]),
    risks: zod_1.z.array(zod_1.z.object({
        description: zod_1.z.string(),
        severity: exports.RiskLevelSchema,
        mitigation: zod_1.z.string()
    })).default([]),
    tasks: zod_1.z.array(exports.PlanTaskSchema).min(1),
    success_criteria: zod_1.z.array(zod_1.z.string()).min(1)
});
// 15.2 Business Analyst Schema
exports.BusinessAnalystFindingSchema = zod_1.z.object({
    finding: zod_1.z.string(),
    evidence: zod_1.z.array(zod_1.z.string()),
    confidence: zod_1.z.number().min(0).max(1),
    impact: zod_1.z.enum(['low', 'medium', 'high', 'critical'])
});
exports.BusinessAnalystOutputSchema = zod_1.z.object({
    findings: zod_1.z.array(exports.BusinessAnalystFindingSchema),
    bottlenecks: zod_1.z.array(zod_1.z.string()),
    missing_data: zod_1.z.array(zod_1.z.string()),
    recommended_focus: zod_1.z.array(zod_1.z.string())
});
// 15.3 Planning Agent Schema
exports.PlanningAgentTaskSchema = zod_1.z.object({
    task_key: zod_1.z.string().min(1),
    title: zod_1.z.string().min(3),
    description: zod_1.z.string(),
    agent: exports.AgentTypeSchema,
    priority: exports.PrioritySchema,
    dependencies: zod_1.z.array(zod_1.z.string()).default([]),
    required_tools: zod_1.z.array(exports.ToolNameSchema).default([]),
    completion_criteria: zod_1.z.array(zod_1.z.string()),
    approval_required: zod_1.z.boolean().default(false)
});
exports.PlanningAgentOutputSchema = zod_1.z.object({
    plan_summary: zod_1.z.string(),
    tasks: zod_1.z.array(exports.PlanningAgentTaskSchema),
    execution_notes: zod_1.z.array(zod_1.z.string()).default([]),
    risks: zod_1.z.array(zod_1.z.string()).default([])
});
// 15.4 Operations Agent Schema
exports.ToolCallProposalSchema = zod_1.z.object({
    tool_name: exports.ToolNameSchema,
    arguments: zod_1.z.record(zod_1.z.any()),
    reason: zod_1.z.string()
});
exports.OperationsAgentOutputSchema = zod_1.z.object({
    task_key: zod_1.z.string(),
    status: zod_1.z.enum(['completed', 'blocked', 'failed', 'awaiting_approval']),
    observations: zod_1.z.array(zod_1.z.string()),
    actions_proposed: zod_1.z.array(zod_1.z.string()),
    tool_calls: zod_1.z.array(exports.ToolCallProposalSchema).default([]),
    results: zod_1.z.array(zod_1.z.string()).default([]),
    blockers: zod_1.z.array(zod_1.z.string()).default([]),
    verification_required: zod_1.z.boolean().default(true)
});
// 15.5 Customer Communication Agent Schema
exports.CustomerCommunicationOutputSchema = zod_1.z.object({
    recipient_reference: zod_1.z.string(),
    subject: zod_1.z.string(),
    message: zod_1.z.string(),
    verified_facts: zod_1.z.array(zod_1.z.string()),
    unverified_information: zod_1.z.array(zod_1.z.string()),
    requires_approval: zod_1.z.boolean().default(true),
    delivery_mode: zod_1.z.enum(['draft', 'simulated', 'sent']).default('draft')
});
// 15.6 Quality and Risk Agent Schema
exports.QualityIssueSchema = zod_1.z.object({
    description: zod_1.z.string(),
    severity: exports.RiskLevelSchema,
    recommended_correction: zod_1.z.string()
});
exports.QualityCheckSchema = zod_1.z.object({
    name: zod_1.z.string(),
    passed: zod_1.z.boolean(),
    evidence: zod_1.z.string()
});
exports.QualityRiskOutputSchema = zod_1.z.object({
    decision: zod_1.z.enum(['approved', 'flagged', 'rejected']),
    issues: zod_1.z.array(exports.QualityIssueSchema).default([]),
    checks: zod_1.z.array(exports.QualityCheckSchema).default([]),
    completion_verified: zod_1.z.boolean(),
    summary: zod_1.z.string()
});
// 15.7 Final Report Schema
exports.FinalReportSchema = zod_1.z.object({
    workflow_summary: zod_1.z.string(),
    completed_actions: zod_1.z.array(zod_1.z.string()),
    pending_actions: zod_1.z.array(zod_1.z.string()),
    failed_actions: zod_1.z.array(zod_1.z.string()),
    verified_outcomes: zod_1.z.array(zod_1.z.string()),
    estimated_time_saved_minutes: zod_1.z.number().nonnegative(),
    estimation_method: zod_1.z.string(),
    remaining_risks: zod_1.z.array(zod_1.z.string()),
    recommendations: zod_1.z.array(zod_1.z.string()),
    overall_status: zod_1.z.enum(['completed', 'failed', 'needs_attention'])
});
// 9.1 Workflow Creation Form Schema
exports.CreateWorkflowSchema = zod_1.z.object({
    title: zod_1.z.string().min(3).max(120),
    objective: zod_1.z.string().min(20).max(5000),
    category: exports.BusinessCategorySchema.default('general'),
    priority: exports.PrioritySchema.default('medium'),
    deadline: zod_1.z.string().datetime().nullable().optional(),
    constraints: zod_1.z.array(zod_1.z.string()).default([]),
    executionMode: exports.ExecutionModeSchema.default('demo'),
    approvalPolicy: exports.ApprovalPolicySchema.default('risk_based'),
    recordIds: zod_1.z.array(zod_1.z.string()).default([])
});
exports.UpdateWorkflowSchema = exports.CreateWorkflowSchema.partial().extend({
    status: exports.WorkflowStatusSchema.optional()
});
// Task Schemas
exports.CreateTaskSchema = zod_1.z.object({
    workflowId: zod_1.z.string().uuid(),
    agentId: zod_1.z.string().uuid().optional(),
    title: zod_1.z.string().min(3),
    description: zod_1.z.string().min(3),
    priority: exports.PrioritySchema.default('medium'),
    toolNames: zod_1.z.array(exports.ToolNameSchema).default([]),
    inputData: zod_1.z.record(zod_1.z.any()).default({}),
    completionCriteria: zod_1.z.record(zod_1.z.any()).default({}),
    dependencies: zod_1.z.array(zod_1.z.string()).default([])
});
// Approval Schemas
exports.CreateApprovalRequestSchema = zod_1.z.object({
    workflowId: zod_1.z.string().uuid(),
    taskId: zod_1.z.string().uuid().optional(),
    actionType: zod_1.z.string(),
    actionPayload: zod_1.z.record(zod_1.z.any()),
    reason: zod_1.z.string().min(5),
    riskLevel: exports.RiskLevelSchema.default('medium')
});
exports.ResolveApprovalSchema = zod_1.z.object({
    reviewComment: zod_1.z.string().max(1000).optional()
});
// Business Data Schemas
exports.BusinessCustomerSchema = zod_1.z.object({
    id: zod_1.z.string().uuid().optional(),
    workspaceId: zod_1.z.string().uuid().optional(),
    name: zod_1.z.string().min(2).max(120),
    email: zod_1.z.string().email().optional().or(zod_1.z.literal('')),
    phone: zod_1.z.string().optional().or(zod_1.z.literal(''))
});
exports.SupplierSchema = zod_1.z.object({
    id: zod_1.z.string().uuid().optional(),
    workspaceId: zod_1.z.string().uuid().optional(),
    name: zod_1.z.string().min(2).max(120),
    email: zod_1.z.string().email().optional().or(zod_1.z.literal('')),
    status: zod_1.z.enum(['active', 'inactive', 'delayed']).default('active'),
    leadTimeDays: zod_1.z.number().int().nonnegative().optional()
});
exports.InventoryItemSchema = zod_1.z.object({
    id: zod_1.z.string().uuid().optional(),
    workspaceId: zod_1.z.string().uuid().optional(),
    sku: zod_1.z.string().min(2).max(50),
    name: zod_1.z.string().min(2).max(120),
    quantity: zod_1.z.number().int().nonnegative(),
    reorderThreshold: zod_1.z.number().int().nonnegative().default(5),
    supplierId: zod_1.z.string().uuid().nullable().optional()
});
exports.BusinessOrderSchema = zod_1.z.object({
    id: zod_1.z.string().uuid().optional(),
    workspaceId: zod_1.z.string().uuid().optional(),
    customerId: zod_1.z.string().uuid().nullable().optional(),
    orderNumber: zod_1.z.string().min(2).max(50),
    status: zod_1.z.enum(['pending', 'processing', 'delayed', 'shipped', 'delivered', 'cancelled']).default('pending'),
    expectedDelivery: zod_1.z.string().datetime().nullable().optional(),
    notes: zod_1.z.string().optional().or(zod_1.z.literal(''))
});
exports.TemplateSchema = zod_1.z.object({
    id: zod_1.z.string().uuid().optional(),
    name: zod_1.z.string().min(3).max(120),
    description: zod_1.z.string().default(''),
    category: exports.BusinessCategorySchema.default('general'),
    definition: zod_1.z.object({
        objective: zod_1.z.string(),
        priority: exports.PrioritySchema,
        constraints: zod_1.z.array(zod_1.z.string()).default([]),
        approvalPolicy: exports.ApprovalPolicySchema.default('risk_based'),
        suggestedTasks: zod_1.z.array(zod_1.z.string()).default([])
    }),
    isPublic: zod_1.z.boolean().default(false)
});
//# sourceMappingURL=schemas.js.map