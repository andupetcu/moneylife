import { Pool } from 'pg';
import type { GameCategory } from './banking-service.js';

const ALL_CATEGORIES: GameCategory[] = [
  'housing', 'food', 'transport', 'entertainment',
  'utilities', 'health', 'education', 'shopping', 'other',
];

export interface CategoryComparison {
  category: GameCategory;
  gameAmount: number;
  realAmount: number;
  differencePercent: number; // positive = spent more IRL
}

export interface MirrorInsight {
  type: 'overspend' | 'underspend' | 'match' | 'missing';
  category: GameCategory;
  message: string;
  severity: 'info' | 'warning' | 'positive';
}

export interface MirrorComparison {
  id: string;
  gameId: string;
  periodStart: string;
  periodEnd: string;
  gameSpending: Record<string, number>;
  realSpending: Record<string, number>;
  categories: CategoryComparison[];
  similarityScore: number;
  insights: MirrorInsight[];
  createdAt: string;
}

export interface MirrorDashboard {
  comparisons: MirrorComparison[];
  overallSimilarity: number;
  trend: 'improving' | 'stable' | 'declining';
  topDifferences: CategoryComparison[];
}

function calculateSimilarity(
  gameSpending: Record<string, number>,
  realSpending: Record<string, number>,
): number {
  const categories = new Set([...Object.keys(gameSpending), ...Object.keys(realSpending)]);
  if (categories.size === 0) return 100;

  let totalDiff = 0;
  let totalMax = 0;

  for (const cat of categories) {
    const game = Math.abs(gameSpending[cat] || 0);
    const real = Math.abs(realSpending[cat] || 0);
    const maxVal = Math.max(game, real);
    if (maxVal === 0) continue;
    totalDiff += Math.abs(game - real);
    totalMax += maxVal;
  }

  if (totalMax === 0) return 100;
  return Math.round(Math.max(0, (1 - totalDiff / totalMax) * 100));
}

function generateInsights(
  gameSpending: Record<string, number>,
  realSpending: Record<string, number>,
): MirrorInsight[] {
  const insights: MirrorInsight[] = [];

  for (const cat of ALL_CATEGORIES) {
    const game = Math.abs(gameSpending[cat] || 0);
    const real = Math.abs(realSpending[cat] || 0);

    if (game === 0 && real === 0) continue;

    if (real > 0 && game === 0) {
      insights.push({
        type: 'missing',
        category: cat,
        message: `You spent on ${cat} IRL but not in-game. Consider adding ${cat} expenses to your game budget.`,
        severity: 'warning',
      });
      continue;
    }

    if (game > 0 && real === 0) {
      insights.push({
        type: 'missing',
        category: cat,
        message: `You have ${cat} spending in-game but none IRL. Your game budget may be too conservative here.`,
        severity: 'info',
      });
      continue;
    }

    const diffPct = game > 0 ? Math.round(((real - game) / game) * 100) : 0;

    if (diffPct > 30) {
      insights.push({
        type: 'overspend',
        category: cat,
        message: `You spent ${diffPct}% more on ${cat} IRL than in-game. Try adjusting your game budget to be more realistic.`,
        severity: 'warning',
      });
    } else if (diffPct < -30) {
      insights.push({
        type: 'underspend',
        category: cat,
        message: `You spent ${Math.abs(diffPct)}% less on ${cat} IRL than in-game. Great job keeping ${cat} costs down!`,
        severity: 'positive',
      });
    } else {
      insights.push({
        type: 'match',
        category: cat,
        message: `Your ${cat} spending is well-aligned between game and reality (${Math.abs(diffPct)}% difference).`,
        severity: 'positive',
      });
    }
  }

  // Sort: warnings first, then info, then positive
  const severityOrder: Record<string, number> = { warning: 0, info: 1, positive: 2 };
  insights.sort((a, b) => severityOrder[a.severity] - severityOrder[b.severity]);

  return insights;
}

export async function comparePeriod(
  pool: Pool,
  gameId: string,
  userId: string,
  year: number,
  month: number,
): Promise<MirrorComparison> {
  const periodStart = `${year}-${String(month).padStart(2, '0')}-01`;
  const lastDay = new Date(year, month, 0).getDate();
  const periodEnd = `${year}-${String(month).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`;

  // Get game transactions for the period (expenses only, by category)
  const gameResult = await pool.query(
    `SELECT category, SUM(amount) as total
     FROM transactions
     WHERE game_id = $1 AND game_date >= $2 AND game_date <= $3
       AND type IN ('expense', 'loan_payment', 'insurance_premium', 'fee', 'bnpl_installment')
     GROUP BY category`,
    [gameId, periodStart, periodEnd],
  );

  const gameSpending: Record<string, number> = {};
  for (const row of gameResult.rows) {
    const cat = (row.category || 'other').toLowerCase();
    gameSpending[cat] = Math.abs(Number(row.total));
  }

  // Get real synced transactions for the period
  const realResult = await pool.query(
    `SELECT category, SUM(amount) as total
     FROM synced_transactions
     WHERE user_id = $1 AND date >= $2 AND date <= $3 AND amount < 0
     GROUP BY category`,
    [userId, periodStart, periodEnd],
  );

  const realSpending: Record<string, number> = {};
  for (const row of realResult.rows) {
    const cat = (row.category || 'other').toLowerCase();
    realSpending[cat] = Math.abs(Number(row.total));
  }

  // Build category comparisons
  const categories: CategoryComparison[] = ALL_CATEGORIES
    .map(cat => {
      const game = gameSpending[cat] || 0;
      const real = realSpending[cat] || 0;
      const diffPct = game > 0 ? Math.round(((real - game) / game) * 100) : (real > 0 ? 100 : 0);
      return { category: cat, gameAmount: game, realAmount: real, differencePercent: diffPct };
    })
    .filter(c => c.gameAmount > 0 || c.realAmount > 0);

  const similarityScore = calculateSimilarity(gameSpending, realSpending);
  const insights = generateInsights(gameSpending, realSpending);

  // Upsert into mirror_comparisons
  const result = await pool.query(
    `INSERT INTO mirror_comparisons (user_id, game_id, period_start, period_end, game_spending, real_spending, insights)
     VALUES ($1, $2, $3, $4, $5, $6, $7)
     ON CONFLICT (user_id, period_start) WHERE game_id = $2
     DO UPDATE SET game_spending = EXCLUDED.game_spending,
                   real_spending = EXCLUDED.real_spending,
                   insights = EXCLUDED.insights
     RETURNING id, created_at`,
    [userId, gameId, periodStart, periodEnd, JSON.stringify(gameSpending), JSON.stringify(realSpending), JSON.stringify(insights)],
  );

  // Fallback if ON CONFLICT doesn't match (no partial unique index)
  let id: string;
  let createdAt: string;
  if (result.rows.length > 0) {
    id = result.rows[0].id;
    createdAt = result.rows[0].created_at;
  } else {
    // Query existing
    const existing = await pool.query(
      'SELECT id, created_at FROM mirror_comparisons WHERE user_id = $1 AND game_id = $2 AND period_start = $3',
      [userId, gameId, periodStart],
    );
    if (existing.rows.length > 0) {
      id = existing.rows[0].id;
      createdAt = existing.rows[0].created_at;
      await pool.query(
        'UPDATE mirror_comparisons SET game_spending = $1, real_spending = $2, insights = $3 WHERE id = $4',
        [JSON.stringify(gameSpending), JSON.stringify(realSpending), JSON.stringify(insights), id],
      );
    } else {
      const ins = await pool.query(
        `INSERT INTO mirror_comparisons (user_id, game_id, period_start, period_end, game_spending, real_spending, insights)
         VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id, created_at`,
        [userId, gameId, periodStart, periodEnd, JSON.stringify(gameSpending), JSON.stringify(realSpending), JSON.stringify(insights)],
      );
      id = ins.rows[0].id;
      createdAt = ins.rows[0].created_at;
    }
  }

  return {
    id,
    gameId,
    periodStart,
    periodEnd,
    gameSpending,
    realSpending,
    categories,
    similarityScore,
    insights,
    createdAt: new Date(createdAt).toISOString(),
  };
}

export async function getMirrorDashboard(
  pool: Pool,
  gameId: string,
  userId: string,
): Promise<MirrorDashboard> {
  const result = await pool.query(
    `SELECT id, game_id, period_start, period_end, game_spending, real_spending, insights, created_at
     FROM mirror_comparisons
     WHERE game_id = $1 AND user_id = $2
     ORDER BY period_start DESC
     LIMIT 12`,
    [gameId, userId],
  );

  const comparisons: MirrorComparison[] = result.rows.map((row: Record<string, unknown>) => {
    const gs = row.game_spending as Record<string, number>;
    const rs = row.real_spending as Record<string, number>;

    const categories = ALL_CATEGORIES
      .map(cat => {
        const game = gs[cat] || 0;
        const real = rs[cat] || 0;
        const diffPct = game > 0 ? Math.round(((real - game) / game) * 100) : (real > 0 ? 100 : 0);
        return { category: cat, gameAmount: game, realAmount: real, differencePercent: diffPct };
      })
      .filter(c => c.gameAmount > 0 || c.realAmount > 0);

    return {
      id: row.id as string,
      gameId: row.game_id as string,
      periodStart: (row.period_start as Date).toISOString().split('T')[0],
      periodEnd: (row.period_end as Date).toISOString().split('T')[0],
      gameSpending: gs,
      realSpending: rs,
      categories,
      similarityScore: calculateSimilarity(gs, rs),
      insights: (row.insights || []) as MirrorInsight[],
      createdAt: new Date(row.created_at as string).toISOString(),
    };
  });

  // Overall similarity = average of all comparisons
  const overallSimilarity = comparisons.length > 0
    ? Math.round(comparisons.reduce((sum, c) => sum + c.similarityScore, 0) / comparisons.length)
    : 0;

  // Trend: compare last 3 vs previous 3
  let trend: 'improving' | 'stable' | 'declining' = 'stable';
  if (comparisons.length >= 4) {
    const recent = comparisons.slice(0, 3);
    const older = comparisons.slice(3, 6);
    const recentAvg = recent.reduce((s, c) => s + c.similarityScore, 0) / recent.length;
    const olderAvg = older.reduce((s, c) => s + c.similarityScore, 0) / older.length;
    if (recentAvg > olderAvg + 5) trend = 'improving';
    else if (recentAvg < olderAvg - 5) trend = 'declining';
  }

  // Top differences: aggregate across all comparisons, sort by absolute difference
  const catDiffs: Record<string, { gameTotal: number; realTotal: number; count: number }> = {};
  for (const comp of comparisons) {
    for (const cat of comp.categories) {
      if (!catDiffs[cat.category]) catDiffs[cat.category] = { gameTotal: 0, realTotal: 0, count: 0 };
      catDiffs[cat.category].gameTotal += cat.gameAmount;
      catDiffs[cat.category].realTotal += cat.realAmount;
      catDiffs[cat.category].count++;
    }
  }

  const topDifferences: CategoryComparison[] = Object.entries(catDiffs)
    .map(([cat, d]) => {
      const diffPct = d.gameTotal > 0 ? Math.round(((d.realTotal - d.gameTotal) / d.gameTotal) * 100) : 100;
      return {
        category: cat as GameCategory,
        gameAmount: d.gameTotal,
        realAmount: d.realTotal,
        differencePercent: diffPct,
      };
    })
    .sort((a, b) => Math.abs(b.differencePercent) - Math.abs(a.differencePercent))
    .slice(0, 5);

  return { comparisons, overallSimilarity, trend, topDifferences };
}
