/**
 * Digital Heroes - Types & Interfaces
 * Specification based on Level 1 PRD 2026 Edition
 */

export type UserRole = 'user' | 'admin' | 'public';

export type SubscriptionPlan = 'monthly' | 'yearly';
export type SubscriptionStatus = 'active' | 'inactive' | 'cancelled' | 'past_due';

export interface Profile {
  id: string;
  full_name: string;
  email: string;
  role: UserRole;
  selected_charity_id: string;
  charity_percentage: number; // minimum 10%
  handicap?: number;
  home_club?: string;
  avatar_url?: string;
  created_at: string;
  updated_at: string;
}

export interface Subscription {
  id: string;
  user_id: string;
  plan: SubscriptionPlan;
  stripe_customer_id?: string;
  stripe_subscription_id?: string;
  status: SubscriptionStatus;
  start_date: string;
  renewal_date: string;
  cancelled_at?: string | null;
  created_at: string;
  amount_cents: number;
  charity_percentage: number;
}

export interface GolfScore {
  id: string;
  user_id: string;
  score: number; // 1 - 45 Stableford
  score_date: string; // YYYY-MM-DD
  course_name?: string;
  created_at: string;
  updated_at: string;
}

export interface UpcomingCharityEvent {
  id: string;
  title: string;
  date: string;
  location: string;
  description: string;
}

export interface Charity {
  id: string;
  name: string;
  category: 'Youth & Education' | 'Cancer & Health' | 'Veterans & First Responders' | 'Environmental' | 'Junior Golf';
  description: string;
  mission: string;
  impact_statement: string;
  image_url: string;
  logo_url: string;
  website_url: string;
  is_featured: boolean;
  is_active: boolean;
  total_raised: number;
  upcoming_events: UpcomingCharityEvent[];
  created_at: string;
  updated_at: string;
}

export type DrawType = 'random' | 'algorithmic';
export type DrawStatus = 'draft' | 'simulated' | 'published' | 'completed';

export interface Draw {
  id: string;
  title: string;
  draw_date: string; // YYYY-MM-DD
  draw_type: DrawType;
  winning_numbers: number[]; // 5 unique numbers 1-45
  status: DrawStatus;
  total_prize_pool: number; // in USD or INR equivalent
  jackpot_rollover: number; // previous rollover carried into this draw
  new_jackpot_rollover: number; // amount rolled over if tier 5 has 0 winners
  subscribers_count: number;
  tier_5_pool: number; // 40% + rollover
  tier_4_pool: number; // 35%
  tier_3_pool: number; // 25%
  simulated_at?: string | null;
  published_at?: string | null;
  created_at: string;
}

export interface DrawResult {
  id: string;
  draw_id: string;
  user_id: string;
  user_name: string;
  user_email: string;
  user_scores: number[];
  match_type: 5 | 4 | 3 | 0;
  matched_numbers: number[];
  prize_amount: number;
}

export type WinnerVerificationStatus = 'pending' | 'approved' | 'rejected';
export type WinnerPaymentStatus = 'pending' | 'paid';

export interface Winner {
  id: string;
  user_id: string;
  user_name: string;
  user_email: string;
  draw_id: string;
  draw_title: string;
  draw_date: string;
  match_type: 5 | 4 | 3;
  prize_amount: number;
  matched_numbers: number[];
  user_scores: number[];
  proof_url: string | null;
  proof_notes?: string;
  verification_status: WinnerVerificationStatus;
  payment_status: WinnerPaymentStatus;
  rejection_reason?: string;
  created_at: string;
  verified_at?: string | null;
  paid_at?: string | null;
}

export interface PlatformSettings {
  prize_pool_percentage: number; // e.g. 20%
  charity_min_percentage: number; // 10%
  monthly_price: number; // e.g. 25
  yearly_price: number; // e.g. 240
  current_jackpot_rollover: number; // accumulated rollover
  currency_symbol: string; // e.g. "$" or "₹"
}

export interface CharityDonation {
  id: string;
  user_id: string;
  user_name: string;
  charity_id: string;
  charity_name: string;
  amount: number;
  donation_type: 'subscription_cut' | 'direct_donation';
  created_at: string;
}

export interface SimulationResult {
  draw: Draw;
  matchedUsers: {
    tier5: DrawResult[];
    tier4: DrawResult[];
    tier3: DrawResult[];
    unmatched: DrawResult[];
  };
  payouts: {
    tier5PerWinner: number;
    tier4PerWinner: number;
    tier3PerWinner: number;
    willRollover: boolean;
    rolloverAmount: number;
  };
}
