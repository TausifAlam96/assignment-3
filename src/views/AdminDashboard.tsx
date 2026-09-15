import React, { useState } from 'react';
import { useStore } from '../services/store';
import {
  Winner,
  Charity,
  Profile,
  SimulationResult,
} from '../types';
import {
  ShieldAlert,
  Trophy,
  Users,
  Heart,
  Settings,
  Sparkles,
  CheckCircle2,
  Play,
  RotateCcw,
  Search,
  Plus,
  DollarSign,
  FileCheck,
  CreditCard,
  Eye,
} from 'lucide-react';
import confetti from 'canvas-confetti';

export const AdminDashboard: React.FC = () => {
  const { state, actions } = useStore();
  const [activeTab, setActiveTab] = useState<
    'overview' | 'draws' | 'users' | 'winners' | 'charities' | 'settings'
  >('draws');

  // Draw Management state
  const [drawMethod, setDrawMethod] = useState<'random' | 'algorithmic'>('random');
  const [draftNumbers, setDraftNumbers] = useState<number[]>([34, 38, 31, 29, 41]);
  const [simulationResult, setSimulationResult] = useState<SimulationResult | null>(null);
  const [isSimulating, setIsSimulating] = useState(false);
  const [drawSuccessMsg, setDrawSuccessMsg] = useState<string | null>(null);

  // User search
  const [userSearch, setUserSearch] = useState('');

  // Proof review modal
  const [reviewingWinner, setReviewingWinner] = useState<Winner | null>(null);
  const [rejectReason, setRejectReason] = useState('');

  // Charity modal
  const [isCharityModalOpen, setIsCharityModalOpen] = useState(false);
  const [charityName, setCharityName] = useState('');
  const [charityCategory, setCharityCategory] = useState<
    | 'Youth & Education'
    | 'Cancer & Health'
    | 'Veterans & First Responders'
    | 'Environmental'
    | 'Junior Golf'
  >('Veterans & First Responders');
  const [charityDesc, setCharityDesc] = useState('');
  const [charityMission, setCharityMission] = useState('');
  const [charityImage, setCharityImage] = useState('');

  // Settings local state
  const [settingsForm, setSettingsForm] = useState(state.settings);

  // Metrics
  const activeSubscribers = state.subscriptions.filter(
    (s) => s.status === 'active'
  ).length;
  const totalCharityRaised = state.charities.reduce(
    (acc, c) => acc + c.total_raised,
    0
  );
  const totalPrizePaid = state.winners
    .filter((w) => w.payment_status === 'paid')
    .reduce((acc, w) => acc + w.prize_amount, 0);

  // Handlers for Draw
  const handleAutoGenerateNumbers = () => {
    const nums: number[] = [];
    while (nums.length < 5) {
      const r = Math.floor(Math.random() * 45) + 1;
      if (!nums.includes(r)) {
        nums.push(r);
      }
    }
    nums.sort((a, b) => a - b);
    setDraftNumbers(nums);
    setSimulationResult(null);
  };

  const handleSimulateDraw = () => {
    setIsSimulating(true);
    const now = new Date();
    const result = actions.runDrawSimulation({
      title: `Official Draw - ${now.toLocaleString('default', { month: 'long', year: 'numeric' })}`,
      drawDate: now.toISOString().split('T')[0],
      drawType: drawMethod,
      customWinningNumbers: draftNumbers,
    });
    setSimulationResult(result);
    setIsSimulating(false);
  };

  const handleExecuteDraw = () => {
    let resultToPublish = simulationResult;
    if (!resultToPublish) {
      const now = new Date();
      resultToPublish = actions.runDrawSimulation({
        title: `Official Draw - ${now.toLocaleString('default', { month: 'long', year: 'numeric' })}`,
        drawDate: now.toISOString().split('T')[0],
        drawType: drawMethod,
        customWinningNumbers: draftNumbers,
      });
    }

    const res = actions.publishDraw(resultToPublish);
    setDrawSuccessMsg(res.message);
    setSimulationResult(null);

    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 },
    });

    setTimeout(() => {
      setDrawSuccessMsg(null);
    }, 5000);
  };

  const handleApproveWinner = (winnerId: string) => {
    actions.approveWinnerProof(winnerId);
    setReviewingWinner(null);
  };

  const handleRejectWinner = (winnerId: string) => {
    actions.rejectWinnerProof(winnerId, rejectReason || 'Scorecard did not match dates');
    setReviewingWinner(null);
    setRejectReason('');
  };

  const handleMarkPayout = (winnerId: string) => {
    actions.markWinnerPaid(winnerId);
  };

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    actions.updateSettings(settingsForm);
    alert('Settings saved successfully!');
  };

  const handleCreateCharity = (e: React.FormEvent) => {
    e.preventDefault();
    actions.addCharity({
      name: charityName,
      category: charityCategory,
      description: charityDesc,
      mission: charityMission || charityDesc,
      impact_statement: 'Guaranteed donor funds delivered every monthly cycle.',
      image_url:
        charityImage ||
        'https://images.unsplash.com/photo-1593111774240-d529f12cf4bb?w=800&auto=format&fit=crop&q=80',
      logo_url: 'https://images.unsplash.com/photo-1593111774240-d529f12cf4bb?w=200&auto=format&fit=crop&q=80',
      website_url: 'https://digitalheroesgolf.org',
      is_featured: true,
      is_active: true,
      upcoming_events: [],
    });
    setIsCharityModalOpen(false);
    setCharityName('');
    setCharityDesc('');
    setCharityMission('');
    setCharityImage('');
  };

  const filteredProfiles = state.profiles.filter(
    (u) =>
      u.full_name.toLowerCase().includes(userSearch.toLowerCase()) ||
      u.email.toLowerCase().includes(userSearch.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 p-6 rounded-3xl bg-gradient-to-r from-purple-950/80 via-slate-900 to-[#0e1424] border border-purple-500/30 shadow-2xl">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-purple-500/20 text-purple-400 border border-purple-500/30 flex items-center justify-center shadow-md">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-extrabold text-white font-heading">
                Admin Command Center
              </h1>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30">
                SUPER ADMIN
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Automated Draw Engine • Winner Audit & Scorecards • Charity Treasury
            </p>
          </div>
        </div>

        {/* Quick Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto bg-slate-950/70 p-1.5 rounded-2xl border border-slate-800">
          <button
            onClick={() => setActiveTab('draws')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors flex items-center gap-1.5 ${
              activeTab === 'draws'
                ? 'bg-purple-600 text-white shadow'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Trophy className="w-3.5 h-3.5" />
            Draw Engine
          </button>
          <button
            onClick={() => setActiveTab('winners')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors flex items-center gap-1.5 ${
              activeTab === 'winners'
                ? 'bg-purple-600 text-white shadow'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <FileCheck className="w-3.5 h-3.5" />
            Winners ({state.winners.length})
          </button>
          <button
            onClick={() => setActiveTab('users')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors flex items-center gap-1.5 ${
              activeTab === 'users'
                ? 'bg-purple-600 text-white shadow'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            Users
          </button>
          <button
            onClick={() => setActiveTab('charities')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors flex items-center gap-1.5 ${
              activeTab === 'charities'
                ? 'bg-purple-600 text-white shadow'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Heart className="w-3.5 h-3.5" />
            Charities
          </button>
          <button
            onClick={() => setActiveTab('settings')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors flex items-center gap-1.5 ${
              activeTab === 'settings'
                ? 'bg-purple-600 text-white shadow'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Settings className="w-3.5 h-3.5" />
            Settings
          </button>
        </div>
      </div>

      {/* KPI Cards Strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800">
          <div className="text-xs text-amber-400 font-semibold flex items-center gap-1.5">
            <Trophy className="w-3.5 h-3.5" />
            Current Rollover Jackpot
          </div>
          <div className="text-2xl font-bold font-mono text-white mt-1">
            {state.settings.currency_symbol}
            {state.settings.current_jackpot_rollover.toLocaleString()}
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">5/5 Match Pot</div>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800">
          <div className="text-xs text-emerald-400 font-semibold flex items-center gap-1.5">
            <Users className="w-3.5 h-3.5" />
            Active Paid Subscribers
          </div>
          <div className="text-2xl font-bold font-mono text-white mt-1">
            {activeSubscribers}
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">
            Generating monthly pool
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800">
          <div className="text-xs text-rose-400 font-semibold flex items-center gap-1.5">
            <Heart className="w-3.5 h-3.5" />
            Charity Funds Disbursed
          </div>
          <div className="text-2xl font-bold font-mono text-white mt-1">
            {state.settings.currency_symbol}
            {totalCharityRaised.toLocaleString()}
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">All vetted non-profits</div>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800">
          <div className="text-xs text-sky-400 font-semibold flex items-center gap-1.5">
            <CreditCard className="w-3.5 h-3.5" />
            Total Prizes Paid Out
          </div>
          <div className="text-2xl font-bold font-mono text-white mt-1">
            {state.settings.currency_symbol}
            {totalPrizePaid.toLocaleString()}
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">
            Verified scorecards
          </div>
        </div>
      </div>

      {drawSuccessMsg && (
        <div className="p-4 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-sm flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
          <span>{drawSuccessMsg}</span>
        </div>
      )}

      {/* TAB 1: DRAW ENGINE */}
      {activeTab === 'draws' && (
        <div className="space-y-8">
          <div className="rounded-3xl bg-slate-900/70 border border-slate-800 p-6 sm:p-8 space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
              <div>
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-amber-400" />
                  Monthly Draw Control & Simulation
                </h2>
                <p className="text-xs text-slate-400 mt-1">
                  Configure numbers, run live simulations against all users' rolling scores, and execute official results.
                </p>
              </div>

              {/* Draw method switch */}
              <div className="flex items-center gap-1.5 bg-slate-950 p-1.5 rounded-xl border border-slate-800">
                <button
                  onClick={() => setDrawMethod('random')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                    drawMethod === 'random'
                      ? 'bg-purple-600 text-white shadow'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Random (1-45)
                </button>
                <button
                  onClick={() => setDrawMethod('algorithmic')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                    drawMethod === 'algorithmic'
                      ? 'bg-purple-600 text-white shadow'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Algorithmic Frequency
                </button>
              </div>
            </div>

            {/* 5 Balls Editor */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-slate-300">
                  Target Draw Numbers (Stableford 1 to 45):
                </label>
                <button
                  onClick={handleAutoGenerateNumbers}
                  className="text-xs text-purple-400 hover:text-purple-300 font-semibold flex items-center gap-1"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  Auto-Generate 5 Numbers
                </button>
              </div>

              <div className="grid grid-cols-5 gap-3 max-w-md">
                {draftNumbers.map((num, i) => (
                  <input
                    key={i}
                    type="number"
                    min={1}
                    max={45}
                    value={num}
                    onChange={(e) => {
                      const next = [...draftNumbers];
                      next[i] = Math.max(1, Math.min(45, Number(e.target.value) || 1));
                      setDraftNumbers(next);
                      setSimulationResult(null);
                    }}
                    className="w-full py-3 text-center text-xl font-bold font-mono rounded-xl bg-slate-950 border border-slate-700 text-white focus:border-purple-500 focus:outline-none"
                  />
                ))}
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                onClick={handleSimulateDraw}
                disabled={isSimulating}
                className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold border border-slate-700 flex items-center gap-2 cursor-pointer"
              >
                <Play className="w-4 h-4 text-emerald-400" />
                <span>Simulate Match Analysis</span>
              </button>

              <button
                onClick={handleExecuteDraw}
                className="px-6 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold shadow-lg shadow-purple-950/50 flex items-center gap-2 cursor-pointer"
              >
                <Trophy className="w-4 h-4 text-amber-300" />
                <span>Execute & Publish Official Draw</span>
              </button>
            </div>

            {/* Live Simulation Breakdown Output */}
            {simulationResult && (
              <div className="mt-6 p-5 rounded-2xl bg-slate-950/80 border border-purple-500/40 space-y-4 animate-in fade-in duration-200">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30">
                      SIMULATION AUDIT
                    </span>
                    <h3 className="text-sm font-bold text-white">
                      Projected Payouts for {draftNumbers.join(' - ')}
                    </h3>
                  </div>
                  <span className="text-xs text-slate-400 font-mono">
                    Pool: {state.settings.currency_symbol}
                    {simulationResult.draw.total_prize_pool.toLocaleString()}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                  {/* Match 5 */}
                  <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
                    <div className="text-amber-400 font-bold flex justify-between">
                      <span>5 Matches (40% + Rollover)</span>
                      <span>{simulationResult.matchedUsers.tier5.length} won</span>
                    </div>
                    <div className="text-base font-bold font-mono text-white">
                      {simulationResult.matchedUsers.tier5.length > 0
                        ? `${state.settings.currency_symbol}${simulationResult.payouts.tier5PerWinner.toLocaleString()} each`
                        : `Rollover: +${state.settings.currency_symbol}${simulationResult.payouts.rolloverAmount.toLocaleString()}`}
                    </div>
                    <div className="text-[11px] text-slate-400">
                      {simulationResult.matchedUsers.tier5.length === 0
                        ? 'No 5-match hits. Pot rolls over into next draw.'
                        : simulationResult.matchedUsers.tier5.map((w) => w.user_name).join(', ')}
                    </div>
                  </div>

                  {/* Match 4 */}
                  <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
                    <div className="text-emerald-400 font-bold flex justify-between">
                      <span>4 Matches (35% pool)</span>
                      <span>{simulationResult.matchedUsers.tier4.length} won</span>
                    </div>
                    <div className="text-base font-bold font-mono text-white">
                      {simulationResult.matchedUsers.tier4.length > 0
                        ? `${state.settings.currency_symbol}${simulationResult.payouts.tier4PerWinner.toLocaleString()} each`
                        : `${state.settings.currency_symbol}0`}
                    </div>
                    <div className="text-[11px] text-slate-400">
                      {simulationResult.matchedUsers.tier4.length > 0
                        ? simulationResult.matchedUsers.tier4.map((w) => w.user_name).join(', ')
                        : 'No 4-match hits this simulation.'}
                    </div>
                  </div>

                  {/* Match 3 */}
                  <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
                    <div className="text-sky-400 font-bold flex justify-between">
                      <span>3 Matches (25% pool)</span>
                      <span>{simulationResult.matchedUsers.tier3.length} won</span>
                    </div>
                    <div className="text-base font-bold font-mono text-white">
                      {simulationResult.matchedUsers.tier3.length > 0
                        ? `${state.settings.currency_symbol}${simulationResult.payouts.tier3PerWinner.toLocaleString()} each`
                        : `${state.settings.currency_symbol}0`}
                    </div>
                    <div className="text-[11px] text-slate-400">
                      {simulationResult.matchedUsers.tier3.length > 0
                        ? `${simulationResult.matchedUsers.tier3.length} golfers qualify for prize share`
                        : 'No 3-match hits.'}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Past Draws History */}
          <div className="rounded-3xl bg-slate-900/60 border border-slate-800 p-6 space-y-4">
            <h3 className="text-base font-bold text-white">
              Historical Draws ({state.draws.length})
            </h3>
            <div className="divide-y divide-slate-800">
              {state.draws.map((d) => (
                <div
                  key={d.id}
                  className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-white">{d.title}</span>
                      <span className="text-[10px] font-mono uppercase px-2 py-0.2 rounded bg-slate-800 text-slate-300">
                        {d.draw_type}
                      </span>
                      <span className="text-slate-400">{d.draw_date}</span>
                    </div>
                    <div className="text-slate-400">
                      Total Prize Pool: <strong className="text-amber-400 font-mono">{state.settings.currency_symbol}{d.total_prize_pool.toLocaleString()}</strong> • Rollover carry: {state.settings.currency_symbol}{d.new_jackpot_rollover.toLocaleString()}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {d.winning_numbers.map((n, i) => (
                      <span
                        key={i}
                        className="w-8 h-8 rounded-full bg-slate-800 border border-amber-400/60 flex items-center justify-center text-white font-mono font-bold text-xs"
                      >
                        {n}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: WINNERS AUDITING */}
      {activeTab === 'winners' && (
        <div className="rounded-3xl bg-slate-900/60 border border-slate-800 p-6 space-y-6">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <div>
              <h2 className="text-lg font-bold text-white">
                Winner Claims & Scorecard Verification
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Audit uploaded scorecard proofs before issuing cash payouts.
              </p>
            </div>
            <span className="text-xs text-slate-400">
              {state.winners.filter((w) => w.verification_status === 'pending').length} pending review
            </span>
          </div>

          <div className="divide-y divide-slate-800">
            {state.winners.map((w) => (
              <div
                key={w.id}
                className="py-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 text-xs"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <strong className="text-white text-sm">
                      {w.user_name}
                    </strong>
                    <span className="text-slate-400">({w.user_email})</span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30">
                      {w.match_type}/5 Matches
                    </span>
                  </div>
                  <div className="text-slate-400 flex items-center gap-3">
                    <span>Prize: <strong className="text-amber-400 font-mono">{state.settings.currency_symbol}{w.prize_amount.toLocaleString()}</strong></span>
                    <span>•</span>
                    <span>Verification: <strong className="uppercase text-white">{w.verification_status}</strong></span>
                    <span>•</span>
                    <span>Payout: <strong className="uppercase text-white">{w.payment_status}</strong></span>
                  </div>
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                  {w.proof_url ? (
                    <button
                      onClick={() => setReviewingWinner(w)}
                      className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700 flex items-center gap-1.5"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>Inspect Scorecard</span>
                    </button>
                  ) : (
                    <span className="text-[11px] text-slate-500 italic">
                      No proof uploaded yet
                    </span>
                  )}

                  {w.verification_status === 'pending' && (
                    <>
                      <button
                        onClick={() => handleApproveWinner(w.id)}
                        className="px-3 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs"
                      >
                        Approve
                      </button>
                      <button
                        onClick={() => {
                          setReviewingWinner(w);
                        }}
                        className="px-3 py-1.5 rounded-lg bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/40 text-xs font-medium"
                      >
                        Reject
                      </button>
                    </>
                  )}

                  {w.verification_status === 'approved' && w.payment_status !== 'paid' && (
                    <button
                      onClick={() => handleMarkPayout(w.id)}
                      className="px-3 py-1.5 rounded-lg bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-xs flex items-center gap-1"
                    >
                      <DollarSign className="w-3.5 h-3.5" />
                      Release Payout
                    </button>
                  )}

                  {w.payment_status === 'paid' && (
                    <span className="px-2 py-1 rounded bg-sky-500/10 text-sky-400 border border-sky-500/20 text-[11px] font-mono">
                      ✓ PAID OUT
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: USER MANAGEMENT */}
      {activeTab === 'users' && (
        <div className="rounded-3xl bg-slate-900/60 border border-slate-800 p-6 space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
            <div>
              <h2 className="text-lg font-bold text-white">
                Platform Golfer Directory ({state.profiles.length})
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Audit player profiles, subscription tiers, and logged scorecards.
              </p>
            </div>

            <div className="relative w-full sm:w-64">
              <input
                type="text"
                placeholder="Search golfers..."
                value={userSearch}
                onChange={(e) => setUserSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
              />
              <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-2.5" />
            </div>
          </div>

          <div className="divide-y divide-slate-800">
            {filteredProfiles.map((u) => {
              const userSub = state.subscriptions.find((s) => s.user_id === u.id);
              const uScores = state.scores.filter((s) => s.user_id === u.id);
              const charity = state.charities.find((c) => c.id === u.selected_charity_id);

              return (
                <div
                  key={u.id}
                  className="py-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 text-xs"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-white text-sm">{u.full_name}</span>
                      <span className="text-[10px] uppercase font-mono px-1.5 py-0.2 rounded bg-slate-800 text-slate-400">
                        {u.role}
                      </span>
                    </div>
                    <div className="text-slate-400 flex items-center gap-2">
                      <span>{u.email}</span>
                      <span>•</span>
                      <span>Charity: <strong className="text-rose-400">{charity?.name || 'None'}</strong> ({u.charity_percentage}%)</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <div className="text-white font-medium">
                        {uScores.length} rounds logged
                      </div>
                      <div className="text-[10px] text-slate-400 font-mono">
                        Sub: {userSub ? `${userSub.plan} (${userSub.status})` : 'Free'}
                      </div>
                    </div>

                    <button
                      onClick={() => {
                        const newPlan = userSub?.status === 'active' ? 'yearly' : 'monthly';
                        actions.activateSubscription(u.id, newPlan, u.charity_percentage);
                        alert(`Toggled subscription for ${u.full_name}`);
                      }}
                      className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold border border-slate-700"
                    >
                      Toggle Sub
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 4: CHARITY MANAGEMENT */}
      {activeTab === 'charities' && (
        <div className="rounded-3xl bg-slate-900/60 border border-slate-800 p-6 space-y-6">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <div>
              <h2 className="text-lg font-bold text-white">
                Vetted Charity Directory & Treasury
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Manage causes, update descriptions, and track accumulated disbursements.
              </p>
            </div>

            <button
              onClick={() => setIsCharityModalOpen(true)}
              className="px-3 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold flex items-center gap-1.5 shadow"
            >
              <Plus className="w-3.5 h-3.5" />
              Add Partner Charity
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {state.charities.map((c) => (
              <div
                key={c.id}
                className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 flex items-start gap-4 text-xs"
              >
                <img
                  src={c.image_url}
                  alt={c.name}
                  referrerPolicy="no-referrer"
                  className="w-16 h-16 rounded-xl object-cover border border-slate-700"
                />
                <div className="flex-1 space-y-1">
                  <div className="flex items-center justify-between">
                    <h4 className="font-bold text-white text-sm">{c.name}</h4>
                    <span className="text-[10px] text-slate-400 bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
                      {c.category}
                    </span>
                  </div>
                  <p className="text-slate-400 line-clamp-2">{c.description}</p>
                  <div className="pt-2 flex items-center justify-between text-[11px]">
                    <span className="text-rose-400 font-bold font-mono">
                      Raised: {state.settings.currency_symbol}{c.total_raised.toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 5: PLATFORM SETTINGS */}
      {activeTab === 'settings' && (
        <div className="rounded-3xl bg-slate-900/60 border border-slate-800 p-6 space-y-6 max-w-2xl">
          <div className="border-b border-slate-800 pb-4">
            <h2 className="text-lg font-bold text-white">Platform Settings & Rules</h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Adjust draw prize splits, rollover jackpot, and subscription pricing.
            </p>
          </div>

          <form onSubmit={handleSaveSettings} className="space-y-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-300 mb-1">
                Current Rollover Jackpot ({state.settings.currency_symbol})
              </label>
              <input
                type="number"
                value={settingsForm.current_jackpot_rollover}
                onChange={(e) =>
                  setSettingsForm({
                    ...settingsForm,
                    current_jackpot_rollover: Number(e.target.value),
                  })
                }
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white font-mono font-bold"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block font-semibold text-slate-300 mb-1">
                  Monthly Price ({state.settings.currency_symbol})
                </label>
                <input
                  type="number"
                  value={settingsForm.monthly_price}
                  onChange={(e) =>
                    setSettingsForm({
                      ...settingsForm,
                      monthly_price: Number(e.target.value),
                    })
                  }
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white font-mono font-bold"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">
                  Yearly Price ({state.settings.currency_symbol})
                </label>
                <input
                  type="number"
                  value={settingsForm.yearly_price}
                  onChange={(e) =>
                    setSettingsForm({
                      ...settingsForm,
                      yearly_price: Number(e.target.value),
                    })
                  }
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white font-mono font-bold"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block font-semibold text-slate-300 mb-1">
                  Prize Pool Allocation (%)
                </label>
                <input
                  type="number"
                  value={settingsForm.prize_pool_percentage}
                  onChange={(e) =>
                    setSettingsForm({
                      ...settingsForm,
                      prize_pool_percentage: Number(e.target.value),
                    })
                  }
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white font-mono font-bold"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">
                  Charity Minimum Allocation (%)
                </label>
                <input
                  type="number"
                  value={settingsForm.charity_min_percentage}
                  onChange={(e) =>
                    setSettingsForm({
                      ...settingsForm,
                      charity_min_percentage: Number(e.target.value),
                    })
                  }
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white font-mono font-bold"
                />
              </div>
            </div>

            <button
              type="submit"
              className="py-2.5 px-5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shadow-md transition-colors"
            >
              Save Platform Configuration
            </button>
          </form>
        </div>
      )}

      {/* Review Winner Scorecard Modal */}
      {reviewingWinner && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="relative w-full max-w-xl rounded-2xl bg-[#0f1422] border border-slate-700 p-6 sm:p-8 text-slate-100 shadow-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white">
                Inspect Uploaded Scorecard Proof
              </h3>
              <button
                onClick={() => setReviewingWinner(null)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            {reviewingWinner.proof_url ? (
              <div className="rounded-xl overflow-hidden border border-slate-700 max-h-72">
                <img
                  src={reviewingWinner.proof_url}
                  alt="Scorecard Proof"
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-contain bg-slate-950"
                />
              </div>
            ) : (
              <div className="p-8 text-center text-xs text-slate-400 bg-slate-900 rounded-xl">
                No image uploaded
              </div>
            )}

            {reviewingWinner.proof_notes && (
              <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-300">
                <strong>Golfer note:</strong> {reviewingWinner.proof_notes}
              </div>
            )}

            <div className="space-y-2">
              <label className="block text-xs font-semibold text-slate-300">
                Rejection Reason (if rejecting):
              </label>
              <input
                type="text"
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="e.g. Scorecard points did not match logged round"
                className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => handleRejectWinner(reviewingWinner.id)}
                className="px-4 py-2 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/40 text-xs font-bold"
              >
                Reject Claim
              </button>
              <button
                onClick={() => handleApproveWinner(reviewingWinner.id)}
                className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold"
              >
                Approve Winner
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Charity Modal */}
      {isCharityModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="relative w-full max-w-md rounded-2xl bg-[#0f1422] border border-slate-700 p-6 text-slate-100 shadow-2xl space-y-4">
            <h3 className="text-base font-bold text-white">Add New Charity Partner</h3>
            <form onSubmit={handleCreateCharity} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-300 mb-1">
                  Charity Name
                </label>
                <input
                  type="text"
                  required
                  value={charityName}
                  onChange={(e) => setCharityName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">
                  Category
                </label>
                <select
                  value={charityCategory}
                  onChange={(e) => setCharityCategory(e.target.value as any)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white"
                >
                  <option value="Veterans & First Responders">Veterans & First Responders</option>
                  <option value="Youth & Education">Youth & Education</option>
                  <option value="Cancer & Health">Cancer & Health</option>
                  <option value="Junior Golf">Junior Golf</option>
                  <option value="Environmental">Environmental</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">
                  Mission Statement
                </label>
                <textarea
                  required
                  rows={2}
                  value={charityMission}
                  onChange={(e) => setCharityMission(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">
                  Detailed Description
                </label>
                <textarea
                  required
                  rows={2}
                  value={charityDesc}
                  onChange={(e) => setCharityDesc(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">
                  Image URL
                </label>
                <input
                  type="text"
                  value={charityImage}
                  onChange={(e) => setCharityImage(e.target.value)}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsCharityModalOpen(false)}
                  className="px-3 py-1.5 rounded-lg bg-slate-800 text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg bg-purple-600 text-white font-bold"
                >
                  Create Charity
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
