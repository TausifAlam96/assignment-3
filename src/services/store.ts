/**
 * Digital Heroes - Centralized State & Data Layer
 * Handles local persistence, Supabase hooks, and PRD business logic
 */

import { useState, useEffect } from 'react';
import {
  Charity,
  CharityDonation,
  Draw,
  DrawResult,
  GolfScore,
  PlatformSettings,
  Profile,
  SimulationResult,
  Subscription,
  SubscriptionPlan,
  Winner,
} from '../types';
import {
  INITIAL_CHARITIES,
  INITIAL_DRAWS,
  INITIAL_PROFILES,
  INITIAL_SCORES,
  INITIAL_SETTINGS,
  INITIAL_SUBSCRIPTIONS,
  INITIAL_WINNERS,
} from './seedData';
import { simulateMonthlyDraw } from './drawEngine';

const STORAGE_KEY = 'digital_heroes_app_state_v2';

interface AppState {
  currentUserId: string | null;
  profiles: Profile[];
  subscriptions: Subscription[];
  scores: GolfScore[];
  charities: Charity[];
  draws: Draw[];
  drawResults: DrawResult[];
  winners: Winner[];
  donations: CharityDonation[];
  settings: PlatformSettings;
}

function loadInitialState(): AppState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && Array.isArray(parsed.profiles) && Array.isArray(parsed.charities)) {
        return parsed;
      }
    }
  } catch (e) {
    console.error('Failed to load local state, using seed defaults', e);
  }

  return {
    currentUserId: 'usr-tausif', // Default to Demo Subscriber
    profiles: INITIAL_PROFILES,
    subscriptions: INITIAL_SUBSCRIPTIONS,
    scores: INITIAL_SCORES,
    charities: INITIAL_CHARITIES,
    draws: INITIAL_DRAWS,
    drawResults: [],
    winners: INITIAL_WINNERS,
    donations: [
      {
        id: 'don-1',
        user_id: 'usr-tausif',
        user_name: 'Tausif Alam',
        charity_id: 'charity-1',
        charity_name: 'Youth On Course Foundation',
        amount: 150,
        donation_type: 'subscription_cut',
        created_at: '2026-08-01T00:00:00.000Z',
      },
    ],
    settings: INITIAL_SETTINGS,
  };
}

let state: AppState = loadInitialState();
const listeners = new Set<() => void>();

function notify() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (e) {
    console.error('Failed to persist state', e);
  }
  listeners.forEach((fn) => fn());
}

export function useStore() {
  const [, setTick] = useState(0);

  useEffect(() => {
    const cb = () => setTick((t) => t + 1);
    listeners.add(cb);
    return () => {
      listeners.delete(cb);
    };
  }, []);

  const currentUser = state.profiles.find((p) => p.id === state.currentUserId) || null;
  const currentSubscription = currentUser
    ? state.subscriptions.find((s) => s.user_id === currentUser.id) || null
    : null;
  const currentCharity = currentUser
    ? state.charities.find((c) => c.id === currentUser.selected_charity_id) || null
    : null;
  const userScores = currentUser
    ? state.scores
        .filter((s) => s.user_id === currentUser.id)
        .sort((a, b) => new Date(b.score_date).getTime() - new Date(a.score_date).getTime())
    : [];
  const userWinners = currentUser
    ? state.winners
        .filter((w) => w.user_id === currentUser.id)
        .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    : [];

  return {
    state,
    currentUser,
    currentSubscription,
    currentCharity,
    userScores,
    userWinners,
    actions,
  };
}

export const actions = {
  // ------------------- AUTHENTICATION -------------------
  login(email: string): { success: boolean; message: string; profile?: Profile } {
    const profile = state.profiles.find((p) => p.email.toLowerCase() === email.trim().toLowerCase());
    if (!profile) {
      return { success: false, message: 'No account found with this email address.' };
    }
    state.currentUserId = profile.id;
    notify();
    return { success: true, message: `Welcome back, ${profile.full_name}!`, profile };
  },

  register(data: {
    full_name: string;
    email: string;
    selected_charity_id: string;
    charity_percentage: number;
    plan: SubscriptionPlan;
    handicap?: number;
    home_club?: string;
  }): { success: boolean; message: string; profile?: Profile } {
    const existing = state.profiles.find((p) => p.email.toLowerCase() === data.email.trim().toLowerCase());
    if (existing) {
      return { success: false, message: 'An account with this email already exists. Please log in.' };
    }

    const newId = `usr-${Date.now()}`;
    const charityPercentage = Math.max(state.settings.charity_min_percentage, data.charity_percentage || 10);

    const newProfile: Profile = {
      id: newId,
      full_name: data.full_name.trim(),
      email: data.email.trim().toLowerCase(),
      role: 'user',
      selected_charity_id: data.selected_charity_id || state.charities[0]?.id || 'charity-1',
      charity_percentage: charityPercentage,
      handicap: data.handicap,
      home_club: data.home_club,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    // Calculate subscription amount
    const amountCents = data.plan === 'yearly' ? state.settings.yearly_price * 100 : state.settings.monthly_price * 100;
    const renewalDate = new Date();
    if (data.plan === 'yearly') {
      renewalDate.setFullYear(renewalDate.getFullYear() + 1);
    } else {
      renewalDate.setMonth(renewalDate.getMonth() + 1);
    }

    const newSub: Subscription = {
      id: `sub-${newId}`,
      user_id: newId,
      plan: data.plan,
      stripe_customer_id: `cus_${Date.now()}`,
      stripe_subscription_id: `sub_${Date.now()}`,
      status: 'active',
      start_date: new Date().toISOString(),
      renewal_date: renewalDate.toISOString(),
      amount_cents: amountCents,
      charity_percentage: charityPercentage,
      created_at: new Date().toISOString(),
    };

    state.profiles.push(newProfile);
    state.subscriptions.push(newSub);
    state.currentUserId = newId;

    // Record initial charity cut
    const charity = state.charities.find((c) => c.id === newProfile.selected_charity_id);
    if (charity) {
      const donationAmount = Math.round((newSub.amount_cents / 100) * (charityPercentage / 100));
      state.donations.push({
        id: `don-${Date.now()}`,
        user_id: newId,
        user_name: newProfile.full_name,
        charity_id: charity.id,
        charity_name: charity.name,
        amount: donationAmount,
        donation_type: 'subscription_cut',
        created_at: new Date().toISOString(),
      });
      charity.total_raised += donationAmount;
    }

    notify();
    return { success: true, message: 'Account successfully created and activated!', profile: newProfile };
  },

  logout() {
    state.currentUserId = null;
    notify();
  },

  quickSwitchUser(role: 'admin' | 'user' | string) {
    if (role === 'admin') {
      state.currentUserId = 'usr-admin';
    } else if (role === 'user') {
      state.currentUserId = 'usr-tausif';
    } else {
      state.currentUserId = role;
    }
    notify();
  },

  // ------------------- SCORES LOGIC -------------------
  /**
   * Adds a new Stableford score (1 - 45)
   * Enforces:
   * 1. score between 1 and 45
   * 2. UNIQUE(user_id, score_date) - duplicate date rejected
   * 3. Retains exactly latest 5 scores (oldest automatically removed)
   */
  addScore(userId: string, score: number, scoreDate: string, courseName?: string): { success: boolean; message: string } {
    if (isNaN(score) || score < 1 || score > 45) {
      return { success: false, message: 'Score must be a valid Stableford number between 1 and 45.' };
    }
    if (!scoreDate) {
      return { success: false, message: 'Score date is required.' };
    }

    // Check duplicate date for this user
    const duplicate = state.scores.find(
      (s) => s.user_id === userId && s.score_date === scoreDate
    );
    if (duplicate) {
      return {
        success: false,
        message: `You already entered a score for ${scoreDate}. Duplicate scores for the same date are not allowed. You may edit or delete the existing entry instead.`,
      };
    }

    const newScore: GolfScore = {
      id: `sc-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      user_id: userId,
      score: Math.round(score),
      score_date: scoreDate,
      course_name: courseName?.trim() || 'Club Round',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    state.scores.push(newScore);

    // Enforce 5-score rolling rule: keep latest 5 by date descending
    const userScores = state.scores
      .filter((s) => s.user_id === userId)
      .sort((a, b) => new Date(b.score_date).getTime() - new Date(a.score_date).getTime());

    if (userScores.length > 5) {
      // Keep only top 5, remove the rest from state.scores
      const keepIds = new Set(userScores.slice(0, 5).map((s) => s.id));
      state.scores = state.scores.filter((s) => s.user_id !== userId || keepIds.has(s.id));
    }

    notify();
    return { success: true, message: 'Score saved successfully! Your rolling 5 scores have been updated.' };
  },

  updateScore(scoreId: string, score: number, scoreDate: string, courseName?: string): { success: boolean; message: string } {
    if (isNaN(score) || score < 1 || score > 45) {
      return { success: false, message: 'Score must be between 1 and 45.' };
    }

    const existing = state.scores.find((s) => s.id === scoreId);
    if (!existing) {
      return { success: false, message: 'Score entry not found.' };
    }

    // Check duplicate date with other entries
    const duplicate = state.scores.find(
      (s) => s.user_id === existing.user_id && s.id !== scoreId && s.score_date === scoreDate
    );
    if (duplicate) {
      return { success: false, message: `Another score already exists for ${scoreDate}.` };
    }

    existing.score = Math.round(score);
    existing.score_date = scoreDate;
    if (courseName !== undefined) existing.course_name = courseName.trim();
    existing.updated_at = new Date().toISOString();

    notify();
    return { success: true, message: 'Score updated successfully!' };
  },

  deleteScore(scoreId: string): { success: boolean; message: string } {
    const idx = state.scores.findIndex((s) => s.id === scoreId);
    if (idx === -1) {
      return { success: false, message: 'Score not found.' };
    }
    state.scores.splice(idx, 1);
    notify();
    return { success: true, message: 'Score deleted successfully.' };
  },

  // ------------------- CHARITY -------------------
  updateUserCharity(userId: string, charityId: string, percentage: number): { success: boolean; message: string } {
    const profile = state.profiles.find((p) => p.id === userId);
    if (!profile) return { success: false, message: 'User not found.' };

    const min = state.settings.charity_min_percentage;
    if (percentage < min) {
      return { success: false, message: `Charity contribution must be at least ${min}%.` };
    }

    profile.selected_charity_id = charityId;
    profile.charity_percentage = percentage;
    profile.updated_at = new Date().toISOString();

    // Also update subscription record
    const sub = state.subscriptions.find((s) => s.user_id === userId);
    if (sub) {
      sub.charity_percentage = percentage;
    }

    notify();
    return { success: true, message: 'Charity preference updated successfully!' };
  },

  donateDirectly(userId: string, charityId: string, amount: number): { success: boolean; message: string } {
    if (isNaN(amount) || amount <= 0) {
      return { success: false, message: 'Please enter a valid donation amount.' };
    }

    const charity = state.charities.find((c) => c.id === charityId);
    if (!charity) return { success: false, message: 'Charity not found.' };

    const profile = state.profiles.find((p) => p.id === userId);
    const userName = profile ? profile.full_name : 'Anonymous Golfer';

    state.donations.push({
      id: `don-${Date.now()}`,
      user_id: userId,
      user_name: userName,
      charity_id: charityId,
      charity_name: charity.name,
      amount: Math.round(amount),
      donation_type: 'direct_donation',
      created_at: new Date().toISOString(),
    });

    charity.total_raised += Math.round(amount);
    notify();
    return { success: true, message: `Thank you! Your donation of ${state.settings.currency_symbol}${amount.toLocaleString()} to ${charity.name} was completed.` };
  },

  addCharity(charity: Omit<Charity, 'id' | 'created_at' | 'updated_at' | 'total_raised'>): { success: boolean; message: string } {
    const newCharity: Charity = {
      ...charity,
      id: `charity-${Date.now()}`,
      total_raised: 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    state.charities.push(newCharity);
    notify();
    return { success: true, message: 'Charity added successfully!' };
  },

  updateCharity(id: string, updates: Partial<Charity>): { success: boolean; message: string } {
    const charity = state.charities.find((c) => c.id === id);
    if (!charity) return { success: false, message: 'Charity not found.' };
    Object.assign(charity, updates, { updated_at: new Date().toISOString() });
    notify();
    return { success: true, message: 'Charity updated successfully!' };
  },

  deleteCharity(id: string): { success: boolean; message: string } {
    state.charities = state.charities.filter((c) => c.id !== id);
    notify();
    return { success: true, message: 'Charity deleted successfully.' };
  },

  // ------------------- SUBSCRIPTION & STRIPE -------------------
  activateSubscription(userId: string, plan: SubscriptionPlan, charityPercentage: number) {
    let sub = state.subscriptions.find((s) => s.user_id === userId);
    const renewalDate = new Date();
    if (plan === 'yearly') {
      renewalDate.setFullYear(renewalDate.getFullYear() + 1);
    } else {
      renewalDate.setMonth(renewalDate.getMonth() + 1);
    }

    const amountCents = plan === 'yearly' ? state.settings.yearly_price * 100 : state.settings.monthly_price * 100;

    if (sub) {
      sub.plan = plan;
      sub.status = 'active';
      sub.cancelled_at = null;
      sub.renewal_date = renewalDate.toISOString();
      sub.amount_cents = amountCents;
      sub.charity_percentage = charityPercentage;
    } else {
      sub = {
        id: `sub-${userId}`,
        user_id: userId,
        plan,
        stripe_customer_id: `cus_${Date.now()}`,
        stripe_subscription_id: `sub_${Date.now()}`,
        status: 'active',
        start_date: new Date().toISOString(),
        renewal_date: renewalDate.toISOString(),
        amount_cents: amountCents,
        charity_percentage: charityPercentage,
        created_at: new Date().toISOString(),
      };
      state.subscriptions.push(sub);
    }

    const profile = state.profiles.find((p) => p.id === userId);
    if (profile) {
      profile.charity_percentage = charityPercentage;
    }

    notify();
    return { success: true, message: 'Subscription successfully activated via Stripe!' };
  },

  cancelSubscription(userId: string) {
    const sub = state.subscriptions.find((s) => s.user_id === userId);
    if (!sub) return { success: false, message: 'No active subscription found.' };
    sub.status = 'cancelled';
    sub.cancelled_at = new Date().toISOString();
    notify();
    return { success: true, message: 'Subscription has been cancelled. Access remains valid until period end.' };
  },

  renewSubscription(userId: string) {
    const sub = state.subscriptions.find((s) => s.user_id === userId);
    if (!sub) return { success: false, message: 'Subscription not found.' };
    sub.status = 'active';
    sub.cancelled_at = null;
    const renewalDate = new Date();
    renewalDate.setMonth(renewalDate.getMonth() + 1);
    sub.renewal_date = renewalDate.toISOString();
    notify();
    return { success: true, message: 'Subscription renewed successfully!' };
  },

  // ------------------- DRAWS -------------------
  runDrawSimulation(params: {
    title: string;
    drawDate: string;
    drawType: 'random' | 'algorithmic';
    customWinningNumbers?: number[];
  }): SimulationResult {
    // Gather all active users with their latest 5 scores
    const activeSubs = new Set(
      state.subscriptions.filter((s) => s.status === 'active').map((s) => s.user_id)
    );

    const activeUsers = state.profiles
      .filter((p) => p.role === 'user' && activeSubs.has(p.id))
      .map((p) => {
        const scores = state.scores
          .filter((s) => s.user_id === p.id)
          .sort((a, b) => new Date(b.score_date).getTime() - new Date(a.score_date).getTime())
          .slice(0, 5)
          .map((s) => s.score);

        return {
          id: p.id,
          name: p.full_name,
          email: p.email,
          scores,
        };
      });

    return simulateMonthlyDraw({
      drawTitle: params.title,
      drawDate: params.drawDate,
      drawType: params.drawType,
      activeUsers,
      allStoredScores: state.scores,
      settings: state.settings,
      customWinningNumbers: params.customWinningNumbers,
    });
  },

  publishDraw(simulation: SimulationResult): { success: boolean; message: string; draw: Draw } {
    const draw = { ...simulation.draw, status: 'published' as const, published_at: new Date().toISOString() };
    state.draws.unshift(draw);

    // Save draw results
    const allResults = [
      ...simulation.matchedUsers.tier5,
      ...simulation.matchedUsers.tier4,
      ...simulation.matchedUsers.tier3,
      ...simulation.matchedUsers.unmatched,
    ];
    state.drawResults.push(...allResults);

    // Create winners entries for 5, 4, 3 matches
    const winnersToInsert: Winner[] = [];
    const addWinners = (results: DrawResult[], matchType: 5 | 4 | 3) => {
      for (const r of results) {
        winnersToInsert.push({
          id: `win-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
          user_id: r.user_id,
          user_name: r.user_name,
          user_email: r.user_email,
          draw_id: draw.id,
          draw_title: draw.title,
          draw_date: draw.draw_date,
          match_type: matchType,
          prize_amount: r.prize_amount,
          matched_numbers: r.matched_numbers,
          user_scores: r.user_scores,
          proof_url: null,
          proof_notes: '',
          verification_status: 'pending',
          payment_status: 'pending',
          created_at: new Date().toISOString(),
        });
      }
    };

    addWinners(simulation.matchedUsers.tier5, 5);
    addWinners(simulation.matchedUsers.tier4, 4);
    addWinners(simulation.matchedUsers.tier3, 3);

    state.winners.unshift(...winnersToInsert);

    // Update jackpot rollover in settings
    state.settings.current_jackpot_rollover = simulation.payouts.rolloverAmount;

    notify();
    return {
      success: true,
      message: `Draw "${draw.title}" published! Created ${winnersToInsert.length} winner records. Next month rollover: ${state.settings.currency_symbol}${simulation.payouts.rolloverAmount.toLocaleString()}`,
      draw,
    };
  },

  // ------------------- WINNERS & PROOF VERIFICATION -------------------
  uploadWinnerProof(winnerId: string, proofUrl: string, notes?: string): { success: boolean; message: string } {
    const winner = state.winners.find((w) => w.id === winnerId);
    if (!winner) return { success: false, message: 'Winner record not found.' };

    winner.proof_url = proofUrl;
    if (notes !== undefined) winner.proof_notes = notes;
    winner.verification_status = 'pending';
    winner.rejection_reason = undefined;

    notify();
    return { success: true, message: 'Proof submitted successfully! Admin review in progress.' };
  },

  approveWinnerProof(winnerId: string): { success: boolean; message: string } {
    const winner = state.winners.find((w) => w.id === winnerId);
    if (!winner) return { success: false, message: 'Winner record not found.' };

    winner.verification_status = 'approved';
    winner.verified_at = new Date().toISOString();
    winner.payment_status = 'pending';
    winner.rejection_reason = undefined;

    notify();
    return { success: true, message: `Winner ${winner.user_name} approved! Payout status is now Pending.` };
  },

  rejectWinnerProof(winnerId: string, reason: string): { success: boolean; message: string } {
    const winner = state.winners.find((w) => w.id === winnerId);
    if (!winner) return { success: false, message: 'Winner record not found.' };

    winner.verification_status = 'rejected';
    winner.rejection_reason = reason.trim() || 'Scorecard details could not be verified against the competition record.';

    notify();
    return { success: true, message: `Winner submission marked as rejected.` };
  },

  markWinnerPaid(winnerId: string): { success: boolean; message: string } {
    const winner = state.winners.find((w) => w.id === winnerId);
    if (!winner) return { success: false, message: 'Winner record not found.' };

    if (winner.verification_status !== 'approved') {
      return { success: false, message: 'Cannot complete payout: Score proof must be approved first.' };
    }

    winner.payment_status = 'paid';
    winner.paid_at = new Date().toISOString();

    notify();
    return { success: true, message: `Payment of ${state.settings.currency_symbol}${winner.prize_amount.toLocaleString()} marked as Paid to ${winner.user_name}!` };
  },

  // ------------------- SETTINGS -------------------
  updateSettings(newSettings: Partial<PlatformSettings>): { success: boolean; message: string } {
    Object.assign(state.settings, newSettings);
    notify();
    return { success: true, message: 'Platform settings updated successfully!' };
  },

  resetDefaults() {
    localStorage.removeItem(STORAGE_KEY);
    state = loadInitialState();
    notify();
    return { success: true, message: 'Reset to default PRD sample data.' };
  },
};
