import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FileCode,
  PlayCircle,
  Plus,
  Sparkles,
  Layers,
  ShieldCheck,
  Loader2,
  CheckCircle2
} from 'lucide-react';
import { api } from '../lib/api';
import { StatusBadge } from '../components/ui/StatusBadge';

export const TemplatesPage: React.FC = () => {
  const navigate = useNavigate();
  const [templates, setTemplates] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [runningId, setRunningId] = useState<string | null>(null);

  // New Template Modal
  const [showModal, setShowModal] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('order_management');
  const [priority, setPriority] = useState('high');
  const [objective, setObjective] = useState('');

  useEffect(() => {
    loadTemplates();
  }, []);

  const loadTemplates = async () => {
    try {
      setLoading(true);
      const res = await api.getTemplates();
      setTemplates(res.templates || []);
    } finally {
      setLoading(false);
    }
  };

  const handleRun = async (templateId: string) => {
    try {
      setRunningId(templateId);
      const res = await api.runTemplate(templateId);
      if (res.workflow) {
        navigate(`/workflows/${res.workflow.id}`);
      }
    } catch (err: any) {
      alert(`Error running template: ${err.message}`);
    } finally {
      setRunningId(null);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.createTemplate({
        name,
        description,
        category,
        definition: {
          objective,
          priority,
          constraints: [],
          approvalPolicy: 'risk_based',
          suggestedTasks: []
        },
        isPublic: false
      });
      setShowModal(false);
      setName('');
      setDescription('');
      setObjective('');
      loadTemplates();
    } catch (err: any) {
      alert(`Error creating template: ${err.message}`);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <FileCode className="w-6 h-6 text-indigo-400" />
            <span>Workflow Templates</span>
          </h1>
          <p className="mt-1 text-sm text-slate-300">
            Reusable multi-agent execution blueprints for standard enterprise scenarios.
          </p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg transition-all active:scale-95 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Create Blueprint</span>
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center p-12">
          <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {templates.map(tmpl => (
            <div
              key={tmpl.id}
              className="glass-panel glass-panel-hover p-6 rounded-2xl flex flex-col justify-between transition-all"
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-cyan-400 px-2 py-0.5 rounded bg-cyan-950/40 border border-cyan-800/40">
                    {tmpl.category.replace('_', ' ')}
                  </span>
                  <StatusBadge status={tmpl.definition?.priority || 'medium'} type="priority" />
                </div>

                <h3 className="font-bold text-lg text-white mt-3">{tmpl.name}</h3>
                <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">{tmpl.description}</p>

                {/* Objective quote */}
                <div className="mt-4 p-3 rounded-xl bg-card border border-border/80 text-xs text-slate-300">
                  <span className="text-[10px] uppercase font-bold text-slate-500 block mb-1">
                    Autonomous Objective
                  </span>
                  <p className="line-clamp-3">{tmpl.definition?.objective}</p>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-border/60">
                <button
                  onClick={() => handleRun(tmpl.id)}
                  disabled={runningId === tmpl.id}
                  className="w-full py-2.5 px-4 rounded-xl text-xs font-semibold bg-gradient-to-r from-indigo-600 to-cyan-600 hover:from-indigo-500 hover:to-cyan-500 text-white shadow-md shadow-indigo-600/20 flex items-center justify-center gap-2 transition-all active:scale-95 disabled:opacity-50"
                >
                  {runningId === tmpl.id ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Dispatching Agents...</span>
                    </>
                  ) : (
                    <>
                      <PlayCircle className="w-4 h-4" />
                      <span>Instantiate & Execute</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Template Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="glass-panel w-full max-w-lg p-6 rounded-2xl border border-border/80 shadow-2xl space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-border/80">
              <h3 className="font-bold text-base text-white">Create Custom Workflow Template</h3>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-white">✕</button>
            </div>

            <form onSubmit={handleCreate} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 mb-1">Template Name</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="e.g. Daily Fulfillment Audit"
                  className="w-full bg-slate-900 border border-border rounded-lg p-2.5 text-white"
                />
              </div>

              <div>
                <label className="block text-slate-300 mb-1">Description</label>
                <input
                  type="text"
                  required
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  placeholder="Summary of what this blueprint automates"
                  className="w-full bg-slate-900 border border-border rounded-lg p-2.5 text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-300 mb-1">Category</label>
                  <select
                    value={category}
                    onChange={e => setCategory(e.target.value)}
                    className="w-full bg-slate-900 border border-border rounded-lg p-2 text-white"
                  >
                    <option value="order_management">Order Management</option>
                    <option value="inventory_management">Inventory Management</option>
                    <option value="supplier_coordination">Supplier Coordination</option>
                    <option value="customer_support">Customer Support</option>
                    <option value="internal_operations">Internal Operations</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-300 mb-1">Default Priority</label>
                  <select
                    value={priority}
                    onChange={e => setPriority(e.target.value)}
                    className="w-full bg-slate-900 border border-border rounded-lg p-2 text-white"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="critical">Critical</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-300 mb-1">Objective Template Prompt</label>
                <textarea
                  rows={3}
                  required
                  value={objective}
                  onChange={e => setObjective(e.target.value)}
                  placeholder="Natural language instruction for the Orchestrator..."
                  className="w-full bg-slate-900 border border-border rounded-lg p-2.5 text-white"
                />
              </div>

              <div className="pt-3 flex items-center justify-end gap-2 border-t border-border/80">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 rounded-lg bg-card text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-semibold"
                >
                  Save Blueprint
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
