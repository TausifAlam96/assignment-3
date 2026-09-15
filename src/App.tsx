import React, { useState } from 'react';
import { useStore } from './services/store';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { StripeModal } from './components/StripeModal';
import { AuthModal } from './components/AuthModal';
import { Home } from './views/Home';
import { Charities } from './views/Charities';
import { HowItWorks } from './views/HowItWorks';
import { Pricing } from './views/Pricing';
import { Dashboard } from './views/Dashboard';
import { AdminDashboard } from './views/AdminDashboard';
import { SubscriptionPlan } from './types';
import { isSupabaseConfigured } from './services/supabase';
import { Database } from 'lucide-react';

export default function App() {
  const { currentUser } = useStore();
  const [currentView, setCurrentView] = useState<string>('home');
  const [isStripeModalOpen, setIsStripeModalOpen] = useState(false);
  const [stripeDefaultPlan, setStripeDefaultPlan] = useState<SubscriptionPlan>('monthly');
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');

  const handleOpenStripeModal = (plan: SubscriptionPlan = 'monthly') => {
    setStripeDefaultPlan(plan);
    if (!currentUser) {
      setAuthMode('register');
      setIsAuthModalOpen(true);
    } else {
      setIsStripeModalOpen(true);
    }
  };

  const handleOpenAuthModal = (mode: 'login' | 'register') => {
    setAuthMode(mode);
    setIsAuthModalOpen(true);
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#080b12] text-slate-100 font-sans antialiased selection:bg-emerald-500 selection:text-slate-950">
      {/* Navigation */}
      <Navbar
        currentView={currentView}
        onNavigate={(view) => {
          setCurrentView(view);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        onOpenStripeModal={() => handleOpenStripeModal('monthly')}
        onOpenAuthModal={handleOpenAuthModal}
      />

      {/* Main View Router */}
      <main className="flex-1">
        {currentView === 'home' && (
          <Home
            onNavigate={(view) => {
              setCurrentView(view);
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            onOpenStripeModal={() => handleOpenStripeModal('monthly')}
            onOpenAuthModal={handleOpenAuthModal}
          />
        )}

        {currentView === 'charities' && (
          <Charities onOpenAuthModal={handleOpenAuthModal} />
        )}

        {currentView === 'how-it-works' && (
          <HowItWorks
            onNavigate={(view) => {
              setCurrentView(view);
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            onOpenStripeModal={() => handleOpenStripeModal('monthly')}
          />
        )}

        {currentView === 'pricing' && (
          <Pricing
            onOpenStripeModal={(plan) => handleOpenStripeModal(plan)}
            onOpenAuthModal={handleOpenAuthModal}
          />
        )}

        {currentView === 'dashboard' && (
          <Dashboard
            onOpenStripeModal={() => handleOpenStripeModal('monthly')}
            onNavigate={(view) => {
              setCurrentView(view);
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          />
        )}

        {currentView === 'admin' && <AdminDashboard />}
      </main>

      {/* Supabase connection indicator bar */}
      <div className="bg-[#06080e] border-t border-slate-900 py-1.5 px-4 text-[11px] text-slate-500 flex items-center justify-between">
        <div className="max-w-7xl mx-auto w-full flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Database className="w-3 h-3 text-emerald-400" />
            <span>
              Storage: {isSupabaseConfigured ? 'Connected to Supabase PostgreSQL' : 'Instant Local State Engine (Offline-First Ready)'}
            </span>
          </div>
          <span className="text-slate-600 hidden sm:inline">
            Stableford 1-45 Validation • Rollover Engine Active
          </span>
        </div>
      </div>

      {/* Footer */}
      <Footer
        onNavigate={(view) => {
          setCurrentView(view);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
      />

      {/* Modals */}
      <StripeModal
        isOpen={isStripeModalOpen}
        onClose={() => setIsStripeModalOpen(false)}
        defaultPlan={stripeDefaultPlan}
      />

      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        initialMode={authMode}
      />
    </div>
  );
}
