import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { Sparkles, ArrowRight, ShieldCheck, Mail, Lock, User, CheckCircle2 } from 'lucide-react';

export const AuthPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const isSignUp = location.pathname.includes('signup');

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // Save demo/authenticated session token
    localStorage.setItem('flowpilot_token', 'demo-token');
    localStorage.setItem('flowpilot_workspace_id', 'w0000000-0000-0000-0000-000000000001');

    setTimeout(() => {
      setLoading(false);
      navigate('/dashboard');
    }, 400);
  };

  const handleInstantDemoLogin = () => {
    localStorage.setItem('flowpilot_token', 'demo-token');
    localStorage.setItem('flowpilot_workspace_id', 'w0000000-0000-0000-0000-000000000001');
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen bg-background flex flex-col justify-center items-center px-4 py-12 relative bg-grid-pattern">
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-indigo-600/15 blur-[120px] rounded-full pointer-events-none" />

      {/* Brand Header */}
      <div className="text-center mb-8 relative z-10">
        <Link to="/" className="inline-flex items-center gap-2.5 mb-3 group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-cyan-400 flex items-center justify-center shadow-lg shadow-indigo-500/25">
            <Sparkles className="w-6 h-6 text-white" />
          </div>
          <span className="font-extrabold text-2xl text-white tracking-tight">
            FlowPilot <span className="gradient-text">AI</span>
          </span>
        </Link>
        <p className="text-sm text-slate-400">
          {isSignUp ? 'Create your operations workspace' : 'Welcome back to Mission Control'}
        </p>
      </div>

      {/* Auth Card */}
      <div className="w-full max-w-md glass-panel p-8 rounded-2xl border border-border/80 shadow-2xl relative z-10">
        {/* Toggle Mode */}
        <div className="flex rounded-lg bg-card p-1 border border-border/80 mb-6">
          <Link
            to="/login"
            className={`flex-1 py-1.5 text-center text-xs font-semibold rounded-md transition-colors ${
              !isSignUp ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-white'
            }`}
          >
            Sign In
          </Link>
          <Link
            to="/signup"
            className={`flex-1 py-1.5 text-center text-xs font-semibold rounded-md transition-colors ${
              isSignUp ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-white'
            }`}
          >
            Create Account
          </Link>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-lg bg-rose-500/10 border border-rose-500/20 text-xs text-rose-300">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {isSignUp && (
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">Full Name</label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={e => setFullName(e.target.value)}
                  placeholder="Alex Mercer"
                  className="w-full bg-slate-900/90 border border-border rounded-lg pl-9 pr-3.5 py-2 text-sm text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">Work Email</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
              <input
                type="email"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="ops@company.com"
                className="w-full bg-slate-900/90 border border-border rounded-lg pl-9 pr-3.5 py-2 text-sm text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
              <input
                type="password"
                required
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full bg-slate-900/90 border border-border rounded-lg pl-9 pr-3.5 py-2 text-sm text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 py-2.5 rounded-lg text-sm font-semibold bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/30 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? 'Authenticating...' : isSignUp ? 'Create Workspace Account' : 'Sign In'}
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="relative my-6 text-center">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-border/80"></div>
          </div>
          <span className="relative bg-card px-3 text-[11px] uppercase tracking-wider text-slate-400 font-mono">
            Hackathon / Demo Quick Entry
          </span>
        </div>

        {/* Demo Fast Login Button */}
        <button
          onClick={handleInstantDemoLogin}
          type="button"
          className="w-full py-2.5 rounded-lg text-xs font-semibold bg-cyan-950/40 hover:bg-cyan-950/70 border border-cyan-800/50 text-cyan-300 transition-colors flex items-center justify-center gap-2"
        >
          <CheckCircle2 className="w-4 h-4 text-cyan-400" />
          <span>Enter as Demo Lead (No Key Needed)</span>
        </button>
      </div>
    </div>
  );
};
