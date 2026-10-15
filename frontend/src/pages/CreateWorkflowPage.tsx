import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Clock,
  Layers,
  FileText,
  AlertCircle,
  Plus,
  Trash2,
  CheckCircle2,
  Loader2
} from 'lucide-react';
import { api } from '../lib/api';

export const CreateWorkflowPage: React.FC = () => {
  const navigate = useNavigate();

  const [title, setTitle] = useState('');
  const [objective, setObjective] = useState('');
  const [category, setCategory] = useState('order_management');
  const [priority, setPriority] = useState('high');
  const [executionMode, setExecutionMode] = useState('demo');
  const [approvalPolicy, setApprovalPolicy] = useState('risk_based');
  const [deadline, setDeadline] = useState('');
  const [constraints, setConstraints] = useState<string[]>([
    'Do not issue refunds without approval',
    'Verify supplier stock before promising new delivery date'
  ]);
  const [newConstraint, setNewConstraint] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const sampleObjectives = [
    {
      title: 'Delayed Customer Order & Stock Deficit Resolution',
      category: 'order_management',
      priority: 'high',
      objective: 'Analyze delayed orders, identify inventory shortages, create internal follow-up tasks, and prepare appropriate customer updates.'
    },
    {
      title: 'Warehouse Low-Stock Replenishment & PO Queue',
      category: 'inventory_management',
      priority: 'medium',
      objective: 'Detect all SKUs below reorder threshold, inspect supplier lead times, and queue replenishment purchase requests.'
    },
    {
      title: 'Supplier Delay Assessment & Rescheduling',
      category: 'supplier_coordination',
      priority: 'high',
      objective: 'Identify suppliers with delayed shipments, find impacted customer orders, reschedule fulfillment, and coordinate internal follow-ups.'
    }
  ];

  const applySample = (sample: typeof sampleObjectives[0]) => {
    setTitle(sample.title);
    setCategory(sample.category);
    setPriority(sample.priority);
    setObjective(sample.objective);
  };

  const handleAddConstraint = () => {
    if (newConstraint.trim()) {
      setConstraints([...constraints, newConstraint.trim()]);
      setNewConstraint('');
    }
  };

  const handleRemoveConstraint = (index: number) => {
    setConstraints(constraints.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent, autoStart = true) => {
    e.preventDefault();
    if (objective.trim().length < 20) {
      setError('Business objective must be at least 20 characters.');
      return;
    }
    if (title.trim().length < 3) {
      setError('Title must be at least 3 characters.');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // 1. Create Workflow Record
      const res = await api.createWorkflow({
        title,
        objective,
        category,
        priority,
        executionMode,
        approvalPolicy,
        deadline: deadline ? new Date(deadline).toISOString() : null,
        constraints
      });

      const workflowId = res.workflow.id;

      // 2. Plan the workflow
      await api.planWorkflow(workflowId);

      // 3. Start if requested
      if (autoStart) {
        await api.startWorkflow(workflowId);
      }

      navigate(`/workflows/${workflowId}`);
    } catch (err: any) {
      setError(err.message || 'Failed to create and plan workflow');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-300">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          <Sparkles className="w-6 h-6 text-indigo-400" />
          <span>Create Autonomous Workflow</span>
        </h1>
        <p className="mt-1 text-sm text-slate-300">
          Describe your business objective in natural language. The Orchestrator and Planning agents will construct an executable, dependency-aware task graph.
        </p>
      </div>

      {/* Quick Templates Chips */}
      <div>
        <span className="text-xs font-mono uppercase text-slate-400 tracking-wider">
          Or Load Sample Scenario
        </span>
        <div className="mt-2 flex flex-wrap gap-2">
          {sampleObjectives.map((sample, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => applySample(sample)}
              className="text-xs px-3 py-1.5 rounded-lg border border-border bg-card hover:bg-cardHover text-slate-300 hover:text-white transition-colors text-left"
            >
              {sample.title}
            </button>
          ))}
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-sm text-rose-300 flex items-center gap-2">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Main Form */}
      <form onSubmit={e => handleSubmit(e, true)} className="space-y-6 glass-panel p-8 rounded-2xl border border-border/80 shadow-2xl">
        {/* Title */}
        <div>
          <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
            Workflow Title
          </label>
          <input
            type="text"
            required
            value={title}
            onChange={e => setTitle(e.target.value)}
            placeholder="e.g. Delayed Order Resolution & Stock Shortage Mitigation"
            className="w-full bg-slate-900 border border-border rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-indigo-500"
          />
        </div>

        {/* Objective */}
        <div>
          <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
            Natural-Language Business Objective
          </label>
          <textarea
            required
            rows={4}
            value={objective}
            onChange={e => setObjective(e.target.value)}
            placeholder="Describe the operational challenge or goal in plain English..."
            className="w-full bg-slate-900 border border-border rounded-xl p-4 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-indigo-500"
          />
          <div className="flex justify-between text-[11px] text-slate-500 mt-1 font-mono">
            <span>Minimum 20 characters</span>
            <span>{objective.length} characters</span>
          </div>
        </div>

        {/* Row: Category, Priority, Execution Mode */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
              Business Category
            </label>
            <select
              value={category}
              onChange={e => setCategory(e.target.value)}
              className="w-full bg-slate-900 border border-border rounded-xl px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-indigo-500"
            >
              <option value="order_management">Order Management</option>
              <option value="inventory_management">Inventory Management</option>
              <option value="supplier_coordination">Supplier Coordination</option>
              <option value="customer_support">Customer Support</option>
              <option value="internal_operations">Internal Operations</option>
              <option value="general">General Operations</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
              Priority Level
            </label>
            <select
              value={priority}
              onChange={e => setPriority(e.target.value)}
              className="w-full bg-slate-900 border border-border rounded-xl px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-indigo-500"
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="critical">Critical</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
              Approval Policy
            </label>
            <select
              value={approvalPolicy}
              onChange={e => setApprovalPolicy(e.target.value)}
              className="w-full bg-slate-900 border border-border rounded-xl px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-indigo-500"
            >
              <option value="risk_based">Risk-Based (Recommended)</option>
              <option value="required">Strictly Required for All</option>
              <option value="manual_only">Manual Review Only</option>
            </select>
          </div>
        </div>

        {/* Constraints */}
        <div>
          <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
            Execution Constraints & Safeguards
          </label>
          <div className="flex gap-2 mb-2">
            <input
              type="text"
              value={newConstraint}
              onChange={e => setNewConstraint(e.target.value)}
              onKeyDown={e => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleAddConstraint();
                }
              }}
              placeholder="e.g. Do not issue discounts greater than $50 without approval"
              className="flex-1 bg-slate-900 border border-border rounded-xl px-4 py-2 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-indigo-500"
            />
            <button
              type="button"
              onClick={handleAddConstraint}
              className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-border flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>Add</span>
            </button>
          </div>

          <div className="space-y-1.5 mt-3">
            {constraints.map((c, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between px-3.5 py-2 rounded-lg bg-card border border-border/80 text-xs text-slate-300"
              >
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                  <span>{c}</span>
                </div>
                <button
                  type="button"
                  onClick={() => handleRemoveConstraint(idx)}
                  className="text-slate-500 hover:text-rose-400 transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Submit Actions */}
        <div className="pt-4 flex flex-col sm:flex-row items-center justify-end gap-3 border-t border-border/60">
          <button
            type="button"
            disabled={loading}
            onClick={e => handleSubmit(e, false)}
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl text-sm font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-border transition-colors disabled:opacity-50"
          >
            {loading ? 'Planning...' : 'Generate Plan Only (Review First)'}
          </button>

          <button
            type="submit"
            disabled={loading}
            className="w-full sm:w-auto px-6 py-2.5 rounded-xl text-sm font-semibold bg-gradient-to-r from-indigo-600 to-cyan-600 hover:from-indigo-500 hover:to-cyan-500 text-white shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2 transition-all active:scale-95 disabled:opacity-50"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Orchestrating Plan...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>Plan & Start Autonomous Execution</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};
