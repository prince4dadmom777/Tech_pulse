import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  GitBranch,
  PlayCircle,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Sparkles,
  Bot,
  ArrowRight,
  TrendingUp,
  Package,
  Layers,
  FileCode,
  ShieldAlert,
  Loader2
} from 'lucide-react';
import { api } from '../lib/api';
import { MetricCard } from '../components/ui/MetricCard';
import { StatusBadge } from '../components/ui/StatusBadge';

export const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState<any>(null);
  const [recentWorkflows, setRecentWorkflows] = useState<any[]>([]);
  const [alerts, setAlerts] = useState<any>(null);
  const [activity, setActivity] = useState<any[]>([]);
  const [templates, setTemplates] = useState<any[]>([]);
  const [runningTemplateId, setRunningTemplateId] = useState<string | null>(null);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const [sumRes, wfRes, alertRes, actRes, tmplRes] = await Promise.all([
        api.getDashboardSummary().catch(() => ({ summary: {} })),
        api.getWorkflows().catch(() => ({ workflows: [] })),
        api.getDashboardAlerts().catch(() => ({})),
        api.getDashboardActivity(6).catch(() => ({ activity: [] })),
        api.getTemplates().catch(() => ({ templates: [] }))
      ]);

      setSummary(sumRes.summary || {});
      setRecentWorkflows((wfRes.workflows || []).slice(0, 5));
      setAlerts(alertRes || {});
      setActivity(actRes.activity || []);
      setTemplates((tmplRes.templates || []).slice(0, 3));
    } finally {
      setLoading(false);
    }
  };

  const handleRunTemplate = async (templateId: string) => {
    try {
      setRunningTemplateId(templateId);
      const res = await api.runTemplate(templateId);
      if (res.workflow) {
        navigate(`/workflows/${res.workflow.id}`);
      }
    } catch (err: any) {
      alert(`Error running template: ${err.message}`);
    } finally {
      setRunningTemplateId(null);
    }
  };

  if (loading && !summary) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3">
        <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
        <span className="text-sm font-mono text-slate-400">Loading operations intelligence...</span>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Top Banner / Welcome */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-2xl bg-gradient-to-r from-indigo-950/40 via-card to-card border border-indigo-500/20">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2.5">
            Mission Control <span className="text-cyan-400 font-mono text-xs px-2 py-0.5 rounded bg-cyan-950/80 border border-cyan-800/50">HQ</span>
          </h1>
          <p className="mt-1 text-sm text-slate-300">
            Autonomous multi-agent coordinator active. Real-time task scheduling and approval enforcement.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to="/workflows/new"
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/30 transition-all active:scale-95"
          >
            <Sparkles className="w-4 h-4" />
            <span>Create Workflow</span>
          </Link>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Total Workflows"
          value={summary?.totalWorkflows || 0}
          subtitle={`${summary?.activeWorkflows || 0} in active progress`}
          icon={GitBranch}
          accentColor="indigo"
        />
        <MetricCard
          title="Pending Approvals"
          value={summary?.pendingApprovals || 0}
          subtitle="Awaiting human sign-off"
          icon={AlertTriangle}
          accentColor={summary?.pendingApprovals > 0 ? 'amber' : 'emerald'}
          trend={summary?.pendingApprovals > 0 ? { value: 'Requires Review', positive: false } : undefined}
        />
        <MetricCard
          title="Tasks Completed"
          value={summary?.tasksCompletedTotal || 0}
          subtitle="Verified by Quality Agent"
          icon={CheckCircle2}
          accentColor="emerald"
        />
        <MetricCard
          title="Manual Time Saved"
          value={`${summary?.estimatedTimeSavedMinutes || 0}m`}
          subtitle="Automated coordination"
          icon={Clock}
          accentColor="cyan"
          trend={{ value: '15m / task', positive: true }}
        />
      </div>

      {/* Operational Alerts & Warnings (if any) */}
      {(alerts?.delayedOrdersCount > 0 || alerts?.lowStockCount > 0) && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {alerts?.delayedOrdersCount > 0 && (
            <div className="p-4 rounded-xl bg-amber-950/20 border border-amber-500/30 flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
              <div className="flex-1">
                <h4 className="text-sm font-bold text-amber-200">
                  {alerts.delayedOrdersCount} Delayed Order(s) Detected
                </h4>
                <p className="mt-0.5 text-xs text-amber-300/80">
                  Customer fulfillment impacted. Run an order resolution workflow to dispatch warehouse follow-ups.
                </p>
                <div className="mt-2 flex gap-2">
                  <Link
                    to="/business-data"
                    className="text-xs font-semibold text-amber-300 hover:text-white underline"
                  >
                    View Delayed Orders
                  </Link>
                </div>
              </div>
            </div>
          )}

          {alerts?.lowStockCount > 0 && (
            <div className="p-4 rounded-xl bg-rose-950/20 border border-rose-500/30 flex items-start gap-3">
              <ShieldAlert className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
              <div className="flex-1">
                <h4 className="text-sm font-bold text-rose-200">
                  {alerts.lowStockCount} SKU(s) Below Threshold
                </h4>
                <p className="mt-0.5 text-xs text-rose-300/80">
                  Immediate replenishment recommended. Check supplier lead times in Business Data.
                </p>
                <div className="mt-2 flex gap-2">
                  <Link
                    to="/business-data"
                    className="text-xs font-semibold text-rose-300 hover:text-white underline"
                  >
                    Inspect Inventory
                  </Link>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Two-Column Layout: Workflows & Agent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Workflows (2 cols) */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Layers className="w-5 h-5 text-indigo-400" />
              <span>Active & Recent Workflows</span>
            </h3>
            <Link to="/workflows" className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 flex items-center gap-1">
              <span>View All</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="glass-panel rounded-xl overflow-hidden border border-border/80">
            {recentWorkflows.length === 0 ? (
              <div className="p-8 text-center text-slate-400 text-sm">
                No workflows created yet. Click "Create Workflow" or launch the Demo!
              </div>
            ) : (
              <div className="divide-y divide-border/60">
                {recentWorkflows.map(wf => (
                  <div
                    key={wf.id}
                    onClick={() => navigate(`/workflows/${wf.id}`)}
                    className="p-4 hover:bg-cardHover/50 transition-colors cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <StatusBadge status={wf.status} />
                        <span className="font-semibold text-sm text-slate-100 truncate">{wf.title}</span>
                      </div>
                      <p className="mt-1 text-xs text-slate-400 line-clamp-1">{wf.objective}</p>
                    </div>

                    <div className="flex items-center gap-4 shrink-0">
                      <div className="w-28 text-right">
                        <div className="text-[11px] font-mono text-slate-400 mb-1">
                          {wf.tasksCompleted || 0} / {wf.tasksTotal || 0} tasks
                        </div>
                        <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
                          <div
                            className="bg-indigo-500 h-full rounded-full transition-all duration-300"
                            style={{ width: `${wf.progressPercent || 0}%` }}
                          />
                        </div>
                      </div>
                      <ArrowRight className="w-4 h-4 text-slate-500" />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Quick-Start Templates */}
          <div className="pt-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-2">
              <FileCode className="w-4 h-4 text-cyan-400" />
              <span>Quick-Start Templates</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {templates.map(tmpl => (
                <div
                  key={tmpl.id}
                  className="p-4 rounded-xl glass-panel glass-panel-hover flex flex-col justify-between"
                >
                  <div>
                    <span className="text-[10px] font-mono uppercase text-indigo-400">
                      {tmpl.category.replace('_', ' ')}
                    </span>
                    <h4 className="text-sm font-semibold text-white mt-1">{tmpl.name}</h4>
                    <p className="text-xs text-slate-400 mt-1 line-clamp-2">{tmpl.description}</p>
                  </div>
                  <button
                    onClick={() => handleRunTemplate(tmpl.id)}
                    disabled={runningTemplateId === tmpl.id}
                    className="mt-4 w-full py-1.5 px-3 rounded-lg text-xs font-semibold bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-500/30 flex items-center justify-center gap-1.5 transition-colors disabled:opacity-50"
                  >
                    {runningTemplateId === tmpl.id ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <PlayCircle className="w-3.5 h-3.5" />
                    )}
                    <span>Run Template</span>
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Live Activity & Agent Status (1 col) */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Bot className="w-5 h-5 text-cyan-400" />
              <span>Agent Activity Stream</span>
            </h3>
            <Link to="/activity" className="text-xs font-semibold text-cyan-400 hover:text-cyan-300">
              Audit Logs
            </Link>
          </div>

          <div className="glass-panel rounded-xl p-4 divide-y divide-border/60">
            {activity.length === 0 ? (
              <p className="text-xs text-slate-400 py-6 text-center">No agent actions recorded yet.</p>
            ) : (
              activity.map(act => (
                <div key={act.id} className="py-3 first:pt-0 last:pb-0 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-slate-200 capitalize">
                      {act.action.replace('tool_executed:', 'Tool: ').replace('_', ' ')}
                    </span>
                    <span className="text-[10px] font-mono text-slate-500">
                      {new Date(act.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <p className="text-slate-400 mt-1 truncate">
                    Actor: <span className="font-mono text-indigo-300">{act.actor_type}</span> — Status:{' '}
                    <span className={act.outcome === 'success' || act.outcome === 'approved' ? 'text-emerald-400' : 'text-amber-400'}>
                      {act.outcome}
                    </span>
                  </p>
                </div>
              ))
            )}
          </div>

          {/* Agent Team Health */}
          <div className="glass-panel rounded-xl p-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
              Specialized Agent Registry
            </h4>
            <div className="space-y-2">
              {['Orchestrator', 'Business Analyst', 'Planner', 'Operations', 'Customer Comms', 'Quality & Risk'].map(agentName => (
                <div key={agentName} className="flex items-center justify-between text-xs py-1">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-400" />
                    <span className="text-slate-200 font-medium">{agentName}</span>
                  </div>
                  <span className="text-[10px] font-mono text-slate-400">Ready</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
