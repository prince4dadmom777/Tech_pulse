import React, { useState, useEffect } from 'react';
import {
  CheckSquare,
  ShieldCheck,
  AlertTriangle,
  Clock,
  CheckCircle2,
  XCircle,
  Loader2,
  Lock,
  ArrowRight
} from 'lucide-react';
import { api } from '../lib/api';
import { StatusBadge } from '../components/ui/StatusBadge';

export const ApprovalsPage: React.FC = () => {
  const [approvals, setApprovals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('pending');
  const [selectedApproval, setSelectedApproval] = useState<any | null>(null);
  const [reviewComment, setReviewComment] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    loadApprovals();
  }, [statusFilter]);

  const loadApprovals = async () => {
    try {
      setLoading(true);
      const res = await api.getApprovals(statusFilter || undefined);
      setApprovals(res.approvals || []);
    } finally {
      setLoading(false);
    }
  };

  const handleResolve = async (status: 'approved' | 'rejected') => {
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
      loadApprovals();
    } catch (err: any) {
      alert(`Action failed: ${err.message}`);
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          <CheckSquare className="w-6 h-6 text-indigo-400" />
          <span>Human Approval Center</span>
        </h1>
        <p className="mt-1 text-sm text-slate-300">
          Enforce human-in-the-loop oversight for sensitive operations, financial commitments, and customer communications.
        </p>
      </div>

      {/* Filter Tabs */}
      <div className="flex border-b border-border/80 gap-6 text-sm font-semibold text-slate-400">
        {[
          { key: 'pending', label: 'Pending Review' },
          { key: 'approved', label: 'Approved History' },
          { key: 'rejected', label: 'Rejected Actions' },
          { key: '', label: 'All Requests' }
        ].map(tab => (
          <button
            key={tab.key}
            onClick={() => setStatusFilter(tab.key)}
            className={`pb-3 transition-colors relative ${
              statusFilter === tab.key ? 'text-indigo-400' : 'hover:text-slate-200'
            }`}
          >
            <span>{tab.label}</span>
            {statusFilter === tab.key && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-500 rounded-full" />
            )}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex items-center justify-center p-12">
          <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
        </div>
      ) : approvals.length === 0 ? (
        <div className="glass-panel p-12 text-center rounded-2xl">
          <ShieldCheck className="w-12 h-12 text-slate-600 mx-auto mb-3" />
          <h3 className="text-base font-semibold text-slate-200">No {statusFilter || ''} approvals found</h3>
          <p className="mt-1 text-xs text-slate-400">
            When agents stage high-risk actions, they will appear here with payload verification hashes.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {approvals.map(app => (
            <div
              key={app.id}
              className={`glass-panel p-6 rounded-2xl border transition-all ${
                app.status === 'pending'
                  ? 'border-amber-500/40 shadow-lg shadow-amber-500/5'
                  : 'border-border/80'
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex flex-wrap items-center gap-2">
                  <StatusBadge status={app.status} type="approval" size="md" />
                  <span className="text-xs font-mono px-2.5 py-0.5 rounded bg-card border border-border text-slate-300">
                    Risk: <strong className="text-amber-300 uppercase">{app.risk_level}</strong>
                  </span>
                  <span className="text-[11px] font-mono text-slate-500">
                    Payload SHA-256: {app.action_hash.substring(0, 16)}...
                  </span>
                </div>
                <span className="text-xs font-mono text-slate-500">
                  {new Date(app.created_at).toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>

              <div className="mt-4">
                <h3 className="text-base font-bold text-white">
                  {app.action_type.replace(/_/g, ' ').toUpperCase()}
                </h3>
                <p className="text-xs text-slate-300 mt-1">{app.reason}</p>
              </div>

              {/* Action Payload Box */}
              <div className="mt-3 p-3.5 rounded-xl bg-slate-900 border border-border/80 font-mono text-xs text-slate-300">
                <div className="flex items-center justify-between text-[10px] text-slate-500 uppercase font-bold mb-1.5">
                  <span className="flex items-center gap-1">
                    <Lock className="w-3 h-3 text-indigo-400" />
                    <span>Cryptographically Bound Action Payload</span>
                  </span>
                  <span>Validated by Server</span>
                </div>
                <pre className="whitespace-pre-wrap max-h-36 overflow-y-auto">{JSON.stringify(app.action_payload, null, 2)}</pre>
              </div>

              {/* Action buttons */}
              {app.status === 'pending' ? (
                <div className="mt-4 pt-3 border-t border-border/60 flex items-center justify-end gap-3">
                  <button
                    onClick={() => setSelectedApproval(app)}
                    className="px-5 py-2 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg transition-all"
                  >
                    Review & Decide
                  </button>
                </div>
              ) : (
                <div className="mt-4 pt-3 border-t border-border/60 text-xs text-slate-400 flex items-center justify-between">
                  <span>
                    Decision: <strong className="capitalize text-slate-200">{app.status}</strong>
                    {app.review_comment && ` — "${app.review_comment}"`}
                  </span>
                  <span className="font-mono text-[11px]">
                    Reviewed {new Date(app.reviewed_at || app.created_at).toLocaleTimeString()}
                  </span>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Review Modal */}
      {selectedApproval && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="glass-panel w-full max-w-lg p-6 rounded-2xl border border-border/80 shadow-2xl space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-border/80">
              <div>
                <span className="text-[11px] font-mono text-amber-400 uppercase tracking-wider">Human Authorization Review</span>
                <h3 className="text-lg font-bold text-white mt-0.5">{selectedApproval.action_type.replace(/_/g, ' ').toUpperCase()}</h3>
              </div>
              <button
                onClick={() => setSelectedApproval(null)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-slate-300">{selectedApproval.reason}</p>

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
                placeholder="Notes or conditions for this decision..."
                className="w-full bg-slate-900 border border-border rounded-xl p-3 text-xs text-white placeholder:text-slate-600 focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div className="pt-2 flex items-center justify-end gap-3">
              <button
                onClick={() => handleResolve('rejected')}
                disabled={actionLoading}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-rose-600/20 hover:bg-rose-600/30 text-rose-300 border border-rose-500/30 transition-colors disabled:opacity-50"
              >
                Reject & Block Action
              </button>
              <button
                onClick={() => handleResolve('approved')}
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
