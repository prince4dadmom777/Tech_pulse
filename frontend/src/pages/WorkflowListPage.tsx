import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  GitBranch,
  Search,
  Filter,
  Plus,
  Play,
  Pause,
  Trash2,
  ArrowRight,
  Loader2,
  Calendar,
  Layers
} from 'lucide-react';
import { api } from '../lib/api';
import { StatusBadge } from '../components/ui/StatusBadge';

export const WorkflowListPage: React.FC = () => {
  const navigate = useNavigate();
  const [workflows, setWorkflows] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');

  useEffect(() => {
    loadWorkflows();
  }, [statusFilter, categoryFilter, priorityFilter]);

  const loadWorkflows = async () => {
    try {
      setLoading(true);
      const res = await api.getWorkflows({
        status: statusFilter || undefined,
        category: categoryFilter || undefined,
        priority: priorityFilter || undefined,
        search: search || undefined
      });
      setWorkflows(res.workflows || []);
    } catch (_) {
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loadWorkflows();
  };

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (confirm('Delete this workflow and its associated tasks?')) {
      await api.deleteWorkflow(id);
      loadWorkflows();
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <GitBranch className="w-6 h-6 text-indigo-400" />
            <span>Workflow Registry</span>
          </h1>
          <p className="mt-1 text-sm text-slate-300">
            Inspect, manage, and monitor all multi-agent workflows and task execution lifecycles.
          </p>
        </div>

        <Link
          to="/workflows/new"
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/30 transition-all active:scale-95 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>New Workflow</span>
        </Link>
      </div>

      {/* Filter & Search Bar */}
      <div className="glass-panel p-4 rounded-xl flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        <form onSubmit={handleSearchSubmit} className="relative flex-1">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search workflows by title or objective..."
            className="w-full bg-slate-900 border border-border rounded-lg pl-9 pr-4 py-2 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-indigo-500"
          />
        </form>

        <div className="flex flex-wrap items-center gap-2">
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="bg-slate-900 border border-border rounded-lg px-3 py-2 text-xs text-slate-300 focus:outline-none focus:border-indigo-500"
          >
            <option value="">All Statuses</option>
            <option value="draft">Draft</option>
            <option value="planned">Planned</option>
            <option value="running">Running</option>
            <option value="awaiting_approval">Awaiting Approval</option>
            <option value="completed">Completed</option>
            <option value="failed">Failed</option>
            <option value="paused">Paused</option>
          </select>

          <select
            value={categoryFilter}
            onChange={e => setCategoryFilter(e.target.value)}
            className="bg-slate-900 border border-border rounded-lg px-3 py-2 text-xs text-slate-300 focus:outline-none focus:border-indigo-500"
          >
            <option value="">All Categories</option>
            <option value="order_management">Order Management</option>
            <option value="inventory_management">Inventory Management</option>
            <option value="supplier_coordination">Supplier Coordination</option>
            <option value="customer_support">Customer Support</option>
            <option value="internal_operations">Internal Operations</option>
          </select>

          <select
            value={priorityFilter}
            onChange={e => setPriorityFilter(e.target.value)}
            className="bg-slate-900 border border-border rounded-lg px-3 py-2 text-xs text-slate-300 focus:outline-none focus:border-indigo-500"
          >
            <option value="">All Priorities</option>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
            <option value="critical">Critical</option>
          </select>
        </div>
      </div>

      {/* Workflows List */}
      {loading ? (
        <div className="flex items-center justify-center p-12">
          <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
        </div>
      ) : workflows.length === 0 ? (
        <div className="glass-panel p-12 text-center rounded-2xl">
          <Layers className="w-12 h-12 text-slate-600 mx-auto mb-3" />
          <h3 className="text-base font-semibold text-slate-200">No workflows found</h3>
          <p className="mt-1 text-xs text-slate-400">
            Create your first autonomous workflow or launch a demo scenario from the navigation.
          </p>
          <Link
            to="/workflows/new"
            className="inline-flex items-center gap-2 mt-4 px-4 py-2 rounded-lg text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white"
          >
            <Plus className="w-4 h-4" />
            <span>Create Workflow</span>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3">
          {workflows.map(wf => (
            <div
              key={wf.id}
              onClick={() => navigate(`/workflows/${wf.id}`)}
              className="glass-panel glass-panel-hover p-5 rounded-xl cursor-pointer transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
            >
              <div className="min-w-0 flex-1 space-y-1.5">
                <div className="flex flex-wrap items-center gap-2">
                  <StatusBadge status={wf.status} />
                  <StatusBadge status={wf.priority} type="priority" />
                  <span className="text-[11px] font-mono text-cyan-400 px-2 py-0.5 rounded bg-cyan-950/40 border border-cyan-800/30 uppercase">
                    {wf.category.replace('_', ' ')}
                  </span>
                  <span className="text-[11px] font-mono text-slate-500">
                    ID: {wf.id.substring(0, 8)}
                  </span>
                </div>

                <h3 className="text-base font-bold text-white truncate">{wf.title}</h3>
                <p className="text-xs text-slate-400 line-clamp-2">{wf.objective}</p>

                <div className="flex items-center gap-4 text-[11px] text-slate-500 pt-1">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5" />
                    {new Date(wf.created_at).toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                  </span>
                  <span>Policy: <strong className="text-slate-400">{wf.approval_policy}</strong></span>
                </div>
              </div>

              {/* Progress & Actions */}
              <div className="flex items-center gap-6 shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-border/60">
                <div className="w-32">
                  <div className="flex justify-between text-[11px] font-mono text-slate-400 mb-1">
                    <span>Progress</span>
                    <span>{wf.tasksCompleted || 0}/{wf.tasksTotal || 0}</span>
                  </div>
                  <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-indigo-500 to-cyan-400 h-full rounded-full transition-all duration-300"
                      style={{ width: `${wf.progressPercent || 0}%` }}
                    />
                  </div>
                </div>

                <button
                  onClick={e => handleDelete(e, wf.id)}
                  className="p-2 text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors"
                  title="Delete workflow"
                >
                  <Trash2 className="w-4 h-4" />
                </button>

                <ArrowRight className="w-4 h-4 text-slate-500" />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
