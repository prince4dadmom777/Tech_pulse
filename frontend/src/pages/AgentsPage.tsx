import React, { useState, useEffect } from 'react';
import {
  Bot,
  Cpu,
  Layers,
  ShieldCheck,
  GitBranch,
  Terminal,
  Activity,
  CheckCircle2,
  Clock,
  Settings,
  Loader2
} from 'lucide-react';
import { api } from '../lib/api';

export const AgentsPage: React.FC = () => {
  const [agents, setAgents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAgents();
  }, []);

  const loadAgents = async () => {
    try {
      setLoading(true);
      const res = await api.getAgents();
      setAgents(res.agents || []);
    } finally {
      setLoading(false);
    }
  };

  const agentIcons: Record<string, any> = {
    orchestrator: GitBranch,
    business_analyst: Layers,
    planner: Cpu,
    operations: Terminal,
    customer_communication: Bot,
    quality_risk: ShieldCheck
  };

  const permittedTools: Record<string, string[]> = {
    orchestrator: ['read_order', 'read_inventory', 'generate_final_report'],
    business_analyst: ['read_order', 'read_inventory', 'search_customers', 'read_supplier_records'],
    planner: ['read_inventory', 'read_supplier_records'],
    operations: ['create_internal_task', 'update_permitted_internal_records', 'generate_inventory_alert', 'request_approval'],
    customer_communication: ['draft_customer_communication', 'request_approval'],
    quality_risk: ['generate_final_report']
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div>
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          <Bot className="w-6 h-6 text-indigo-400" />
          <span>Agent Control Center</span>
        </h1>
        <p className="mt-1 text-sm text-slate-300">
          Monitor specialized agent roles, permitted application tools, execution telemetry, and runtime boundaries.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {agents.map(agent => {
          const Icon = agentIcons[agent.agent_type] || Bot;
          const tools = permittedTools[agent.agent_type] || [];
          const isBusy = agent.currentStatus === 'busy';

          return (
            <div
              key={agent.id}
              className="glass-panel glass-panel-hover p-6 rounded-2xl flex flex-col justify-between transition-all"
            >
              <div>
                {/* Agent Header */}
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
                      <Icon className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-bold text-base text-white">{agent.name}</h3>
                      <span className="text-[11px] font-mono text-cyan-400 uppercase">
                        {agent.agent_type.replace('_', ' ')}
                      </span>
                    </div>
                  </div>

                  {/* Status Pill */}
                  <span
                    className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-mono border ${
                      isBusy
                        ? 'bg-indigo-500/10 text-indigo-400 border-indigo-500/30 animate-pulse'
                        : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                    }`}
                  >
                    <span className={`w-1.5 h-1.5 rounded-full ${isBusy ? 'bg-indigo-400' : 'bg-emerald-400'}`} />
                    <span>{isBusy ? 'Active' : 'Standby'}</span>
                  </span>
                </div>

                <p className="mt-3 text-xs text-slate-300 leading-relaxed">{agent.description}</p>

                {/* Permitted Tools */}
                <div className="mt-4">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1.5">
                    Authorized Tools
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {tools.map(tool => (
                      <span
                        key={tool}
                        className="px-2 py-0.5 rounded bg-slate-900 border border-border text-[10px] font-mono text-slate-300"
                      >
                        {tool}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Telemetry Footer */}
              <div className="mt-6 pt-4 border-t border-border/80 flex items-center justify-between text-xs font-mono text-slate-400">
                <div>
                  <span>Runs: </span>
                  <strong className="text-white">{agent.totalExecutions || 0}</strong>
                </div>
                <div>
                  <span>Completed: </span>
                  <strong className="text-emerald-400">{agent.completedCount || 0}</strong>
                </div>
                <div>
                  <span>Failed: </span>
                  <strong className={agent.failedCount > 0 ? 'text-rose-400' : 'text-slate-400'}>
                    {agent.failedCount || 0}
                  </strong>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
