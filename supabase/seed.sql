-- FlowPilot AI Seed Data

-- 1. Insert Core Agents
insert into public.agents (id, agent_type, name, description, enabled, configuration)
values
  ('a0000000-0000-0000-0000-000000000001', 'orchestrator', 'Orchestrator Agent', 'Directs end-to-end workflow lifecycle, breaks down business objectives, and coordinates agent handoffs.', true, '{"max_concurrency": 3}'::jsonb),
  ('a0000000-0000-0000-0000-000000000002', 'business_analyst', 'Business Analyst Agent', 'Inspects database records, audits order fulfillment delays, inventory bottlenecks, and calculates business impact.', true, '{"confidence_threshold": 0.75}'::jsonb),
  ('a0000000-0000-0000-0000-000000000003', 'planner', 'Planning Agent', 'Constructs dependency graphs, maps task criteria, and assigns appropriate tools to specialized agents.', true, '{"allow_cycles": false}'::jsonb),
  ('a0000000-0000-0000-0000-000000000004', 'operations', 'Operations Agent', 'Executes permitted tools, adjusts inventory quantities, issues internal tasks, and coordinates supplier requests.', true, '{"safe_mode": true}'::jsonb),
  ('a0000000-0000-0000-0000-000000000005', 'customer_communication', 'Customer Communication Agent', 'Drafts and validates customer status updates, delivery notices, and follow-ups grounded strictly in verified facts.', true, '{"require_approval_by_default": true}'::jsonb),
  ('a0000000-0000-0000-0000-000000000006', 'quality_risk', 'Quality and Risk Agent', 'Verifies real application state changes against completion criteria, evaluates risks, and flags policy deviations.', true, '{"strict_verification": true}'::jsonb)
on conflict (agent_type) do update set
  name = excluded.name,
  description = excluded.description,
  configuration = excluded.configuration;

-- 2. Insert Standard Workflow Templates
insert into public.workflow_templates (id, name, description, category, definition, is_public)
values
  (
    't0000000-0000-0000-0000-000000000001',
    'Delayed Order Resolution',
    'Investigate delayed customer orders, identify stock shortages, generate internal follow-up tasks, and draft fact-checked customer updates.',
    'order_management',
    '{
      "objective": "Analyze delayed orders, identify inventory shortages, create internal follow-up tasks, and prepare appropriate customer updates.",
      "priority": "high",
      "constraints": ["Do not issue refunds without approval", "Verify supplier stock before promising new delivery date"],
      "approvalPolicy": "risk_based",
      "suggestedTasks": [
        "Audit pending and delayed orders",
        "Cross-reference inventory availability for delayed items",
        "Create warehouse escalation task",
        "Draft customer delay notification"
      ]
    }'::jsonb,
    true
  ),
  (
    't0000000-0000-0000-0000-000000000002',
    'Low-Stock Investigation & Replenishment',
    'Audit inventory items below threshold, determine lead times, and create supplier purchase requests with approval safeguards.',
    'inventory_management',
    '{
      "objective": "Detect all SKUs below reorder threshold, inspect supplier lead times, and queue replenishment purchase requests.",
      "priority": "medium",
      "constraints": ["Purchase orders over $500 require human sign-off"],
      "approvalPolicy": "risk_based",
      "suggestedTasks": [
        "Scan inventory for low-stock items",
        "Check supplier status and lead times",
        "Request purchase order approval",
        "Update inventory alerts"
      ]
    }'::jsonb,
    true
  ),
  (
    't0000000-0000-0000-0000-000000000003',
    'Supplier Delay Coordination',
    'Identify active supplier shipment delays, assess affected customer orders, and dispatch mitigation operations.',
    'supplier_coordination',
    '{
      "objective": "Identify suppliers with delayed shipments, find impacted customer orders, reschedule fulfillment, and coordinate internal follow-ups.",
      "priority": "high",
      "constraints": ["Notify logistics department immediately"],
      "approvalPolicy": "risk_based",
      "suggestedTasks": [
        "Query suppliers marked as delayed",
        "Map supplier SKUs to open orders",
        "Adjust expected delivery estimates",
        "Dispatch logistics task"
      ]
    }'::jsonb,
    true
  ),
  (
    't0000000-0000-0000-0000-000000000004',
    'Customer Complaint Triage',
    'Classify inbound customer dissatisfaction, inspect order history, prioritize high-impact issues, and prepare resolution plans.',
    'customer_support',
    '{
      "objective": "Review customer complaint tickets, retrieve order details, evaluate root causes, and prepare resolution steps.",
      "priority": "critical",
      "constraints": ["High-priority customers must receive draft email within 1 hour"],
      "approvalPolicy": "required",
      "suggestedTasks": [
        "Retrieve customer and order history",
        "Diagnose shipment or product failure",
        "Draft tailored empathetic communication",
        "Queue internal investigation"
      ]
    }'::jsonb,
    true
  ),
  (
    't0000000-0000-0000-0000-000000000005',
    'Overdue Task Coordination',
    'Inspect pending internal tasks past due date, reassign owners, escalate bottlenecks, and generate status summary.',
    'internal_operations',
    '{
      "objective": "Identify internal tasks past due date, analyze dependencies, alert team leads, and generate remediation summary.",
      "priority": "medium",
      "constraints": ["Do not auto-cancel overdue tasks"],
      "approvalPolicy": "risk_based",
      "suggestedTasks": [
        "Filter tasks where due_at < now() and status != completed",
        "Analyze blockers and dependencies",
        "Generate operational alert",
        "Produce executive summary report"
      ]
    }'::jsonb,
    true
  )
on conflict (id) do nothing;
