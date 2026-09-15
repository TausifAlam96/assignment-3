import React, { useState } from 'react';
import { useStore } from '../services/store';
import {
  User,
  Lock,
  Mail,
  Heart,
  X,
  ShieldAlert,
  Sparkles,
  ArrowRight,
} from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: 'login' | 'register';
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  initialMode = 'login',
}) => {
  const { state, actions } = useStore();
  const [mode, setMode] = useState<'login' | 'register' | 'forgot'>(initialMode);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [selectedCharityId, setSelectedCharityId] = useState(
    state.charities[0]?.id || 'charity-1'
  );
  const [charityPercentage, setCharityPercentage] = useState(15);
  const [feedback, setFeedback] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFeedback(null);

    if (mode === 'login') {
      const res = actions.login(email);
      if (res.success) {
        onClose();
      } else {
        setFeedback(res.message || 'Invalid email. Use quick switch below for demo access.');
      }
    } else if (mode === 'register') {
      if (!fullName.trim() || !email.trim()) {
        setFeedback('Please provide your name and email.');
        return;
      }
      const res = actions.register({
        full_name: fullName.trim(),
        email: email.trim(),
        selected_charity_id: selectedCharityId,
        charity_percentage: charityPercentage,
        plan: 'monthly',
      });
      if (res.success) {
        onClose();
      } else {
        setFeedback(res.message);
      }
    } else if (mode === 'forgot') {
      setFeedback('Password reset link sent to ' + email + ' (simulated).');
      setTimeout(() => {
        setMode('login');
        setFeedback(null);
      }, 2000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-md rounded-2xl bg-[#0f1422] border border-slate-700/80 shadow-2xl p-6 sm:p-8 text-slate-100 overflow-hidden">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="mb-6 text-center">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 mb-3">
            {mode === 'login' ? (
              <User className="w-6 h-6" />
            ) : mode === 'register' ? (
              <Sparkles className="w-6 h-6" />
            ) : (
              <Mail className="w-6 h-6" />
            )}
          </div>
          <h3 className="text-xl font-bold text-white font-heading">
            {mode === 'login'
              ? 'Sign in to Digital Heroes'
              : mode === 'register'
              ? 'Join the Charity Golf Lottery'
              : 'Reset Password'}
          </h3>
          <p className="text-xs text-slate-400 mt-1">
            {mode === 'login'
              ? 'Enter your credentials or click a quick persona below'
              : mode === 'register'
              ? 'Select your charity and start submitting your monthly scores'
              : 'Enter your email to receive recovery instructions'}
          </p>
        </div>

        {/* Quick Persona Switches for Evaluators */}
        <div className="mb-6 p-3 rounded-xl bg-slate-900/80 border border-slate-800 text-xs">
          <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2">
            Demo 1-Click Access
          </div>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => {
                actions.quickSwitchUser('user');
                onClose();
              }}
              className="px-2.5 py-2 rounded-lg bg-emerald-950/40 border border-emerald-500/30 hover:bg-emerald-900/40 text-emerald-300 font-medium text-left flex items-center justify-between group"
            >
              <div>
                <div className="font-semibold text-white">Golfer (Tausif)</div>
                <div className="text-[10px] text-slate-400">Active subscriber</div>
              </div>
              <ArrowRight className="w-3.5 h-3.5 opacity-60 group-hover:translate-x-0.5 transition-transform" />
            </button>

            <button
              type="button"
              onClick={() => {
                actions.quickSwitchUser('admin');
                onClose();
              }}
              className="px-2.5 py-2 rounded-lg bg-purple-950/40 border border-purple-500/30 hover:bg-purple-900/40 text-purple-300 font-medium text-left flex items-center justify-between group"
            >
              <div>
                <div className="font-semibold text-white">Admin Portal</div>
                <div className="text-[10px] text-slate-400">Draw & payouts command</div>
              </div>
              <ShieldAlert className="w-3.5 h-3.5 opacity-60 text-purple-400" />
            </button>
          </div>
        </div>

        {feedback && (
          <div className="mb-4 p-3 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs">
            {feedback}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === 'register' && (
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Full Name
              </label>
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="e.g. Tausif Alam"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-sm placeholder-slate-500 focus:outline-none focus:border-emerald-500"
              />
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Email Address
            </label>
            <div className="relative">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="tausif@example.com"
                className="w-full pl-9 pr-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-sm placeholder-slate-500 focus:outline-none focus:border-emerald-500"
              />
              <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
            </div>
          </div>

          {mode !== 'forgot' && (
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-semibold text-slate-300">
                  Password
                </label>
                {mode === 'login' && (
                  <button
                    type="button"
                    onClick={() => setMode('forgot')}
                    className="text-[11px] text-slate-400 hover:text-emerald-400"
                  >
                    Forgot password?
                  </button>
                )}
              </div>
              <div className="relative">
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-9 pr-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-sm placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                />
                <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
              </div>
            </div>
          )}

          {mode === 'register' && (
            <div className="space-y-3 pt-1 border-t border-slate-800">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Select Your Beneficiary Charity
                </label>
                <select
                  value={selectedCharityId}
                  onChange={(e) => setSelectedCharityId(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:outline-none focus:border-emerald-500"
                >
                  {state.charities.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({c.category})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="text-slate-300 font-semibold flex items-center gap-1">
                    <Heart className="w-3.5 h-3.5 text-rose-400" />
                    Charity Allocation
                  </span>
                  <span className="text-rose-400 font-bold">{charityPercentage}%</span>
                </div>
                <input
                  type="range"
                  min={state.settings.charity_min_percentage}
                  max={50}
                  step={5}
                  value={charityPercentage}
                  onChange={(e) => setCharityPercentage(Number(e.target.value))}
                  className="w-full accent-rose-500 h-1.5 bg-slate-700 rounded-lg cursor-pointer"
                />
              </div>
            </div>
          )}

          <button
            type="submit"
            className="w-full py-2.5 px-4 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-sm shadow-md shadow-emerald-950/40 transition-all cursor-pointer mt-2"
          >
            {mode === 'login'
              ? 'Sign In'
              : mode === 'register'
              ? 'Create Account & Continue'
              : 'Send Reset Email'}
          </button>
        </form>

        {/* Footer switch */}
        <div className="mt-5 text-center text-xs text-slate-400">
          {mode === 'login' ? (
            <p>
              Don't have an account?{' '}
              <button
                onClick={() => setMode('register')}
                className="text-emerald-400 hover:underline font-semibold"
              >
                Sign up
              </button>
            </p>
          ) : mode === 'register' ? (
            <p>
              Already registered?{' '}
              <button
                onClick={() => setMode('login')}
                className="text-emerald-400 hover:underline font-semibold"
              >
                Sign in
              </button>
            </p>
          ) : (
            <button
              onClick={() => setMode('login')}
              className="text-emerald-400 hover:underline font-semibold"
            >
              Back to sign in
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
