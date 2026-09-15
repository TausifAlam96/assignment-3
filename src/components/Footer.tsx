import React from 'react';
import { Target, Heart, ShieldCheck, Mail, ArrowUpRight } from 'lucide-react';
import { useStore } from '../services/store';

interface FooterProps {
  onNavigate: (view: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate }) => {
  const { state } = useStore();

  return (
    <footer className="border-t border-slate-800/80 bg-[#070a10] text-slate-400 text-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand Col */}
          <div className="space-y-3 md:col-span-1">
            <div
              className="flex items-center gap-2 cursor-pointer"
              onClick={() => onNavigate('home')}
            >
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-700 flex items-center justify-center text-white shadow-md">
                <Target className="w-4 h-4 text-white" />
              </div>
              <span className="font-bold text-white tracking-tight text-sm font-heading">
                DIGITAL HEROES
              </span>
            </div>
            <p className="text-slate-400 text-xs leading-relaxed">
              The ethical golf lottery where your rolling Stableford scores power
              compelling cash prizes and guaranteed charity funding.
            </p>
            <div className="text-[11px] text-slate-500">
              Registered Charity Partner Network • Gambling Commission & Charity Commission Compliant
            </div>
          </div>

          {/* Quick links */}
          <div className="space-y-2">
            <h4 className="font-semibold text-white text-xs uppercase tracking-wider">
              Navigation
            </h4>
            <ul className="space-y-1.5">
              <li>
                <button
                  onClick={() => onNavigate('home')}
                  className="hover:text-emerald-400 transition-colors"
                >
                  Home & Jackpots
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('charities')}
                  className="hover:text-emerald-400 transition-colors"
                >
                  Vetted Charities Directory
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('how-it-works')}
                  className="hover:text-emerald-400 transition-colors"
                >
                  How It Works & Stableford Rules
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('pricing')}
                  className="hover:text-emerald-400 transition-colors"
                >
                  Membership Pricing
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('dashboard')}
                  className="hover:text-emerald-400 transition-colors"
                >
                  Golfer Dashboard
                </button>
              </li>
            </ul>
          </div>

          {/* Fair Play & Charity Commitment */}
          <div className="space-y-2">
            <h4 className="font-semibold text-white text-xs uppercase tracking-wider">
              Integrity & Standards
            </h4>
            <ul className="space-y-1.5 text-[11px] text-slate-400">
              <li className="flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                <span>Strict Scorecard Verification Prior to Payouts</span>
              </li>
              <li className="flex items-center gap-1.5">
                <Heart className="w-3.5 h-3.5 text-rose-400 flex-shrink-0" />
                <span>Minimum 10% Guaranteed to Vetted Charities</span>
              </li>
              <li className="flex items-center gap-1.5">
                <Target className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />
                <span>Rolling 5 Scores (1-45 Stableford Range Check)</span>
              </li>
            </ul>
          </div>

          {/* Contact / Help */}
          <div className="space-y-2">
            <h4 className="font-semibold text-white text-xs uppercase tracking-wider">
              Contact & Compliance
            </h4>
            <p className="text-xs text-slate-400">
              Need assistance with your golf club certification or handicap sync?
            </p>
            <div className="pt-1">
              <a
                href="mailto:support@digitalheroesgolf.org"
                className="inline-flex items-center gap-1.5 text-xs text-emerald-400 hover:text-emerald-300 font-medium"
              >
                <Mail className="w-3.5 h-3.5" />
                <span>support@digitalheroesgolf.org</span>
              </a>
            </div>
          </div>
        </div>

        <div className="pt-8 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-slate-500">
          <div>
            © {new Date().getFullYear()} Digital Heroes Golf & Charity Lottery. All rights reserved.
          </div>
          <div className="flex items-center gap-4">
            <span className="hover:text-slate-400 cursor-pointer">Terms of Play</span>
            <span>•</span>
            <span className="hover:text-slate-400 cursor-pointer">Charity Charter</span>
            <span>•</span>
            <span className="hover:text-slate-400 cursor-pointer">Responsible Gaming (18+)</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
