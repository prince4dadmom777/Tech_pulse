import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  GitBranch,
  PlusCircle,
  Bot,
  ListTodo,
  CheckSquare,
  Database,
  FileCode,
  BarChart3,
  History,
  Settings,
  Sparkles,
  ExternalLink
} from 'lucide-react';

interface SidebarProps {
  pendingApprovalsCount?: number;
}

export const Sidebar: React.FC<SidebarProps> = ({ pendingApprovalsCount = 0 }) => {
  const navItems = [
    { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { label: 'New Workflow', path: '/workflows/new', icon: PlusCircle, highlight: true },
    { label: 'Workflows', path: '/workflows', icon: GitBranch },
    { label: 'Agent Center', path: '/agents', icon: Bot },
    { label: 'Task Queue', path: '/tasks', icon: ListTodo },
    {
      label: 'Approvals',
      path: '/approvals',
      icon: CheckSquare,
      badge: pendingApprovalsCount > 0 ? pendingApprovalsCount : undefined
    },
    { label: 'Business Data', path: '/business-data', icon: Database },
    { label: 'Templates', path: '/templates', icon: FileCode },
    { label: 'Analytics', path: '/analytics', icon: BarChart3 },
    { label: 'Activity Logs', path: '/activity', icon: History },
    { label: 'Settings', path: '/settings', icon: Settings }
  ];

  return (
    <aside className="w-64 border-r border-border bg-[#090d16]/95 flex flex-col h-screen sticky top-0 z-30 select-none">
      {/* Brand Logo */}
      <div className="h-16 flex items-center px-6 border-b border-border/80 gap-3">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-cyan-400 flex items-center justify-center shadow-lg shadow-indigo-500/20">
          <Sparkles className="w-5 h-5 text-white" />
        </div>
        <div>
          <span className="font-extrabold text-base tracking-tight text-white flex items-center gap-1.5">
            FlowPilot <span className="text-cyan-400 font-mono text-xs px-1.5 py-0.5 rounded bg-cyan-950/60 border border-cyan-800/40">AI</span>
          </span>
          <p className="text-[10px] text-slate-400 tracking-wider uppercase font-semibold">Autonomous Ops</p>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
        <div className="px-3 pb-2 text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
          Orchestration
        </div>
        {navItems.map(item => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === '/workflows'}
              className={({ isActive }) =>
                `flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-indigo-600/15 text-indigo-300 border border-indigo-500/30'
                    : item.highlight
                    ? 'text-cyan-300 bg-cyan-950/30 hover:bg-cyan-950/50 border border-cyan-800/30'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-white/[0.03]'
                }`
              }
            >
              <div className="flex items-center gap-3">
                <Icon className="w-4 h-4 shrink-0" />
                <span>{item.label}</span>
              </div>
              {item.badge !== undefined && (
                <span className="px-2 py-0.5 text-xs font-bold rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 animate-pulse">
                  {item.badge}
                </span>
              )}
            </NavLink>
          );
        })}
      </div>

      {/* Footer / Landing Link */}
      <div className="p-3 border-t border-border/80">
        <NavLink
          to="/"
          className="flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium text-slate-400 hover:text-white hover:bg-white/[0.04] transition-colors"
        >
          <span className="flex items-center gap-2">
            <ExternalLink className="w-3.5 h-3.5" />
            Public Landing Page
          </span>
          <span className="text-[10px] text-slate-400">v1.0</span>
        </NavLink>
      </div>
    </aside>
  );
};
