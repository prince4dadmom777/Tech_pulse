import { Router } from 'express';
import { BusinessOrderSchema, InventoryItemSchema, BusinessCustomerSchema, SupplierSchema } from '@flowpilot/shared';
import { db, DEMO_WORKSPACE_ID } from '../database/store.js';
import { getParam } from '../utils/params.js';
export const businessRouter = Router();
// Orders
businessRouter.get('/orders', (req, res) => {
    const wsId = req.workspaceId || DEMO_WORKSPACE_ID;
    const orders = db.getOrders(wsId);
    res.json({ orders });
});
businessRouter.post('/orders', (req, res, next) => {
    try {
        const wsId = req.workspaceId || DEMO_WORKSPACE_ID;
        const validated = BusinessOrderSchema.parse(req.body);
        const order = db.createOrder(wsId, {
            customer_id: validated.customerId || null,
            order_number: validated.orderNumber,
            status: validated.status,
            expected_delivery: validated.expectedDelivery || null,
            notes: validated.notes || null
        });
        res.status(201).json({ order });
    }
    catch (err) {
        next(err);
    }
});
businessRouter.get('/orders/:orderId', (req, res) => {
    const wsId = req.workspaceId || DEMO_WORKSPACE_ID;
    const orderId = getParam(req.params.orderId);
    const order = db.getOrderById(wsId, orderId);
    if (!order)
        return res.status(404).json({ error: 'Order not found.' });
    const items = db.getOrderItems(order.id);
    res.json({ order, items });
});
businessRouter.patch('/orders/:orderId', (req, res, next) => {
    try {
        const wsId = req.workspaceId || DEMO_WORKSPACE_ID;
        const orderId = getParam(req.params.orderId);
        const updated = db.updateOrder(wsId, orderId, req.body);
        if (!updated)
            return res.status(404).json({ error: 'Order not found.' });
        res.json({ order: updated });
    }
    catch (err) {
        next(err);
    }
});
// Inventory
businessRouter.get('/inventory', (req, res) => {
    const wsId = req.workspaceId || DEMO_WORKSPACE_ID;
    const items = db.getInventory(wsId);
    res.json({ items });
});
businessRouter.post('/inventory', (req, res, next) => {
    try {
        const wsId = req.workspaceId || DEMO_WORKSPACE_ID;
        const validated = InventoryItemSchema.parse(req.body);
        const item = db.createInventoryItem(wsId, {
            sku: validated.sku,
            name: validated.name,
            quantity: validated.quantity,
            reorder_threshold: validated.reorderThreshold,
            supplier_id: validated.supplierId || null
        });
        res.status(201).json({ item });
    }
    catch (err) {
        next(err);
    }
});
businessRouter.get('/inventory/:inventoryId', (req, res) => {
    const wsId = req.workspaceId || DEMO_WORKSPACE_ID;
    const inventoryId = getParam(req.params.inventoryId);
    const item = db.getInventoryItemById(wsId, inventoryId);
    if (!item)
        return res.status(404).json({ error: 'Inventory item not found.' });
    res.json({ item });
});
businessRouter.patch('/inventory/:inventoryId', (req, res, next) => {
    try {
        const wsId = req.workspaceId || DEMO_WORKSPACE_ID;
        const inventoryId = getParam(req.params.inventoryId);
        const updated = db.updateInventoryItem(wsId, inventoryId, req.body);
        if (!updated)
            return res.status(404).json({ error: 'Inventory item not found.' });
        res.json({ item: updated });
    }
    catch (err) {
        next(err);
    }
});
// Customers
businessRouter.get('/customers', (req, res) => {
    const wsId = req.workspaceId || DEMO_WORKSPACE_ID;
    const customers = db.getCustomers(wsId);
    res.json({ customers });
});
businessRouter.post('/customers', (req, res, next) => {
    try {
        const wsId = req.workspaceId || DEMO_WORKSPACE_ID;
        const validated = BusinessCustomerSchema.parse(req.body);
        const customer = db.createCustomer(wsId, {
            name: validated.name,
            email: validated.email || null,
            phone: validated.phone || null
        });
        res.status(201).json({ customer });
    }
    catch (err) {
        next(err);
    }
});
// Suppliers
businessRouter.get('/suppliers', (req, res) => {
    const wsId = req.workspaceId || DEMO_WORKSPACE_ID;
    const suppliers = db.getSuppliers(wsId);
    res.json({ suppliers });
});
businessRouter.post('/suppliers', (req, res, next) => {
    try {
        const wsId = req.workspaceId || DEMO_WORKSPACE_ID;
        const validated = SupplierSchema.parse(req.body);
        const supplier = db.createSupplier(wsId, {
            name: validated.name,
            email: validated.email || null,
            status: validated.status,
            lead_time_days: validated.leadTimeDays || null
        });
        res.status(201).json({ supplier });
    }
    catch (err) {
        next(err);
    }
});
// Internal Tasks
businessRouter.get('/internal-tasks', (req, res) => {
    const wsId = req.workspaceId || DEMO_WORKSPACE_ID;
    const tasks = db.getInternalTasks(wsId);
    res.json({ tasks });
});
businessRouter.post('/internal-tasks', (req, res) => {
    const wsId = req.workspaceId || DEMO_WORKSPACE_ID;
    const { title, description, priority, dueAt } = req.body;
    if (!title)
        return res.status(400).json({ error: 'Title is required' });
    const task = db.createInternalTask(wsId, {
        workflow_id: null,
        title,
        description: description || null,
        status: 'open',
        priority: priority || 'medium',
        due_at: dueAt || null
    });
    res.status(201).json({ task });
});
//# sourceMappingURL=business.routes.js.map