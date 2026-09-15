import React, { useState } from 'react';
import { useStore } from '../services/store';
import {
  Trophy,
  Heart,
  User,
  ShieldAlert,
  LogOut,
  ChevronDown,
  Sparkles,
  CreditCard,
  Target,
  Menu,
  X,
  RotateCcw,
} from 'lucide-react';

interface NavbarProps {
  currentView: string;
  onNavigate: (view: string) => void;
  onOpenStripeModal: () => void;
  onOpenAuthModal: (mode: 'login' | 'register') => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentView,
  onNavigate,
  onOpenStripeModal,
  onOpenAuthModal,
}) => {
  const { currentUser, currentSubscription, state, actions } = useStore();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  const isSubscriber = currentSubscription?.status === 'active';
  const isAdmin = currentUser?.role === 'admin';

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-800/80 bg-[#0a0d14]/90 backdrop-blur-md">
      {/* Top Notification / Rollover Jackpot Ticker */}
      <div className="bg-gradient-to-r from-emerald-950/80 via-slate-900 to-amber-950/80 px-4 py-1.5 text-xs text-slate-300 border-b border-slate-800/60 flex items-center justify-between">
        <div className="max-w-7xl mx-auto w-full flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold bg-amber-500/20 text-amber-400 border border-amber-500/30">
              NEXT MONTHLY DRAW
            </span>
            <span className="hidden sm:inline text-slate-400">
              5-Match Jackpot Rollover:
            </span>
            <span className="font-bold text-amber-400">
              {state.settings.currency_symbol}
              {state.settings.current_jackpot_rollover.toLocaleString()}
            </span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                actions.resetDefaults();
                alert('Database reset to fresh demo state!');
              }}
              title="Reset test data"
              className="text-slate-400 hover:text-slate-200 text-[11px] flex items-center gap-1 transition-colors"
            >
              <RotateCcw className="w-3 h-3" />
              <span className="hidden md:inline">Reset Demo</span>
            </button>
            <div className="h-3 w-[1px] bg-slate-700 hidden sm:block"></div>
            {/* Quick Persona Switcher for Evaluation */}
            <div className="flex items-center gap-1.5 text-[11px]">
              <span className="text-slate-400 hidden lg:inline">Persona:</span>
              <button
                onClick={() => actions.quickSwitchUser('user')}
                className={`px-2 py-0.5 rounded text-[11px] font-medium transition-colors ${
                  currentUser?.role === 'user'
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Golfer (Tausif)
              </button>
              <button
                onClick={() => actions.quickSwitchUser('admin')}
                className={`px-2 py-0.5 rounded text-[11px] font-medium transition-colors ${
                  currentUser?.role === 'admin'
                    ? 'bg-purple-500/20 text-purple-400 border border-purple-500/40'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Admin
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Navbar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand */}
        <div
          className="flex items-center gap-3 cursor-pointer group"
          onClick={() => onNavigate('home')}
        >
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-700 flex items-center justify-center text-white shadow-lg shadow-emerald-950/50 group-hover:scale-105 transition-transform">
            <Target className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-lg font-bold tracking-tight text-white font-heading">
                DIGITAL HEROES
              </span>
              <span className="text-[10px] tracking-wider uppercase px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-semibold">
                GOLF & CHARITY
              </span>
            </div>
            <p className="text-[11px] text-slate-400 -mt-0.5 hidden sm:block">
              Play. Win. Give Back.
            </p>
          </div>
        </div>

        {/* Desktop Nav Links */}
        <nav className="hidden md:flex items-center gap-1 lg:gap-2">
          <button
            onClick={() => onNavigate('home')}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              currentView === 'home'
                ? 'text-white bg-slate-800/80'
                : 'text-slate-300 hover:text-white hover:bg-slate-800/40'
            }`}
          >
            Home
          </button>
          <button
            onClick={() => onNavigate('charities')}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              currentView === 'charities'
                ? 'text-white bg-slate-800/80'
                : 'text-slate-300 hover:text-white hover:bg-slate-800/40'
            }`}
          >
            Charities
          </button>
          <button
            onClick={() => onNavigate('how-it-works')}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              currentView === 'how-it-works'
                ? 'text-white bg-slate-800/80'
                : 'text-slate-300 hover:text-white hover:bg-slate-800/40'
            }`}
          >
            How It Works
          </button>
          <button
            onClick={() => onNavigate('pricing')}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              currentView === 'pricing'
                ? 'text-white bg-slate-800/80'
                : 'text-slate-300 hover:text-white hover:bg-slate-800/40'
            }`}
          >
            Pricing
          </button>

          {currentUser && (
            <button
              onClick={() => onNavigate('dashboard')}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5 ${
                currentView === 'dashboard'
                  ? 'text-emerald-400 bg-emerald-950/40 border border-emerald-500/30'
                  : 'text-slate-300 hover:text-emerald-400 hover:bg-slate-800/40'
              }`}
            >
              <Trophy className="w-4 h-4 text-emerald-400" />
              My Dashboard
            </button>
          )}

          {isAdmin && (
            <button
              onClick={() => onNavigate('admin')}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5 ${
                currentView === 'admin'
                  ? 'text-purple-400 bg-purple-950/40 border border-purple-500/30'
                  : 'text-purple-300 hover:text-purple-200 hover:bg-slate-800/40'
              }`}
            >
              <ShieldAlert className="w-4 h-4 text-purple-400" />
              Admin Command
            </button>
          )}
        </nav>

        {/* Right CTA / User controls */}
        <div className="flex items-center gap-3">
          {!isSubscriber && currentUser && (
            <button
              onClick={onOpenStripeModal}
              className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-md shadow-emerald-900/30 transition-all cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5" />
              Activate Subscription
            </button>
          )}

          {currentUser ? (
            <div className="relative">
              <button
                onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-slate-700/80 bg-slate-800/50 hover:bg-slate-800 transition-colors text-left"
              >
                <div className="w-7 h-7 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center font-bold text-xs">
                  {currentUser.full_name.charAt(0)}
                </div>
                <div className="hidden lg:block">
                  <div className="text-xs font-medium text-white flex items-center gap-1">
                    <span>{currentUser.full_name}</span>
                    {isAdmin && (
                      <span className="text-[10px] bg-purple-500/30 text-purple-300 px-1 py-0.2 rounded font-mono font-semibold">
                        ADMIN
                      </span>
                    )}
                  </div>
                  <div className="text-[10px] text-slate-400 flex items-center gap-1">
                    <span
                      className={`w-1.5 h-1.5 rounded-full ${
                        isSubscriber ? 'bg-emerald-400' : 'bg-amber-400'
                      }`}
                    ></span>
                    {isSubscriber ? 'Active Plan' : 'Free Member'}
                  </div>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>

              {userDropdownOpen && (
                <div
                  className="absolute right-0 mt-2 w-56 rounded-xl bg-[#111624] border border-slate-700 shadow-2xl py-2 z-50 text-xs"
                  onClick={() => setUserDropdownOpen(false)}
                >
                  <div className="px-3 py-2 border-b border-slate-800">
                    <p className="font-semibold text-white">{currentUser.full_name}</p>
                    <p className="text-slate-400 text-[11px] truncate">{currentUser.email}</p>
                  </div>
                  <div className="py-1">
                    <button
                      onClick={() => onNavigate('dashboard')}
                      className="w-full text-left px-3 py-2 text-slate-200 hover:bg-slate-800/80 flex items-center gap-2"
                    >
                      <Trophy className="w-3.5 h-3.5 text-emerald-400" />
                      Golfer Dashboard
                    </button>
                    {isAdmin && (
                      <button
                        onClick={() => onNavigate('admin')}
                        className="w-full text-left px-3 py-2 text-purple-300 hover:bg-slate-800/80 flex items-center gap-2"
                      >
                        <ShieldAlert className="w-3.5 h-3.5 text-purple-400" />
                        Admin Command Center
                      </button>
                    )}
                    <button
                      onClick={() => onNavigate('charities')}
                      className="w-full text-left px-3 py-2 text-slate-200 hover:bg-slate-800/80 flex items-center gap-2"
                    >
                      <Heart className="w-3.5 h-3.5 text-rose-400" />
                      Explore Charities
                    </button>
                    <button
                      onClick={onOpenStripeModal}
                      className="w-full text-left px-3 py-2 text-slate-200 hover:bg-slate-800/80 flex items-center gap-2"
                    >
                      <CreditCard className="w-3.5 h-3.5 text-sky-400" />
                      Manage Subscription
                    </button>
                  </div>
                  <div className="border-t border-slate-800 pt-1">
                    <button
                      onClick={() => actions.logout()}
                      className="w-full text-left px-3 py-2 text-rose-400 hover:bg-rose-950/30 flex items-center gap-2"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      Sign Out
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <button
                onClick={() => onOpenAuthModal('login')}
                className="px-3 py-1.5 rounded-lg text-xs font-medium text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
              >
                Sign In
              </button>
              <button
                onClick={() => onOpenAuthModal('register')}
                className="px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-md shadow-emerald-900/30 transition-all"
              >
                Join Now
              </button>
            </div>
          )}

          {/* Mobile hamburger */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-800 bg-[#0d121f] px-4 pt-3 pb-5 space-y-2">
          <button
            onClick={() => {
              onNavigate('home');
              setMobileMenuOpen(false);
            }}
            className="block w-full text-left px-3 py-2 rounded-lg text-sm text-slate-200 hover:bg-slate-800"
          >
            Home
          </button>
          <button
            onClick={() => {
              onNavigate('charities');
              setMobileMenuOpen(false);
            }}
            className="block w-full text-left px-3 py-2 rounded-lg text-sm text-slate-200 hover:bg-slate-800"
          >
            Charities
          </button>
          <button
            onClick={() => {
              onNavigate('how-it-works');
              setMobileMenuOpen(false);
            }}
            className="block w-full text-left px-3 py-2 rounded-lg text-sm text-slate-200 hover:bg-slate-800"
          >
            How It Works
          </button>
          <button
            onClick={() => {
              onNavigate('pricing');
              setMobileMenuOpen(false);
            }}
            className="block w-full text-left px-3 py-2 rounded-lg text-sm text-slate-200 hover:bg-slate-800"
          >
            Pricing
          </button>
          {currentUser && (
            <button
              onClick={() => {
                onNavigate('dashboard');
                setMobileMenuOpen(false);
              }}
              className="block w-full text-left px-3 py-2 rounded-lg text-sm font-semibold text-emerald-400 bg-emerald-950/40"
            >
              My Dashboard
            </button>
          )}
          {isAdmin && (
            <button
              onClick={() => {
                onNavigate('admin');
                setMobileMenuOpen(false);
              }}
              className="block w-full text-left px-3 py-2 rounded-lg text-sm font-semibold text-purple-400 bg-purple-950/40"
            >
              Admin Command Center
            </button>
          )}
        </div>
      )}
    </header>
  );
};
