import React, { useState } from 'react';
import { useStore } from '../services/store';
import {
  Trophy,
  Heart,
  Target,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  TrendingUp,
  Award,
  Users,
  Calendar,
  CheckCircle,
  HelpCircle,
  Clock,
} from 'lucide-react';

interface HomeProps {
  onNavigate: (view: string) => void;
  onOpenStripeModal: () => void;
  onOpenAuthModal: (mode: 'login' | 'register') => void;
}

export const Home: React.FC<HomeProps> = ({
  onNavigate,
  onOpenStripeModal,
  onOpenAuthModal,
}) => {
  const { state, currentUser, currentSubscription } = useStore();
  const [calculatorScoreCount, setCalculatorScoreCount] = useState<number>(4);

  // Latest draw
  const latestDraw = state.draws[0];
  const activeSubscribersCount = state.subscriptions.filter(
    (s) => s.status === 'active'
  ).length;

  const totalCharityRaised = state.charities.reduce(
    (acc, c) => acc + c.total_raised,
    0
  );

  const basePrizePoolEstimate = Math.round(
    activeSubscribersCount * state.settings.monthly_price * (state.settings.prize_pool_percentage / 100)
  ) || 12500;

  return (
    <div className="space-y-20 pb-16">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-20 px-4 sm:px-6 lg:px-8 border-b border-slate-800/80 bg-gradient-to-b from-[#0e1424] via-[#090d16] to-[#080b12]">
        {/* Background glow meshes */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[650px] h-[350px] bg-emerald-500/10 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute top-1/2 right-10 w-[350px] h-[350px] bg-amber-500/10 rounded-full blur-[100px] pointer-events-none" />

        <div className="max-w-6xl mx-auto text-center relative z-10 space-y-6">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-950/60 border border-emerald-500/30 text-emerald-300 text-xs font-medium backdrop-blur-md">
            <span className="flex h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
            Next Monthly Draw: End of Current Cycle • Rollover Jackpot Active
          </div>

          {/* Main Headline */}
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white tracking-tight font-heading leading-tight max-w-4xl mx-auto">
            Turn Your Weekend Golf Handicap Into{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-300 to-amber-300">
              Life-Changing Charity Impact
            </span>{' '}
            & Huge Cash Jackpots.
          </h1>

          {/* Subtext */}
          <p className="text-base sm:text-lg text-slate-300 max-w-2xl mx-auto leading-relaxed">
            Submit your last 5 Stableford scores each month. Match our automated
            draw numbers to win up to {state.settings.currency_symbol}
            {state.settings.current_jackpot_rollover.toLocaleString()} in rollover
            jackpots, while guaranteed funds flow to causes you care about.
          </p>

          {/* Hero CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            {currentUser && currentSubscription?.status === 'active' ? (
              <button
                onClick={() => onNavigate('dashboard')}
                className="w-full sm:w-auto px-7 py-3.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-sm shadow-xl shadow-emerald-950/60 transition-all flex items-center justify-center gap-2 group cursor-pointer"
              >
                <span>Go to My Golfer Dashboard</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
            ) : currentUser ? (
              <button
                onClick={onOpenStripeModal}
                className="w-full sm:w-auto px-7 py-3.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-sm shadow-xl shadow-emerald-950/60 transition-all flex items-center justify-center gap-2 group cursor-pointer"
              >
                <Sparkles className="w-4 h-4" />
                <span>Activate Subscription ({state.settings.currency_symbol}{state.settings.monthly_price}/mo)</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
            ) : (
              <button
                onClick={() => onOpenAuthModal('register')}
                className="w-full sm:w-auto px-7 py-3.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-sm shadow-xl shadow-emerald-950/60 transition-all flex items-center justify-center gap-2 group cursor-pointer"
              >
                <Sparkles className="w-4 h-4" />
                <span>Join Now & Select Charity</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
            )}

            <button
              onClick={() => onNavigate('how-it-works')}
              className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 text-slate-200 border border-slate-700 font-semibold text-sm transition-all flex items-center justify-center gap-2"
            >
              <span>How The 5-Score Draw Works</span>
            </button>
          </div>

          {/* Quick Metrics Strip */}
          <div className="pt-10 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto text-left">
            <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-sm">
              <div className="text-xs text-amber-400 font-semibold uppercase tracking-wider flex items-center gap-1.5 mb-1">
                <Trophy className="w-3.5 h-3.5" />
                Rollover Jackpot
              </div>
              <div className="text-2xl font-extrabold text-white font-mono">
                {state.settings.currency_symbol}
                {state.settings.current_jackpot_rollover.toLocaleString()}
              </div>
              <div className="text-[11px] text-slate-400 mt-0.5">5/5 Match Guarantee</div>
            </div>

            <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-sm">
              <div className="text-xs text-rose-400 font-semibold uppercase tracking-wider flex items-center gap-1.5 mb-1">
                <Heart className="w-3.5 h-3.5" />
                Charities Funded
              </div>
              <div className="text-2xl font-extrabold text-white font-mono">
                {state.settings.currency_symbol}
                {totalCharityRaised.toLocaleString()}
              </div>
              <div className="text-[11px] text-slate-400 mt-0.5">Direct to vetted partners</div>
            </div>

            <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-sm">
              <div className="text-xs text-emerald-400 font-semibold uppercase tracking-wider flex items-center gap-1.5 mb-1">
                <Users className="w-3.5 h-3.5" />
                Active Golfers
              </div>
              <div className="text-2xl font-extrabold text-white font-mono">
                {activeSubscribersCount + 84}
              </div>
              <div className="text-[11px] text-slate-400 mt-0.5">Competing every month</div>
            </div>

            <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-sm">
              <div className="text-xs text-sky-400 font-semibold uppercase tracking-wider flex items-center gap-1.5 mb-1">
                <ShieldCheck className="w-3.5 h-3.5" />
                Fair & Verified
              </div>
              <div className="text-2xl font-extrabold text-white font-mono">
                100%
              </div>
              <div className="text-[11px] text-slate-400 mt-0.5">Scorecards checked prior to payout</div>
            </div>
          </div>
        </div>
      </section>

      {/* Latest Draw Showcase Banner */}
      {latestDraw && (
        <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="rounded-2xl bg-gradient-to-r from-slate-900 via-[#101728] to-slate-900 border border-slate-800 p-6 sm:p-8 shadow-xl relative overflow-hidden">
            <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded text-[11px] font-semibold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                    LATEST DRAW RESULTS
                  </span>
                  <span className="text-xs text-slate-400 font-mono">
                    {latestDraw.draw_date}
                  </span>
                </div>
                <h3 className="text-xl sm:text-2xl font-bold text-white">
                  {latestDraw.title}
                </h3>
                <p className="text-xs sm:text-sm text-slate-300">
                  Total Prize Pool:{' '}
                  <strong className="text-amber-400 font-mono">
                    {state.settings.currency_symbol}
                    {latestDraw.total_prize_pool.toLocaleString()}
                  </strong>{' '}
                  • Rollover carry:{' '}
                  <span className="text-slate-300 font-mono">
                    {state.settings.currency_symbol}
                    {latestDraw.new_jackpot_rollover.toLocaleString()}
                  </span>
                </p>
              </div>

              {/* Drawn Numbers Balls */}
              <div className="flex items-center gap-2.5 sm:gap-3 flex-wrap">
                {latestDraw.winning_numbers.map((num, i) => (
                  <div
                    key={i}
                    className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-gradient-to-b from-slate-700 to-slate-900 border-2 border-amber-400/80 flex items-center justify-center text-white font-mono font-black text-lg sm:text-xl shadow-lg shadow-amber-950/40"
                  >
                    {num}
                  </div>
                ))}
              </div>
            </div>

            {/* Match breakdown stats */}
            <div className="mt-6 pt-6 border-t border-slate-800 grid grid-cols-3 gap-4 text-center">
              <div className="p-2.5 rounded-lg bg-slate-950/40 border border-slate-800/60">
                <div className="text-[11px] text-slate-400 font-semibold">
                  5 Matches (40% + Rollover)
                </div>
                <div className="text-sm font-bold text-amber-400 mt-0.5 font-mono">
                  {state.settings.currency_symbol}
                  {latestDraw.tier_5_pool.toLocaleString()}
                </div>
              </div>

              <div className="p-2.5 rounded-lg bg-slate-950/40 border border-slate-800/60">
                <div className="text-[11px] text-slate-400 font-semibold">
                  4 Matches (35%)
                </div>
                <div className="text-sm font-bold text-emerald-400 mt-0.5 font-mono">
                  {state.settings.currency_symbol}
                  {latestDraw.tier_4_pool.toLocaleString()}
                </div>
              </div>

              <div className="p-2.5 rounded-lg bg-slate-950/40 border border-slate-800/60">
                <div className="text-[11px] text-slate-400 font-semibold">
                  3 Matches (25%)
                </div>
                <div className="text-sm font-bold text-sky-400 mt-0.5 font-mono">
                  {state.settings.currency_symbol}
                  {latestDraw.tier_3_pool.toLocaleString()}
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* The 3-Step Simple Mechanics */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        <div className="text-center space-y-3">
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
            How The Lottery Works
          </span>
          <h2 className="text-3xl font-extrabold text-white font-heading">
            Simple, Transparent, and Impactful
          </h2>
          <p className="text-sm text-slate-400 max-w-xl mx-auto">
            Unlike generic random scratchers, your monthly lottery tickets come
            from your real Stableford golf scores.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-slate-700 transition-all space-y-4">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 flex items-center justify-center font-bold font-mono text-lg">
              01
            </div>
            <h3 className="text-lg font-bold text-white">Log 5 Rolling Scores</h3>
            <p className="text-sm text-slate-300 leading-relaxed">
              Every round you play, log your Stableford points (1–45). Our system
              automatically locks in your most recent 5 rolling scores as your
              official entry numbers.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-slate-700 transition-all space-y-4">
            <div className="w-12 h-12 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/30 flex items-center justify-center font-bold font-mono text-lg">
              02
            </div>
            <h3 className="text-lg font-bold text-white">Automated Monthly Draw</h3>
            <p className="text-sm text-slate-300 leading-relaxed">
              On the final day of every month, 5 numbers are drawn. Match 5, 4,
              or 3 numbers to claim your share of the prize pool (40% / 35% / 25%).
              Unclaimed 5-match funds roll over!
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-slate-700 transition-all space-y-4">
            <div className="w-12 h-12 rounded-xl bg-rose-500/10 text-rose-400 border border-rose-500/30 flex items-center justify-center font-bold font-mono text-lg">
              03
            </div>
            <h3 className="text-lg font-bold text-white">Guaranteed Charity Giving</h3>
            <p className="text-sm text-slate-300 leading-relaxed">
              At least 10% (and up to 50%+) of your monthly membership goes straight
              to your designated veteran, youth, animal, or environmental charity.
            </p>
          </div>
        </div>
      </section>

      {/* Interactive Prize Calculator */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-2xl bg-[#0f1422] border border-slate-800 p-6 sm:p-8 space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
            <div>
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Trophy className="w-5 h-5 text-amber-400" />
                Prize Matching Calculator
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Simulate your expected payout based on current base pool of {state.settings.currency_symbol}
                {basePrizePoolEstimate.toLocaleString()} + rollover
              </p>
            </div>
            <div className="flex items-center gap-1.5 bg-slate-900 p-1 rounded-xl border border-slate-800">
              {[3, 4, 5].map((matches) => (
                <button
                  key={matches}
                  onClick={() => setCalculatorScoreCount(matches)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    calculatorScoreCount === matches
                      ? 'bg-amber-500 text-slate-950 shadow'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {matches} Matches
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
            <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800">
              <span className="text-xs text-slate-400">Prize Tier Pool</span>
              <div className="text-xl font-bold text-amber-400 font-mono mt-1">
                {calculatorScoreCount === 5
                  ? `40% + Rollover (${state.settings.currency_symbol}${(
                      basePrizePoolEstimate * 0.4 +
                      state.settings.current_jackpot_rollover
                    ).toLocaleString()})`
                  : calculatorScoreCount === 4
                  ? `35% (${state.settings.currency_symbol}${(
                      basePrizePoolEstimate * 0.35
                    ).toLocaleString()})`
                  : `25% (${state.settings.currency_symbol}${(
                      basePrizePoolEstimate * 0.25
                    ).toLocaleString()})`}
              </div>
            </div>

            <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800">
              <span className="text-xs text-slate-400">Estimated Winners</span>
              <div className="text-xl font-bold text-slate-200 font-mono mt-1">
                {calculatorScoreCount === 5
                  ? '0 - 1 golfer'
                  : calculatorScoreCount === 4
                  ? '2 - 4 golfers'
                  : '8 - 15 golfers'}
              </div>
            </div>

            <div className="p-4 rounded-xl bg-emerald-950/30 border border-emerald-500/30">
              <span className="text-xs text-emerald-400 font-semibold">
                Est. Payout Per Golfer
              </span>
              <div className="text-2xl font-black text-emerald-300 font-mono mt-1">
                {state.settings.currency_symbol}
                {calculatorScoreCount === 5
                  ? (
                      basePrizePoolEstimate * 0.4 +
                      state.settings.current_jackpot_rollover
                    ).toLocaleString()
                  : calculatorScoreCount === 4
                  ? Math.round(
                      (basePrizePoolEstimate * 0.35) / 3
                    ).toLocaleString()
                  : Math.round(
                      (basePrizePoolEstimate * 0.25) / 10
                    ).toLocaleString()}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Charities Spotlight */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-rose-400 bg-rose-500/10 px-3 py-1 rounded-full border border-rose-500/20">
              Your Impact
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white font-heading mt-2">
              Vetted Charity Partners
            </h2>
            <p className="text-sm text-slate-400 mt-1">
              Select one upon sign-up, or switch anytime from your dashboard.
            </p>
          </div>

          <button
            onClick={() => onNavigate('charities')}
            className="text-xs font-semibold text-emerald-400 hover:text-emerald-300 flex items-center gap-1 group"
          >
            <span>View All Partner Charities</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {state.charities.slice(0, 3).map((charity) => (
            <div
              key={charity.id}
              className="rounded-2xl bg-slate-900/60 border border-slate-800 overflow-hidden flex flex-col hover:border-slate-700 transition-all"
            >
              <div className="h-44 overflow-hidden relative">
                <img
                  src={charity.image_url}
                  alt={charity.name}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <span className="absolute top-3 left-3 text-[10px] uppercase font-bold tracking-wider px-2.5 py-1 rounded-md bg-slate-950/80 text-white backdrop-blur-md border border-slate-700/60">
                  {charity.category}
                </span>
              </div>

              <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                <div className="space-y-2">
                  <h4 className="font-bold text-base text-white">{charity.name}</h4>
                  <p className="text-xs text-slate-300 line-clamp-3 leading-relaxed">
                    {charity.description}
                  </p>
                </div>

                <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs">
                  <span className="text-slate-400">Total Funded:</span>
                  <span className="font-bold text-rose-400 font-mono">
                    {state.settings.currency_symbol}
                    {charity.total_raised.toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Subscription Callout */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-3xl bg-gradient-to-br from-emerald-950/80 via-slate-900 to-[#121c24] border border-emerald-500/30 p-8 sm:p-12 text-center space-y-6 relative overflow-hidden">
          <div className="max-w-2xl mx-auto space-y-3">
            <h3 className="text-2xl sm:text-3xl font-extrabold text-white font-heading">
              Ready to Play for Causes and Cash?
            </h3>
            <p className="text-sm text-slate-300">
              Membership starts from only {state.settings.currency_symbol}
              {state.settings.monthly_price} per month. Automatic monthly draws, verified
              handicap scoring, and immediate charity disbursement.
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-4">
            <button
              onClick={() => {
                if (currentUser) {
                  onOpenStripeModal();
                } else {
                  onOpenAuthModal('register');
                }
              }}
              className="px-8 py-3.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-sm shadow-xl shadow-emerald-950/60 transition-all flex items-center gap-2 cursor-pointer"
            >
              <Sparkles className="w-4 h-4" />
              <span>Join Digital Heroes Today</span>
            </button>
            <button
              onClick={() => onNavigate('pricing')}
              className="px-6 py-3.5 rounded-xl bg-slate-800 text-slate-200 hover:bg-slate-700 font-semibold text-sm border border-slate-700"
            >
              View Membership Pricing
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};
