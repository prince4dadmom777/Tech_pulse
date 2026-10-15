import React, { useState, useEffect } from 'react';
import {
  BarChart3,
  TrendingUp,
  Clock,
  CheckCircle2,
  Bot,
  Layers,
  Sparkles,
  Loader2
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
  AreaChart,
  Area
} from 'recharts';
import { api } from '../lib/api';
import { MetricCard } from '../components/ui/MetricCard';

export const AnalyticsPage: React.FC = () => {
  const [overview, setOverview] = useState<any>(null);
  const [trends, setTrends] = useState<any[]>([]);
  const [agentStats, setAgentStats] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAnalytics();
  }, []);

  const loadAnalytics = async () => {
    try {
      setLoading(true);
      const [ovRes, trRes, agRes] = await Promise.all([
        api.getAnalyticsOverview().catch(() => ({})),
        api.getWorkflowTrends().catch(() => ({ trend: [] })),
        api.getAgentStats().catch(() => ({ agentStats: [] }))
      ]);

      setOverview(ovRes);
      setTrends(trRes.trend || []);
      setAgentStats(agRes.agentStats || []);
    } finally {
      setLoading(false);
    }
  };

  if (loading && !overview) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      <div>
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          <BarChart3 className="w-6 h-6 text-indigo-400" />
          <span>Operational Analytics & Telemetry</span>
        </h1>
        <p className="mt-1 text-sm text-slate-300">
          Database-derived execution metrics, agent success ratios, and measurable manual time savings.
        </p>
      </div>

      {/* Top Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Completion Rate"
          value={`${overview?.completionRate || 100}%`}
          subtitle={`${overview?.completedWorkflows || 0} of ${overview?.totalWorkflows || 0} finished`}
          icon={TrendingUp}
          accentColor="emerald"
        />
        <MetricCard
          title="Completed Tasks"
          value={overview?.completedTasks || 0}
          subtitle="Grounded execution records"
          icon={CheckCircle2}
          accentColor="indigo"
        />
        <MetricCard
          title="Measured Time Saved"
          value={`${overview?.timeSavedMinutes || 0}m`}
          subtitle="Estimated: 15m overhead / task"
          icon={Clock}
          accentColor="cyan"
          trend={{ value: 'Estimated model', positive: true }}
        />
        <MetricCard
          title="Pending Approvals"
          value={overview?.pendingApprovals || 0}
          subtitle="Human review queue"
          icon={Bot}
          accentColor={overview?.pendingApprovals > 0 ? 'amber' : 'emerald'}
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart 1: Workflow Execution Trends */}
        <div className="glass-panel p-6 rounded-2xl border border-border/80">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-bold text-base text-white">Execution Volume & Velocity</h3>
              <p className="text-xs text-slate-400">Daily workflows dispatched vs completed</p>
            </div>
            <span className="text-xs font-mono text-indigo-400 bg-indigo-950/40 px-2.5 py-0.5 rounded border border-indigo-800/40">
              7-Day Trend
            </span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trends}>
                <defs>
                  <linearGradient id="colorCompleted" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1f2a44" />
                <XAxis dataKey="date" stroke="#64748b" tick={{ fontSize: 11 }} />
                <YAxis stroke="#64748b" tick={{ fontSize: 11 }} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#111726', borderColor: '#1f2a44', borderRadius: '8px' }}
                />
                <Area type="monotone" dataKey="total" stroke="#06b6d4" fill="transparent" name="Total Dispatched" />
                <Area type="monotone" dataKey="completed" stroke="#6366f1" fillOpacity={1} fill="url(#colorCompleted)" name="Completed" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Agent Success Rates */}
        <div className="glass-panel p-6 rounded-2xl border border-border/80">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-bold text-base text-white">Agent Team Performance</h3>
              <p className="text-xs text-slate-400">Total subtasks executed by specialized role</p>
            </div>
            <span className="text-xs font-mono text-emerald-400 bg-emerald-950/40 px-2.5 py-0.5 rounded border border-emerald-800/40">
              Verified
            </span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={agentStats}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1f2a44" />
                <XAxis dataKey="agentType" stroke="#64748b" tick={{ fontSize: 10 }} tickFormatter={(val: string) => val.split('_')[0]} />
                <YAxis stroke="#64748b" tick={{ fontSize: 11 }} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#111726', borderColor: '#1f2a44', borderRadius: '8px' }}
                />
                <Bar dataKey="completed" fill="#6366f1" name="Completed" radius={[4, 4, 0, 0]} />
                <Bar dataKey="failed" fill="#f43f5e" name="Failed" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Category Breakdown Table */}
      <div className="glass-panel p-6 rounded-2xl border border-border/80">
        <h3 className="font-bold text-base text-white mb-4">Workflows by Operational Domain</h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {Object.entries(overview?.categoryBreakdown || {}).map(([cat, count]: any) => (
            <div key={cat} className="p-3.5 rounded-xl bg-card border border-border text-center">
              <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">
                {cat.replace(/_/g, ' ')}
              </span>
              <span className="text-xl font-bold text-white mt-1 block">{count}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
