import React from 'react';
import {
  Clock,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  PlayCircle,
  PauseCircle,
  ShieldAlert,
  Loader2
} from 'lucide-react';

interface StatusBadgeProps {
  status: string;
  type?: 'workflow' | 'task' | 'approval' | 'priority' | 'risk';
  size?: 'sm' | 'md';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, type = 'workflow', size = 'sm' }) => {
  const s = status.toLowerCase();

  const getStyleAndIcon = () => {
    switch (s) {
      case 'completed':
      case 'approved':
      case 'active':
        return {
          bg: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
          icon: <CheckCircle2 className="w-3.5 h-3.5" />
        };
      case 'running':
      case 'in_progress':
      case 'processing':
        return {
          bg: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20',
          icon: <Loader2 className="w-3.5 h-3.5 animate-spin" />
        };
      case 'awaiting_approval':
      case 'pending':
        return {
          bg: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
          icon: <Clock className="w-3.5 h-3.5" />
        };
      case 'ready':
      case 'planned':
        return {
          bg: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20',
          icon: <PlayCircle className="w-3.5 h-3.5" />
        };
      case 'paused':
        return {
          bg: 'bg-slate-500/10 text-slate-400 border-slate-500/20',
          icon: <PauseCircle className="w-3.5 h-3.5" />
        };
      case 'failed':
      case 'rejected':
      case 'cancelled':
        return {
          bg: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
          icon: <XCircle className="w-3.5 h-3.5" />
        };
      case 'blocked':
      case 'needs_attention':
        return {
          bg: 'bg-orange-500/10 text-orange-400 border-orange-500/20',
          icon: <AlertTriangle className="w-3.5 h-3.5" />
        };
      // Priorities
      case 'critical':
        return {
          bg: 'bg-rose-500/20 text-rose-300 border-rose-500/40',
          icon: <ShieldAlert className="w-3.5 h-3.5" />
        };
      case 'high':
        return {
          bg: 'bg-amber-500/15 text-amber-300 border-amber-500/30',
          icon: <AlertTriangle className="w-3.5 h-3.5" />
        };
      case 'medium':
        return {
          bg: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
          icon: null
        };
      case 'low':
        return {
          bg: 'bg-slate-500/10 text-slate-400 border-slate-500/20',
          icon: null
        };
      default:
        return {
          bg: 'bg-slate-500/10 text-slate-300 border-slate-500/20',
          icon: null
        };
    }
  };

  const { bg, icon } = getStyleAndIcon();
  const sizeClasses = size === 'sm' ? 'px-2.5 py-0.5 text-xs' : 'px-3 py-1 text-sm font-medium';

  const label = s
    .split('_')
    .map(w => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');

  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border font-mono capitalize tracking-wide ${bg} ${sizeClasses}`}>
      {icon}
      <span>{label}</span>
    </span>
  );
};
