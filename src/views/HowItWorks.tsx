import React, { useState } from 'react';
import { useStore } from '../services/store';
import {
  Trophy,
  Target,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  TrendingUp,
  Sparkles,
  ShieldCheck,
  RotateCcw,
  ArrowRight,
} from 'lucide-react';

interface HowItWorksProps {
  onNavigate: (view: string) => void;
  onOpenStripeModal: () => void;
}

export const HowItWorks: React.FC<HowItWorksProps> = ({
  onNavigate,
  onOpenStripeModal,
}) => {
  const { state } = useStore();
  const [testScores, setTestScores] = useState<number[]>([34, 38, 32, 40, 36]);
  const [tested, setTested] = useState(false);

  const latestDraw = state.draws[0];
  const drawNumbers = latestDraw ? latestDraw.winning_numbers : [34, 38, 31, 29, 41];

  const matchedNumbers = testScores.filter((n) => drawNumbers.includes(n));
  const matchCount = matchedNumbers.length;

  const updateTestScore = (index: number, val: number) => {
    const next = [...testScores];
    next[index] = Math.max(1, Math.min(45, val || 1));
    setTestScores(next);
    setTested(false);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-16">
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto space-y-3">
        <span className="text-xs font-bold uppercase tracking-wider text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
          Complete Rules & Transparent Mechanics
        </span>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white font-heading">
          How Digital Heroes Works
        </h1>
        <p className="text-sm sm:text-base text-slate-300">
          The UK & international charity lottery engineered specifically for
          amateur and club golfers. Here is everything you need to know about
          Stableford scoring, rolling submissions, prize pools, and rollover
          jackpots.
        </p>
      </div>

      {/* Interactive Simulator Card */}
      <div className="rounded-3xl bg-[#0f1422] border border-slate-800 p-6 sm:p-8 shadow-xl space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30 uppercase">
                Interactive Simulator
              </span>
              <h3 className="text-lg font-bold text-white">
                Test Your 5 Scores Against Draw #{latestDraw?.id.slice(0, 6) || 'OCT'}
              </h3>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Official Draw Numbers:{' '}
              <span className="font-mono text-amber-300 font-bold">
                {drawNumbers.join(' - ')}
              </span>
            </p>
          </div>

          <button
            onClick={() => setTested(true)}
            className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shadow-md shadow-emerald-950/40 transition-colors flex items-center gap-1.5"
          >
            <Sparkles className="w-3.5 h-3.5" />
            Check Matches Now
          </button>
        </div>

        {/* Inputs */}
        <div className="space-y-2">
          <label className="text-xs font-semibold text-slate-300">
            Enter 5 Sample Stableford Points (1 to 45):
          </label>
          <div className="grid grid-cols-5 gap-2 sm:gap-4 max-w-lg">
            {testScores.map((score, idx) => {
              const isMatched = tested && drawNumbers.includes(score);
              return (
                <div key={idx} className="space-y-1 text-center">
                  <span className="text-[10px] text-slate-500 font-mono">
                    Round #{idx + 1}
                  </span>
                  <input
                    type="number"
                    min={1}
                    max={45}
                    value={score}
                    onChange={(e) => updateTestScore(idx, Number(e.target.value))}
                    className={`w-full py-2.5 text-center font-mono font-bold text-base sm:text-lg rounded-xl border transition-all ${
                      isMatched
                        ? 'bg-emerald-950/80 border-emerald-400 text-emerald-300 ring-2 ring-emerald-500'
                        : 'bg-slate-900 border-slate-700 text-white focus:border-emerald-500'
                    }`}
                  />
                  {tested && isMatched && (
                    <span className="text-[10px] text-emerald-400 font-bold block">
                      MATCH!
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Result alert */}
        {tested && (
          <div
            className={`p-4 rounded-xl border text-xs sm:text-sm flex items-center justify-between ${
              matchCount >= 5
                ? 'bg-amber-950/40 border-amber-500 text-amber-300'
                : matchCount === 4
                ? 'bg-emerald-950/40 border-emerald-500 text-emerald-300'
                : matchCount === 3
                ? 'bg-sky-950/40 border-sky-500 text-sky-300'
                : 'bg-slate-900 border-slate-700 text-slate-400'
            }`}
          >
            <div>
              <strong>
                {matchCount === 5
                  ? 'JACKPOT WINNER! 5 out of 5 matches!'
                  : matchCount === 4
                  ? 'TIER 2 WINNER! 4 out of 5 matches!'
                  : matchCount === 3
                  ? 'TIER 3 WINNER! 3 out of 5 matches!'
                  : `${matchCount} matches. (Need at least 3 matches to win a cash share)`}
              </strong>
              <div className="text-[11px] mt-0.5 opacity-80">
                Matched numbers:{' '}
                {matchedNumbers.length > 0
                  ? matchedNumbers.join(', ')
                  : 'None this round'}
              </div>
            </div>

            {matchCount >= 3 && (
              <span className="font-mono font-bold text-base sm:text-lg">
                {matchCount === 5
                  ? `Prize: 40% + Rollover (${state.settings.currency_symbol}25,000+)`
                  : matchCount === 4
                  ? `Prize: 35% Pool Share`
                  : `Prize: 25% Pool Share`}
              </span>
            )}
          </div>
        )}
      </div>

      {/* Comprehensive Rule Sections */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Section 1 */}
        <div className="rounded-2xl bg-slate-900/60 border border-slate-800 p-6 space-y-4">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 flex items-center justify-center font-bold">
            1
          </div>
          <h3 className="text-xl font-bold text-white">
            Why Stableford Scoring?
          </h3>
          <p className="text-sm text-slate-300 leading-relaxed">
            Stableford awards points per hole based on net score relative to par
            (e.g., net birdie = 3 points, net par = 2 points, net bogey = 1 point).
            Because points range predictably between <strong>1 and 45</strong>, it creates an
            equitable lottery distribution that neutralizes course difficulty differences.
          </p>
          <ul className="text-xs text-slate-400 space-y-2 pt-2">
            <li className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
              <span>Valid Stableford scores strictly validated between 1 and 45 points.</span>
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
              <span>Duplicate dates on the same day are blocked by validation rules.</span>
            </li>
          </ul>
        </div>

        {/* Section 2 */}
        <div className="rounded-2xl bg-slate-900/60 border border-slate-800 p-6 space-y-4">
          <div className="w-10 h-10 rounded-xl bg-teal-500/10 text-teal-400 border border-teal-500/30 flex items-center justify-center font-bold">
            2
          </div>
          <h3 className="text-xl font-bold text-white">
            The Rolling 5 Scores System
          </h3>
          <p className="text-sm text-slate-300 leading-relaxed">
            Your monthly entry is always formed by your <strong>most recent 5 rounds</strong>.
            Whenever you log a new round, it automatically becomes Round #1, pushing the oldest
            round off your ticket.
          </p>
          <ul className="text-xs text-slate-400 space-y-2 pt-2">
            <li className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
              <span>Active golfers continuously update their numbers with every weekend round.</span>
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
              <span>Winter off-season? Your last 5 verified scores stay locked in.</span>
            </li>
          </ul>
        </div>

        {/* Section 3 */}
        <div className="rounded-2xl bg-slate-900/60 border border-slate-800 p-6 space-y-4">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/30 flex items-center justify-center font-bold">
            3
          </div>
          <h3 className="text-xl font-bold text-white">
            Draw Mechanics: Random vs. Algorithmic
          </h3>
          <p className="text-sm text-slate-300 leading-relaxed">
            Administrators configure whether the draw operates via pure cryptographically
            random generation (1-45 uniformly) or an <strong>Algorithmic Frequency Weight</strong>,
            which analyzes all user-submitted scores to produce realistic golf-distribution numbers.
          </p>
          <ul className="text-xs text-slate-400 space-y-2 pt-2">
            <li className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-amber-400 flex-shrink-0" />
              <span>Full cryptographic transparency with timestamped draw IDs.</span>
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-amber-400 flex-shrink-0" />
              <span>Both draw modes adhere strictly to the 1-45 range limits.</span>
            </li>
          </ul>
        </div>

        {/* Section 4 */}
        <div className="rounded-2xl bg-slate-900/60 border border-slate-800 p-6 space-y-4">
          <div className="w-10 h-10 rounded-xl bg-rose-500/10 text-rose-400 border border-rose-500/30 flex items-center justify-center font-bold">
            4
          </div>
          <h3 className="text-xl font-bold text-white">
            Prize Splits & Rollover Jackpot
          </h3>
          <p className="text-sm text-slate-300 leading-relaxed">
            Monthly pool distribution is locked into PRD specifications:
          </p>
          <div className="space-y-2 text-xs">
            <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 flex justify-between">
              <span className="text-amber-400 font-bold">5 of 5 Matches:</span>
              <span className="text-white font-mono">40% Prize Pool + ALL Rollover</span>
            </div>
            <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 flex justify-between">
              <span className="text-emerald-400 font-bold">4 of 5 Matches:</span>
              <span className="text-white font-mono">35% Prize Pool split equally</span>
            </div>
            <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 flex justify-between">
              <span className="text-sky-400 font-bold">3 of 5 Matches:</span>
              <span className="text-white font-mono">25% Prize Pool split equally</span>
            </div>
            <p className="text-[11px] text-slate-400 pt-1">
              * If zero players hit 5 of 5 matches, the entire 40% pot rolls over into next month's jackpot pool.
            </p>
          </div>
        </div>
      </div>

      {/* Verification & Fraud Prevention */}
      <div className="rounded-2xl bg-gradient-to-r from-slate-900 via-slate-800/40 to-slate-900 border border-slate-700 p-6 sm:p-8 space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">
              Strict Scorecard Verification Before Payout
            </h3>
            <p className="text-xs text-slate-400">
              Maintaining 100% integrity for our charity partners and community.
            </p>
          </div>
        </div>
        <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
          When your numbers match, your status is set to <strong>Pending Verification</strong>.
          You simply upload a photo or screenshot of your club scorecard or app handicap record
          (e.g., England Golf, WHS, GolfNow, or signed club card). Our admin team verifies the date
          and Stableford total before triggering the cash transfer to your account.
        </p>
      </div>

      {/* Bottom CTA */}
      <div className="text-center pt-4">
        <button
          onClick={onOpenStripeModal}
          className="px-8 py-3.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-sm shadow-xl shadow-emerald-950/60 transition-all inline-flex items-center gap-2"
        >
          <span>Subscribe & Join the Next Draw</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
