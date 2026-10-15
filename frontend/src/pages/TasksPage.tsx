import React, { useState, useEffect } from 'react';
import {
  ListTodo,
  Kanban,
  List,
  RotateCcw,
  CheckCircle2,
  Clock,
  AlertTriangle,
  XCircle,
  Filter,
  Search,
  Bot,
  Loader2,
  ArrowRight
} from 'lucide-react';
import { api } from '../lib/api';
import { StatusBadge } from '../components/ui/StatusBadge';

export const TasksPage: React.FC = () => {
  const [tasks, setTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'list' | 'board'>('board');
  const [statusFilter, setStatusFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');
  const [retryingTaskId, setRetryingTaskId] = useState<string | null>(null);

  useEffect(() => {
    loadTasks();
  }, [statusFilter, priorityFilter]);

  const loadTasks = async () => {
    try {
      setLoading(true);
      const res = await api.getTasks({
        status: statusFilter || undefined,
        priority: priorityFilter || undefined
      });
      setTasks(res.tasks || []);
    } finally {
      setLoading(false);
    }
  };

  const handleRetry = async (taskId: string) => {
    try {
      setRetryingTaskId(taskId);
      await api.retryTask(taskId);
      loadTasks();
    } finally {
      setRetryingTaskId(null);
    }
  };

  const columns = [
    { title: 'Pending / Ready', statuses: ['pending', 'ready'], color: 'text-cyan-400' },
    { title: 'Running', statuses: ['running'], color: 'text-indigo-400' },
    { title: 'Awaiting Approval', statuses: ['awaiting_approval'], color: 'text-amber-400' },
    { title: 'Completed', statuses: ['completed'], color: 'text-emerald-400' },
    { title: 'Failed / Blocked', statuses: ['failed', 'blocked'], color: 'text-rose-400' }
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <ListTodo className="w-6 h-6 text-indigo-400" />
            <span>Task Execution Queue</span>
          </h1>
          <p className="mt-1 text-sm text-slate-300">
            Real-time multi-agent task queue with dependency-aware scheduling and failure recovery.
          </p>
        </div>

        {/* View Mode Toggle */}
        <div className="flex items-center gap-2">
          <div className="flex rounded-lg bg-card p-1 border border-border">
            <button
              onClick={() => setViewMode('board')}
              className={`p-1.5 rounded-md text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                viewMode === 'board' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Kanban className="w-4 h-4" />
              <span>Board</span>
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-1.5 rounded-md text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                viewMode === 'list' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              <List className="w-4 h-4" />
              <span>List</span>
            </button>
          </div>
        </div>
      </div>

      {/* Filter bar */}
      <div className="glass-panel p-3.5 rounded-xl flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2 text-xs text-slate-400">
          <Filter className="w-4 h-4" />
          <span>Filters:</span>
        </div>
        <select
          value={statusFilter}
          onChange={e => setStatusFilter(e.target.value)}
          className="bg-slate-900 border border-border rounded-lg px-3 py-1.5 text-xs text-slate-300 focus:outline-none focus:border-indigo-500"
        >
          <option value="">All Statuses</option>
          <option value="pending">Pending</option>
          <option value="ready">Ready</option>
          <option value="running">Running</option>
          <option value="awaiting_approval">Awaiting Approval</option>
          <option value="completed">Completed</option>
          <option value="failed">Failed</option>
          <option value="blocked">Blocked</option>
        </select>

        <select
          value={priorityFilter}
          onChange={e => setPriorityFilter(e.target.value)}
          className="bg-slate-900 border border-border rounded-lg px-3 py-1.5 text-xs text-slate-300 focus:outline-none focus:border-indigo-500"
        >
          <option value="">All Priorities</option>
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
          <option value="critical">Critical</option>
        </select>
      </div>

      {loading ? (
        <div className="flex items-center justify-center p-12">
          <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
        </div>
      ) : tasks.length === 0 ? (
        <div className="glass-panel p-12 text-center rounded-2xl">
          <ListTodo className="w-12 h-12 text-slate-600 mx-auto mb-3" />
          <h3 className="text-base font-semibold text-slate-200">Task queue empty</h3>
          <p className="mt-1 text-xs text-slate-400">Launch a workflow to populate scheduled tasks.</p>
        </div>
      ) : viewMode === 'board' ? (
        /* KANBAN BOARD VIEW */
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4 overflow-x-auto pb-4">
          {columns.map(col => {
            const colTasks = tasks.filter(t => col.statuses.includes(t.status));
            return (
              <div key={col.title} className="flex flex-col gap-3 min-w-[260px]">
                <div className="flex items-center justify-between pb-2 border-b border-border/80">
                  <span className={`text-xs font-bold uppercase tracking-wider ${col.color}`}>
                    {col.title}
                  </span>
                  <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-card border border-border text-slate-400">
                    {colTasks.length}
                  </span>
                </div>

                <div className="space-y-3 flex-1">
                  {colTasks.map(task => (
                    <div
                      key={task.id}
                      className="glass-panel p-4 rounded-xl border border-border/80 space-y-2.5 hover:border-indigo-500/40 transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <StatusBadge status={task.priority} type="priority" />
                        <span className="text-[10px] font-mono text-slate-500">
                          Att: {task.attempt_count}/{task.max_attempts}
                        </span>
                      </div>

                      <h4 className="font-semibold text-xs text-white leading-snug">{task.title}</h4>
                      <p className="text-[11px] text-slate-400 line-clamp-2">{task.description}</p>

                      <div className="pt-2 border-t border-border/60 flex items-center justify-between text-[11px]">
                        <span className="text-indigo-400 font-mono capitalize">
                          {task.agent_type ? task.agent_type.replace('_', ' ') : 'Agent'}
                        </span>

                        {(task.status === 'failed' || task.status === 'blocked') && (
                          <button
                            onClick={() => handleRetry(task.id)}
                            disabled={retryingTaskId === task.id}
                            className="p-1 rounded text-cyan-400 hover:text-cyan-300 hover:bg-cyan-950/40"
                            title="Retry task"
                          >
                            <RotateCcw className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* TABLE LIST VIEW */
        <div className="glass-panel rounded-2xl overflow-hidden border border-border/80">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-900/60 uppercase font-mono text-[10px] tracking-wider text-slate-400 border-b border-border/80">
              <tr>
                <th className="p-4">Task</th>
                <th className="p-4">Status</th>
                <th className="p-4">Priority</th>
                <th className="p-4">Agent</th>
                <th className="p-4">Attempts</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {tasks.map(task => (
                <tr key={task.id} className="hover:bg-cardHover/30 transition-colors">
                  <td className="p-4 font-medium text-white max-w-xs truncate">
                    <div>{task.title}</div>
                    <div className="text-[11px] text-slate-500 truncate">{task.description}</div>
                  </td>
                  <td className="p-4">
                    <StatusBadge status={task.status} type="task" />
                  </td>
                  <td className="p-4">
                    <StatusBadge status={task.priority} type="priority" />
                  </td>
                  <td className="p-4 font-mono text-indigo-400 capitalize">
                    {task.agent_type ? task.agent_type.replace('_', ' ') : 'Operations'}
                  </td>
                  <td className="p-4 font-mono text-slate-400">
                    {task.attempt_count} / {task.max_attempts}
                  </td>
                  <td className="p-4 text-right">
                    {(task.status === 'failed' || task.status === 'blocked') && (
                      <button
                        onClick={() => handleRetry(task.id)}
                        disabled={retryingTaskId === task.id}
                        className="px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-cyan-950/40 text-cyan-300 border border-cyan-800/40 hover:bg-cyan-950/70"
                      >
                        Retry
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
