import React, { useState, useEffect } from 'react';
import {
  Settings,
  ShieldCheck,
  Cpu,
  RotateCcw,
  Building2,
  Lock,
  CheckCircle2,
  AlertTriangle,
  Loader2,
  Sparkles,
  Database,
  RefreshCw,
  ExternalLink
} from 'lucide-react';
import { api } from '../lib/api';

export const SettingsPage: React.FC = () => {
  const [aiStatus, setAiStatus] = useState<any>(null);
  const [supabaseStatus, setSupabaseStatus] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [resetting, setResetting] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    loadStatus();
  }, []);

  const loadStatus = async () => {
    try {
      setLoading(true);
      const [aiRes, supaRes] = await Promise.allSettled([
        api.getAiStatus(),
        api.getSupabaseStatus()
      ]);
      if (aiRes.status === 'fulfilled') setAiStatus(aiRes.value);
      if (supaRes.status === 'fulfilled') setSupabaseStatus(supaRes.value);
    } finally {
      setLoading(false);
    }
  };

  const handleSyncSupabase = async () => {
    try {
      setSyncing(true);
      const res = await api.syncSupabase();
      setMessage('Successfully synced local workspace data to Supabase PostgreSQL database.');
      setTimeout(() => setMessage(null), 5000);
      loadStatus();
    } catch (err: any) {
      alert(`Sync failed: ${err.message}`);
    } finally {
      setSyncing(false);
    }
  };

  const handleReset = async () => {
    if (confirm('Are you sure you want to reset all orders, inventory, and workflows back to default seed?')) {
      try {
        setResetting(true);
        await api.resetDemo();
        setMessage('Workspace data successfully reset to clean initial state.');
        setTimeout(() => setMessage(null), 4000);
      } catch (err: any) {
        alert(`Reset failed: ${err.message}`);
      } finally {
        setResetting(false);
      }
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-300">
      <div>
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          <Settings className="w-6 h-6 text-indigo-400" />
          <span>System & Workspace Settings</span>
        </h1>
        <p className="mt-1 text-sm text-slate-300">
          Configure runtime guardrails, AI provider connectivity, human approval policies, and demo workspace lifecycle.
        </p>
      </div>

      {message && (
        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-sm text-emerald-300 flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5 shrink-0" />
          <span>{message}</span>
        </div>
      )}

      {/* Workspace Profile */}
      <div className="glass-panel p-6 rounded-2xl border border-border/80 space-y-4">
        <h3 className="font-bold text-base text-white flex items-center gap-2">
          <Building2 className="w-5 h-5 text-indigo-400" />
          <span>Workspace Environment</span>
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs font-mono">
          <div className="p-3 rounded-xl bg-slate-900 border border-border">
            <span className="text-slate-500 block mb-1">Organization</span>
            <span className="text-white font-bold">Acme Operations HQ</span>
          </div>
          <div className="p-3 rounded-xl bg-slate-900 border border-border">
            <span className="text-slate-500 block mb-1">Active Role</span>
            <span className="text-indigo-400 font-bold">Workspace Owner</span>
          </div>
          <div className="p-3 rounded-xl bg-slate-900 border border-border">
            <span className="text-slate-500 block mb-1">Database Isolation</span>
            <span className="text-emerald-400 font-bold">RLS Enforced (PostgreSQL)</span>
          </div>
        </div>
      </div>

      {/* AI Provider Status */}
      <div className="glass-panel p-6 rounded-2xl border border-border/80 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-base text-white flex items-center gap-2">
            <Cpu className="w-5 h-5 text-cyan-400" />
            <span>AI Orchestration Provider</span>
          </h3>
          <span
            className={`px-3 py-1 rounded-full text-xs font-mono border ${
              aiStatus?.configured
                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                : 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30'
            }`}
          >
            {aiStatus?.configured ? 'Live Gemini Key Active' : 'Deterministic Autonomous Demo Mode'}
          </span>
        </div>

        <p className="text-xs text-slate-300">
          FlowPilot AI is configured with the official Google GenAI SDK (<code>@google/genai</code>). When <code>GEMINI_API_KEY</code> is supplied in <code>.env</code>, live Gemini models generate dynamic task graphs. Otherwise, the high-fidelity deterministic engine powers autonomous execution.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-mono">
          <div className="p-3 rounded-xl bg-card border border-border">
            <span className="text-slate-500 block">Configured Model</span>
            <strong className="text-slate-200">{aiStatus?.model || 'gemini-2.5-flash'}</strong>
          </div>
          <div className="p-3 rounded-xl bg-card border border-border">
            <span className="text-slate-500 block">Client Security</span>
            <strong className="text-emerald-400">Credentials Stored Server-Side Only</strong>
          </div>
        </div>
      </div>

      {/* Supabase PostgreSQL Database Status */}
      <div className="glass-panel p-6 rounded-2xl border border-border/80 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-base text-white flex items-center gap-2">
            <Database className="w-5 h-5 text-emerald-400" />
            <span>Supabase PostgreSQL Database</span>
          </h3>
          <span
            className={`px-3 py-1 rounded-full text-xs font-mono border ${
              supabaseStatus?.connected
                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                : 'bg-rose-500/10 text-rose-400 border-rose-500/30'
            }`}
          >
            {supabaseStatus?.connected ? 'Connected to Supabase' : 'Offline / Local Store'}
          </span>
        </div>

        <p className="text-xs text-slate-300">
          {supabaseStatus?.message || 'Connecting to Supabase...'}
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-mono">
          <div className="p-3 rounded-xl bg-card border border-border">
            <span className="text-slate-500 block">Supabase Project URL</span>
            <strong className="text-slate-200 truncate block">
              {supabaseStatus?.url || 'https://kwmvezaudazdabxhprmg.supabase.co'}
            </strong>
          </div>
          <div className="p-3 rounded-xl bg-card border border-border">
            <span className="text-slate-500 block">PostgreSQL Schema Status</span>
            <strong className={supabaseStatus?.tablesFound ? 'text-emerald-400' : 'text-amber-400'}>
              {supabaseStatus?.tablesFound ? 'Active & Migrated' : 'Tables Pending Migration'}
            </strong>
          </div>
        </div>

        {!supabaseStatus?.tablesFound && (
          <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-300 space-y-2">
            <div className="flex items-center gap-2 font-semibold">
              <AlertTriangle className="w-4 h-4 shrink-0 text-amber-400" />
              <span>Next Step: Run the Migration in Supabase</span>
            </div>
            <p className="text-slate-300 leading-relaxed">
              Open your Supabase Project Dashboard &rarr; <strong>SQL Editor</strong> &rarr; paste the contents of{' '}
              <code className="text-amber-200 bg-amber-950/60 px-1 py-0.5 rounded">
                supabase/migrations/20250101000000_flowpilot_core.sql
              </code>{' '}
              and click <strong>Run</strong>. Then click the sync button below!
            </p>
          </div>
        )}

        <div className="flex items-center justify-between pt-2">
          <button
            onClick={loadStatus}
            disabled={loading}
            className="flex items-center gap-2 text-xs text-slate-300 hover:text-white transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Re-check Connection</span>
          </button>

          <button
            onClick={handleSyncSupabase}
            disabled={syncing}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 text-xs font-semibold border border-emerald-500/30 transition-all disabled:opacity-50"
          >
            {syncing ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <RefreshCw className="w-3.5 h-3.5" />
            )}
            <span>Sync Local Data to Supabase</span>
          </button>
        </div>
      </div>

      {/* Execution Limits & Guardrails */}
      <div className="glass-panel p-6 rounded-2xl border border-border/80 space-y-4">
        <h3 className="font-bold text-base text-white flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-amber-400" />
          <span>Execution Limits & Safety Policies</span>
        </h3>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono">
          <div className="p-3 rounded-xl bg-card border border-border text-center">
            <span className="text-slate-500 block mb-1">Max Tasks / Plan</span>
            <span className="text-base font-bold text-white">{aiStatus?.limits?.maxTasks || 25}</span>
          </div>
          <div className="p-3 rounded-xl bg-card border border-border text-center">
            <span className="text-slate-500 block mb-1">Max Execution Steps</span>
            <span className="text-base font-bold text-white">{aiStatus?.limits?.maxSteps || 50}</span>
          </div>
          <div className="p-3 rounded-xl bg-card border border-border text-center">
            <span className="text-slate-500 block mb-1">Max Retry Attempts</span>
            <span className="text-base font-bold text-white">{aiStatus?.limits?.maxRetries || 3}</span>
          </div>
          <div className="p-3 rounded-xl bg-card border border-border text-center">
            <span className="text-slate-500 block mb-1">Task Timeout</span>
            <span className="text-base font-bold text-white">{(aiStatus?.limits?.taskTimeoutMs || 60000) / 1000}s</span>
          </div>
        </div>
      </div>

      {/* Demo Controls & Data Reset */}
      <div className="glass-panel p-6 rounded-2xl border border-rose-500/20 space-y-3">
        <h3 className="font-bold text-base text-white flex items-center gap-2">
          <RotateCcw className="w-5 h-5 text-rose-400" />
          <span>Demo Data Reset</span>
        </h3>
        <p className="text-xs text-slate-300">
          Restore delayed customer orders, depleted inventory (SKU-PRO-01 quantity: 2), and sample suppliers to their initial state for a clean demonstration run.
        </p>

        <div className="pt-2">
          <button
            onClick={handleReset}
            disabled={resetting}
            className="px-4 py-2 rounded-xl text-xs font-semibold bg-rose-600/20 hover:bg-rose-600/30 text-rose-300 border border-rose-500/40 transition-colors flex items-center gap-2 disabled:opacity-50"
          >
            {resetting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <RotateCcw className="w-3.5 h-3.5" />}
            <span>Reset Demo Workspace Data</span>
          </button>
        </div>
      </div>
    </div>
  );
};
