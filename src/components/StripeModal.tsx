import React, { useState } from 'react';
import { useStore } from '../services/store';
import { SubscriptionPlan } from '../types';
import {
  CreditCard,
  Lock,
  CheckCircle2,
  Heart,
  ShieldCheck,
  X,
  Sparkles,
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface StripeModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultPlan?: SubscriptionPlan;
}

export const StripeModal: React.FC<StripeModalProps> = ({
  isOpen,
  onClose,
  defaultPlan = 'monthly',
}) => {
  const { currentUser, currentCharity, state, actions } = useStore();
  const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlan>(defaultPlan);
  const [charityPercentage, setCharityPercentage] = useState<number>(
    currentUser?.charity_percentage || 15
  );
  const [cardNumber, setCardNumber] = useState('4242 •••• •••• 4242');
  const [cardExpiry, setCardExpiry] = useState('12/28');
  const [cardCvc, setCardCvc] = useState('888');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  if (!isOpen) return null;

  const basePrice =
    selectedPlan === 'yearly'
      ? state.settings.yearly_price
      : state.settings.monthly_price;

  const charityCut = Math.round(basePrice * (charityPercentage / 100));
  const prizePoolCut = Math.round(
    basePrice * (state.settings.prize_pool_percentage / 100)
  );
  const platformCut = basePrice - charityCut - prizePoolCut;

  const handleSubscribe = () => {
    if (!currentUser) {
      alert('Please log in or register before subscribing.');
      return;
    }

    setIsProcessing(true);

    // Simulate Stripe Checkout API & Webhook confirmation
    setTimeout(() => {
      actions.activateSubscription(currentUser.id, selectedPlan, charityPercentage);
      setIsProcessing(false);
      setIsSuccess(true);

      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
      });

      setTimeout(() => {
        setIsSuccess(false);
        onClose();
      }, 1800);
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg rounded-2xl bg-[#0f1422] border border-slate-700/80 shadow-2xl p-6 sm:p-8 text-slate-100 overflow-hidden">
        {/* Glow effect */}
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-48 h-48 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        <button
          onClick={onClose}
          disabled={isProcessing}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {isSuccess ? (
          <div className="py-10 text-center space-y-4">
            <div className="w-16 h-16 mx-auto rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center">
              <CheckCircle2 className="w-9 h-9" />
            </div>
            <h3 className="text-2xl font-bold text-white">Subscription Active!</h3>
            <p className="text-sm text-slate-300 max-w-sm mx-auto">
              Welcome to the Digital Heroes platform. Your Stripe payment was verified via webhook, and you are entered into the upcoming monthly draw.
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-emerald-500 flex items-center justify-center text-white font-bold shadow-md">
                <CreditCard className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  Stripe Checkout
                  <span className="text-[10px] uppercase font-semibold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                    PCI Compliant
                  </span>
                </h3>
                <p className="text-xs text-slate-400">
                  Secure automated billing & monthly draw entry
                </p>
              </div>
            </div>

            {/* Plan Selector */}
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setSelectedPlan('monthly')}
                className={`p-3.5 rounded-xl border text-left transition-all ${
                  selectedPlan === 'monthly'
                    ? 'border-emerald-500 bg-emerald-950/20 ring-1 ring-emerald-500'
                    : 'border-slate-700 bg-slate-800/40 hover:border-slate-600'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-300">Monthly</span>
                  <span className="text-[10px] text-slate-400">Flexible</span>
                </div>
                <div className="text-lg font-bold text-white mt-1">
                  {state.settings.currency_symbol}
                  {state.settings.monthly_price.toLocaleString()}
                  <span className="text-xs font-normal text-slate-400">/mo</span>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setSelectedPlan('yearly')}
                className={`p-3.5 rounded-xl border text-left transition-all relative overflow-hidden ${
                  selectedPlan === 'yearly'
                    ? 'border-emerald-500 bg-emerald-950/20 ring-1 ring-emerald-500'
                    : 'border-slate-700 bg-slate-800/40 hover:border-slate-600'
                }`}
              >
                <span className="absolute top-0 right-0 bg-emerald-500 text-slate-950 text-[9px] font-bold px-2 py-0.5 rounded-bl">
                  SAVE 17%
                </span>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-300">Yearly</span>
                </div>
                <div className="text-lg font-bold text-white mt-1">
                  {state.settings.currency_symbol}
                  {state.settings.yearly_price.toLocaleString()}
                  <span className="text-xs font-normal text-slate-400">/yr</span>
                </div>
              </button>
            </div>

            {/* Charity Allocation Slider */}
            <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700/60 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Heart className="w-4 h-4 text-rose-400" />
                  <span className="text-xs font-semibold text-slate-200">
                    Charity Contribution
                  </span>
                </div>
                <span className="text-xs font-bold text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded border border-rose-500/20">
                  {charityPercentage}% ({state.settings.currency_symbol}
                  {charityCut.toLocaleString()})
                </span>
              </div>

              <input
                type="range"
                min={state.settings.charity_min_percentage}
                max={50}
                step={5}
                value={charityPercentage}
                onChange={(e) => setCharityPercentage(Number(e.target.value))}
                className="w-full accent-rose-500 cursor-pointer h-1.5 bg-slate-700 rounded-lg"
              />

              <div className="flex justify-between text-[11px] text-slate-400">
                <span>Min: {state.settings.charity_min_percentage}% (PRD rule)</span>
                <span>Directing to: <strong className="text-slate-200">{currentCharity?.name || 'Chosen Charity'}</strong></span>
              </div>
            </div>

            {/* Fee Distribution Breakdown */}
            <div className="text-xs bg-slate-900/60 rounded-xl p-3 border border-slate-800 space-y-1.5 text-slate-300">
              <div className="flex justify-between text-[11px]">
                <span className="text-slate-400">Total Charged:</span>
                <span className="font-semibold text-white">
                  {state.settings.currency_symbol}
                  {basePrice.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between text-[11px] text-rose-400">
                <span>Charity Donation ({charityPercentage}%):</span>
                <span>+{state.settings.currency_symbol}{charityCut.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-[11px] text-amber-400">
                <span>Monthly Prize Pool ({state.settings.prize_pool_percentage}%):</span>
                <span>+{state.settings.currency_symbol}{prizePoolCut.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-[11px] text-slate-400 pt-1 border-t border-slate-800">
                <span>Platform Operations:</span>
                <span>{state.settings.currency_symbol}{platformCut.toLocaleString()}</span>
              </div>
            </div>

            {/* Simulated Stripe Card Form */}
            <div className="space-y-3">
              <label className="block text-xs font-semibold text-slate-300">
                Payment Details
              </label>
              <div className="rounded-xl border border-slate-700 bg-slate-900/90 p-3 space-y-2.5">
                <div className="flex items-center justify-between text-xs text-slate-400">
                  <div className="flex items-center gap-2">
                    <Lock className="w-3.5 h-3.5 text-slate-400" />
                    <span>Card Number</span>
                  </div>
                  <span className="text-[10px] text-slate-500 font-mono">TEST MODE</span>
                </div>
                <input
                  type="text"
                  value={cardNumber}
                  onChange={(e) => setCardNumber(e.target.value)}
                  className="w-full bg-transparent text-sm text-white font-mono tracking-wider focus:outline-none"
                  placeholder="Card Number"
                />
                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-800 text-xs">
                  <input
                    type="text"
                    value={cardExpiry}
                    onChange={(e) => setCardExpiry(e.target.value)}
                    className="bg-transparent text-slate-200 font-mono focus:outline-none"
                    placeholder="MM/YY"
                  />
                  <input
                    type="text"
                    value={cardCvc}
                    onChange={(e) => setCardCvc(e.target.value)}
                    className="bg-transparent text-right text-slate-200 font-mono focus:outline-none"
                    placeholder="CVC"
                  />
                </div>
              </div>
            </div>

            {/* CTA */}
            <div className="space-y-2 pt-1">
              <button
                type="button"
                onClick={handleSubscribe}
                disabled={isProcessing}
                className="w-full py-3 px-4 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-sm shadow-lg shadow-emerald-950/50 flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50"
              >
                {isProcessing ? (
                  <>
                    <div className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                    <span>Processing with Stripe Webhook...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>
                      Pay {state.settings.currency_symbol}
                      {basePrice.toLocaleString()} & Activate Entry
                    </span>
                  </>
                )}
              </button>
              <div className="flex items-center justify-center gap-2 text-[11px] text-slate-400">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>256-bit SSL encrypted. Cancel anytime in dashboard.</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
