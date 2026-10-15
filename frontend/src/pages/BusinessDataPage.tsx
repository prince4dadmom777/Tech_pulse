import React, { useState, useEffect } from 'react';
import {
  Database,
  Package,
  ShoppingCart,
  Users,
  Truck,
  Plus,
  Search,
  Filter,
  AlertTriangle,
  Loader2,
  CheckCircle2,
  XCircle
} from 'lucide-react';
import { api } from '../lib/api';
import { StatusBadge } from '../components/ui/StatusBadge';

export const BusinessDataPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'orders' | 'inventory' | 'customers' | 'suppliers'>('orders');
  const [loading, setLoading] = useState(true);

  // Data states
  const [orders, setOrders] = useState<any[]>([]);
  const [inventory, setInventory] = useState<any[]>([]);
  const [customers, setCustomers] = useState<any[]>([]);
  const [suppliers, setSuppliers] = useState<any[]>([]);

  // Search
  const [query, setQuery] = useState('');

  // New Record Modal
  const [showAddModal, setShowAddModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Form states
  const [orderForm, setOrderForm] = useState({ orderNumber: '', status: 'delayed', notes: '' });
  const [invForm, setInvForm] = useState({ sku: '', name: '', quantity: 10, reorderThreshold: 15 });
  const [custForm, setCustForm] = useState({ name: '', email: '', phone: '' });
  const [suppForm, setSuppForm] = useState({ name: '', email: '', status: 'active', leadTimeDays: 7 });

  useEffect(() => {
    loadAllData();
  }, []);

  const loadAllData = async () => {
    try {
      setLoading(true);
      const [ordRes, invRes, custRes, supRes] = await Promise.all([
        api.getOrders().catch(() => ({ orders: [] })),
        api.getInventory().catch(() => ({ items: [] })),
        api.getCustomers().catch(() => ({ customers: [] })),
        api.getSuppliers().catch(() => ({ suppliers: [] }))
      ]);

      setOrders(ordRes.orders || []);
      setInventory(invRes.items || []);
      setCustomers(custRes.customers || []);
      setSuppliers(supRes.suppliers || []);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateRecord = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      if (activeTab === 'orders') {
        await api.createOrder({ ...orderForm, customerId: customers[0]?.id || null });
      } else if (activeTab === 'inventory') {
        await api.createInventoryItem(invForm);
      } else if (activeTab === 'customers') {
        await api.createCustomer(custForm);
      } else if (activeTab === 'suppliers') {
        await api.createSupplier(suppForm);
      }
      setShowAddModal(false);
      loadAllData();
    } catch (err: any) {
      alert(`Error creating record: ${err.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Database className="w-6 h-6 text-indigo-400" />
            <span>Business Data Records</span>
          </h1>
          <p className="mt-1 text-sm text-slate-300">
            Searchable, isolated enterprise operational database queried by the autonomous agent cluster.
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg transition-all active:scale-95 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add Record</span>
        </button>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-border/80 gap-6 text-sm font-semibold text-slate-400">
        {[
          { key: 'orders', label: `Orders (${orders.length})`, icon: ShoppingCart },
          { key: 'inventory', label: `Inventory (${inventory.length})`, icon: Package },
          { key: 'customers', label: `Customers (${customers.length})`, icon: Users },
          { key: 'suppliers', label: `Suppliers (${suppliers.length})`, icon: Truck }
        ].map(tab => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.key}
              onClick={() => {
                setActiveTab(tab.key as any);
                setQuery('');
              }}
              className={`pb-3 flex items-center gap-2 transition-colors relative ${
                activeTab === tab.key ? 'text-indigo-400' : 'hover:text-slate-200'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
              {activeTab === tab.key && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-500 rounded-full" />
              )}
            </button>
          );
        })}
      </div>

      {/* Search Input */}
      <div className="glass-panel p-3.5 rounded-xl flex items-center gap-3">
        <Search className="w-4 h-4 text-slate-500" />
        <input
          type="text"
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder={`Search ${activeTab}...`}
          className="bg-transparent text-xs text-white placeholder:text-slate-500 focus:outline-none flex-1"
        />
      </div>

      {loading ? (
        <div className="flex items-center justify-center p-12">
          <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
        </div>
      ) : (
        <div className="glass-panel rounded-2xl overflow-hidden border border-border/80">
          {/* TAB 1: ORDERS */}
          {activeTab === 'orders' && (
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-900/60 uppercase font-mono text-[10px] tracking-wider text-slate-400 border-b border-border/80">
                <tr>
                  <th className="p-4">Order #</th>
                  <th className="p-4">Customer</th>
                  <th className="p-4">Status</th>
                  <th className="p-4">Expected Delivery</th>
                  <th className="p-4">Notes</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {orders
                  .filter(o => !query || o.order_number.toLowerCase().includes(query.toLowerCase()) || (o.customer_name && o.customer_name.toLowerCase().includes(query.toLowerCase())))
                  .map(order => (
                    <tr key={order.id} className="hover:bg-cardHover/30 transition-colors">
                      <td className="p-4 font-mono font-bold text-white">{order.order_number}</td>
                      <td className="p-4 font-medium text-slate-200">{order.customer_name || 'Apex Global Logistics'}</td>
                      <td className="p-4">
                        <StatusBadge status={order.status} />
                      </td>
                      <td className="p-4 font-mono text-slate-400">
                        {order.expected_delivery ? new Date(order.expected_delivery).toLocaleDateString() : 'N/A'}
                      </td>
                      <td className="p-4 text-slate-400 max-w-xs truncate">{order.notes || '—'}</td>
                    </tr>
                  ))}
              </tbody>
            </table>
          )}

          {/* TAB 2: INVENTORY */}
          {activeTab === 'inventory' && (
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-900/60 uppercase font-mono text-[10px] tracking-wider text-slate-400 border-b border-border/80">
                <tr>
                  <th className="p-4">SKU</th>
                  <th className="p-4">Item Name</th>
                  <th className="p-4">Current Stock</th>
                  <th className="p-4">Threshold</th>
                  <th className="p-4">Supplier</th>
                  <th className="p-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {inventory
                  .filter(i => !query || i.sku.toLowerCase().includes(query.toLowerCase()) || i.name.toLowerCase().includes(query.toLowerCase()))
                  .map(item => {
                    const isLow = item.quantity <= item.reorder_threshold;
                    return (
                      <tr key={item.id} className="hover:bg-cardHover/30 transition-colors">
                        <td className="p-4 font-mono font-bold text-indigo-400">{item.sku}</td>
                        <td className="p-4 font-semibold text-white">{item.name}</td>
                        <td className="p-4 font-mono text-base font-bold text-white">{item.quantity}</td>
                        <td className="p-4 font-mono text-slate-400">{item.reorder_threshold}</td>
                        <td className="p-4 text-slate-300">{item.supplier_name || 'Nexus Component Labs'}</td>
                        <td className="p-4">
                          {isLow ? (
                            <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-rose-500/10 text-rose-400 border border-rose-500/30 flex items-center gap-1 w-max">
                              <AlertTriangle className="w-3 h-3" />
                              <span>Low Stock</span>
                            </span>
                          ) : (
                            <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 w-max block">
                              Optimal
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
              </tbody>
            </table>
          )}

          {/* TAB 3: CUSTOMERS */}
          {activeTab === 'customers' && (
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-900/60 uppercase font-mono text-[10px] tracking-wider text-slate-400 border-b border-border/80">
                <tr>
                  <th className="p-4">Customer Name</th>
                  <th className="p-4">Email Address</th>
                  <th className="p-4">Phone Number</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {customers
                  .filter(c => !query || c.name.toLowerCase().includes(query.toLowerCase()) || (c.email && c.email.toLowerCase().includes(query.toLowerCase())))
                  .map(cust => (
                    <tr key={cust.id} className="hover:bg-cardHover/30 transition-colors">
                      <td className="p-4 font-semibold text-white">{cust.name}</td>
                      <td className="p-4 font-mono text-slate-300">{cust.email || '—'}</td>
                      <td className="p-4 font-mono text-slate-400">{cust.phone || '—'}</td>
                    </tr>
                  ))}
              </tbody>
            </table>
          )}

          {/* TAB 4: SUPPLIERS */}
          {activeTab === 'suppliers' && (
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-900/60 uppercase font-mono text-[10px] tracking-wider text-slate-400 border-b border-border/80">
                <tr>
                  <th className="p-4">Supplier Name</th>
                  <th className="p-4">Contact Email</th>
                  <th className="p-4">Fulfillment Status</th>
                  <th className="p-4">Lead Time</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {suppliers
                  .filter(s => !query || s.name.toLowerCase().includes(query.toLowerCase()))
                  .map(sup => (
                    <tr key={sup.id} className="hover:bg-cardHover/30 transition-colors">
                      <td className="p-4 font-semibold text-white">{sup.name}</td>
                      <td className="p-4 font-mono text-slate-300">{sup.email || '—'}</td>
                      <td className="p-4">
                        <StatusBadge status={sup.status} />
                      </td>
                      <td className="p-4 font-mono text-slate-400">{sup.lead_time_days || 0} days</td>
                    </tr>
                  ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* Add Record Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="glass-panel w-full max-w-md p-6 rounded-2xl border border-border/80 shadow-2xl space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-border/80">
              <h3 className="font-bold text-base text-white capitalize">Add New {activeTab.slice(0, -1)}</h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-white">✕</button>
            </div>

            <form onSubmit={handleCreateRecord} className="space-y-3 text-xs">
              {activeTab === 'orders' && (
                <>
                  <div>
                    <label className="block text-slate-300 mb-1">Order Number</label>
                    <input
                      type="text"
                      required
                      value={orderForm.orderNumber}
                      onChange={e => setOrderForm({ ...orderForm, orderNumber: e.target.value })}
                      placeholder="ORD-2025-099"
                      className="w-full bg-slate-900 border border-border rounded-lg p-2 text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-300 mb-1">Status</label>
                    <select
                      value={orderForm.status}
                      onChange={e => setOrderForm({ ...orderForm, status: e.target.value })}
                      className="w-full bg-slate-900 border border-border rounded-lg p-2 text-white"
                    >
                      <option value="pending">Pending</option>
                      <option value="processing">Processing</option>
                      <option value="delayed">Delayed</option>
                      <option value="shipped">Shipped</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-slate-300 mb-1">Notes</label>
                    <input
                      type="text"
                      value={orderForm.notes}
                      onChange={e => setOrderForm({ ...orderForm, notes: e.target.value })}
                      placeholder="Special instructions or delay reason"
                      className="w-full bg-slate-900 border border-border rounded-lg p-2 text-white"
                    />
                  </div>
                </>
              )}

              {activeTab === 'inventory' && (
                <>
                  <div>
                    <label className="block text-slate-300 mb-1">SKU</label>
                    <input
                      type="text"
                      required
                      value={invForm.sku}
                      onChange={e => setInvForm({ ...invForm, sku: e.target.value })}
                      placeholder="SKU-XYZ-01"
                      className="w-full bg-slate-900 border border-border rounded-lg p-2 text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-300 mb-1">Item Name</label>
                    <input
                      type="text"
                      required
                      value={invForm.name}
                      onChange={e => setInvForm({ ...invForm, name: e.target.value })}
                      placeholder="Precision Sensor Module"
                      className="w-full bg-slate-900 border border-border rounded-lg p-2 text-white"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-slate-300 mb-1">Initial Quantity</label>
                      <input
                        type="number"
                        required
                        value={invForm.quantity}
                        onChange={e => setInvForm({ ...invForm, quantity: parseInt(e.target.value, 10) || 0 })}
                        className="w-full bg-slate-900 border border-border rounded-lg p-2 text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-300 mb-1">Reorder Threshold</label>
                      <input
                        type="number"
                        required
                        value={invForm.reorderThreshold}
                        onChange={e => setInvForm({ ...invForm, reorderThreshold: parseInt(e.target.value, 10) || 0 })}
                        className="w-full bg-slate-900 border border-border rounded-lg p-2 text-white"
                      />
                    </div>
                  </div>
                </>
              )}

              {activeTab === 'customers' && (
                <>
                  <div>
                    <label className="block text-slate-300 mb-1">Company / Customer Name</label>
                    <input
                      type="text"
                      required
                      value={custForm.name}
                      onChange={e => setCustForm({ ...custForm, name: e.target.value })}
                      placeholder="Nexus Logistics"
                      className="w-full bg-slate-900 border border-border rounded-lg p-2 text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-300 mb-1">Email</label>
                    <input
                      type="email"
                      value={custForm.email}
                      onChange={e => setCustForm({ ...custForm, email: e.target.value })}
                      placeholder="contact@nexus.com"
                      className="w-full bg-slate-900 border border-border rounded-lg p-2 text-white"
                    />
                  </div>
                </>
              )}

              {activeTab === 'suppliers' && (
                <>
                  <div>
                    <label className="block text-slate-300 mb-1">Supplier Name</label>
                    <input
                      type="text"
                      required
                      value={suppForm.name}
                      onChange={e => setSuppForm({ ...suppForm, name: e.target.value })}
                      placeholder="Apex Semiconductor"
                      className="w-full bg-slate-900 border border-border rounded-lg p-2 text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-300 mb-1">Lead Time (Days)</label>
                    <input
                      type="number"
                      value={suppForm.leadTimeDays}
                      onChange={e => setSuppForm({ ...suppForm, leadTimeDays: parseInt(e.target.value, 10) || 0 })}
                      className="w-full bg-slate-900 border border-border rounded-lg p-2 text-white"
                    />
                  </div>
                </>
              )}

              <div className="pt-3 flex items-center justify-end gap-2 border-t border-border/80">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-lg bg-card text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-semibold"
                >
                  {submitting ? 'Saving...' : 'Save Record'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
