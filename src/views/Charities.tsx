import React, { useState } from 'react';
import { useStore } from '../services/store';
import { Charity } from '../types';
import {
  Heart,
  Search,
  ExternalLink,
  CheckCircle2,
  Calendar,
  DollarSign,
  ArrowRight,
  ShieldCheck,
  Award,
  Sparkles,
} from 'lucide-react';

interface CharitiesProps {
  onOpenAuthModal: (mode: 'login' | 'register') => void;
}

export const Charities: React.FC<CharitiesProps> = ({ onOpenAuthModal }) => {
  const { state, currentUser, actions } = useStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [directDonationModalCharity, setDirectDonationModalCharity] = useState<Charity | null>(null);
  const [directDonationAmount, setDirectDonationAmount] = useState<number>(50);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const categories = [
    'All',
    'Youth & Education',
    'Cancer & Health',
    'Veterans & First Responders',
    'Environmental',
    'Junior Golf',
  ];

  const filteredCharities = state.charities.filter((charity) => {
    const matchesCategory =
      selectedCategory === 'All' || charity.category === selectedCategory;
    const matchesSearch =
      charity.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      charity.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleSelectAsBeneficiary = (charityId: string) => {
    if (!currentUser) {
      onOpenAuthModal('register');
      return;
    }

    const res = actions.updateUserCharity(
      currentUser.id,
      charityId,
      currentUser.charity_percentage || 15
    );
    if (res.success) {
      setSuccessMessage('Successfully set as your primary lottery charity!');
      setTimeout(() => setSuccessMessage(null), 4000);
    }
  };

  const handleDirectDonation = (e: React.FormEvent) => {
    e.preventDefault();
    if (!directDonationModalCharity) return;

    const res = actions.donateDirectly(
      currentUser?.id || 'anonymous',
      directDonationModalCharity.id,
      directDonationAmount
    );

    setDirectDonationModalCharity(null);
    setSuccessMessage(res.message);
    setTimeout(() => setSuccessMessage(null), 4500);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <span className="text-xs font-bold uppercase tracking-wider text-rose-400 bg-rose-500/10 px-3 py-1 rounded-full border border-rose-500/20">
          Vetted Non-Profit Network
        </span>
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white font-heading">
          Choose The Cause You Play For
        </h1>
        <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
          Every month, a percentage of your Digital Heroes subscription goes
          directly to your chosen charity. You can switch your designated
          charity anytime.
        </p>
      </div>

      {successMessage && (
        <div className="p-4 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-sm flex items-center justify-between animate-in fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
            <span>{successMessage}</span>
          </div>
          <button
            onClick={() => setSuccessMessage(null)}
            className="text-xs text-emerald-400 hover:text-white"
          >
            ✕
          </button>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 p-4 rounded-2xl bg-slate-900/60 border border-slate-800">
        <div className="relative w-full md:w-80">
          <input
            type="text"
            placeholder="Search charities by name or cause..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-rose-500"
          />
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-2 md:pb-0">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors ${
                selectedCategory === cat
                  ? 'bg-rose-500 text-white shadow-md'
                  : 'bg-slate-800/80 text-slate-400 hover:text-white'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Charity Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCharities.map((charity) => {
          const isSelectedByCurrent =
            currentUser?.selected_charity_id === charity.id;

          return (
            <div
              key={charity.id}
              className={`rounded-2xl bg-slate-900/70 border overflow-hidden flex flex-col justify-between transition-all ${
                isSelectedByCurrent
                  ? 'border-rose-500/80 shadow-lg shadow-rose-950/40 ring-1 ring-rose-500/40'
                  : 'border-slate-800 hover:border-slate-700'
              }`}
            >
              <div>
                {/* Image */}
                <div className="h-48 relative overflow-hidden bg-slate-950">
                  <img
                    src={charity.image_url}
                    alt={charity.name}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent opacity-80" />

                  <span className="absolute top-3 left-3 text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded bg-slate-950/90 text-slate-200 backdrop-blur-md border border-slate-700/60">
                    {charity.category}
                  </span>

                  {isSelectedByCurrent && (
                    <span className="absolute top-3 right-3 text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-rose-500 text-white flex items-center gap-1 shadow-md">
                      <Heart className="w-3 h-3 fill-white" />
                      Your Active Charity
                    </span>
                  )}

                  <div className="absolute bottom-3 left-3 right-3">
                    <h3 className="text-lg font-bold text-white leading-snug drop-shadow-md">
                      {charity.name}
                    </h3>
                  </div>
                </div>

                {/* Body Content */}
                <div className="p-5 space-y-4">
                  <p className="text-xs text-slate-300 leading-relaxed line-clamp-3">
                    {charity.description}
                  </p>

                  <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80 space-y-1">
                    <div className="text-[11px] text-slate-400 font-semibold uppercase tracking-wider">
                      Charity Mission
                    </div>
                    <p className="text-xs text-slate-300 italic">
                      "{charity.mission}"
                    </p>
                  </div>

                  {/* Impact Stats */}
                  <div className="grid grid-cols-2 gap-2 text-xs pt-1">
                    <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800">
                      <span className="text-[11px] text-slate-400">Total Funded:</span>
                      <div className="text-sm font-bold text-rose-400 font-mono mt-0.5">
                        {state.settings.currency_symbol}
                        {charity.total_raised.toLocaleString()}
                      </div>
                    </div>

                    <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800">
                      <span className="text-[11px] text-slate-400">Status:</span>
                      <div className="text-xs font-bold text-emerald-400 mt-0.5 flex items-center gap-1">
                        <ShieldCheck className="w-3.5 h-3.5" />
                        Verified Non-Profit
                      </div>
                    </div>
                  </div>

                  {/* Upcoming Golf Days / Events */}
                  {charity.upcoming_events && charity.upcoming_events.length > 0 && (
                    <div className="pt-2 border-t border-slate-800/80 space-y-2">
                      <span className="text-[11px] font-semibold text-slate-400 flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-amber-400" />
                        Upcoming Charity Golf Day:
                      </span>
                      <div className="text-xs text-slate-300 bg-slate-950/40 p-2 rounded-lg border border-slate-800">
                        <strong className="text-white block">
                          {charity.upcoming_events[0].title}
                        </strong>
                        <span className="text-[11px] text-slate-400">
                          {charity.upcoming_events[0].date} • {charity.upcoming_events[0].location}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Bottom Action Footer */}
              <div className="p-5 pt-0 flex items-center gap-2">
                <button
                  onClick={() => handleSelectAsBeneficiary(charity.id)}
                  className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                    isSelectedByCurrent
                      ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                      : 'bg-emerald-500 hover:bg-emerald-400 text-slate-950'
                  }`}
                >
                  <Heart className={`w-3.5 h-3.5 ${isSelectedByCurrent ? 'fill-rose-400' : ''}`} />
                  <span>{isSelectedByCurrent ? 'Selected Cause' : 'Select As Cause'}</span>
                </button>

                <button
                  onClick={() => setDirectDonationModalCharity(charity)}
                  className="py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 flex items-center gap-1"
                  title="Make a one-off tax-deductible gift"
                >
                  <DollarSign className="w-3.5 h-3.5 text-amber-400" />
                  <span>Donate</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Direct Donation Modal */}
      {directDonationModalCharity && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="relative w-full max-w-md rounded-2xl bg-[#0f1422] border border-slate-700 p-6 text-slate-100 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Heart className="w-4 h-4 text-rose-400" />
                Direct Gift to {directDonationModalCharity.name}
              </h3>
              <button
                onClick={() => setDirectDonationModalCharity(null)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-slate-300">
              Make an instant one-off donation. 100% of direct donations go to
              the non-profit organization.
            </p>

            <form onSubmit={handleDirectDonation} className="space-y-4 text-xs">
              <div className="grid grid-cols-4 gap-2">
                {[25, 50, 100, 250].map((amt) => (
                  <button
                    key={amt}
                    type="button"
                    onClick={() => setDirectDonationAmount(amt)}
                    className={`py-2 rounded-xl font-bold border transition-colors ${
                      directDonationAmount === amt
                        ? 'bg-rose-500 text-white border-rose-400'
                        : 'bg-slate-900 text-slate-300 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    {state.settings.currency_symbol}
                    {amt}
                  </button>
                ))}
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-semibold">
                  Custom Donation Amount ({state.settings.currency_symbol})
                </label>
                <input
                  type="number"
                  min={5}
                  value={directDonationAmount}
                  onChange={(e) => setDirectDonationAmount(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white font-mono font-bold"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setDirectDonationModalCharity(null)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-rose-500 hover:bg-rose-400 text-white font-bold shadow-md shadow-rose-950/40"
                >
                  Complete {state.settings.currency_symbol}
                  {directDonationAmount} Gift
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
