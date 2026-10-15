import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { logger } from '../logging/logger.js';
export const DEMO_WORKSPACE_ID = 'w0000000-0000-0000-0000-000000000001';
export const DEMO_USER_ID = 'u0000000-0000-0000-0000-000000000001';
export function generateSeedData() {
    const now = new Date().toISOString();
    const workspaces = [
        {
            id: DEMO_WORKSPACE_ID,
            name: 'Acme Operations HQ',
            created_by: DEMO_USER_ID,
            created_at: now,
            updated_at: now
        }
    ];
    const workspace_members = [
        {
            workspace_id: DEMO_WORKSPACE_ID,
            user_id: DEMO_USER_ID,
            role: 'owner',
            created_at: now
        }
    ];
    const agents = [
        {
            id: 'a0000000-0000-0000-0000-000000000001',
            agent_type: 'orchestrator',
            name: 'Orchestrator Agent',
            description: 'Directs end-to-end workflow lifecycle, breaks down business objectives, and coordinates agent handoffs.',
            enabled: true,
            configuration: { max_concurrency: 3 },
            created_at: now,
            updated_at: now
        },
        {
            id: 'a0000000-0000-0000-0000-000000000002',
            agent_type: 'business_analyst',
            name: 'Business Analyst Agent',
            description: 'Inspects database records, audits order fulfillment delays, inventory bottlenecks, and calculates business impact.',
            enabled: true,
            configuration: { confidence_threshold: 0.75 },
            created_at: now,
            updated_at: now
        },
        {
            id: 'a0000000-0000-0000-0000-000000000003',
            agent_type: 'planner',
            name: 'Planning Agent',
            description: 'Constructs dependency graphs, maps task criteria, and assigns appropriate tools to specialized agents.',
            enabled: true,
            configuration: { allow_cycles: false },
            created_at: now,
            updated_at: now
        },
        {
            id: 'a0000000-0000-0000-0000-000000000004',
            agent_type: 'operations',
            name: 'Operations Agent',
            description: 'Executes permitted tools, adjusts inventory quantities, issues internal tasks, and coordinates supplier requests.',
            enabled: true,
            configuration: { safe_mode: true },
            created_at: now,
            updated_at: now
        },
        {
            id: 'a0000000-0000-0000-0000-000000000005',
            agent_type: 'customer_communication',
            name: 'Customer Communication Agent',
            description: 'Drafts and validates customer status updates, delivery notices, and follow-ups grounded strictly in verified facts.',
            enabled: true,
            configuration: { require_approval_by_default: true },
            created_at: now,
            updated_at: now
        },
        {
            id: 'a0000000-0000-0000-0000-000000000006',
            agent_type: 'quality_risk',
            name: 'Quality and Risk Agent',
            description: 'Verifies real application state changes against completion criteria, evaluates risks, and flags policy deviations.',
            enabled: true,
            configuration: { strict_verification: true },
            created_at: now,
            updated_at: now
        }
    ];
    const business_customers = [
        {
            id: 'c0000000-0000-0000-0000-000000000001',
            workspace_id: DEMO_WORKSPACE_ID,
            name: 'Apex Global Logistics',
            email: 'procurement@apexlogistics.com',
            phone: '+1 (555) 234-5678',
            created_at: now,
            updated_at: now
        },
        {
            id: 'c0000000-0000-0000-0000-000000000002',
            workspace_id: DEMO_WORKSPACE_ID,
            name: 'Meridian Retail Partners',
            email: 'orders@meridianretail.com',
            phone: '+1 (555) 876-5432',
            created_at: now,
            updated_at: now
        },
        {
            id: 'c0000000-0000-0000-0000-000000000003',
            workspace_id: DEMO_WORKSPACE_ID,
            name: 'Vanguard Industrial Supply',
            email: 'ops@vanguardindustrial.com',
            phone: '+1 (555) 345-6789',
            created_at: now,
            updated_at: now
        }
    ];
    const suppliers = [
        {
            id: 's0000000-0000-0000-0000-000000000001',
            workspace_id: DEMO_WORKSPACE_ID,
            name: 'Nexus Component Labs',
            email: 'fulfillment@nexuslabs.io',
            status: 'delayed',
            lead_time_days: 14,
            created_at: now,
            updated_at: now
        },
        {
            id: 's0000000-0000-0000-0000-000000000002',
            workspace_id: DEMO_WORKSPACE_ID,
            name: 'Pacific Precision Electronics',
            email: 'sales@pacificprecision.com',
            status: 'active',
            lead_time_days: 5,
            created_at: now,
            updated_at: now
        }
    ];
    const inventory_items = [
        {
            id: 'i0000000-0000-0000-0000-000000000001',
            workspace_id: DEMO_WORKSPACE_ID,
            sku: 'SKU-PRO-01',
            name: 'Industrial Micro-Sensor Pro V3',
            quantity: 2,
            reorder_threshold: 15,
            supplier_id: 's0000000-0000-0000-0000-000000000001',
            created_at: now,
            updated_at: now
        },
        {
            id: 'i0000000-0000-0000-0000-000000000002',
            workspace_id: DEMO_WORKSPACE_ID,
            sku: 'SKU-PWR-04',
            name: 'Heavy-Duty 24V Power Distribution Rail',
            quantity: 45,
            reorder_threshold: 10,
            supplier_id: 's0000000-0000-0000-0000-000000000002',
            created_at: now,
            updated_at: now
        },
        {
            id: 'i0000000-0000-0000-0000-000000000003',
            workspace_id: DEMO_WORKSPACE_ID,
            sku: 'SKU-CON-09',
            name: 'Shielded Telemetry Connector Kit',
            quantity: 120,
            reorder_threshold: 30,
            supplier_id: 's0000000-0000-0000-0000-000000000002',
            created_at: now,
            updated_at: now
        }
    ];
    const business_orders = [
        {
            id: 'o0000000-0000-0000-0000-000000000001',
            workspace_id: DEMO_WORKSPACE_ID,
            customer_id: 'c0000000-0000-0000-0000-000000000001',
            order_number: 'ORD-2025-089',
            status: 'delayed',
            expected_delivery: new Date(Date.now() - 86400000 * 2).toISOString(),
            notes: 'Customer priority shipment. Stock shortage on SKU-PRO-01 causing fulfillment block.',
            created_at: new Date(Date.now() - 86400000 * 5).toISOString(),
            updated_at: now
        },
        {
            id: 'o0000000-0000-0000-0000-000000000002',
            workspace_id: DEMO_WORKSPACE_ID,
            customer_id: 'c0000000-0000-0000-0000-000000000002',
            order_number: 'ORD-2025-090',
            status: 'processing',
            expected_delivery: new Date(Date.now() + 86400000 * 3).toISOString(),
            notes: 'Standard replenishment batch.',
            created_at: new Date(Date.now() - 86400000 * 2).toISOString(),
            updated_at: now
        }
    ];
    const order_items = [
        {
            id: 'oi000000-0000-0000-0000-000000000001',
            order_id: 'o0000000-0000-0000-0000-000000000001',
            inventory_item_id: 'i0000000-0000-0000-0000-000000000001',
            quantity: 10,
            created_at: now
        },
        {
            id: 'oi000000-0000-0000-0000-000000000002',
            order_id: 'o0000000-0000-0000-0000-000000000001',
            inventory_item_id: 'i0000000-0000-0000-0000-000000000002',
            quantity: 4,
            created_at: now
        }
    ];
    const internal_tasks = [
        {
            id: 'it000000-0000-0000-0000-000000000001',
            workspace_id: DEMO_WORKSPACE_ID,
            workflow_id: null,
            title: 'Review Warehouse Safety Audit',
            description: 'Complete quarterly inventory safety verification.',
            status: 'completed',
            priority: 'low',
            due_at: new Date(Date.now() - 86400000).toISOString(),
            created_at: new Date(Date.now() - 86400000 * 3).toISOString(),
            updated_at: now
        }
    ];
    const workflow_templates = [
        {
            id: 't0000000-0000-0000-0000-000000000001',
            workspace_id: DEMO_WORKSPACE_ID,
            created_by: DEMO_USER_ID,
            name: 'Delayed Order Resolution',
            description: 'Investigate delayed customer orders, identify stock shortages, generate internal follow-up tasks, and draft fact-checked customer updates.',
            category: 'order_management',
            definition: {
                objective: 'Analyze delayed orders, identify inventory shortages, create internal follow-up tasks, and prepare appropriate customer updates.',
                priority: 'high',
                constraints: ['Do not issue refunds without approval', 'Verify supplier stock before promising new delivery date'],
                approvalPolicy: 'risk_based',
                suggestedTasks: [
                    'Audit pending and delayed orders',
                    'Cross-reference inventory availability for delayed items',
                    'Create warehouse escalation task',
                    'Draft customer delay notification'
                ]
            },
            is_public: true,
            created_at: now,
            updated_at: now
        },
        {
            id: 't0000000-0000-0000-0000-000000000002',
            workspace_id: DEMO_WORKSPACE_ID,
            created_by: DEMO_USER_ID,
            name: 'Low-Stock Investigation & Replenishment',
            description: 'Audit inventory items below threshold, determine lead times, and create supplier purchase requests with approval safeguards.',
            category: 'inventory_management',
            definition: {
                objective: 'Detect all SKUs below reorder threshold, inspect supplier lead times, and queue replenishment purchase requests.',
                priority: 'medium',
                constraints: ['Purchase orders over $500 require human sign-off'],
                approvalPolicy: 'risk_based',
                suggestedTasks: [
                    'Scan inventory for low-stock items',
                    'Check supplier status and lead times',
                    'Request purchase order approval',
                    'Update inventory alerts'
                ]
            },
            is_public: true,
            created_at: now,
            updated_at: now
        },
        {
            id: 't0000000-0000-0000-0000-000000000003',
            workspace_id: DEMO_WORKSPACE_ID,
            created_by: DEMO_USER_ID,
            name: 'Supplier Delay Coordination',
            description: 'Identify active supplier shipment delays, assess affected customer orders, and dispatch mitigation operations.',
            category: 'supplier_coordination',
            definition: {
                objective: 'Identify suppliers with delayed shipments, find impacted customer orders, reschedule fulfillment, and coordinate internal follow-ups.',
                priority: 'high',
                constraints: ['Notify logistics department immediately'],
                approvalPolicy: 'risk_based',
                suggestedTasks: [
                    'Query suppliers marked as delayed',
                    'Map supplier SKUs to open orders',
                    'Adjust expected delivery estimates',
                    'Dispatch logistics task'
                ]
            },
            is_public: true,
            created_at: now,
            updated_at: now
        },
        {
            id: 't0000000-0000-0000-0000-000000000004',
            workspace_id: DEMO_WORKSPACE_ID,
            created_by: DEMO_USER_ID,
            name: 'Customer Complaint Triage',
            description: 'Classify inbound customer dissatisfaction, inspect order history, prioritize high-impact issues, and prepare resolution plans.',
            category: 'customer_support',
            definition: {
                objective: 'Review customer complaint tickets, retrieve order details, evaluate root causes, and prepare resolution steps.',
                priority: 'critical',
                constraints: ['High-priority customers must receive draft email within 1 hour'],
                approvalPolicy: 'required',
                suggestedTasks: [
                    'Retrieve customer and order history',
                    'Diagnose shipment or product failure',
                    'Draft tailored empathetic communication',
                    'Queue internal investigation'
                ]
            },
            is_public: true,
            created_at: now,
            updated_at: now
        },
        {
            id: 't0000000-0000-0000-0000-000000000005',
            workspace_id: DEMO_WORKSPACE_ID,
            created_by: DEMO_USER_ID,
            name: 'Overdue Task Coordination',
            description: 'Inspect pending internal tasks past due date, reassign owners, escalate bottlenecks, and generate status summary.',
            category: 'internal_operations',
            definition: {
                objective: 'Identify internal tasks past due date, analyze dependencies, alert team leads, and generate remediation summary.',
                priority: 'medium',
                constraints: ['Do not auto-cancel overdue tasks'],
                approvalPolicy: 'risk_based',
                suggestedTasks: [
                    'Filter tasks where due_at < now() and status != completed',
                    'Analyze blockers and dependencies',
                    'Generate operational alert',
                    'Produce executive summary report'
                ]
            },
            is_public: true,
            created_at: now,
            updated_at: now
        }
    ];
    const activity_logs = [
        {
            id: 'al000000-0000-0000-0000-000000000001',
            workspace_id: DEMO_WORKSPACE_ID,
            workflow_id: null,
            task_id: null,
            actor_type: 'system',
            actor_id: 'system',
            action: 'workspace_initialized',
            outcome: 'success',
            metadata: { message: 'Demo workspace initialized with production schema' },
            created_at: now
        }
    ];
    return {
        workspaces,
        workspace_members,
        workflows: [],
        agents,
        workflow_tasks: [],
        task_dependencies: [],
        agent_executions: [],
        business_customers,
        suppliers,
        inventory_items,
        business_orders,
        order_items,
        internal_tasks,
        approval_requests: [],
        tool_executions: [],
        activity_logs,
        workflow_templates,
        notifications: []
    };
}
export class InMemoryStore {
    data;
    filePath;
    saveTimeout = null;
    constructor() {
        this.filePath = path.resolve(process.cwd(), '.data', 'flowpilot_store.json');
        this.data = this.loadOrInit();
    }
    loadOrInit() {
        try {
            if (fs.existsSync(this.filePath)) {
                const raw = fs.readFileSync(this.filePath, 'utf-8');
                const parsed = JSON.parse(raw);
                logger.info(`Loaded persistent database store from ${this.filePath}`);
                return parsed;
            }
        }
        catch (err) {
            logger.warn(`Could not load store file, initializing fresh seed: ${err}`);
        }
        const seed = generateSeedData();
        this.saveImmediate(seed);
        return seed;
    }
    saveImmediate(dataToSave) {
        try {
            const dir = path.dirname(this.filePath);
            if (!fs.existsSync(dir)) {
                fs.mkdirSync(dir, { recursive: true });
            }
            fs.writeFileSync(this.filePath, JSON.stringify(dataToSave, null, 2), 'utf-8');
        }
        catch (err) {
            logger.error(`Error saving database store: ${err}`);
        }
    }
    persist() {
        if (this.saveTimeout)
            clearTimeout(this.saveTimeout);
        this.saveTimeout = setTimeout(() => {
            this.saveImmediate(this.data);
        }, 200);
    }
    resetDemoData() {
        this.data = generateSeedData();
        this.saveImmediate(this.data);
        logger.info('Database store reset to initial seed state.');
        return true;
    }
    // Workspaces
    getWorkspaces() {
        return this.data.workspaces;
    }
    getWorkspaceById(id) {
        return this.data.workspaces.find(w => w.id === id);
    }
    createWorkspace(name, userId) {
        const now = new Date().toISOString();
        const ws = {
            id: crypto.randomUUID(),
            name,
            created_by: userId,
            created_at: now,
            updated_at: now
        };
        this.data.workspaces.push(ws);
        this.data.workspace_members.push({
            workspace_id: ws.id,
            user_id: userId,
            role: 'owner',
            created_at: now
        });
        this.persist();
        return ws;
    }
    // Workspace Members
    getWorkspaceMembers(workspaceId) {
        return this.data.workspace_members.filter(m => m.workspace_id === workspaceId);
    }
    isMember(workspaceId, userId) {
        return this.data.workspace_members.some(m => m.workspace_id === workspaceId && m.user_id === userId);
    }
    // Workflows
    getWorkflows(workspaceId) {
        return this.data.workflows
            .filter(w => w.workspace_id === workspaceId)
            .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    }
    getWorkflowById(workspaceId, id) {
        return this.data.workflows.find(w => w.workspace_id === workspaceId && w.id === id);
    }
    createWorkflow(workflow) {
        const now = new Date().toISOString();
        const newWorkflow = {
            ...workflow,
            id: crypto.randomUUID(),
            created_at: now,
            updated_at: now
        };
        this.data.workflows.push(newWorkflow);
        this.persist();
        return newWorkflow;
    }
    updateWorkflow(workspaceId, id, updates) {
        const wf = this.getWorkflowById(workspaceId, id);
        if (!wf)
            return undefined;
        Object.assign(wf, updates, { updated_at: new Date().toISOString() });
        this.persist();
        return wf;
    }
    deleteWorkflow(workspaceId, id) {
        const idx = this.data.workflows.findIndex(w => w.workspace_id === workspaceId && w.id === id);
        if (idx === -1)
            return false;
        this.data.workflows.splice(idx, 1);
        this.data.workflow_tasks = this.data.workflow_tasks.filter(t => t.workflow_id !== id);
        this.data.approval_requests = this.data.approval_requests.filter(a => a.workflow_id !== id);
        this.persist();
        return true;
    }
    // Agents
    getAgents() {
        return this.data.agents;
    }
    getAgentById(id) {
        return this.data.agents.find(a => a.id === id);
    }
    getAgentByType(type) {
        return this.data.agents.find(a => a.agent_type === type);
    }
    // Tasks
    getTasks(workspaceId, workflowId) {
        const allowedWorkflowIds = new Set(this.data.workflows.filter(w => w.workspace_id === workspaceId).map(w => w.id));
        return this.data.workflow_tasks
            .filter(t => allowedWorkflowIds.has(t.workflow_id) && (!workflowId || t.workflow_id === workflowId))
            .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
    }
    getTaskById(workspaceId, id) {
        const tasks = this.getTasks(workspaceId);
        return tasks.find(t => t.id === id);
    }
    createTask(task) {
        const now = new Date().toISOString();
        const newTask = {
            ...task,
            id: crypto.randomUUID(),
            created_at: now,
            updated_at: now
        };
        this.data.workflow_tasks.push(newTask);
        this.persist();
        return newTask;
    }
    updateTask(workspaceId, id, updates) {
        const task = this.getTaskById(workspaceId, id);
        if (!task)
            return undefined;
        Object.assign(task, updates, { updated_at: new Date().toISOString() });
        this.persist();
        return task;
    }
    // Task Dependencies
    getDependencies(taskId) {
        return this.data.task_dependencies.filter(d => d.task_id === taskId);
    }
    getWorkflowDependencies(workflowId) {
        const tasks = this.data.workflow_tasks.filter(t => t.workflow_id === workflowId);
        const taskIds = new Set(tasks.map(t => t.id));
        return this.data.task_dependencies.filter(d => taskIds.has(d.task_id));
    }
    addDependency(taskId, dependsOnTaskId) {
        const dep = {
            task_id: taskId,
            depends_on_task_id: dependsOnTaskId,
            created_at: new Date().toISOString()
        };
        this.data.task_dependencies.push(dep);
        this.persist();
        return dep;
    }
    // Agent Executions
    getAgentExecutions(workflowId, agentId) {
        return this.data.agent_executions
            .filter(e => (!workflowId || e.workflow_id === workflowId) && (!agentId || e.agent_id === agentId))
            .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    }
    createAgentExecution(exec) {
        const newExec = {
            ...exec,
            id: crypto.randomUUID(),
            created_at: new Date().toISOString()
        };
        this.data.agent_executions.push(newExec);
        this.persist();
        return newExec;
    }
    updateAgentExecution(id, updates) {
        const ex = this.data.agent_executions.find(e => e.id === id);
        if (!ex)
            return undefined;
        Object.assign(ex, updates);
        this.persist();
        return ex;
    }
    // Business Customers
    getCustomers(workspaceId) {
        return this.data.business_customers.filter(c => c.workspace_id === workspaceId);
    }
    createCustomer(workspaceId, customer) {
        const now = new Date().toISOString();
        const newCust = {
            ...customer,
            id: crypto.randomUUID(),
            workspace_id: workspaceId,
            created_at: now,
            updated_at: now
        };
        this.data.business_customers.push(newCust);
        this.persist();
        return newCust;
    }
    // Suppliers
    getSuppliers(workspaceId) {
        return this.data.suppliers.filter(s => s.workspace_id === workspaceId);
    }
    createSupplier(workspaceId, supplier) {
        const now = new Date().toISOString();
        const newSupplier = {
            ...supplier,
            id: crypto.randomUUID(),
            workspace_id: workspaceId,
            created_at: now,
            updated_at: now
        };
        this.data.suppliers.push(newSupplier);
        this.persist();
        return newSupplier;
    }
    // Inventory
    getInventory(workspaceId) {
        const suppliers = this.getSuppliers(workspaceId);
        const supplierMap = new Map(suppliers.map(s => [s.id, s.name]));
        return this.data.inventory_items
            .filter(i => i.workspace_id === workspaceId)
            .map(i => ({
            ...i,
            supplier_name: i.supplier_id ? supplierMap.get(i.supplier_id) : undefined
        }));
    }
    getInventoryItemById(workspaceId, id) {
        return this.data.inventory_items.find(i => i.workspace_id === workspaceId && (i.id === id || i.sku === id));
    }
    createInventoryItem(workspaceId, item) {
        const now = new Date().toISOString();
        const newItem = {
            ...item,
            id: crypto.randomUUID(),
            workspace_id: workspaceId,
            created_at: now,
            updated_at: now
        };
        this.data.inventory_items.push(newItem);
        this.persist();
        return newItem;
    }
    updateInventoryItem(workspaceId, id, updates) {
        const item = this.getInventoryItemById(workspaceId, id);
        if (!item)
            return undefined;
        Object.assign(item, updates, { updated_at: new Date().toISOString() });
        this.persist();
        return item;
    }
    // Orders
    getOrders(workspaceId) {
        const customers = this.getCustomers(workspaceId);
        const customerMap = new Map(customers.map(c => [c.id, c.name]));
        return this.data.business_orders
            .filter(o => o.workspace_id === workspaceId)
            .map(o => ({
            ...o,
            customer_name: o.customer_id ? customerMap.get(o.customer_id) : undefined
        }))
            .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    }
    getOrderById(workspaceId, id) {
        return this.data.business_orders.find(o => o.workspace_id === workspaceId && (o.id === id || o.order_number === id));
    }
    createOrder(workspaceId, order) {
        const now = new Date().toISOString();
        const newOrder = {
            ...order,
            id: crypto.randomUUID(),
            workspace_id: workspaceId,
            created_at: now,
            updated_at: now
        };
        this.data.business_orders.push(newOrder);
        this.persist();
        return newOrder;
    }
    updateOrder(workspaceId, id, updates) {
        const order = this.getOrderById(workspaceId, id);
        if (!order)
            return undefined;
        Object.assign(order, updates, { updated_at: new Date().toISOString() });
        this.persist();
        return order;
    }
    getOrderItems(orderId) {
        const items = this.data.inventory_items;
        const itemMap = new Map(items.map(i => [i.id, i.name]));
        return this.data.order_items
            .filter(oi => oi.order_id === orderId)
            .map(oi => ({
            ...oi,
            item_name: itemMap.get(oi.inventory_item_id)
        }));
    }
    // Internal Tasks
    getInternalTasks(workspaceId) {
        return this.data.internal_tasks
            .filter(t => t.workspace_id === workspaceId)
            .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    }
    createInternalTask(workspaceId, task) {
        const now = new Date().toISOString();
        const newTask = {
            ...task,
            id: crypto.randomUUID(),
            workspace_id: workspaceId,
            created_at: now,
            updated_at: now
        };
        this.data.internal_tasks.push(newTask);
        this.persist();
        return newTask;
    }
    // Approvals
    getApprovals(workspaceId) {
        const tasks = this.getTasks(workspaceId);
        const taskMap = new Map(tasks.map(t => [t.id, t.title]));
        return this.data.approval_requests
            .filter(a => a.workspace_id === workspaceId)
            .map(a => ({
            ...a,
            task_title: a.task_id ? taskMap.get(a.task_id) : undefined
        }))
            .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    }
    getApprovalById(workspaceId, id) {
        return this.data.approval_requests.find(a => a.workspace_id === workspaceId && a.id === id);
    }
    createApprovalRequest(workspaceId, approval) {
        const now = new Date().toISOString();
        // Compute immutable hash of action payload
        const canonicalPayload = JSON.stringify(approval.action_payload, Object.keys(approval.action_payload).sort());
        const actionHash = crypto.createHash('sha256').update(canonicalPayload).digest('hex');
        const newApproval = {
            ...approval,
            id: crypto.randomUUID(),
            workspace_id: workspaceId,
            action_hash: actionHash,
            status: 'pending',
            review_comment: null,
            reviewed_at: null,
            created_at: now
        };
        this.data.approval_requests.push(newApproval);
        this.persist();
        return newApproval;
    }
    resolveApproval(workspaceId, id, status, reviewerId, comment) {
        const app = this.getApprovalById(workspaceId, id);
        if (!app || app.status !== 'pending')
            return undefined;
        app.status = status;
        app.reviewed_by = reviewerId;
        app.reviewed_at = new Date().toISOString();
        app.review_comment = comment || null;
        this.persist();
        return app;
    }
    // Tool Executions
    getToolExecutions(workspaceId, workflowId) {
        return this.data.tool_executions
            .filter(e => e.workspace_id === workspaceId && (!workflowId || e.workflow_id === workflowId))
            .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    }
    createToolExecution(workspaceId, exec) {
        const newExec = {
            ...exec,
            id: crypto.randomUUID(),
            workspace_id: workspaceId,
            created_at: new Date().toISOString()
        };
        this.data.tool_executions.push(newExec);
        this.persist();
        return newExec;
    }
    // Activity Logs
    getActivityLogs(workspaceId, limit = 50) {
        return this.data.activity_logs
            .filter(l => l.workspace_id === workspaceId)
            .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
            .slice(0, limit);
    }
    logActivity(workspaceId, entry) {
        const log = {
            ...entry,
            id: crypto.randomUUID(),
            workspace_id: workspaceId,
            created_at: new Date().toISOString()
        };
        this.data.activity_logs.unshift(log);
        if (this.data.activity_logs.length > 500) {
            this.data.activity_logs = this.data.activity_logs.slice(0, 500);
        }
        this.persist();
        return log;
    }
    // Templates
    getTemplates(workspaceId) {
        return this.data.workflow_templates.filter(t => t.is_public || t.workspace_id === workspaceId);
    }
    getTemplateById(id) {
        return this.data.workflow_templates.find(t => t.id === id);
    }
    createTemplate(workspaceId, template) {
        const now = new Date().toISOString();
        const newTemplate = {
            ...template,
            id: crypto.randomUUID(),
            created_at: now,
            updated_at: now
        };
        this.data.workflow_templates.push(newTemplate);
        this.persist();
        return newTemplate;
    }
    // Notifications
    getNotifications(workspaceId, userId) {
        return this.data.notifications
            .filter(n => n.workspace_id === workspaceId && (!n.user_id || !userId || n.user_id === userId))
            .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    }
    createNotification(workspaceId, notif) {
        const newNotif = {
            ...notif,
            read_at: notif.read_at || null,
            id: crypto.randomUUID(),
            workspace_id: workspaceId,
            created_at: new Date().toISOString()
        };
        this.data.notifications.unshift(newNotif);
        this.persist();
        return newNotif;
    }
    markNotificationRead(id) {
        const notif = this.data.notifications.find(n => n.id === id);
        if (!notif)
            return false;
        notif.read_at = new Date().toISOString();
        this.persist();
        return true;
    }
}
export const db = new InMemoryStore();
//# sourceMappingURL=store.js.map