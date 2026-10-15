import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Bot,
  GitMerge,
  Cpu,
  Layers,
  CheckCircle,
  Clock,
  PackageCheck,
  Zap,
  Play
} from 'lucide-react';
import { api } from '../lib/api';

export const LandingPage: React.FC = () => {
  const navigate = useNavigate();

  const handleLaunchInstantDemo = async () => {
    try {
      const res = await api.runDemo();
      if (res.workflow) {
        navigate(`/workflows/${res.workflow.id}`);
      } else {
        navigate('/dashboard');
      }
    } catch (_) {
      navigate('/dashboard');
    }
  };

  return (
    <div className="min-h-screen bg-background text-slate-100 relative overflow-hidden bg-grid-pattern">
      {/* Glow Orbs in background */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[500px] bg-indigo-600/15 blur-[140px] pointer-events-none rounded-full" />
      <div className="absolute top-1/3 right-10 w-[400px] h-[400px] bg-cyan-500/10 blur-[130px] pointer-events-none rounded-full" />

      {/* Navigation */}
      <nav className="h-20 border-b border-border/80 backdrop-blur-md sticky top-0 z-50 px-6 lg:px-12 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-cyan-400 flex items-center justify-center shadow-lg shadow-indigo-500/25">
            <Sparkles className="w-6 h-6 text-white" />
          </div>
          <span className="font-extrabold text-xl tracking-tight text-white">
            FlowPilot <span className="gradient-text">AI</span>
          </span>
        </div>

        <div className="flex items-center gap-4">
          <Link
            to="/login"
            className="text-sm font-semibold text-slate-300 hover:text-white transition-colors px-3 py-2"
          >
            Sign In
          </Link>
          <Link
            to="/dashboard"
            className="px-4 py-2 rounded-lg text-sm font-semibold bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-600/30 transition-all active:scale-95"
          >
            Launch Dashboard
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="py-24 px-6 lg:px-12 max-w-6xl mx-auto text-center relative z-10">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-indigo-500/30 bg-indigo-950/40 text-indigo-300 text-xs font-mono mb-8">
          <Zap className="w-3.5 h-3.5 text-cyan-400" />
          <span>Production-Grade Multi-Agent Workflow Automation</span>
        </div>

        <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-white leading-[1.1]">
          Turn Business Complexity into{' '}
          <span className="gradient-text">Autonomous Action</span>
        </h1>

        <p className="mt-6 text-lg sm:text-xl text-slate-300 max-w-3xl mx-auto font-normal leading-relaxed">
          From fragmented business operations to intelligent multi-agent execution. FlowPilot AI autonomously reasons, plans, coordinates tools, and resolves delayed customer orders and inventory shortages with verifiable human oversight.
        </p>

        {/* Action CTAs */}
        <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
          <button
            onClick={handleLaunchInstantDemo}
            className="px-6 py-3.5 rounded-xl text-base font-semibold bg-gradient-to-r from-indigo-600 via-indigo-500 to-cyan-500 hover:from-indigo-500 hover:to-cyan-400 text-white shadow-xl shadow-indigo-600/25 flex items-center gap-2 transition-all active:scale-95"
          >
            <Play className="w-4 h-4 fill-current" />
            <span>Explore Live Demo Scenario</span>
            <ArrowRight className="w-4 h-4" />
          </button>
          <Link
            to="/dashboard"
            className="px-6 py-3.5 rounded-xl text-base font-semibold glass-panel glass-panel-hover text-slate-200 transition-all"
          >
            Open Mission Control
          </Link>
        </div>

        {/* Live Multi-Agent Architecture Card */}
        <div className="mt-20 p-8 rounded-2xl glass-panel border border-border/80 shadow-2xl text-left">
          <div className="flex items-center justify-between pb-6 border-b border-border/60">
            <div>
              <span className="text-xs font-mono uppercase tracking-wider text-cyan-400">Collaborative Agent Architecture</span>
              <h3 className="text-xl font-bold text-white mt-1">Autonomous Specialized Agent Team</h3>
            </div>
            <div className="flex items-center gap-2 text-xs font-mono text-emerald-400 bg-emerald-950/40 px-3 py-1 rounded-full border border-emerald-500/30">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              <span>Orchestrator Active</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
            <div className="p-4 rounded-xl bg-card border border-border/80 hover:border-indigo-500/40 transition-colors">
              <div className="flex items-center gap-2 text-indigo-400 font-semibold text-sm">
                <Bot className="w-4 h-4" />
                <span>Orchestrator & Analyst</span>
              </div>
              <p className="mt-2 text-xs text-slate-300">
                Parses natural language objectives, queries order items and stock records, and calculates operational impact.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-card border border-border/80 hover:border-cyan-500/40 transition-colors">
              <div className="flex items-center gap-2 text-cyan-400 font-semibold text-sm">
                <GitMerge className="w-4 h-4" />
                <span>Planner & Operations</span>
              </div>
              <p className="mt-2 text-xs text-slate-300">
                Constructs acyclic DAG task dependencies, dispatches warehouse work orders, and prepares replenishment purchase orders.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-card border border-border/80 hover:border-amber-500/40 transition-colors">
              <div className="flex items-center gap-2 text-amber-400 font-semibold text-sm">
                <ShieldCheck className="w-4 h-4" />
                <span>Quality & Human Gate</span>
              </div>
              <p className="mt-2 text-xs text-slate-300">
                Gates financial commitments and customer communications behind cryptographically hashed approval requests.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-20 px-6 lg:px-12 max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <span className="text-xs font-mono uppercase tracking-wider text-indigo-400">Core Capabilities</span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white mt-2">Engineered for Reliability & Truthfulness</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="glass-panel p-6 rounded-2xl">
            <div className="w-10 h-10 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 mb-4">
              <Cpu className="w-5 h-5" />
            </div>
            <h4 className="text-lg font-bold text-white">Natural Language Planning</h4>
            <p className="mt-2 text-sm text-slate-400">
              Transform ambiguous natural-language business requests into verified, dependency-aware task graphs with rigorous JSON schema validation.
            </p>
          </div>

          <div className="glass-panel p-6 rounded-2xl">
            <div className="w-10 h-10 rounded-lg bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 mb-4">
              <GitMerge className="w-5 h-5" />
            </div>
            <h4 className="text-lg font-bold text-white">DAG Dependency Scheduler</h4>
            <p className="mt-2 text-sm text-slate-400">
              Prevents deadlock and circular dependencies with Kahn's topological sort. Concurrent branches execute independently and safely.
            </p>
          </div>

          <div className="glass-panel p-6 rounded-2xl">
            <div className="w-10 h-10 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 mb-4">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h4 className="text-lg font-bold text-white">Human Approval Center</h4>
            <p className="mt-2 text-sm text-slate-400">
              Consequential financial operations and external customer communications require explicit human sign-off with SHA-256 payload integrity.
            </p>
          </div>

          <div className="glass-panel p-6 rounded-2xl">
            <div className="w-10 h-10 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 mb-4">
              <Layers className="w-5 h-5" />
            </div>
            <h4 className="text-lg font-bold text-white">Typed Tool Registry</h4>
            <p className="mt-2 text-sm text-slate-400">
              Strict allowlists for application tools prevent arbitrary queries or execution. Every tool invocation is logged in the immutable audit trail.
            </p>
          </div>

          <div className="glass-panel p-6 rounded-2xl">
            <div className="w-10 h-10 rounded-lg bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 mb-4">
              <PackageCheck className="w-5 h-5" />
            </div>
            <h4 className="text-lg font-bold text-white">Real Business Records</h4>
            <p className="mt-2 text-sm text-slate-400">
              Searchable, editable database management for customer orders, warehouse inventory, suppliers, and internal operational tickets.
            </p>
          </div>

          <div className="glass-panel p-6 rounded-2xl">
            <div className="w-10 h-10 rounded-lg bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400 mb-4">
              <CheckCircle className="w-5 h-5" />
            </div>
            <h4 className="text-lg font-bold text-white">State-Verified Reporting</h4>
            <p className="mt-2 text-sm text-slate-400">
              Tasks are marked completed only after inspecting actual database mutations, delivering evidence-backed final reports.
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/80 py-12 px-6 lg:px-12 text-center text-slate-500 text-xs">
        <p>FlowPilot AI — Autonomous Business Workflow Automation System</p>
        <p className="mt-1">Built with React, Vite, Node.js, Express, PostgreSQL, and Google Gemini.</p>
      </footer>
    </div>
  );
};
