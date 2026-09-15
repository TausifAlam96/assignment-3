import React, { useState } from 'react';
import { useStore } from '../services/store';
import { SubscriptionPlan } from '../types';
import {
  Check,
  Sparkles,
  Heart,
  Trophy,
  ShieldCheck,
  HelpCircle,
  ArrowRight,
  CreditCard,
} from 'lucide-react';

interface PricingProps {
  onOpenStripeModal: (plan?: SubscriptionPlan) => void;
  onOpenAuthModal: (mode: 'login' | 'register') => void;
}

export const Pricing: React.FC<PricingProps> = ({
  onOpenStripeModal,
  onOpenAuthModal,
}) => {
  const { state, currentUser, currentSubscription } = useStore();
  const [charityPercentage, setCharityPercentage] = useState<number>(15);
  const [activeFaq, setActiveFaq] = useState<number | null>(null);

  const monthlyPrice = state.settings.monthly_price;
  const yearlyPrice = state.settings.yearly_price;

  const monthlyCharity = Math.round(monthlyPrice * (charityPercentage / 100));
  const yearlyCharity = Math.round(yearlyPrice * (charityPercentage / 100));

  const faqs = [
    {
      q: 'Can I cancel my membership at any time?',
      a: 'Yes, absolutely. There are no lock-in contracts. You can manage or cancel your active subscription directly inside your Golfer Dashboard at any point.',
    },
    {
      q: 'Can I change my designated charity later?',
      a: 'Yes. You can switch between any of our vetted charity partners whenever you wish. The update takes effect immediately for your next billing cycle.',
    },
    {
      q: 'What happens if I play more than 5 golf rounds in a month?',
      a: 'Only your latest 5 rolling rounds are used for the monthly draw. Whenever you post a new round, it automatically becomes Round #1, and your 5th oldest round drops off.',
    },
    {
      q: 'How are prizes paid out?',
      a: 'Once your 5 rolling numbers match 3, 4, or 5 draw numbers, you upload a picture or screenshot of your club/app scorecard. Upon fast admin verification, winnings are transferred directly via bank transfer or Stripe payout.',
    },
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-16">
      {/* Title */}
      <div className="text-center max-w-3xl mx-auto space-y-3">
        <span className="text-xs font-bold uppercase tracking-wider text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
          Transparent Membership
        </span>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white font-heading">
          Choose Your Plan. Power Real Impact.
        </h1>
        <p className="text-sm sm:text-base text-slate-300">
          Every penny is audited. Half goes directly into the player prize pool,
          your selected charity receives guaranteed monthly support, and you get
          entered into every draw.
        </p>
      </div>

      {/* Charity percentage adjuster */}
      <div className="max-w-xl mx-auto p-5 rounded-2xl bg-[#0f1422] border border-slate-800 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Heart className="w-4 h-4 text-rose-400" />
            <span className="text-xs font-semibold text-slate-200">
              Customize Your Charity Contribution:
            </span>
          </div>
          <span className="text-xs font-bold text-rose-400 bg-rose-500/10 px-2.5 py-0.5 rounded border border-rose-500/20">
            {charityPercentage}% of fee
          </span>
        </div>

        <input
          type="range"
          min={state.settings.charity_min_percentage}
          max={50}
          step={5}
          value={charityPercentage}
          onChange={(e) => setCharityPercentage(Number(e.target.value))}
          className="w-full accent-rose-500 h-2 bg-slate-700 rounded-lg cursor-pointer"
        />

        <div className="flex justify-between text-[11px] text-slate-400">
          <span>Minimum: 10% (Platform charter)</span>
          <span>Maximum: 50%+</span>
        </div>
      </div>

      {/* Pricing Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto items-stretch">
        {/* Monthly Card */}
        <div className="rounded-3xl bg-slate-900/70 border border-slate-800 p-8 flex flex-col justify-between space-y-6 relative hover:border-slate-700 transition-all">
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-xl font-bold text-white">Monthly Flex</h3>
              <span className="text-xs text-slate-400 font-medium">Billed monthly</span>
            </div>

            <div className="flex items-baseline gap-1">
              <span className="text-4xl font-extrabold text-white font-mono">
                {state.settings.currency_symbol}
                {monthlyPrice}
              </span>
              <span className="text-sm text-slate-400">/ month</span>
            </div>

            <p className="text-xs text-slate-300">
              Directs <strong className="text-rose-400">{state.settings.currency_symbol}{monthlyCharity}</strong> each
              month to your designated charity cause.
            </p>

            <ul className="space-y-3 pt-2 text-xs text-slate-300">
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                <span>1 Entry per month using your latest 5 rolling scores</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                <span>Eligible for all 5/5, 4/5, and 3/5 cash prize splits</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                <span>Full access to Rollover Jackpot ({state.settings.currency_symbol}{state.settings.current_jackpot_rollover.toLocaleString()})</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                <span>Unlimited score updating & Golfer Dashboard</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                <span>Cancel or switch charities anytime</span>
              </li>
            </ul>
          </div>

          <button
            onClick={() => onOpenStripeModal('monthly')}
            className="w-full py-3 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-sm border border-slate-700 transition-colors flex items-center justify-center gap-2"
          >
            <CreditCard className="w-4 h-4" />
            <span>Select Monthly Plan</span>
          </button>
        </div>

        {/* Yearly Card (Featured) */}
        <div className="rounded-3xl bg-[#0f1526] border-2 border-emerald-500 p-8 flex flex-col justify-between space-y-6 relative shadow-2xl shadow-emerald-950/40">
          <div className="absolute -top-3.5 right-8 bg-gradient-to-r from-emerald-500 to-teal-400 text-slate-950 text-xs font-black uppercase tracking-wider px-3.5 py-1 rounded-full shadow-md">
            Save 17% • Best Value
          </div>

          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-xl font-bold text-white flex items-center gap-2">
                <span>Annual Golfer</span>
                <Sparkles className="w-4 h-4 text-emerald-400" />
              </h3>
              <span className="text-xs text-emerald-400 font-semibold">12 Draws</span>
            </div>

            <div className="flex items-baseline gap-1">
              <span className="text-4xl font-extrabold text-white font-mono">
                {state.settings.currency_symbol}
                {yearlyPrice}
              </span>
              <span className="text-sm text-slate-400">/ year</span>
            </div>

            <p className="text-xs text-slate-300">
              Directs <strong className="text-rose-400">{state.settings.currency_symbol}{yearlyCharity}</strong> per
              year directly to charity. 2 months free vs monthly billing.
            </p>

            <ul className="space-y-3 pt-2 text-xs text-slate-200">
              <li className="flex items-center gap-2 font-medium">
                <Check className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                <span>12 Consecutive monthly draw entries locked in</span>
              </li>
              <li className="flex items-center gap-2 font-medium">
                <Check className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                <span>Immediate eligibility for all 5/5 Rollover Jackpots</span>
              </li>
              <li className="flex items-center gap-2 font-medium">
                <Check className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                <span>Priority scorecard verification & express payouts</span>
              </li>
              <li className="flex items-center gap-2 font-medium">
                <Check className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                <span>Official Digital Heroes Charter Member digital badge</span>
              </li>
              <li className="flex items-center gap-2 font-medium">
                <Check className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                <span>Annual tax-deductible charitable impact certificate</span>
              </li>
            </ul>
          </div>

          <button
            onClick={() => onOpenStripeModal('yearly')}
            className="w-full py-3.5 px-4 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-sm shadow-xl shadow-emerald-950/60 transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <Sparkles className="w-4 h-4" />
            <span>Join with Annual Plan ({state.settings.currency_symbol}{yearlyPrice})</span>
          </button>
        </div>
      </div>

      {/* Transparency Table */}
      <div className="max-w-3xl mx-auto rounded-2xl bg-slate-900/60 border border-slate-800 p-6 space-y-4">
        <h4 className="text-sm font-bold text-white flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          Where Every Pound Goes (Audited Transparency)
        </h4>

        <div className="space-y-2 text-xs">
          <div className="flex items-center justify-between p-2 rounded-lg bg-slate-950/40">
            <span className="text-slate-300">Prize Pool (Player Payouts)</span>
            <span className="font-mono font-bold text-amber-400">50%</span>
          </div>
          <div className="flex items-center justify-between p-2 rounded-lg bg-slate-950/40">
            <span className="text-slate-300">Direct Charity Support (Your Choice)</span>
            <span className="font-mono font-bold text-rose-400">{charityPercentage}%</span>
          </div>
          <div className="flex items-center justify-between p-2 rounded-lg bg-slate-950/40">
            <span className="text-slate-300">
              Payment Processing, Legal Compliance, Webhooks & Ops
            </span>
            <span className="font-mono font-bold text-slate-400">
              {100 - 50 - charityPercentage}%
            </span>
          </div>
        </div>
      </div>

      {/* FAQs */}
      <div className="max-w-3xl mx-auto space-y-4">
        <h3 className="text-xl font-bold text-white text-center">
          Frequently Asked Questions
        </h3>
        <div className="space-y-3">
          {faqs.map((faq, i) => (
            <div
              key={i}
              className="rounded-xl bg-slate-900/70 border border-slate-800 overflow-hidden"
            >
              <button
                onClick={() => setActiveFaq(activeFaq === i ? null : i)}
                className="w-full text-left p-4 text-xs sm:text-sm font-semibold text-white flex items-center justify-between"
              >
                <span>{faq.q}</span>
                <span className="text-slate-400 text-lg">
                  {activeFaq === i ? '−' : '+'}
                </span>
              </button>
              {activeFaq === i && (
                <div className="p-4 pt-0 text-xs text-slate-300 leading-relaxed border-t border-slate-800/60 mt-1">
                  {faq.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
