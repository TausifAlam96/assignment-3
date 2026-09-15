/**
 * Digital Heroes - Draw & Prize Pool Engine
 * Mathematical implementation satisfying PRD §06 and §07
 */

import { Draw, DrawResult, GolfScore, PlatformSettings, SimulationResult } from '../types';

/**
 * Generate 5 unique random numbers between 1 and 45
 */
export function generateRandomWinningNumbers(min = 1, max = 45, count = 5): number[] {
  const numbers = new Set<number>();
  while (numbers.size < count) {
    const n = Math.floor(Math.random() * (max - min + 1)) + min;
    numbers.add(n);
  }
  return Array.from(numbers).sort((a, b) => a - b);
}

/**
 * Calculate frequency map of all submitted golf scores (1 - 45)
 */
export function getScoreFrequencies(scores: GolfScore[]): Record<number, number> {
  const freq: Record<number, number> = {};
  for (let i = 1; i <= 45; i++) {
    freq[i] = 0;
  }
  for (const s of scores) {
    if (s.score >= 1 && s.score <= 45) {
      freq[s.score] = (freq[s.score] || 0) + 1;
    }
  }
  return freq;
}

/**
 * Algorithmic draw weighted by community score frequency
 * Numbers submitted more frequently have proportionately higher probability of being drawn.
 * Includes Laplace smoothing (+1) to ensure every number 1-45 has a non-zero probability.
 */
export function generateAlgorithmicWinningNumbers(
  scores: GolfScore[],
  count = 5,
  min = 1,
  max = 45
): number[] {
  const frequencies = getScoreFrequencies(scores);

  // Build weights array
  const weights: { number: number; weight: number }[] = [];
  for (let n = min; n <= max; n++) {
    const userCount = frequencies[n] || 0;
    // Score frequency weighting with baseline smoothing
    const weight = userCount > 0 ? userCount * 3 + 1 : 1;
    weights.push({ number: n, weight });
  }

  const chosen = new Set<number>();

  while (chosen.size < count) {
    // Filter out already chosen
    const available = weights.filter((w) => !chosen.has(w.number));
    const totalWeight = available.reduce((acc, curr) => acc + curr.weight, 0);

    let randomVal = Math.random() * totalWeight;
    for (const item of available) {
      randomVal -= item.weight;
      if (randomVal <= 0) {
        chosen.add(item.number);
        break;
      }
    }
  }

  return Array.from(chosen).sort((a, b) => a - b);
}

/**
 * Compute matches between a user's stored scores and the drawn winning numbers
 */
export function evaluateUserMatch(userScores: number[], winningNumbers: number[]): {
  matchCount: 5 | 4 | 3 | 0;
  matchedNumbers: number[];
} {
  const winSet = new Set(winningNumbers);
  const matched = userScores.filter((score) => winSet.has(score));
  // deduplicate matched numbers if any score was identical
  const uniqueMatched = Array.from(new Set(matched)).sort((a, b) => a - b);
  const count = uniqueMatched.length;

  if (count >= 5) return { matchCount: 5, matchedNumbers: uniqueMatched };
  if (count === 4) return { matchCount: 4, matchedNumbers: uniqueMatched };
  if (count === 3) return { matchCount: 3, matchedNumbers: uniqueMatched };
  return { matchCount: 0, matchedNumbers: uniqueMatched };
}

/**
 * Execute full draw simulation
 */
export function simulateMonthlyDraw(params: {
  drawTitle: string;
  drawDate: string;
  drawType: 'random' | 'algorithmic';
  activeUsers: { id: string; name: string; email: string; scores: number[] }[];
  allStoredScores: GolfScore[];
  settings: PlatformSettings;
  customWinningNumbers?: number[];
}): SimulationResult {
  const {
    drawTitle,
    drawDate,
    drawType,
    activeUsers,
    allStoredScores,
    settings,
    customWinningNumbers,
  } = params;

  // 1. Generate winning numbers
  const winningNumbers =
    customWinningNumbers && customWinningNumbers.length === 5
      ? customWinningNumbers.sort((a, b) => a - b)
      : drawType === 'algorithmic'
      ? generateAlgorithmicWinningNumbers(allStoredScores, 5)
      : generateRandomWinningNumbers(1, 45, 5);

  // 2. Compute base pool from active subscribers
  const subscriberCount = activeUsers.length;
  // Allocation per subscriber = monthlyPrice * (prize_pool_percentage / 100)
  const poolContributionPerUser = settings.monthly_price * (settings.prize_pool_percentage / 100);
  const currentBasePool = Math.round(subscriberCount * poolContributionPerUser);
  const previousRollover = settings.current_jackpot_rollover || 0;
  const totalPrizePool = currentBasePool + previousRollover;

  // 3. Tier allocations according to PRD:
  // 5-match: 40% of base + previous rollover
  // 4-match: 35% of base
  // 3-match: 25% of base
  const tier5Base = Math.round(currentBasePool * 0.4);
  const tier5Pool = tier5Base + previousRollover;
  const tier4Pool = Math.round(currentBasePool * 0.35);
  const tier3Pool = Math.round(currentBasePool * 0.25);

  // 4. Evaluate each user's latest 5 scores
  const tier5Winners: DrawResult[] = [];
  const tier4Winners: DrawResult[] = [];
  const tier3Winners: DrawResult[] = [];
  const unmatched: DrawResult[] = [];

  const drawId = `draw-${Date.now()}`;

  for (const user of activeUsers) {
    const { matchCount, matchedNumbers } = evaluateUserMatch(user.scores, winningNumbers);

    const result: DrawResult = {
      id: `res-${user.id}-${Date.now()}`,
      draw_id: drawId,
      user_id: user.id,
      user_name: user.name,
      user_email: user.email,
      user_scores: user.scores,
      match_type: matchCount,
      matched_numbers: matchedNumbers,
      prize_amount: 0, // calculated below
    };

    if (matchCount === 5) {
      tier5Winners.push(result);
    } else if (matchCount === 4) {
      tier4Winners.push(result);
    } else if (matchCount === 3) {
      tier3Winners.push(result);
    } else {
      unmatched.push(result);
    }
  }

  // 5. Calculate split prizes & rollover
  let tier5PerWinner = 0;
  let willRollover = false;
  let rolloverAmount = 0;

  if (tier5Winners.length > 0) {
    tier5PerWinner = Math.floor(tier5Pool / tier5Winners.length);
    tier5Winners.forEach((w) => (w.prize_amount = tier5PerWinner));
    willRollover = false;
    rolloverAmount = 0;
  } else {
    // 5-match jackpot rolls over to next month
    willRollover = true;
    rolloverAmount = tier5Pool;
  }

  let tier4PerWinner = 0;
  if (tier4Winners.length > 0) {
    tier4PerWinner = Math.floor(tier4Pool / tier4Winners.length);
    tier4Winners.forEach((w) => (w.prize_amount = tier4PerWinner));
  }

  let tier3PerWinner = 0;
  if (tier3Winners.length > 0) {
    tier3PerWinner = Math.floor(tier3Pool / tier3Winners.length);
    tier3Winners.forEach((w) => (w.prize_amount = tier3PerWinner));
  }

  const draw: Draw = {
    id: drawId,
    title: drawTitle,
    draw_date: drawDate,
    draw_type: drawType,
    winning_numbers: winningNumbers,
    status: 'simulated',
    total_prize_pool: totalPrizePool,
    jackpot_rollover: previousRollover,
    new_jackpot_rollover: rolloverAmount,
    subscribers_count: subscriberCount,
    tier_5_pool: tier5Pool,
    tier_4_pool: tier4Pool,
    tier_3_pool: tier3Pool,
    simulated_at: new Date().toISOString(),
    created_at: new Date().toISOString(),
  };

  return {
    draw,
    matchedUsers: {
      tier5: tier5Winners,
      tier4: tier4Winners,
      tier3: tier3Winners,
      unmatched,
    },
    payouts: {
      tier5PerWinner,
      tier4PerWinner,
      tier3PerWinner,
      willRollover,
      rolloverAmount,
    },
  };
}
