import { PoolClient } from 'pg';
import type { Badge, BadgeCondition, RewardGrant, GameDate } from '@moneylife/shared-types';
import type { GameRow } from '../models/game.js';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

// Import badge catalog from config package
const badgePath = join(__dirname, '../../../../packages/config/src/badges.json');
const badgeCatalog: { badges: Badge[] } = JSON.parse(readFileSync(badgePath, 'utf-8'));

const ALL_BADGES: Badge[] = badgeCatalog.badges;

// ---------- metric resolvers ----------

interface MetricContext {
  game: GameRow;
  action: string;
  events: string[];
  client: PoolClient;
}

/**
 * Resolve a metric name to a numeric value from the game state and DB.
 * For threshold badges, returns the current metric value.
 * For event badges, returns 1 if the event occurred (present in events list), else 0.
 * For streak badges, returns the current streak count for that metric.
 */
async function resolveThresholdMetric(metric: string, ctx: MetricContext): Promise<number> {
  const g = ctx.game;

  switch (metric) {
    // Savings
    case 'savings_deposits': {
      const res = await ctx.client.query(
        "SELECT COUNT(*) FROM transactions WHERE game_id = $1 AND type = 'transfer' AND category = 'transfer' AND amount > 0 AND account_id IN (SELECT id FROM game_accounts WHERE game_id = $1 AND type = 'savings')",
        [g.id],
      );
      return parseInt(res.rows[0].count, 10);
    }
    case 'emergency_fund_months': {
      const savingsRes = await ctx.client.query(
        "SELECT COALESCE(SUM(balance), 0) as total FROM game_accounts WHERE game_id = $1 AND type = 'savings' AND status = 'active'",
        [g.id],
      );
      const savingsTotal = parseInt(savingsRes.rows[0].total, 10);
      const monthlyIncome = parseInt(g.monthly_income, 10);
      return monthlyIncome > 0 ? savingsTotal / monthlyIncome : 0;
    }
    case 'savings_goals_completed': {
      const res = await ctx.client.query(
        "SELECT COUNT(*) FROM game_events WHERE game_id = $1 AND type = 'goal_completed'",
        [g.id],
      );
      return parseInt(res.rows[0].count, 10);
    }
    case 'savings_balance': {
      const res = await ctx.client.query(
        "SELECT COALESCE(SUM(balance), 0) as total FROM game_accounts WHERE game_id = $1 AND type = 'savings' AND status = 'active'",
        [g.id],
      );
      return parseInt(res.rows[0].total, 10);
    }

    // Credit
    case 'cc_full_payments': {
      const res = await ctx.client.query(
        "SELECT COUNT(*) FROM game_events WHERE game_id = $1 AND type = 'cc_full_payment'",
        [g.id],
      );
      return parseInt(res.rows[0].count, 10);
    }
    case 'chi_score':
      return g.chi_score;
    case 'non_mortgage_debt': {
      const res = await ctx.client.query(
        "SELECT COALESCE(SUM(ABS(balance)), 0) as total FROM game_accounts WHERE game_id = $1 AND type NOT IN ('checking', 'savings', 'mortgage', 'investment_brokerage', 'investment_retirement') AND status = 'active' AND balance < 0",
        [g.id],
      );
      return parseInt(res.rows[0].total, 10);
    }
    case 'total_debt': {
      const res = await ctx.client.query(
        "SELECT COALESCE(SUM(ABS(balance)), 0) as total FROM game_accounts WHERE game_id = $1 AND type NOT IN ('checking', 'savings', 'investment_brokerage', 'investment_retirement') AND status = 'active' AND balance < 0",
        [g.id],
      );
      return parseInt(res.rows[0].total, 10);
    }

    // Budget
    case 'budget_score':
      return g.budget_score;

    // Investment
    case 'asset_types_held': {
      const res = await ctx.client.query(
        "SELECT COUNT(DISTINCT data->>'assetType') as cnt FROM game_events WHERE game_id = $1 AND type = 'investment_buy'",
        [g.id],
      );
      return parseInt(res.rows[0].cnt, 10);
    }
    case 'longest_investment_hold_months': {
      const res = await ctx.client.query(
        "SELECT MIN(created_at) as earliest FROM game_events WHERE game_id = $1 AND type = 'investment_buy'",
        [g.id],
      );
      if (!res.rows[0].earliest) return 0;
      const earliest = new Date(res.rows[0].earliest);
      const currentDate = g.current_game_date instanceof Date ? g.current_game_date : new Date(g.current_game_date);
      const monthsDiff = (currentDate.getFullYear() - earliest.getFullYear()) * 12 + (currentDate.getMonth() - earliest.getMonth());
      return Math.max(0, monthsDiff);
    }
    case 'portfolio_value': {
      const res = await ctx.client.query(
        "SELECT COALESCE(SUM(balance), 0) as total FROM game_accounts WHERE game_id = $1 AND type IN ('investment_brokerage', 'investment_retirement') AND status = 'active'",
        [g.id],
      );
      return parseInt(res.rows[0].total, 10);
    }
    case 'retirement_readiness':
      return 0; // Not yet implemented in game
    case 'dividends_received': {
      const res = await ctx.client.query(
        "SELECT COUNT(*) FROM transactions WHERE game_id = $1 AND type = 'dividend'",
        [g.id],
      );
      return parseInt(res.rows[0].count, 10);
    }

    // Life event
    case 'insurance_types_held': {
      const res = await ctx.client.query(
        "SELECT COUNT(DISTINCT type) FROM game_accounts WHERE game_id = $1 AND type = 'insurance' AND status = 'active'",
        [g.id],
      );
      return parseInt(res.rows[0].count, 10);
    }
    case 'charity_donations': {
      const res = await ctx.client.query(
        "SELECT COUNT(*) FROM game_events WHERE game_id = $1 AND type = 'charity_donation'",
        [g.id],
      );
      return parseInt(res.rows[0].count, 10);
    }

    // Progression
    case 'level_completed':
      // current_level represents the level the player has REACHED
      // A level is "completed" when they've passed its XP threshold
      return Math.max(0, g.current_level);
    case 'chi_min_ever': {
      const res = await ctx.client.query(
        "SELECT COALESCE(MIN(chi_score), 850) as min_chi FROM monthly_reports WHERE game_id = $1",
        [g.id],
      );
      return parseInt(res.rows[0].min_chi, 10);
    }

    // Engagement
    case 'levels_1_4_days': {
      // Days it took to reach level 4 — lower is better, so the badge triggers when days <= value
      // We invert the logic: return 60 minus (actual days) so that if under 60, we get >= 0
      if (g.current_level < 4) return 9999; // Not reached level 4 yet
      const created = g.created_at instanceof Date ? g.created_at : new Date(g.created_at);
      const current = g.current_game_date instanceof Date ? g.current_game_date : new Date(g.current_game_date);
      const daysDiff = Math.floor((current.getTime() - created.getTime()) / (1000 * 60 * 60 * 24));
      // Badge checks "value": 60 meaning completed in under 60 days. But condition is >=.
      // So we store the inverse: this returns the day count, and the evaluator does <=
      return daysDiff;
    }

    default:
      return 0;
  }
}

async function resolveStreakMetric(metric: string, ctx: MetricContext): Promise<number> {
  const g = ctx.game;

  switch (metric) {
    case 'play_days':
      return g.streak_current;

    case 'monthly_savings_deposit':
    case 'savings_rate_20pct':
    case 'all_bills_on_time':
    case 'chi_750_plus':
    case 'utilization_under_10':
    case 'budget_score_90':
    case 'budget_score_95':
    case 'insurance_held':
    case 'cheapest_option_chosen':
    case 'expensive_option_chosen': {
      // Check monthly_reports or game_events for streak counts
      const res = await ctx.client.query(
        "SELECT COUNT(*) FROM game_events WHERE game_id = $1 AND type = 'streak_tick' AND data->>'metric' = $2",
        [g.id, metric],
      );
      // If we don't have streak_tick events yet, try to compute from monthly reports
      if (parseInt(res.rows[0].count, 10) > 0) {
        // Get the current consecutive streak
        return await computeStreakFromEvents(ctx.client, g.id, metric);
      }
      // Fallback: compute from monthly reports for known monthly metrics
      return await computeStreakFromMonthlyReports(ctx.client, g.id, metric);
    }

    default:
      return 0;
  }
}

async function computeStreakFromEvents(client: PoolClient, gameId: string, metric: string): Promise<number> {
  const res = await client.query(
    "SELECT data->>'value' as val FROM game_events WHERE game_id = $1 AND type = 'streak_tick' AND data->>'metric' = $2 ORDER BY created_at DESC LIMIT 1",
    [gameId, metric],
  );
  if (res.rows.length === 0) return 0;
  return parseInt(res.rows[0].val, 10) || 0;
}

async function computeStreakFromMonthlyReports(client: PoolClient, gameId: string, metric: string): Promise<number> {
  const res = await client.query(
    "SELECT chi_score, budget_score, game_month FROM monthly_reports WHERE game_id = $1 ORDER BY game_month DESC",
    [gameId],
  );

  if (res.rows.length === 0) return 0;

  let streak = 0;
  for (const row of res.rows) {
    let passes = false;
    switch (metric) {
      case 'chi_750_plus':
        passes = row.chi_score >= 750;
        break;
      case 'budget_score_90':
        passes = row.budget_score >= 90;
        break;
      case 'budget_score_95':
        passes = row.budget_score >= 95;
        break;
      case 'all_bills_on_time':
        passes = true; // Would need late payment tracking
        break;
      case 'utilization_under_10':
        passes = true; // Would need utilization tracking
        break;
      default:
        passes = false;
    }
    if (passes) {
      streak++;
    } else {
      break; // Streak broken
    }
  }
  return streak;
}

function isEventTriggered(metric: string, events: string[]): boolean {
  return events.includes(metric);
}

// ---------- condition evaluation ----------

async function evaluateCondition(
  condition: BadgeCondition,
  ctx: MetricContext,
): Promise<boolean> {
  switch (condition.type) {
    case 'threshold': {
      if (!condition.metric || condition.value === undefined) return false;
      const current = await resolveThresholdMetric(condition.metric, ctx);
      // Special case for debt badges: value=0 means "no debt"
      if (condition.metric === 'non_mortgage_debt' || condition.metric === 'total_debt') {
        return current <= condition.value;
      }
      // Special case for speed runner: lower is better
      if (condition.metric === 'levels_1_4_days') {
        return current <= condition.value;
      }
      return current >= condition.value;
    }

    case 'streak': {
      if (!condition.metric || condition.value === undefined) return false;
      const currentStreak = await resolveStreakMetric(condition.metric, ctx);
      return currentStreak >= condition.value;
    }

    case 'event': {
      if (!condition.metric) return false;
      // Check if event was triggered in this action or historically
      if (isEventTriggered(condition.metric, ctx.events)) return true;
      // Also check game_events for historical events
      const res = await ctx.client.query(
        "SELECT COUNT(*) FROM game_events WHERE game_id = $1 AND type = $2",
        [ctx.game.id, condition.metric],
      );
      return parseInt(res.rows[0].count, 10) > 0;
    }

    case 'compound': {
      if (!condition.conditions || condition.conditions.length === 0) return false;
      const results = await Promise.all(
        condition.conditions.map((c: BadgeCondition) => evaluateCondition(c, ctx)),
      );
      if (condition.operator === 'or') {
        return results.some(Boolean);
      }
      return results.every(Boolean); // default: 'and'
    }

    default:
      return false;
  }
}

// ---------- main evaluator ----------

export interface BadgeEvalResult {
  newBadges: Array<{ badge: Badge; xpAwarded: number; coinsAwarded: number }>;
  rewards: RewardGrant[];
}

/**
 * Evaluate all badge conditions against the current game state.
 * Awards new badges, grants XP/coin rewards.
 * Should be called after state-mutating actions (advance_day, decide_card, month-end, etc.)
 */
export async function evaluateBadges(
  client: PoolClient,
  game: GameRow,
  action: string,
  triggeredEvents: string[],
): Promise<BadgeEvalResult> {
  const result: BadgeEvalResult = { newBadges: [], rewards: [] };

  // Get already-earned badge IDs for this user
  const earnedRes = await client.query(
    'SELECT badge_id FROM user_badges WHERE user_id = $1',
    [game.user_id],
  );
  const earnedBadgeIds = new Set<string>(earnedRes.rows.map((r: { badge_id: string }) => r.badge_id));

  const ctx: MetricContext = {
    game,
    action,
    events: triggeredEvents,
    client,
  };

  for (const badge of ALL_BADGES) {
    // Skip already earned
    if (earnedBadgeIds.has(badge.id)) continue;

    const earned = await evaluateCondition(badge.condition, ctx);
    if (!earned) continue;

    // Award the badge
    await client.query(
      `INSERT INTO user_badges (user_id, partner_id, badge_id, game_id, difficulty)
       VALUES ($1, $2, $3, $4, $5)
       ON CONFLICT (user_id, badge_id) DO NOTHING`,
      [game.user_id, game.partner_id, badge.id, game.id, game.difficulty],
    );

    // Award badge XP
    if (badge.xpReward > 0) {
      await client.query(
        'UPDATE games SET total_xp = total_xp + $1, updated_at = NOW() WHERE id = $2',
        [badge.xpReward, game.id],
      );
    }

    // Award badge coins
    if (badge.coinReward > 0) {
      await client.query(
        'UPDATE games SET total_coins = total_coins + $1, updated_at = NOW() WHERE id = $2',
        [badge.coinReward, game.id],
      );
    }

    result.newBadges.push({
      badge,
      xpAwarded: badge.xpReward,
      coinsAwarded: badge.coinReward,
    });

    result.rewards.push({
      type: 'badge',
      badgeId: badge.id,
      reason: `Earned badge: ${badge.name}`,
    });

    if (badge.xpReward > 0) {
      result.rewards.push({
        type: 'xp',
        amount: badge.xpReward,
        reason: `Badge reward: ${badge.name}`,
      });
    }

    if (badge.coinReward > 0) {
      result.rewards.push({
        type: 'coins',
        amount: badge.coinReward,
        reason: `Badge reward: ${badge.name}`,
      });
    }

    // Log event
    await client.query(
      `INSERT INTO game_events (game_id, type, game_date, description, data)
       VALUES ($1, 'badge_earned', $2, $3, $4)`,
      [
        game.id,
        game.current_game_date instanceof Date
          ? game.current_game_date.toISOString().split('T')[0]
          : game.current_game_date,
        `Earned badge: ${badge.name}`,
        JSON.stringify({ badgeId: badge.id, xpReward: badge.xpReward, coinReward: badge.coinReward }),
      ],
    );
  }

  return result;
}
