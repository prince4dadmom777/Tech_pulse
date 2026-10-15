import React, { useState, useEffect } from 'react';
import {
  History,
  Search,
  Filter,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Terminal,
  ShieldCheck,
  Bot,
  User,
  Loader2
} from 'lucide-react';
import { api } from '../lib/api';

export const ActivityPage: React.FC = () => {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [actorFilter, setActorFilter] = useState('');

  useEffect(() => {
    loadLogs();
  }, []);

  const loadLogs = async () => {
    try {
      setLoading(true);
      const res = await api.getActivityLogs(100);
      setLogs(res.logs || []);
    } finally {
      setLoading(false);
    }
  };

  const getActorIcon = (actorType: string) => {
    switch (actorType) {
      case 'orchestrator':
      case 'agent':
      case 'business_analyst':
      case 'operations':
        return <Bot className="w-4 h-4 text-indigo-400" />;
      case 'user':
        return <User className="w-4 h-4 text-cyan-400" />;
      default:
        return <Terminal className="w-4 h-4 text-slate-400" />;
    }
  };

  const filteredLogs = logs.filter(log => {
    const matchesSearch = !search ||
      log.action.toLowerCase().includes(search.toLowerCase()) ||
      log.actor_type.toLowerCase().includes(search.toLowerCase()) ||
      JSON.stringify(log.metadata).toLowerCase().includes(search.toLowerCase());

    const matchesActor = !actorFilter || log.actor_type === actorFilter;
    return matchesSearch && matchesActor;
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div>
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          <History className="w-6 h-6 text-indigo-400" />
          <span>Activity Audit Trail</span>
        </h1>
        <p className="mt-1 text-sm text-slate-300">
          Cryptographically recorded audit events documenting every workflow creation, tool invocation, and human approval.
        </p>
      </div>

      {/* Search and Filters */}
      <div className="glass-panel p-3.5 rounded-xl flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search audit trail by action, actor, or payload..."
            className="w-full bg-slate-900 border border-border rounded-lg pl-9 pr-4 py-2 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-indigo-500"
          />
        </div>

        <select
          value={actorFilter}
          onChange={e => setActorFilter(e.target.value)}
          className="bg-slate-900 border border-border rounded-lg px-3 py-2 text-xs text-slate-300 focus:outline-none focus:border-indigo-500"
        >
          <option value="">All Actors</option>
          <option value="orchestrator">Orchestrator</option>
          <option value="business_analyst">Business Analyst</option>
          <option value="operations">Operations Agent</option>
          <option value="user">Human User</option>
          <option value="system">System Core</option>
        </select>
      </div>

      {loading ? (
        <div className="flex items-center justify-center p-12">
          <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
        </div>
      ) : filteredLogs.length === 0 ? (
        <div className="glass-panel p-12 text-center rounded-2xl">
          <History className="w-12 h-12 text-slate-600 mx-auto mb-3" />
          <h3 className="text-base font-semibold text-slate-200">No activity logs recorded</h3>
          <p className="mt-1 text-xs text-slate-400">Events will populate as actions execute.</p>
        </div>
      ) : (
        <div className="glass-panel rounded-2xl overflow-hidden border border-border/80">
          <div className="divide-y divide-border/60">
            {filteredLogs.map(log => (
              <div key={log.id} className="p-4 hover:bg-cardHover/30 transition-colors space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    {getActorIcon(log.actor_type)}
                    <span className="font-mono text-indigo-300 font-semibold uppercase">
                      {log.actor_type}
                    </span>
                    <span className="text-slate-500">•</span>
                    <span className="font-bold text-white">
                      {log.action.replace('tool_executed:', 'Executed Tool: ').replace(/_/g, ' ')}
                    </span>
                  </div>

                  <span className="font-mono text-[11px] text-slate-500">
                    {new Date(log.created_at).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                      second: '2-digit'
                    })}
                  </span>
                </div>

                {log.metadata && Object.keys(log.metadata).length > 0 && (
                  <div className="p-2.5 rounded-lg bg-slate-900 border border-border/80 font-mono text-[11px] text-slate-400 overflow-x-auto">
                    <pre className="whitespace-pre-wrap">{JSON.stringify(log.metadata, null, 2)}</pre>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
