import { z } from 'zod';
export declare const WorkflowStatusSchema: z.ZodEnum<["draft", "planned", "awaiting_approval", "running", "paused", "completed", "failed", "cancelled", "needs_attention"]>;
export declare const TaskStatusSchema: z.ZodEnum<["pending", "ready", "running", "awaiting_approval", "completed", "failed", "blocked", "cancelled"]>;
export declare const ApprovalStatusSchema: z.ZodEnum<["pending", "approved", "rejected", "cancelled"]>;
export declare const AgentTypeSchema: z.ZodEnum<["orchestrator", "business_analyst", "planner", "operations", "customer_communication", "quality_risk"]>;
export declare const ExecutionModeSchema: z.ZodEnum<["demo", "ai"]>;
export declare const PrioritySchema: z.ZodEnum<["low", "medium", "high", "critical"]>;
export declare const RiskLevelSchema: z.ZodEnum<["low", "medium", "high", "critical"]>;
export declare const ApprovalPolicySchema: z.ZodEnum<["required", "risk_based", "manual_only"]>;
export declare const BusinessCategorySchema: z.ZodEnum<["order_management", "inventory_management", "supplier_coordination", "customer_support", "internal_operations", "general"]>;
export declare const ToolNameSchema: z.ZodEnum<["read_order", "read_inventory", "search_customers", "read_supplier_records", "create_internal_task", "update_permitted_internal_records", "generate_inventory_alert", "draft_customer_communication", "request_approval", "generate_final_report"]>;
export declare const PlanTaskSchema: z.ZodObject<{
    task_key: z.ZodString;
    title: z.ZodString;
    description: z.ZodString;
    agent: z.ZodEnum<["orchestrator", "business_analyst", "planner", "operations", "customer_communication", "quality_risk"]>;
    priority: z.ZodDefault<z.ZodEnum<["low", "medium", "high", "critical"]>>;
    dependencies: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
    required_inputs: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
    proposed_tools: z.ZodDefault<z.ZodArray<z.ZodEnum<["read_order", "read_inventory", "search_customers", "read_supplier_records", "create_internal_task", "update_permitted_internal_records", "generate_inventory_alert", "draft_customer_communication", "request_approval", "generate_final_report"]>, "many">>;
    approval_required: z.ZodDefault<z.ZodBoolean>;
    completion_criteria: z.ZodArray<z.ZodString, "many">;
}, "strip", z.ZodTypeAny, {
    task_key: string;
    title: string;
    description: string;
    agent: "orchestrator" | "business_analyst" | "planner" | "operations" | "customer_communication" | "quality_risk";
    priority: "low" | "medium" | "high" | "critical";
    dependencies: string[];
    required_inputs: string[];
    proposed_tools: ("read_order" | "read_inventory" | "search_customers" | "read_supplier_records" | "create_internal_task" | "update_permitted_internal_records" | "generate_inventory_alert" | "draft_customer_communication" | "request_approval" | "generate_final_report")[];
    approval_required: boolean;
    completion_criteria: string[];
}, {
    task_key: string;
    title: string;
    description: string;
    agent: "orchestrator" | "business_analyst" | "planner" | "operations" | "customer_communication" | "quality_risk";
    completion_criteria: string[];
    priority?: "low" | "medium" | "high" | "critical" | undefined;
    dependencies?: string[] | undefined;
    required_inputs?: string[] | undefined;
    proposed_tools?: ("read_order" | "read_inventory" | "search_customers" | "read_supplier_records" | "create_internal_task" | "update_permitted_internal_records" | "generate_inventory_alert" | "draft_customer_communication" | "request_approval" | "generate_final_report")[] | undefined;
    approval_required?: boolean | undefined;
}>;
export declare const OrchestratorPlanSchema: z.ZodObject<{
    objective: z.ZodString;
    summary: z.ZodString;
    assumptions: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
    missing_information: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
    risks: z.ZodDefault<z.ZodArray<z.ZodObject<{
        description: z.ZodString;
        severity: z.ZodEnum<["low", "medium", "high", "critical"]>;
        mitigation: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        description: string;
        severity: "low" | "medium" | "high" | "critical";
        mitigation: string;
    }, {
        description: string;
        severity: "low" | "medium" | "high" | "critical";
        mitigation: string;
    }>, "many">>;
    tasks: z.ZodArray<z.ZodObject<{
        task_key: z.ZodString;
        title: z.ZodString;
        description: z.ZodString;
        agent: z.ZodEnum<["orchestrator", "business_analyst", "planner", "operations", "customer_communication", "quality_risk"]>;
        priority: z.ZodDefault<z.ZodEnum<["low", "medium", "high", "critical"]>>;
        dependencies: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
        required_inputs: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
        proposed_tools: z.ZodDefault<z.ZodArray<z.ZodEnum<["read_order", "read_inventory", "search_customers", "read_supplier_records", "create_internal_task", "update_permitted_internal_records", "generate_inventory_alert", "draft_customer_communication", "request_approval", "generate_final_report"]>, "many">>;
        approval_required: z.ZodDefault<z.ZodBoolean>;
        completion_criteria: z.ZodArray<z.ZodString, "many">;
    }, "strip", z.ZodTypeAny, {
        task_key: string;
        title: string;
        description: string;
        agent: "orchestrator" | "business_analyst" | "planner" | "operations" | "customer_communication" | "quality_risk";
        priority: "low" | "medium" | "high" | "critical";
        dependencies: string[];
        required_inputs: string[];
        proposed_tools: ("read_order" | "read_inventory" | "search_customers" | "read_supplier_records" | "create_internal_task" | "update_permitted_internal_records" | "generate_inventory_alert" | "draft_customer_communication" | "request_approval" | "generate_final_report")[];
        approval_required: boolean;
        completion_criteria: string[];
    }, {
        task_key: string;
        title: string;
        description: string;
        agent: "orchestrator" | "business_analyst" | "planner" | "operations" | "customer_communication" | "quality_risk";
        completion_criteria: string[];
        priority?: "low" | "medium" | "high" | "critical" | undefined;
        dependencies?: string[] | undefined;
        required_inputs?: string[] | undefined;
        proposed_tools?: ("read_order" | "read_inventory" | "search_customers" | "read_supplier_records" | "create_internal_task" | "update_permitted_internal_records" | "generate_inventory_alert" | "draft_customer_communication" | "request_approval" | "generate_final_report")[] | undefined;
        approval_required?: boolean | undefined;
    }>, "many">;
    success_criteria: z.ZodArray<z.ZodString, "many">;
}, "strip", z.ZodTypeAny, {
    objective: string;
    summary: string;
    assumptions: string[];
    missing_information: string[];
    risks: {
        description: string;
        severity: "low" | "medium" | "high" | "critical";
        mitigation: string;
    }[];
    tasks: {
        task_key: string;
        title: string;
        description: string;
        agent: "orchestrator" | "business_analyst" | "planner" | "operations" | "customer_communication" | "quality_risk";
        priority: "low" | "medium" | "high" | "critical";
        dependencies: string[];
        required_inputs: string[];
        proposed_tools: ("read_order" | "read_inventory" | "search_customers" | "read_supplier_records" | "create_internal_task" | "update_permitted_internal_records" | "generate_inventory_alert" | "draft_customer_communication" | "request_approval" | "generate_final_report")[];
        approval_required: boolean;
        completion_criteria: string[];
    }[];
    success_criteria: string[];
}, {
    objective: string;
    summary: string;
    tasks: {
        task_key: string;
        title: string;
        description: string;
        agent: "orchestrator" | "business_analyst" | "planner" | "operations" | "customer_communication" | "quality_risk";
        completion_criteria: string[];
        priority?: "low" | "medium" | "high" | "critical" | undefined;
        dependencies?: string[] | undefined;
        required_inputs?: string[] | undefined;
        proposed_tools?: ("read_order" | "read_inventory" | "search_customers" | "read_supplier_records" | "create_internal_task" | "update_permitted_internal_records" | "generate_inventory_alert" | "draft_customer_communication" | "request_approval" | "generate_final_report")[] | undefined;
        approval_required?: boolean | undefined;
    }[];
    success_criteria: string[];
    assumptions?: string[] | undefined;
    missing_information?: string[] | undefined;
    risks?: {
        description: string;
        severity: "low" | "medium" | "high" | "critical";
        mitigation: string;
    }[] | undefined;
}>;
export declare const BusinessAnalystFindingSchema: z.ZodObject<{
    finding: z.ZodString;
    evidence: z.ZodArray<z.ZodString, "many">;
    confidence: z.ZodNumber;
    impact: z.ZodEnum<["low", "medium", "high", "critical"]>;
}, "strip", z.ZodTypeAny, {
    finding: string;
    evidence: string[];
    confidence: number;
    impact: "low" | "medium" | "high" | "critical";
}, {
    finding: string;
    evidence: string[];
    confidence: number;
    impact: "low" | "medium" | "high" | "critical";
}>;
export declare const BusinessAnalystOutputSchema: z.ZodObject<{
    findings: z.ZodArray<z.ZodObject<{
        finding: z.ZodString;
        evidence: z.ZodArray<z.ZodString, "many">;
        confidence: z.ZodNumber;
        impact: z.ZodEnum<["low", "medium", "high", "critical"]>;
    }, "strip", z.ZodTypeAny, {
        finding: string;
        evidence: string[];
        confidence: number;
        impact: "low" | "medium" | "high" | "critical";
    }, {
        finding: string;
        evidence: string[];
        confidence: number;
        impact: "low" | "medium" | "high" | "critical";
    }>, "many">;
    bottlenecks: z.ZodArray<z.ZodString, "many">;
    missing_data: z.ZodArray<z.ZodString, "many">;
    recommended_focus: z.ZodArray<z.ZodString, "many">;
}, "strip", z.ZodTypeAny, {
    findings: {
        finding: string;
        evidence: string[];
        confidence: number;
        impact: "low" | "medium" | "high" | "critical";
    }[];
    bottlenecks: string[];
    missing_data: string[];
    recommended_focus: string[];
}, {
    findings: {
        finding: string;
        evidence: string[];
        confidence: number;
        impact: "low" | "medium" | "high" | "critical";
    }[];
    bottlenecks: string[];
    missing_data: string[];
    recommended_focus: string[];
}>;
export declare const PlanningAgentTaskSchema: z.ZodObject<{
    task_key: z.ZodString;
    title: z.ZodString;
    description: z.ZodString;
    agent: z.ZodEnum<["orchestrator", "business_analyst", "planner", "operations", "customer_communication", "quality_risk"]>;
    priority: z.ZodEnum<["low", "medium", "high", "critical"]>;
    dependencies: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
    required_tools: z.ZodDefault<z.ZodArray<z.ZodEnum<["read_order", "read_inventory", "search_customers", "read_supplier_records", "create_internal_task", "update_permitted_internal_records", "generate_inventory_alert", "draft_customer_communication", "request_approval", "generate_final_report"]>, "many">>;
    completion_criteria: z.ZodArray<z.ZodString, "many">;
    approval_required: z.ZodDefault<z.ZodBoolean>;
}, "strip", z.ZodTypeAny, {
    task_key: string;
    title: string;
    description: string;
    agent: "orchestrator" | "business_analyst" | "planner" | "operations" | "customer_communication" | "quality_risk";
    priority: "low" | "medium" | "high" | "critical";
    dependencies: string[];
    approval_required: boolean;
    completion_criteria: string[];
    required_tools: ("read_order" | "read_inventory" | "search_customers" | "read_supplier_records" | "create_internal_task" | "update_permitted_internal_records" | "generate_inventory_alert" | "draft_customer_communication" | "request_approval" | "generate_final_report")[];
}, {
    task_key: string;
    title: string;
    description: string;
    agent: "orchestrator" | "business_analyst" | "planner" | "operations" | "customer_communication" | "quality_risk";
    priority: "low" | "medium" | "high" | "critical";
    completion_criteria: string[];
    dependencies?: string[] | undefined;
    approval_required?: boolean | undefined;
    required_tools?: ("read_order" | "read_inventory" | "search_customers" | "read_supplier_records" | "create_internal_task" | "update_permitted_internal_records" | "generate_inventory_alert" | "draft_customer_communication" | "request_approval" | "generate_final_report")[] | undefined;
}>;
export declare const PlanningAgentOutputSchema: z.ZodObject<{
    plan_summary: z.ZodString;
    tasks: z.ZodArray<z.ZodObject<{
        task_key: z.ZodString;
        title: z.ZodString;
        description: z.ZodString;
        agent: z.ZodEnum<["orchestrator", "business_analyst", "planner", "operations", "customer_communication", "quality_risk"]>;
        priority: z.ZodEnum<["low", "medium", "high", "critical"]>;
        dependencies: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
        required_tools: z.ZodDefault<z.ZodArray<z.ZodEnum<["read_order", "read_inventory", "search_customers", "read_supplier_records", "create_internal_task", "update_permitted_internal_records", "generate_inventory_alert", "draft_customer_communication", "request_approval", "generate_final_report"]>, "many">>;
        completion_criteria: z.ZodArray<z.ZodString, "many">;
        approval_required: z.ZodDefault<z.ZodBoolean>;
    }, "strip", z.ZodTypeAny, {
        task_key: string;
        title: string;
        description: string;
        agent: "orchestrator" | "business_analyst" | "planner" | "operations" | "customer_communication" | "quality_risk";
        priority: "low" | "medium" | "high" | "critical";
        dependencies: string[];
        approval_required: boolean;
        completion_criteria: string[];
        required_tools: ("read_order" | "read_inventory" | "search_customers" | "read_supplier_records" | "create_internal_task" | "update_permitted_internal_records" | "generate_inventory_alert" | "draft_customer_communication" | "request_approval" | "generate_final_report")[];
    }, {
        task_key: string;
        title: string;
        description: string;
        agent: "orchestrator" | "business_analyst" | "planner" | "operations" | "customer_communication" | "quality_risk";
        priority: "low" | "medium" | "high" | "critical";
        completion_criteria: string[];
        dependencies?: string[] | undefined;
        approval_required?: boolean | undefined;
        required_tools?: ("read_order" | "read_inventory" | "search_customers" | "read_supplier_records" | "create_internal_task" | "update_permitted_internal_records" | "generate_inventory_alert" | "draft_customer_communication" | "request_approval" | "generate_final_report")[] | undefined;
    }>, "many">;
    execution_notes: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
    risks: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
}, "strip", z.ZodTypeAny, {
    risks: string[];
    tasks: {
        task_key: string;
        title: string;
        description: string;
        agent: "orchestrator" | "business_analyst" | "planner" | "operations" | "customer_communication" | "quality_risk";
        priority: "low" | "medium" | "high" | "critical";
        dependencies: string[];
        approval_required: boolean;
        completion_criteria: string[];
        required_tools: ("read_order" | "read_inventory" | "search_customers" | "read_supplier_records" | "create_internal_task" | "update_permitted_internal_records" | "generate_inventory_alert" | "draft_customer_communication" | "request_approval" | "generate_final_report")[];
    }[];
    plan_summary: string;
    execution_notes: string[];
}, {
    tasks: {
        task_key: string;
        title: string;
        description: string;
        agent: "orchestrator" | "business_analyst" | "planner" | "operations" | "customer_communication" | "quality_risk";
        priority: "low" | "medium" | "high" | "critical";
        completion_criteria: string[];
        dependencies?: string[] | undefined;
        approval_required?: boolean | undefined;
        required_tools?: ("read_order" | "read_inventory" | "search_customers" | "read_supplier_records" | "create_internal_task" | "update_permitted_internal_records" | "generate_inventory_alert" | "draft_customer_communication" | "request_approval" | "generate_final_report")[] | undefined;
    }[];
    plan_summary: string;
    risks?: string[] | undefined;
    execution_notes?: string[] | undefined;
}>;
export declare const ToolCallProposalSchema: z.ZodObject<{
    tool_name: z.ZodEnum<["read_order", "read_inventory", "search_customers", "read_supplier_records", "create_internal_task", "update_permitted_internal_records", "generate_inventory_alert", "draft_customer_communication", "request_approval", "generate_final_report"]>;
    arguments: z.ZodRecord<z.ZodString, z.ZodAny>;
    reason: z.ZodString;
}, "strip", z.ZodTypeAny, {
    tool_name: "read_order" | "read_inventory" | "search_customers" | "read_supplier_records" | "create_internal_task" | "update_permitted_internal_records" | "generate_inventory_alert" | "draft_customer_communication" | "request_approval" | "generate_final_report";
    arguments: Record<string, any>;
    reason: string;
}, {
    tool_name: "read_order" | "read_inventory" | "search_customers" | "read_supplier_records" | "create_internal_task" | "update_permitted_internal_records" | "generate_inventory_alert" | "draft_customer_communication" | "request_approval" | "generate_final_report";
    arguments: Record<string, any>;
    reason: string;
}>;
export declare const OperationsAgentOutputSchema: z.ZodObject<{
    task_key: z.ZodString;
    status: z.ZodEnum<["completed", "blocked", "failed", "awaiting_approval"]>;
    observations: z.ZodArray<z.ZodString, "many">;
    actions_proposed: z.ZodArray<z.ZodString, "many">;
    tool_calls: z.ZodDefault<z.ZodArray<z.ZodObject<{
        tool_name: z.ZodEnum<["read_order", "read_inventory", "search_customers", "read_supplier_records", "create_internal_task", "update_permitted_internal_records", "generate_inventory_alert", "draft_customer_communication", "request_approval", "generate_final_report"]>;
        arguments: z.ZodRecord<z.ZodString, z.ZodAny>;
        reason: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        tool_name: "read_order" | "read_inventory" | "search_customers" | "read_supplier_records" | "create_internal_task" | "update_permitted_internal_records" | "generate_inventory_alert" | "draft_customer_communication" | "request_approval" | "generate_final_report";
        arguments: Record<string, any>;
        reason: string;
    }, {
        tool_name: "read_order" | "read_inventory" | "search_customers" | "read_supplier_records" | "create_internal_task" | "update_permitted_internal_records" | "generate_inventory_alert" | "draft_customer_communication" | "request_approval" | "generate_final_report";
        arguments: Record<string, any>;
        reason: string;
    }>, "many">>;
    results: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
    blockers: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
    verification_required: z.ZodDefault<z.ZodBoolean>;
}, "strip", z.ZodTypeAny, {
    task_key: string;
    status: "awaiting_approval" | "completed" | "failed" | "blocked";
    observations: string[];
    actions_proposed: string[];
    tool_calls: {
        tool_name: "read_order" | "read_inventory" | "search_customers" | "read_supplier_records" | "create_internal_task" | "update_permitted_internal_records" | "generate_inventory_alert" | "draft_customer_communication" | "request_approval" | "generate_final_report";
        arguments: Record<string, any>;
        reason: string;
    }[];
    results: string[];
    blockers: string[];
    verification_required: boolean;
}, {
    task_key: string;
    status: "awaiting_approval" | "completed" | "failed" | "blocked";
    observations: string[];
    actions_proposed: string[];
    tool_calls?: {
        tool_name: "read_order" | "read_inventory" | "search_customers" | "read_supplier_records" | "create_internal_task" | "update_permitted_internal_records" | "generate_inventory_alert" | "draft_customer_communication" | "request_approval" | "generate_final_report";
        arguments: Record<string, any>;
        reason: string;
    }[] | undefined;
    results?: string[] | undefined;
    blockers?: string[] | undefined;
    verification_required?: boolean | undefined;
}>;
export declare const CustomerCommunicationOutputSchema: z.ZodObject<{
    recipient_reference: z.ZodString;
    subject: z.ZodString;
    message: z.ZodString;
    verified_facts: z.ZodArray<z.ZodString, "many">;
    unverified_information: z.ZodArray<z.ZodString, "many">;
    requires_approval: z.ZodDefault<z.ZodBoolean>;
    delivery_mode: z.ZodDefault<z.ZodEnum<["draft", "simulated", "sent"]>>;
}, "strip", z.ZodTypeAny, {
    message: string;
    recipient_reference: string;
    subject: string;
    verified_facts: string[];
    unverified_information: string[];
    requires_approval: boolean;
    delivery_mode: "draft" | "simulated" | "sent";
}, {
    message: string;
    recipient_reference: string;
    subject: string;
    verified_facts: string[];
    unverified_information: string[];
    requires_approval?: boolean | undefined;
    delivery_mode?: "draft" | "simulated" | "sent" | undefined;
}>;
export declare const QualityIssueSchema: z.ZodObject<{
    description: z.ZodString;
    severity: z.ZodEnum<["low", "medium", "high", "critical"]>;
    recommended_correction: z.ZodString;
}, "strip", z.ZodTypeAny, {
    description: string;
    severity: "low" | "medium" | "high" | "critical";
    recommended_correction: string;
}, {
    description: string;
    severity: "low" | "medium" | "high" | "critical";
    recommended_correction: string;
}>;
export declare const QualityCheckSchema: z.ZodObject<{
    name: z.ZodString;
    passed: z.ZodBoolean;
    evidence: z.ZodString;
}, "strip", z.ZodTypeAny, {
    evidence: string;
    name: string;
    passed: boolean;
}, {
    evidence: string;
    name: string;
    passed: boolean;
}>;
export declare const QualityRiskOutputSchema: z.ZodObject<{
    decision: z.ZodEnum<["approved", "flagged", "rejected"]>;
    issues: z.ZodDefault<z.ZodArray<z.ZodObject<{
        description: z.ZodString;
        severity: z.ZodEnum<["low", "medium", "high", "critical"]>;
        recommended_correction: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        description: string;
        severity: "low" | "medium" | "high" | "critical";
        recommended_correction: string;
    }, {
        description: string;
        severity: "low" | "medium" | "high" | "critical";
        recommended_correction: string;
    }>, "many">>;
    checks: z.ZodDefault<z.ZodArray<z.ZodObject<{
        name: z.ZodString;
        passed: z.ZodBoolean;
        evidence: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        evidence: string;
        name: string;
        passed: boolean;
    }, {
        evidence: string;
        name: string;
        passed: boolean;
    }>, "many">>;
    completion_verified: z.ZodBoolean;
    summary: z.ZodString;
}, "strip", z.ZodTypeAny, {
    issues: {
        description: string;
        severity: "low" | "medium" | "high" | "critical";
        recommended_correction: string;
    }[];
    summary: string;
    decision: "approved" | "rejected" | "flagged";
    checks: {
        evidence: string;
        name: string;
        passed: boolean;
    }[];
    completion_verified: boolean;
}, {
    summary: string;
    decision: "approved" | "rejected" | "flagged";
    completion_verified: boolean;
    issues?: {
        description: string;
        severity: "low" | "medium" | "high" | "critical";
        recommended_correction: string;
    }[] | undefined;
    checks?: {
        evidence: string;
        name: string;
        passed: boolean;
    }[] | undefined;
}>;
export declare const FinalReportSchema: z.ZodObject<{
    workflow_summary: z.ZodString;
    completed_actions: z.ZodArray<z.ZodString, "many">;
    pending_actions: z.ZodArray<z.ZodString, "many">;
    failed_actions: z.ZodArray<z.ZodString, "many">;
    verified_outcomes: z.ZodArray<z.ZodString, "many">;
    estimated_time_saved_minutes: z.ZodNumber;
    estimation_method: z.ZodString;
    remaining_risks: z.ZodArray<z.ZodString, "many">;
    recommendations: z.ZodArray<z.ZodString, "many">;
    overall_status: z.ZodEnum<["completed", "failed", "needs_attention"]>;
}, "strip", z.ZodTypeAny, {
    workflow_summary: string;
    completed_actions: string[];
    pending_actions: string[];
    failed_actions: string[];
    verified_outcomes: string[];
    estimated_time_saved_minutes: number;
    estimation_method: string;
    remaining_risks: string[];
    recommendations: string[];
    overall_status: "completed" | "failed" | "needs_attention";
}, {
    workflow_summary: string;
    completed_actions: string[];
    pending_actions: string[];
    failed_actions: string[];
    verified_outcomes: string[];
    estimated_time_saved_minutes: number;
    estimation_method: string;
    remaining_risks: string[];
    recommendations: string[];
    overall_status: "completed" | "failed" | "needs_attention";
}>;
export declare const CreateWorkflowSchema: z.ZodObject<{
    title: z.ZodString;
    objective: z.ZodString;
    category: z.ZodDefault<z.ZodEnum<["order_management", "inventory_management", "supplier_coordination", "customer_support", "internal_operations", "general"]>>;
    priority: z.ZodDefault<z.ZodEnum<["low", "medium", "high", "critical"]>>;
    deadline: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    constraints: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
    executionMode: z.ZodDefault<z.ZodEnum<["demo", "ai"]>>;
    approvalPolicy: z.ZodDefault<z.ZodEnum<["required", "risk_based", "manual_only"]>>;
    recordIds: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
}, "strip", z.ZodTypeAny, {
    title: string;
    priority: "low" | "medium" | "high" | "critical";
    objective: string;
    category: "order_management" | "inventory_management" | "supplier_coordination" | "customer_support" | "internal_operations" | "general";
    constraints: string[];
    executionMode: "demo" | "ai";
    approvalPolicy: "required" | "risk_based" | "manual_only";
    recordIds: string[];
    deadline?: string | null | undefined;
}, {
    title: string;
    objective: string;
    priority?: "low" | "medium" | "high" | "critical" | undefined;
    category?: "order_management" | "inventory_management" | "supplier_coordination" | "customer_support" | "internal_operations" | "general" | undefined;
    deadline?: string | null | undefined;
    constraints?: string[] | undefined;
    executionMode?: "demo" | "ai" | undefined;
    approvalPolicy?: "required" | "risk_based" | "manual_only" | undefined;
    recordIds?: string[] | undefined;
}>;
export declare const UpdateWorkflowSchema: z.ZodObject<{
    title: z.ZodOptional<z.ZodString>;
    objective: z.ZodOptional<z.ZodString>;
    category: z.ZodOptional<z.ZodDefault<z.ZodEnum<["order_management", "inventory_management", "supplier_coordination", "customer_support", "internal_operations", "general"]>>>;
    priority: z.ZodOptional<z.ZodDefault<z.ZodEnum<["low", "medium", "high", "critical"]>>>;
    deadline: z.ZodOptional<z.ZodOptional<z.ZodNullable<z.ZodString>>>;
    constraints: z.ZodOptional<z.ZodDefault<z.ZodArray<z.ZodString, "many">>>;
    executionMode: z.ZodOptional<z.ZodDefault<z.ZodEnum<["demo", "ai"]>>>;
    approvalPolicy: z.ZodOptional<z.ZodDefault<z.ZodEnum<["required", "risk_based", "manual_only"]>>>;
    recordIds: z.ZodOptional<z.ZodDefault<z.ZodArray<z.ZodString, "many">>>;
} & {
    status: z.ZodOptional<z.ZodEnum<["draft", "planned", "awaiting_approval", "running", "paused", "completed", "failed", "cancelled", "needs_attention"]>>;
}, "strip", z.ZodTypeAny, {
    title?: string | undefined;
    priority?: "low" | "medium" | "high" | "critical" | undefined;
    status?: "draft" | "planned" | "awaiting_approval" | "running" | "paused" | "completed" | "failed" | "cancelled" | "needs_attention" | undefined;
    objective?: string | undefined;
    category?: "order_management" | "inventory_management" | "supplier_coordination" | "customer_support" | "internal_operations" | "general" | undefined;
    deadline?: string | null | undefined;
    constraints?: string[] | undefined;
    executionMode?: "demo" | "ai" | undefined;
    approvalPolicy?: "required" | "risk_based" | "manual_only" | undefined;
    recordIds?: string[] | undefined;
}, {
    title?: string | undefined;
    priority?: "low" | "medium" | "high" | "critical" | undefined;
    status?: "draft" | "planned" | "awaiting_approval" | "running" | "paused" | "completed" | "failed" | "cancelled" | "needs_attention" | undefined;
    objective?: string | undefined;
    category?: "order_management" | "inventory_management" | "supplier_coordination" | "customer_support" | "internal_operations" | "general" | undefined;
    deadline?: string | null | undefined;
    constraints?: string[] | undefined;
    executionMode?: "demo" | "ai" | undefined;
    approvalPolicy?: "required" | "risk_based" | "manual_only" | undefined;
    recordIds?: string[] | undefined;
}>;
export declare const CreateTaskSchema: z.ZodObject<{
    workflowId: z.ZodString;
    agentId: z.ZodOptional<z.ZodString>;
    title: z.ZodString;
    description: z.ZodString;
    priority: z.ZodDefault<z.ZodEnum<["low", "medium", "high", "critical"]>>;
    toolNames: z.ZodDefault<z.ZodArray<z.ZodEnum<["read_order", "read_inventory", "search_customers", "read_supplier_records", "create_internal_task", "update_permitted_internal_records", "generate_inventory_alert", "draft_customer_communication", "request_approval", "generate_final_report"]>, "many">>;
    inputData: z.ZodDefault<z.ZodRecord<z.ZodString, z.ZodAny>>;
    completionCriteria: z.ZodDefault<z.ZodRecord<z.ZodString, z.ZodAny>>;
    dependencies: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
}, "strip", z.ZodTypeAny, {
    title: string;
    description: string;
    priority: "low" | "medium" | "high" | "critical";
    dependencies: string[];
    workflowId: string;
    toolNames: ("read_order" | "read_inventory" | "search_customers" | "read_supplier_records" | "create_internal_task" | "update_permitted_internal_records" | "generate_inventory_alert" | "draft_customer_communication" | "request_approval" | "generate_final_report")[];
    inputData: Record<string, any>;
    completionCriteria: Record<string, any>;
    agentId?: string | undefined;
}, {
    title: string;
    description: string;
    workflowId: string;
    priority?: "low" | "medium" | "high" | "critical" | undefined;
    dependencies?: string[] | undefined;
    agentId?: string | undefined;
    toolNames?: ("read_order" | "read_inventory" | "search_customers" | "read_supplier_records" | "create_internal_task" | "update_permitted_internal_records" | "generate_inventory_alert" | "draft_customer_communication" | "request_approval" | "generate_final_report")[] | undefined;
    inputData?: Record<string, any> | undefined;
    completionCriteria?: Record<string, any> | undefined;
}>;
export declare const CreateApprovalRequestSchema: z.ZodObject<{
    workflowId: z.ZodString;
    taskId: z.ZodOptional<z.ZodString>;
    actionType: z.ZodString;
    actionPayload: z.ZodRecord<z.ZodString, z.ZodAny>;
    reason: z.ZodString;
    riskLevel: z.ZodDefault<z.ZodEnum<["low", "medium", "high", "critical"]>>;
}, "strip", z.ZodTypeAny, {
    reason: string;
    workflowId: string;
    actionType: string;
    actionPayload: Record<string, any>;
    riskLevel: "low" | "medium" | "high" | "critical";
    taskId?: string | undefined;
}, {
    reason: string;
    workflowId: string;
    actionType: string;
    actionPayload: Record<string, any>;
    taskId?: string | undefined;
    riskLevel?: "low" | "medium" | "high" | "critical" | undefined;
}>;
export declare const ResolveApprovalSchema: z.ZodObject<{
    reviewComment: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    reviewComment?: string | undefined;
}, {
    reviewComment?: string | undefined;
}>;
export declare const BusinessCustomerSchema: z.ZodObject<{
    id: z.ZodOptional<z.ZodString>;
    workspaceId: z.ZodOptional<z.ZodString>;
    name: z.ZodString;
    email: z.ZodUnion<[z.ZodOptional<z.ZodString>, z.ZodLiteral<"">]>;
    phone: z.ZodUnion<[z.ZodOptional<z.ZodString>, z.ZodLiteral<"">]>;
}, "strip", z.ZodTypeAny, {
    name: string;
    id?: string | undefined;
    workspaceId?: string | undefined;
    email?: string | undefined;
    phone?: string | undefined;
}, {
    name: string;
    id?: string | undefined;
    workspaceId?: string | undefined;
    email?: string | undefined;
    phone?: string | undefined;
}>;
export declare const SupplierSchema: z.ZodObject<{
    id: z.ZodOptional<z.ZodString>;
    workspaceId: z.ZodOptional<z.ZodString>;
    name: z.ZodString;
    email: z.ZodUnion<[z.ZodOptional<z.ZodString>, z.ZodLiteral<"">]>;
    status: z.ZodDefault<z.ZodEnum<["active", "inactive", "delayed"]>>;
    leadTimeDays: z.ZodOptional<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    status: "active" | "inactive" | "delayed";
    name: string;
    id?: string | undefined;
    workspaceId?: string | undefined;
    email?: string | undefined;
    leadTimeDays?: number | undefined;
}, {
    name: string;
    status?: "active" | "inactive" | "delayed" | undefined;
    id?: string | undefined;
    workspaceId?: string | undefined;
    email?: string | undefined;
    leadTimeDays?: number | undefined;
}>;
export declare const InventoryItemSchema: z.ZodObject<{
    id: z.ZodOptional<z.ZodString>;
    workspaceId: z.ZodOptional<z.ZodString>;
    sku: z.ZodString;
    name: z.ZodString;
    quantity: z.ZodNumber;
    reorderThreshold: z.ZodDefault<z.ZodNumber>;
    supplierId: z.ZodOptional<z.ZodNullable<z.ZodString>>;
}, "strip", z.ZodTypeAny, {
    name: string;
    sku: string;
    quantity: number;
    reorderThreshold: number;
    id?: string | undefined;
    workspaceId?: string | undefined;
    supplierId?: string | null | undefined;
}, {
    name: string;
    sku: string;
    quantity: number;
    id?: string | undefined;
    workspaceId?: string | undefined;
    reorderThreshold?: number | undefined;
    supplierId?: string | null | undefined;
}>;
export declare const BusinessOrderSchema: z.ZodObject<{
    id: z.ZodOptional<z.ZodString>;
    workspaceId: z.ZodOptional<z.ZodString>;
    customerId: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    orderNumber: z.ZodString;
    status: z.ZodDefault<z.ZodEnum<["pending", "processing", "delayed", "shipped", "delivered", "cancelled"]>>;
    expectedDelivery: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    notes: z.ZodUnion<[z.ZodOptional<z.ZodString>, z.ZodLiteral<"">]>;
}, "strip", z.ZodTypeAny, {
    status: "cancelled" | "pending" | "delayed" | "processing" | "shipped" | "delivered";
    orderNumber: string;
    id?: string | undefined;
    workspaceId?: string | undefined;
    customerId?: string | null | undefined;
    expectedDelivery?: string | null | undefined;
    notes?: string | undefined;
}, {
    orderNumber: string;
    status?: "cancelled" | "pending" | "delayed" | "processing" | "shipped" | "delivered" | undefined;
    id?: string | undefined;
    workspaceId?: string | undefined;
    customerId?: string | null | undefined;
    expectedDelivery?: string | null | undefined;
    notes?: string | undefined;
}>;
export declare const TemplateSchema: z.ZodObject<{
    id: z.ZodOptional<z.ZodString>;
    name: z.ZodString;
    description: z.ZodDefault<z.ZodString>;
    category: z.ZodDefault<z.ZodEnum<["order_management", "inventory_management", "supplier_coordination", "customer_support", "internal_operations", "general"]>>;
    definition: z.ZodObject<{
        objective: z.ZodString;
        priority: z.ZodEnum<["low", "medium", "high", "critical"]>;
        constraints: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
        approvalPolicy: z.ZodDefault<z.ZodEnum<["required", "risk_based", "manual_only"]>>;
        suggestedTasks: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
    }, "strip", z.ZodTypeAny, {
        priority: "low" | "medium" | "high" | "critical";
        objective: string;
        constraints: string[];
        approvalPolicy: "required" | "risk_based" | "manual_only";
        suggestedTasks: string[];
    }, {
        priority: "low" | "medium" | "high" | "critical";
        objective: string;
        constraints?: string[] | undefined;
        approvalPolicy?: "required" | "risk_based" | "manual_only" | undefined;
        suggestedTasks?: string[] | undefined;
    }>;
    isPublic: z.ZodDefault<z.ZodBoolean>;
}, "strip", z.ZodTypeAny, {
    description: string;
    name: string;
    category: "order_management" | "inventory_management" | "supplier_coordination" | "customer_support" | "internal_operations" | "general";
    definition: {
        priority: "low" | "medium" | "high" | "critical";
        objective: string;
        constraints: string[];
        approvalPolicy: "required" | "risk_based" | "manual_only";
        suggestedTasks: string[];
    };
    isPublic: boolean;
    id?: string | undefined;
}, {
    name: string;
    definition: {
        priority: "low" | "medium" | "high" | "critical";
        objective: string;
        constraints?: string[] | undefined;
        approvalPolicy?: "required" | "risk_based" | "manual_only" | undefined;
        suggestedTasks?: string[] | undefined;
    };
    description?: string | undefined;
    category?: "order_management" | "inventory_management" | "supplier_coordination" | "customer_support" | "internal_operations" | "general" | undefined;
    id?: string | undefined;
    isPublic?: boolean | undefined;
}>;
//# sourceMappingURL=schemas.d.ts.map