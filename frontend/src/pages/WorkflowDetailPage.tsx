import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  GitBranch,
  Play,
  Pause,
  RotateCcw,
  XCircle,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Bot,
  Layers,
  FileText,
  ShieldCheck,
  Cpu,
  ChevronDown,
  ChevronUp,
  Download,
  Loader2,
  Terminal,
  Activity,
  Sparkles
} from 'lucide-react';
import { api } from '../lib/api';
import { StatusBadge } from '../components/ui/StatusBadge';

export const WorkflowDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [expandedTaskId, setExpandedTaskId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'tasks' | 'graph' | 'tools' | 'approvals' | 'report'>('tasks');

  // Approval modal state
  const [selectedApproval, setSelectedApproval] = useState<any | null>(null);
  const [reviewComment, setReviewComment] = useState('');

  useEffect(() => {
    if (id) {
      loadWorkflow();
      setupEventStream(id);
    }
  }, [id]);

  const loadWorkflow = async () => {
    if (!id) return;
    try {
      const res = await api.getWorkflowById(id);
      setData(res);
      // Default expand first running or awaiting_approval task
      const activeTask = res.tasks?.find((t: any) => t.status === 'running' || t.status === 'awaiting_approval');
      if (activeTask) setExpandedTaskId(activeTask.id);
    } finally {
      setLoading(false);
    }
  };

  const setupEventStream = (workflowId: string) => {
    try {
      const eventSource = new EventSource(`/api/workflows/${workflowId}/events`);

      eventSource.onmessage = () => {
        loadWorkflow();
      };

      eventSource.addEventListener('task_completed', () => loadWorkflow());
      eventSource.addEventListener('task_started', () => loadWorkflow());
      eventSource.addEventListener('task_awaiting_approval', () => loadWorkflow());
      eventSource.addEventListener('workflow_completed', () => loadWorkflow());
      eventSource.addEventListener('approval_resolved', () => loadWorkflow());

      return () => {
        eventSource.close();
      };
    } catch (_) {
      // Fallback to polling
      const interval = setInterval(loadWorkflow, 3000);
      return () => clearInterval(interval);
    }
  };

  const handleStart = async () => {
    if (!id) return;
    try {
      setActionLoading(true);
      await api.startWorkflow(id);
      loadWorkflow();
    } finally {
      setActionLoading(false);
    }
  };

  const handlePause = async () => {
    if (!id) return;
    try {
      setActionLoading(true);
      await api.pauseWorkflow(id);
      loadWorkflow();
    } finally {
      setActionLoading(false);
    }
  };

  const handleResume = async () => {
    if (!id) return;
    try {
      setActionLoading(true);
      await api.resumeWorkflow(id);
      loadWorkflow();
    } finally {
      setActionLoading(false);
    }
  };

  const handleCancel = async () => {
    if (!id) return;
    if (confirm('Cancel this workflow?')) {
      try {
        setActionLoading(true);
        await api.cancelWorkflow(id);
        loadWorkflow();
      } finally {
        setActionLoading(false);
      }
    }
  };

  const handleResolveApproval = async (status: 'approved' | 'rejected') => {
    if (!selectedApproval) return;
    try {
      setActionLoading(true);
      if (status === 'approved') {
        await api.approveRequest(selectedApproval.id, reviewComment);
      } else {
        await api.rejectRequest(selectedApproval.id, reviewComment);
      }
      setSelectedApproval(null);
      setReviewComment('');
      loadWorkflow();
    } catch (err: any) {
      alert(`Approval action failed: ${err.message}`);
    } finally {
      setActionLoading(false);
    }
  };

  const handleExportReport = () => {
    if (!data?.workflow?.final_report) return;
    const blob = new Blob([JSON.stringify(data.workflow.final_report, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `flowpilot_report_${data.workflow.id.substring(0, 8)}.json`;
    a.click();
  };

  if (loading || !data?.workflow) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3">
        <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
        <span className="text-sm font-mono text-slate-400">Loading workflow state & DAG...</span>
      </div>
    );
  }

  const { workflow, tasks = [], toolExecutions = [], approvals = [] } = data;
  const isRunning = workflow.status === 'running';
  const isAwaitingApproval = workflow.status === 'awaiting_approval';
  const isPaused = workflow.status === 'paused';
  const isDone = workflow.status === 'completed';

  const completedCount = tasks.filter((t: any) => t.status === 'completed').length;
  const progressPct = tasks.length > 0 ? Math.round((completedCount / tasks.length) * 100) : 0;

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Top Banner & Control Bar */}
      <div className="glass-panel p-6 rounded-2xl border border-border/80 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1.5 min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <StatusBadge status={workflow.status} size="md" />
            <StatusBadge status={workflow.priority} type="priority" />
            <span className="text-xs font-mono text-cyan-400 px-2.5 py-0.5 rounded bg-cyan-950/40 border border-cyan-800/30 uppercase">
              {workflow.category.replace('_', ' ')}
            </span>
            <span className="text-xs font-mono text-slate-500">ID: {workflow.id}</span>
          </div>
          <h1 className="text-2xl font-bold text-white truncate">{workflow.title}</h1>
          <p className="text-sm text-slate-300">{workflow.objective}</p>
        </div>

        {/* Workflow Controls */}
        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          {(workflow.status === 'planned' || workflow.status === 'draft') && (
            <button
              onClick={handleStart}
              disabled={actionLoading}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/30 transition-all active:scale-95 disabled:opacity-50"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>Start Execution</span>
            </button>
          )}

          {isRunning && (
            <button
              onClick={handlePause}
              disabled={actionLoading}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold bg-amber-600 hover:bg-amber-500 text-white shadow-lg transition-all active:scale-95 disabled:opacity-50"
            >
              <Pause className="w-3.5 h-3.5" />
              <span>Pause</span>
            </button>
          )}

          {isPaused && (
            <button
              onClick={handleResume}
              disabled={actionLoading}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg transition-all active:scale-95 disabled:opacity-50"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>Resume</span>
            </button>
          )}

          {!isDone && workflow.status !== 'cancelled' && (
            <button
              onClick={handleCancel}
              disabled={actionLoading}
              className="p-2 rounded-xl text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 border border-border transition-colors"
              title="Cancel Workflow"
            >
              <XCircle className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Progress & Stats Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
        <div className="glass-panel p-4 rounded-xl flex flex-col justify-between">
          <span className="text-[11px] font-mono uppercase text-slate-400">Execution Progress</span>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-xl font-bold text-white">{progressPct}%</span>
            <span className="text-xs font-mono text-slate-400">{completedCount} of {tasks.length} tasks</span>
          </div>
          <div className="mt-2 w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
            <div
              className="bg-gradient-to-r from-indigo-500 to-cyan-400 h-full rounded-full transition-all duration-300"
              style={{ width: `${progressPct}%` }}
            />
          </div>
        </div>

        <div className="glass-panel p-4 rounded-xl">
          <span className="text-[11px] font-mono uppercase text-slate-400">Approval Policy</span>
          <p className="mt-2 text-base font-bold text-white capitalize">{workflow.approval_policy.replace('_', ' ')}</p>
          <p className="text-[11px] text-slate-400 mt-0.5">Sensitive tools gated by human review</p>
        </div>

        <div className="glass-panel p-4 rounded-xl">
          <span className="text-[11px] font-mono uppercase text-slate-400">Pending Approvals</span>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-xl font-bold text-amber-400">
              {approvals.filter((a: any) => a.status === 'pending').length}
            </span>
            <span className="text-xs text-slate-400">requests</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-0.5">
            {approvals.filter((a: any) => a.status === 'pending').length > 0 ? 'Requires action to proceed' : 'All clear'}
          </p>
        </div>

        <div className="glass-panel p-4 rounded-xl">
          <span className="text-[11px] font-mono uppercase text-slate-400">Tool Calls Recorded</span>
          <p className="mt-2 text-xl font-bold text-cyan-400">{toolExecutions.length}</p>
          <p className="text-[11px] text-slate-400 mt-0.5">Immutable audit trail</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-border/80 gap-6 text-sm font-semibold text-slate-400">
        <button
          onClick={() => setActiveTab('tasks')}
          className={`pb-3 flex items-center gap-2 transition-colors relative ${
            activeTab === 'tasks' ? 'text-indigo-400' : 'hover:text-slate-200'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>Task Schedule ({tasks.length})</span>
          {activeTab === 'tasks' && (
            <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-500 rounded-full" />
          )}
        </button>

        <button
          onClick={() => setActiveTab('graph')}
          className={`pb-3 flex items-center gap-2 transition-colors relative ${
            activeTab === 'graph' ? 'text-indigo-400' : 'hover:text-slate-200'
          }`}
        >
          <GitBranch className="w-4 h-4" />
          <span>Dependency DAG Graph</span>
          {activeTab === 'graph' && (
            <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-500 rounded-full" />
          )}
        </button>

        <button
          onClick={() => setActiveTab('tools')}
          className={`pb-3 flex items-center gap-2 transition-colors relative ${
            activeTab === 'tools' ? 'text-indigo-400' : 'hover:text-slate-200'
          }`}
        >
          <Terminal className="w-4 h-4" />
          <span>Tool Activity ({toolExecutions.length})</span>
          {activeTab === 'tools' && (
            <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-500 rounded-full" />
          )}
        </button>

        <button
          onClick={() => setActiveTab('approvals')}
          className={`pb-3 flex items-center gap-2 transition-colors relative ${
            activeTab === 'approvals' ? 'text-indigo-400' : 'hover:text-slate-200'
          }`}
        >
          <ShieldCheck className="w-4 h-4" />
          <span>Approvals ({approvals.length})</span>
          {approvals.some((a: any) => a.status === 'pending') && (
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
          )}
          {activeTab === 'approvals' && (
            <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-500 rounded-full" />
          )}
        </button>

        {workflow.final_report && (
          <button
            onClick={() => setActiveTab('report')}
            className={`pb-3 flex items-center gap-2 transition-colors relative ${
              activeTab === 'report' ? 'text-cyan-400' : 'hover:text-slate-200'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>Final Report</span>
            {activeTab === 'report' && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-cyan-400 rounded-full" />
            )}
          </button>
        )}
      </div>

      {/* TAB 1: Tasks List */}
      {activeTab === 'tasks' && (
        <div className="space-y-3">
          {tasks.map((task: any, index: number) => {
            const isExpanded = expandedTaskId === task.id;
            const taskApprovals = approvals.filter((a: any) => a.task_id === task.id);
            const taskTools = toolExecutions.filter((te: any) => te.task_id === task.id);

            return (
              <div
                key={task.id}
                className={`glass-panel rounded-xl overflow-hidden border transition-all ${
                  task.status === 'running'
                    ? 'border-indigo-500/50 shadow-lg shadow-indigo-500/10'
                    : task.status === 'awaiting_approval'
                    ? 'border-amber-500/50'
                    : 'border-border/80'
                }`}
              >
                <div
                  onClick={() => setExpandedTaskId(isExpanded ? null : task.id)}
                  className="p-4.5 flex items-center justify-between gap-4 cursor-pointer hover:bg-cardHover/40 transition-colors"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="w-6 h-6 rounded-lg bg-card border border-border flex items-center justify-center font-mono text-xs text-slate-400 shrink-0">
                      {index + 1}
                    </span>
                    <StatusBadge status={task.status} type="task" />
                    <div>
                      <h4 className="text-sm font-semibold text-white truncate">{task.title}</h4>
                      <p className="text-xs text-slate-400 truncate">{task.description}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 shrink-0">
                    <span className="text-xs font-mono text-indigo-400 px-2 py-0.5 rounded bg-indigo-950/40 border border-indigo-800/40 hidden sm:inline">
                      {task.input_data?.task_key || 'task'}
                    </span>
                    {task.dependencies?.length > 0 && (
                      <span className="text-[11px] font-mono text-slate-500 hidden md:inline">
                        Depends on: {task.dependencies.length} task(s)
                      </span>
                    )}
                    {isExpanded ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
                  </div>
                </div>

                {/* Expanded Details */}
                {isExpanded && (
                  <div className="px-5 pb-5 pt-2 border-t border-border/60 bg-card/40 space-y-4 text-xs animate-in fade-in duration-200">
                    {/* Completion Criteria */}
                    {task.completion_criteria?.criteria && (
                      <div>
                        <span className="font-semibold text-slate-300 uppercase tracking-wider text-[10px]">
                          Completion Criteria
                        </span>
                        <ul className="mt-1.5 space-y-1 list-disc list-inside text-slate-300">
                          {task.completion_criteria.criteria.map((c: string, i: number) => (
                            <li key={i}>{c}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Output Data / Observations */}
                    {task.output_data && (
                      <div>
                        <span className="font-semibold text-slate-300 uppercase tracking-wider text-[10px]">
                          Agent Observations & Output
                        </span>
                        <div className="mt-1.5 p-3 rounded-lg bg-slate-900 border border-border/80 font-mono text-slate-300 max-h-48 overflow-y-auto">
                          <pre className="whitespace-pre-wrap">{JSON.stringify(task.output_data, null, 2)}</pre>
                        </div>
                      </div>
                    )}

                    {/* Associated Approvals banner */}
                    {taskApprovals.length > 0 && (
                      <div className="p-3 rounded-lg bg-amber-950/20 border border-amber-500/30">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-amber-300 flex items-center gap-1.5">
                            <ShieldCheck className="w-4 h-4" />
                            <span>Action Gate: {taskApprovals[0].action_type}</span>
                          </span>
                          <StatusBadge status={taskApprovals[0].status} type="approval" />
                        </div>
                        <p className="mt-1 text-slate-300">{taskApprovals[0].reason}</p>
                        {taskApprovals[0].status === 'pending' && (
                          <button
                            onClick={() => setSelectedApproval(taskApprovals[0])}
                            className="mt-2.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-amber-600 hover:bg-amber-500 text-white shadow transition-all"
                          >
                            Review & Decide Approval
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* TAB 2: DAG Graph */}
      {activeTab === 'graph' && (
        <div className="glass-panel p-8 rounded-2xl border border-border/80 space-y-6">
          <div>
            <h3 className="text-base font-bold text-white">Topological Dependency DAG</h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Tasks are executed according to acyclic directed graph dependencies. Independent tasks execute concurrently.
            </p>
          </div>

          <div className="flex flex-col gap-4">
            {tasks.map((task: any, idx: number) => {
              const deps = task.dependencies || [];
              return (
                <div key={task.id} className="flex items-start gap-4 p-4 rounded-xl bg-card border border-border/80">
                  <div className="w-8 h-8 rounded-lg bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center font-mono text-xs font-bold text-indigo-300 shrink-0">
                    {idx + 1}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h4 className="font-bold text-sm text-white">{task.title}</h4>
                      <StatusBadge status={task.status} />
                    </div>
                    <p className="text-xs text-slate-400 mt-1">{task.description}</p>
                    <div className="mt-2 flex flex-wrap gap-2 text-[11px] font-mono">
                      <span className="px-2 py-0.5 rounded bg-slate-900 text-slate-400 border border-border">
                        Key: {task.input_data?.task_key || 'task'}
                      </span>
                      {deps.length > 0 ? (
                        <span className="px-2 py-0.5 rounded bg-indigo-950/40 text-indigo-300 border border-indigo-800/40">
                          Prerequisites: {deps.length} predecessor task(s)
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded bg-emerald-950/40 text-emerald-300 border border-emerald-800/40">
                          Root Node (Immediate Start)
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 3: Tool Executions */}
      {activeTab === 'tools' && (
        <div className="glass-panel rounded-2xl overflow-hidden border border-border/80">
          <div className="p-4 border-b border-border/80">
            <h3 className="font-bold text-sm text-white">Immutable Tool Executions Log</h3>
            <p className="text-xs text-slate-400">Strictly typed application tool executions registered with timestamps.</p>
          </div>

          <div className="divide-y divide-border/60">
            {toolExecutions.length === 0 ? (
              <p className="text-xs text-slate-400 p-8 text-center">No tool calls recorded yet.</p>
            ) : (
              toolExecutions.map((te: any) => (
                <div key={te.id} className="p-4 text-xs space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-bold text-indigo-400 bg-indigo-950/40 px-2 py-0.5 rounded border border-indigo-800/40">
                      {te.tool_name}
                    </span>
                    <span className="font-mono text-slate-500">
                      {new Date(te.started_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                    </span>
                  </div>
                  {te.input_summary && (
                    <div className="text-[11px] text-slate-400">
                      <strong>Input:</strong> <span className="font-mono">{JSON.stringify(te.input_summary)}</span>
                    </div>
                  )}
                  {te.output_summary && (
                    <div className="text-[11px] text-emerald-400">
                      <strong>Result:</strong> <span className="font-mono text-slate-300">{JSON.stringify(te.output_summary)}</span>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* TAB 4: Approvals */}
      {activeTab === 'approvals' && (
        <div className="space-y-4">
          {approvals.length === 0 ? (
            <div className="glass-panel p-12 text-center rounded-2xl">
              <ShieldCheck className="w-12 h-12 text-slate-600 mx-auto mb-3" />
              <h3 className="text-base font-semibold text-slate-200">No approval requests</h3>
              <p className="mt-1 text-xs text-slate-400">
                Any sensitive financial commitment or external communication will be safely queued here for review.
              </p>
            </div>
          ) : (
            approvals.map((app: any) => (
              <div key={app.id} className="glass-panel p-6 rounded-2xl border border-border/80 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <StatusBadge status={app.status} type="approval" size="md" />
                    <span className="font-mono text-xs px-2 py-0.5 rounded bg-card border border-border text-slate-300">
                      Risk: {app.risk_level.toUpperCase()}
                    </span>
                  </div>
                  <span className="text-xs font-mono text-slate-500">
                    Hash: {app.action_hash.substring(0, 16)}...
                  </span>
                </div>

                <div>
                  <h4 className="font-bold text-base text-white">{app.action_type.replace('_', ' ').toUpperCase()}</h4>
                  <p className="text-sm text-slate-300 mt-1">{app.reason}</p>
                </div>

                {/* Proposed Payload */}
                <div className="p-3 rounded-xl bg-slate-900 border border-border/80 font-mono text-xs text-slate-300">
                  <span className="text-[10px] uppercase text-slate-500 font-bold block mb-1">Immutable Action Payload</span>
                  <pre className="whitespace-pre-wrap">{JSON.stringify(app.action_payload, null, 2)}</pre>
                </div>

                {app.status === 'pending' ? (
                  <div className="flex items-center justify-end gap-3 pt-2">
                    <button
                      onClick={() => setSelectedApproval(app)}
                      className="px-5 py-2 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white shadow transition-all"
                    >
                      Review & Resolve Decision
                    </button>
                  </div>
                ) : (
                  <div className="text-xs text-slate-400 pt-2 border-t border-border/60">
                    Decision recorded: <strong className="capitalize text-slate-200">{app.status}</strong>
                    {app.review_comment && <span> — Comment: "{app.review_comment}"</span>}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      )}

      {/* TAB 5: Final Report */}
      {activeTab === 'report' && workflow.final_report && (
        <div className="glass-panel p-8 rounded-2xl border border-border/80 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-border/80">
            <div>
              <span className="text-xs font-mono uppercase tracking-wider text-cyan-400">Authoritative Evidence Report</span>
              <h2 className="text-2xl font-bold text-white mt-1">Autonomous Execution Completion Summary</h2>
            </div>
            <button
              onClick={handleExportReport}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-border transition-colors self-start sm:self-auto"
            >
              <Download className="w-4 h-4" />
              <span>Export Report (JSON)</span>
            </button>
          </div>

          <div className="p-4 rounded-xl bg-indigo-950/20 border border-indigo-500/30 text-sm text-slate-200">
            <h4 className="font-bold text-indigo-300 mb-1">Executive Summary</h4>
            <p>{workflow.final_report.workflow_summary}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Completed Verified Outcomes */}
            <div className="space-y-3">
              <h4 className="font-bold text-sm text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4" />
                <span>Verified Outcomes</span>
              </h4>
              <ul className="space-y-2 text-xs text-slate-300">
                {workflow.final_report.verified_outcomes?.map((item: string, i: number) => (
                  <li key={i} className="flex items-start gap-2 p-2.5 rounded-lg bg-card border border-border">
                    <span className="text-emerald-400 font-bold">•</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Recommendations */}
            <div className="space-y-3">
              <h4 className="font-bold text-sm text-cyan-400 uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-4 h-4" />
                <span>Recommended Next Steps</span>
              </h4>
              <ul className="space-y-2 text-xs text-slate-300">
                {workflow.final_report.recommendations?.map((item: string, i: number) => (
                  <li key={i} className="flex items-start gap-2 p-2.5 rounded-lg bg-card border border-border">
                    <span className="text-cyan-400 font-bold">•</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Time Saved Metric Banner */}
          <div className="p-4 rounded-xl bg-card border border-border/80 flex items-center justify-between text-xs">
            <div>
              <span className="font-bold text-white">Estimated Manual Coordination Time Saved:</span>
              <p className="text-slate-400 mt-0.5">{workflow.final_report.estimation_method}</p>
            </div>
            <span className="text-2xl font-bold font-mono text-cyan-400">
              {workflow.final_report.estimated_time_saved_minutes} min
            </span>
          </div>
        </div>
      )}

      {/* Approval Resolution Modal */}
      {selectedApproval && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="glass-panel w-full max-w-lg p-6 rounded-2xl border border-border/80 shadow-2xl space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-border/80">
              <div>
                <span className="text-[11px] font-mono text-amber-400 uppercase tracking-wider">Human Authorization Review</span>
                <h3 className="text-lg font-bold text-white mt-0.5">{selectedApproval.action_type.replace('_', ' ').toUpperCase()}</h3>
              </div>
              <button
                onClick={() => setSelectedApproval(null)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-slate-300">{selectedApproval.reason}</p>

            {/* Payload verification */}
            <div className="p-3 rounded-xl bg-slate-900 border border-border text-xs font-mono text-slate-300 max-h-40 overflow-y-auto">
              <span className="text-[10px] text-slate-500 uppercase block mb-1">Payload SHA-256 Verified</span>
              <pre className="whitespace-pre-wrap">{JSON.stringify(selectedApproval.action_payload, null, 2)}</pre>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Review Decision Comment (Optional)
              </label>
              <textarea
                rows={2}
                value={reviewComment}
                onChange={e => setReviewComment(e.target.value)}
                placeholder="Provide notes or conditions for this decision..."
                className="w-full bg-slate-900 border border-border rounded-xl p-3 text-xs text-white placeholder:text-slate-600 focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div className="pt-2 flex items-center justify-end gap-3">
              <button
                onClick={() => handleResolveApproval('rejected')}
                disabled={actionLoading}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-rose-600/20 hover:bg-rose-600/30 text-rose-300 border border-rose-500/30 transition-colors disabled:opacity-50"
              >
                Reject & Block Action
              </button>
              <button
                onClick={() => handleResolveApproval('approved')}
                disabled={actionLoading}
                className="px-5 py-2 rounded-xl text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-600/30 transition-all active:scale-95 disabled:opacity-50"
              >
                Approve & Execute Action
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
