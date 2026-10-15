import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Bell,
  Play,
  RotateCcw,
  Sparkles,
  Building2,
  Check,
  User,
  LogOut,
  AlertCircle
} from 'lucide-react';
import { api } from '../../lib/api';

interface TopNavigationProps {
  onRefresh?: () => void;
}

export const TopNavigation: React.FC<TopNavigationProps> = ({ onRefresh }) => {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState<any[]>([]);
  const [showNotifPopover, setShowNotifPopover] = useState(false);
  const [aiStatus, setAiStatus] = useState<any>(null);
  const [isDemoRunning, setIsDemoRunning] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [notifRes, aiRes] = await Promise.all([
        api.getNotifications().catch(() => ({ notifications: [] })),
        api.getAiStatus().catch(() => ({ configured: false, mode: 'demo' }))
      ]);
      setNotifications(notifRes.notifications || []);
      setAiStatus(aiRes);
    } catch (_) {}
  };

  const handleLaunchDemo = async () => {
    try {
      setIsDemoRunning(true);
      const res = await api.runDemo();
      if (res.workflow) {
        navigate(`/workflows/${res.workflow.id}`);
      }
      if (onRefresh) onRefresh();
    } catch (err: any) {
      alert(`Error launching demo scenario: ${err.message}`);
    } finally {
      setIsDemoRunning(false);
    }
  };

  const handleResetData = async () => {
    if (confirm('Reset workspace data back to clean seed records?')) {
      await api.resetDemo();
      loadData();
      if (onRefresh) onRefresh();
      alert('Workspace reset successfully.');
    }
  };

  const unreadCount = notifications.filter(n => !n.read_at).length;

  return (
    <header className="h-16 border-b border-border bg-[#090d16]/80 backdrop-blur-md sticky top-0 z-20 flex items-center justify-between px-6">
      {/* Left: Workspace info */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-card border border-border text-xs font-medium text-slate-300">
          <Building2 className="w-4 h-4 text-indigo-400" />
          <span>Acme Operations HQ</span>
          <span className="text-[10px] px-1.5 py-0.2 rounded bg-indigo-500/20 text-indigo-300">Owner</span>
        </div>

        {/* AI Engine Status Badge */}
        <div className="hidden md:flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono border bg-slate-900 border-border">
          <span className={`w-2 h-2 rounded-full ${aiStatus?.configured ? 'bg-emerald-400 animate-pulse' : 'bg-cyan-400'}`} />
          <span className="text-slate-300">
            {aiStatus?.configured ? `Gemini Online (${aiStatus.model})` : 'Deterministic Agent Simulation'}
          </span>
        </div>
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-3">
        {/* Instant Demo Launch Button */}
        <button
          onClick={handleLaunchDemo}
          disabled={isDemoRunning}
          className="flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-gradient-to-r from-indigo-600 to-cyan-600 hover:from-indigo-500 hover:to-cyan-500 text-white shadow-md shadow-indigo-600/20 active:scale-95 transition-all disabled:opacity-50"
          title="Run the complete end-to-end delayed order resolution workflow"
        >
          {isDemoRunning ? (
            <Sparkles className="w-3.5 h-3.5 animate-spin" />
          ) : (
            <Play className="w-3.5 h-3.5 fill-current" />
          )}
          <span>Launch Demo Workflow</span>
        </button>

        {/* Reset DB Button */}
        <button
          onClick={handleResetData}
          className="p-2 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-card border border-transparent hover:border-border transition-colors"
          title="Reset Seed Data"
        >
          <RotateCcw className="w-4 h-4" />
        </button>

        {/* Notifications Popover */}
        <div className="relative">
          <button
            onClick={() => setShowNotifPopover(!showNotifPopover)}
            className="p-2 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-card border border-transparent hover:border-border relative transition-colors"
          >
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-rose-500" />
            )}
          </button>

          {showNotifPopover && (
            <div className="absolute right-0 mt-2 w-80 rounded-xl glass-panel p-4 shadow-2xl z-50 animate-in fade-in zoom-in-95">
              <div className="flex items-center justify-between pb-3 border-b border-border/80">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-300">
                  Notifications ({unreadCount} new)
                </span>
                <span className="text-[10px] text-slate-400">Recent</span>
              </div>
              <div className="mt-3 max-h-64 overflow-y-auto space-y-2">
                {notifications.length === 0 ? (
                  <p className="text-xs text-slate-400 py-3 text-center">No notifications yet.</p>
                ) : (
                  notifications.map(n => (
                    <div
                      key={n.id}
                      onClick={async () => {
                        await api.markNotificationRead(n.id);
                        loadData();
                      }}
                      className={`p-2.5 rounded-lg border text-xs cursor-pointer transition-colors ${
                        n.read_at
                          ? 'bg-transparent border-transparent text-slate-400'
                          : 'bg-indigo-950/30 border-indigo-500/30 text-slate-200'
                      }`}
                    >
                      <p className="font-semibold text-slate-100">{n.title}</p>
                      <p className="mt-0.5 text-slate-300 line-clamp-2">{n.message}</p>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* User Profile avatar */}
        <div className="flex items-center gap-2 pl-2 border-l border-border/80">
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center font-bold text-xs text-white shadow-inner">
            OP
          </div>
        </div>
      </div>
    </header>
  );
};
