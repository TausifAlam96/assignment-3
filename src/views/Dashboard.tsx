import React, { useState } from 'react';
import { useStore } from '../services/store';
import { GolfScore, Winner } from '../types';
import {
  Trophy,
  Calendar,
  Plus,
  Trash2,
  Edit2,
  CheckCircle2,
  Clock,
  AlertCircle,
  Heart,
  Upload,
  CreditCard,
  Target,
  Sparkles,
  ExternalLink,
  ShieldCheck,
  X,
  FileText,
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface DashboardProps {
  onOpenStripeModal: () => void;
  onNavigate: (view: string) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
  onOpenStripeModal,
  onNavigate,
}) => {
  const {
    currentUser,
    currentSubscription,
    currentCharity,
    userScores,
    userWinners,
    state,
    actions,
  } = useStore();

  const rollingScores = userScores.slice(0, 5);
  const userWinnings = userWinners;

  // Modal states
  const [isScoreModalOpen, setIsScoreModalOpen] = useState(false);
  const [editingScore, setEditingScore] = useState<GolfScore | null>(null);
  const [scoreCourse, setScoreCourse] = useState('');
  const [scoreDate, setScoreDate] = useState(
    new Date().toISOString().split('T')[0]
  );
  const [scorePoints, setScorePoints] = useState(36);
  const [scoreNotes, setScoreNotes] = useState('');
  const [scoreError, setScoreError] = useState<string | null>(null);

  // Proof upload modal for winnings
  const [uploadingWinner, setUploadingWinner] = useState<Winner | null>(null);
  const [proofUrl, setProofUrl] = useState('');
  const [proofNote, setProofNote] = useState('');
  const [proofUploaded, setProofUploaded] = useState(false);

  // Charity percentage local state
  const [charityPercent, setCharityPercent] = useState(
    currentUser?.charity_percentage || 15
  );

  if (!currentUser) {
    return (
      <div className="max-w-md mx-auto py-20 px-4 text-center space-y-4">
        <h2 className="text-xl font-bold text-white">Please Sign In</h2>
        <p className="text-sm text-slate-400">
          You must be logged in to view your golfer dashboard and scores.
        </p>
      </div>
    );
  }

  const isSubscribed = currentSubscription?.status === 'active';
  const latestDraw = state.draws[0];

  // Open modal for adding/editing score
  const handleOpenScoreModal = (score?: GolfScore) => {
    setScoreError(null);
    if (score) {
      setEditingScore(score);
      setScoreCourse(score.course_name || '');
      setScoreDate(score.score_date);
      setScorePoints(score.score);
      setScoreNotes('');
    } else {
      setEditingScore(null);
      setScoreCourse('');
      setScoreDate(new Date().toISOString().split('T')[0]);
      setScorePoints(36);
      setScoreNotes('');
    }
    setIsScoreModalOpen(true);
  };

  const handleSaveScore = (e: React.FormEvent) => {
    e.preventDefault();
    setScoreError(null);

    // Range check: 1 - 45
    if (scorePoints < 1 || scorePoints > 45) {
      setScoreError('Stableford score must be between 1 and 45 points.');
      return;
    }

    if (!scoreCourse.trim()) {
      setScoreError('Please enter the golf course name.');
      return;
    }

    // Duplicate date check for this user (unless editing same score)
    const existingDate = userScores.find(
      (s) => s.score_date === scoreDate && (!editingScore || s.id !== editingScore.id)
    );
    if (existingDate) {
      setScoreError(
        'You already logged a score for ' +
          scoreDate +
          '. Duplicate rounds on the same date are prohibited by rules.'
      );
      return;
    }

    if (editingScore) {
      actions.updateScore(editingScore.id, scorePoints, scoreDate, scoreCourse);
    } else {
      actions.addScore(currentUser.id, scorePoints, scoreDate, scoreCourse);
    }

    setIsScoreModalOpen(false);
  };

  const handleDeleteScore = (scoreId: string) => {
    if (confirm('Are you sure you want to delete this golf round?')) {
      actions.deleteScore(scoreId);
    }
  };

  const handleSaveCharityPercentage = () => {
    actions.updateUserCharity(currentUser.id, currentUser.selected_charity_id, charityPercent);
    alert('Charity contribution updated to ' + charityPercent + '%!');
  };

  const handleSimulateProofUpload = () => {
    if (!uploadingWinner) return;

    // Use default scorecard screenshot placeholder or user provided URL
    const demoProofUrl =
      proofUrl ||
      'https://images.unsplash.com/photo-1593111774240-d529f12cf4bb?w=800&auto=format&fit=crop&q=80';

    actions.uploadWinnerProof(uploadingWinner.id, demoProofUrl, proofNote);
    setProofUploaded(true);

    confetti({
      particleCount: 50,
      spread: 60,
      origin: { y: 0.6 },
    });

    setTimeout(() => {
      setProofUploaded(false);
      setUploadingWinner(null);
      setProofUrl('');
      setProofNote('');
    }, 1500);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      {/* Top Welcome / Status Bar */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 p-6 rounded-3xl bg-gradient-to-r from-[#0f1626] to-[#090d16] border border-slate-800 shadow-xl">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-700 flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-emerald-950/40">
            {currentUser.full_name.charAt(0)}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold text-white font-heading">
                {currentUser.full_name}
              </h1>
              <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                GOLFER
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Member ID: <span className="font-mono">{currentUser.id.slice(0, 10)}</span> •{' '}
              {currentUser.email}
            </p>
          </div>
        </div>

        {/* Subscription Status pill */}
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-slate-900/80 border border-slate-800 text-right">
            <div className="text-[10px] uppercase font-semibold text-slate-400">
              Subscription Status
            </div>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span
                className={`w-2 h-2 rounded-full ${
                  isSubscribed ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'
                }`}
              />
              <span className="text-xs font-bold text-white uppercase">
                {isSubscribed ? `${currentSubscription?.plan} Plan (Active)` : 'Inactive / Free'}
              </span>
            </div>
          </div>

          {!isSubscribed ? (
            <button
              onClick={onOpenStripeModal}
              className="px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shadow-md shadow-emerald-950/40 transition-colors"
            >
              Activate Entry ({state.settings.currency_symbol}{state.settings.monthly_price})
            </button>
          ) : (
            <button
              onClick={onOpenStripeModal}
              className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium border border-slate-700 transition-colors"
            >
              Change Plan
            </button>
          )}
        </div>
      </div>

      {/* Official Rolling 5 Numbers Banner */}
      <div className="rounded-3xl bg-gradient-to-br from-[#11192e] to-[#0c111e] border border-emerald-500/30 p-6 sm:p-8 shadow-2xl relative overflow-hidden space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 uppercase tracking-wider">
                Official Monthly Entry
              </span>
              <h2 className="text-xl sm:text-2xl font-extrabold text-white font-heading">
                Your Rolling 5 Draw Numbers
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-slate-300 mt-1">
              Automatically derived from your latest 5 logged rounds in reverse chronological order.
            </p>
          </div>

          <button
            onClick={() => handleOpenScoreModal()}
            className="px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shadow-lg shadow-emerald-950/40 transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Log New Golf Round</span>
          </button>
        </div>

        {/* 5 Rolling Balls display */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 pt-2">
          {Array.from({ length: 5 }).map((_, index) => {
            const scoreItem = rollingScores[index];
            return (
              <div
                key={index}
                className={`p-4 rounded-2xl border text-center relative overflow-hidden transition-all ${
                  scoreItem
                    ? 'bg-slate-900/90 border-slate-700 shadow-md'
                    : 'bg-slate-950/40 border-dashed border-slate-800'
                }`}
              >
                <div className="text-[10px] uppercase font-bold text-slate-400">
                  Round #{index + 1}
                </div>

                {scoreItem ? (
                  <div className="space-y-2 mt-2">
                    <div className="w-14 h-14 mx-auto rounded-full bg-gradient-to-b from-emerald-400 to-teal-600 text-slate-950 font-black text-2xl font-mono flex items-center justify-center shadow-lg shadow-emerald-950/50">
                      {scoreItem.score}
                    </div>
                    <div className="text-xs font-semibold text-white truncate" title={scoreItem.course_name}>
                      {scoreItem.course_name}
                    </div>
                    <div className="text-[10px] text-slate-400 font-mono">
                      {scoreItem.score_date}
                    </div>
                  </div>
                ) : (
                  <div className="py-5 space-y-1">
                    <div className="w-12 h-12 mx-auto rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-600 font-mono font-bold text-lg">
                      ?
                    </div>
                    <div className="text-[11px] text-slate-500">Need Round</div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {rollingScores.length < 5 && (
          <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-xs text-amber-300 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>
              You have {rollingScores.length} of 5 required rounds logged. Add{' '}
              {5 - rollingScores.length} more round(s) to complete your official lottery ticket for the monthly draw.
            </span>
          </div>
        )}
      </div>

      {/* 2-Column Grid: Winnings & Charity Beneficiary */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left 2 Cols: My Scores History & Winnings */}
        <div className="lg:col-span-2 space-y-8">
          {/* My Winnings & Verification Status */}
          <div className="rounded-3xl bg-slate-900/60 border border-slate-800 p-6 space-y-5">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Trophy className="w-5 h-5 text-amber-400" />
                <h3 className="text-base font-bold text-white">
                  My Draw Winnings & Prize Claims
                </h3>
              </div>
              <span className="text-xs text-slate-400">
                {userWinnings.length} winning record(s)
              </span>
            </div>

            {userWinnings.length === 0 ? (
              <div className="py-8 text-center text-xs text-slate-400 space-y-2">
                <Target className="w-8 h-8 text-slate-600 mx-auto" />
                <p>No prize winnings yet. Next draw occurs at month-end!</p>
              </div>
            ) : (
              <div className="space-y-3">
                {userWinnings.map((w) => (
                  <div
                    key={w.id}
                    className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-white text-sm">
                          {w.match_type} of 5 Match Win
                        </span>
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                            w.verification_status === 'approved'
                              ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                              : w.verification_status === 'rejected'
                              ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                              : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                          }`}
                        >
                          {w.verification_status}
                        </span>
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-mono ${
                            w.payment_status === 'paid'
                              ? 'bg-sky-500/20 text-sky-400'
                              : 'bg-slate-800 text-slate-400'
                          }`}
                        >
                          Payout: {w.payment_status}
                        </span>
                      </div>
                      <div className="text-slate-400">
                        Prize: <strong className="text-amber-400 font-mono">{state.settings.currency_symbol}{w.prize_amount.toLocaleString()}</strong> • Draw: {w.draw_title}
                      </div>
                      {w.proof_url && (
                        <div className="text-[11px] text-emerald-400 flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" />
                          <span>Scorecard screenshot uploaded</span>
                        </div>
                      )}
                    </div>

                    <div>
                      {!w.proof_url && w.verification_status === 'pending' ? (
                        <button
                          onClick={() => setUploadingWinner(w)}
                          className="px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                        >
                          <Upload className="w-3.5 h-3.5" />
                          <span>Upload Score Proof</span>
                        </button>
                      ) : (
                        <span className="text-slate-400 text-[11px] italic">
                          {w.payment_status === 'paid'
                            ? 'Paid to bank/card'
                            : 'In admin verification queue'}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Full Logged Scores Ledger */}
          <div className="rounded-3xl bg-slate-900/60 border border-slate-800 p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h3 className="text-base font-bold text-white">
                  Score Ledger ({userScores.length} rounds logged)
                </h3>
                <p className="text-xs text-slate-400">
                  Sorted newest to oldest. Top 5 active in current draw.
                </p>
              </div>

              <button
                onClick={() => handleOpenScoreModal()}
                className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                Add Round
              </button>
            </div>

            {userScores.length === 0 ? (
              <div className="py-8 text-center text-xs text-slate-400">
                No scores logged yet. Click "Log New Golf Round" to get started!
              </div>
            ) : (
              <div className="divide-y divide-slate-800/80">
                {userScores.map((sc, idx) => {
                  const isTop5 = idx < 5;
                  return (
                    <div
                      key={sc.id}
                      className="py-3 flex items-center justify-between text-xs"
                    >
                      <div className="flex items-center gap-3">
                        <span
                          className={`w-7 h-7 rounded-lg flex items-center justify-center font-mono font-bold ${
                            isTop5
                              ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                              : 'bg-slate-800 text-slate-500'
                          }`}
                        >
                          #{idx + 1}
                        </span>
                        <div>
                          <div className="font-semibold text-white flex items-center gap-2">
                            <span>{sc.course_name}</span>
                            {isTop5 && (
                              <span className="text-[10px] px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-400 font-semibold">
                                IN DRAW
                              </span>
                            )}
                          </div>
                          <div className="text-[11px] text-slate-400">
                            {sc.score_date}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <span className="text-base font-bold font-mono text-white">
                            {sc.score}
                          </span>
                          <span className="text-[10px] text-slate-400 block">
                            pts
                          </span>
                        </div>

                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => handleOpenScoreModal(sc)}
                            className="p-1.5 text-slate-400 hover:text-white rounded hover:bg-slate-800"
                            title="Edit"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteScore(sc.id)}
                            className="p-1.5 text-slate-400 hover:text-rose-400 rounded hover:bg-slate-800"
                            title="Delete"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Charity & Impact */}
        <div className="space-y-6">
          {/* Charity Card */}
          <div className="rounded-3xl bg-slate-900/60 border border-slate-800 p-6 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-rose-400 flex items-center gap-1.5">
                <Heart className="w-3.5 h-3.5" />
                My Charity Beneficiary
              </span>
              <button
                onClick={() => onNavigate('charities')}
                className="text-xs text-emerald-400 hover:underline font-medium"
              >
                Change Charity
              </button>
            </div>

            {currentCharity ? (
              <div className="space-y-4">
                <div className="rounded-2xl overflow-hidden border border-slate-800 relative h-36">
                  <img
                    src={currentCharity.image_url}
                    alt={currentCharity.name}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent" />
                  <div className="absolute bottom-2 left-3 right-3">
                    <h4 className="font-bold text-white text-sm truncate">
                      {currentCharity.name}
                    </h4>
                    <span className="text-[10px] text-slate-300">
                      {currentCharity.category}
                    </span>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-300 font-semibold">
                      My Giving Percentage:
                    </span>
                    <span className="text-rose-400 font-bold font-mono">
                      {charityPercent}%
                    </span>
                  </div>
                  <input
                    type="range"
                    min={state.settings.charity_min_percentage}
                    max={50}
                    step={5}
                    value={charityPercent}
                    onChange={(e) => setCharityPercent(Number(e.target.value))}
                    className="w-full accent-rose-500 h-1.5 bg-slate-700 rounded-lg cursor-pointer"
                  />
                  {charityPercent !== currentUser.charity_percentage && (
                    <button
                      onClick={handleSaveCharityPercentage}
                      className="w-full py-1.5 rounded-lg bg-rose-500 hover:bg-rose-400 text-slate-950 font-bold text-xs transition-colors"
                    >
                      Save New Percentage
                    </button>
                  )}
                </div>

                <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 text-xs space-y-1">
                  <div className="flex justify-between text-slate-400">
                    <span>Total Donated So Far:</span>
                    <span className="text-white font-mono font-bold">
                      {state.settings.currency_symbol}
                      {Math.round(
                        (currentSubscription ? 20 : 0) * (charityPercent / 100)
                      )}
                    </span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>Charity Community Total:</span>
                    <span className="text-rose-400 font-mono font-bold">
                      {state.settings.currency_symbol}
                      {currentCharity.total_raised.toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="py-6 text-center text-xs text-slate-400 space-y-2">
                <p>You have not selected a charity yet.</p>
                <button
                  onClick={() => onNavigate('charities')}
                  className="px-3 py-1.5 rounded-lg bg-emerald-500 text-slate-950 font-bold"
                >
                  Browse Charities
                </button>
              </div>
            )}
          </div>

          {/* Quick Rules Reminder */}
          <div className="p-5 rounded-2xl bg-slate-900/40 border border-slate-800/80 text-xs space-y-2 text-slate-400">
            <div className="font-semibold text-white flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              Draw Compliance Check
            </div>
            <p className="leading-relaxed">
              Ensure you log Stableford scores honestly. Scores are cross-referenced with your official club certificate or golf app screenshot upon winning.
            </p>
          </div>
        </div>
      </div>

      {/* Score Modal (Add / Edit) */}
      {isScoreModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="relative w-full max-w-md rounded-2xl bg-[#0f1422] border border-slate-700 p-6 sm:p-8 text-slate-100 shadow-2xl space-y-5">
            <button
              onClick={() => setIsScoreModalOpen(false)}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center">
                <Target className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">
                  {editingScore ? 'Edit Golf Round' : 'Log New Golf Round'}
                </h3>
                <p className="text-xs text-slate-400">
                  Stableford points (1 to 45)
                </p>
              </div>
            </div>

            {scoreError && (
              <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs">
                {scoreError}
              </div>
            )}

            <form onSubmit={handleSaveScore} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Golf Course Name
                </label>
                <input
                  type="text"
                  required
                  value={scoreCourse}
                  onChange={(e) => setScoreCourse(e.target.value)}
                  placeholder="e.g. St Andrews Old Course"
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Date Played
                  </label>
                  <input
                    type="date"
                    required
                    value={scoreDate}
                    onChange={(e) => setScoreDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Stableford Points (1-45)
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={45}
                    required
                    value={scorePoints}
                    onChange={(e) => setScorePoints(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white font-mono font-bold text-sm focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Notes / Competition Name (Optional)
                </label>
                <input
                  type="text"
                  value={scoreNotes}
                  onChange={(e) => setScoreNotes(e.target.value)}
                  placeholder="e.g. Monthly Medal, sunny round"
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsScoreModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold hover:bg-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shadow-md shadow-emerald-950/40"
                >
                  {editingScore ? 'Update Round' : 'Save Round to Ledger'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Scorecard Proof Upload Modal */}
      {uploadingWinner && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="relative w-full max-w-md rounded-2xl bg-[#0f1422] border border-slate-700 p-6 sm:p-8 text-slate-100 shadow-2xl space-y-5">
            <button
              onClick={() => setUploadingWinner(null)}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
            >
              <X className="w-5 h-5" />
            </button>

            {proofUploaded ? (
              <div className="py-8 text-center space-y-3">
                <div className="w-14 h-14 mx-auto rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-bold text-white">Scorecard Submitted!</h3>
                <p className="text-xs text-slate-300">
                  Our compliance team has received your verification document.
                  Payout will be released once verified.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center">
                    <Upload className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-white">
                      Upload Scorecard Verification
                    </h3>
                    <p className="text-xs text-slate-400">
                      Prize:{' '}
                      <span className="text-amber-400 font-bold">
                        {state.settings.currency_symbol}
                        {uploadingWinner.prize_amount.toLocaleString()}
                      </span>
                    </p>
                  </div>
                </div>

                <p className="text-xs text-slate-300 leading-relaxed">
                  To prevent fraudulent claims, please provide proof of your Stableford
                  scores (signed club scorecard photo, England Golf WHS screenshot, or GolfNow handicap export).
                </p>

                {/* Simulated file upload dropzone */}
                <div className="border-2 border-dashed border-slate-700 rounded-2xl p-6 text-center bg-slate-900/60 hover:border-emerald-500/60 transition-colors space-y-2 cursor-pointer">
                  <FileText className="w-8 h-8 text-slate-500 mx-auto" />
                  <div className="text-xs font-semibold text-slate-200">
                    Click to browse or drag & drop scorecard image
                  </div>
                  <div className="text-[10px] text-slate-400">
                    PNG, JPG, PDF up to 10MB
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Or Paste Image URL / Club Portal Link
                  </label>
                  <input
                    type="text"
                    value={proofUrl}
                    onChange={(e) => setProofUrl(e.target.value)}
                    placeholder="https://example.com/scorecard.jpg"
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Verification Notes (Optional)
                  </label>
                  <input
                    type="text"
                    value={proofNote}
                    onChange={(e) => setProofNote(e.target.value)}
                    placeholder="e.g. Attested by Club Pro John Smith"
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <button
                  type="button"
                  onClick={handleSimulateProofUpload}
                  className="w-full py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shadow-md shadow-emerald-950/40 transition-colors"
                >
                  Submit Scorecard for Verification
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
