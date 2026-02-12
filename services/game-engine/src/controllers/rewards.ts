import { Request, Response } from 'express';
import { Pool } from 'pg';
import { z } from 'zod';
import { findGameById } from '../models/game.js';

// ---------- GET /games/:id/xp-history ----------

export function getXpHistoryController(pool: Pool) {
  return async (req: Request, res: Response): Promise<void> => {
    try {
      const gameId = req.params.id as string;
      const game = await findGameById(pool, gameId);
      if (!game) {
        res.status(404).json({ code: 'GAME_NOT_FOUND', message: 'Game not found' });
        return;
      }
      if (game.user_id !== req.userId) {
        res.status(403).json({ code: 'FORBIDDEN', message: 'Not your game' });
        return;
      }

      const limit = Math.min(parseInt(req.query.limit as string, 10) || 50, 200);
      const offset = parseInt(req.query.offset as string, 10) || 0;

      const result = await pool.query(
        `SELECT id, amount, balance_after, reason, created_at
         FROM xp_ledger
         WHERE user_id = $1 AND game_id = $2
         ORDER BY created_at DESC
         LIMIT $3 OFFSET $4`,
        [game.user_id, gameId, limit, offset],
      );

      const countResult = await pool.query(
        'SELECT COUNT(*) FROM xp_ledger WHERE user_id = $1 AND game_id = $2',
        [game.user_id, gameId],
      );

      res.json({
        entries: result.rows.map(r => ({
          id: r.id,
          amount: r.amount,
          balanceAfter: r.balance_after,
          reason: r.reason,
          createdAt: r.created_at,
        })),
        total: parseInt(countResult.rows[0].count, 10),
        limit,
        offset,
      });
    } catch (err) {
      console.error('Get XP history error:', (err as Error).message);
      res.status(500).json({ code: 'INTERNAL_ERROR', message: 'Failed to fetch XP history' });
    }
  };
}

// ---------- GET /games/:id/badges ----------

export function getBadgesController(pool: Pool) {
  return async (req: Request, res: Response): Promise<void> => {
    try {
      const gameId = req.params.id as string;
      const game = await findGameById(pool, gameId);
      if (!game) {
        res.status(404).json({ code: 'GAME_NOT_FOUND', message: 'Game not found' });
        return;
      }
      if (game.user_id !== req.userId) {
        res.status(403).json({ code: 'FORBIDDEN', message: 'Not your game' });
        return;
      }

      const result = await pool.query(
        `SELECT badge_id, earned_at, difficulty, game_id
         FROM user_badges
         WHERE user_id = $1
         ORDER BY earned_at DESC`,
        [game.user_id],
      );

      res.json({
        badges: result.rows.map(r => ({
          badgeId: r.badge_id,
          earnedAt: r.earned_at,
          difficulty: r.difficulty,
          gameId: r.game_id,
        })),
      });
    } catch (err) {
      console.error('Get badges error:', (err as Error).message);
      res.status(500).json({ code: 'INTERNAL_ERROR', message: 'Failed to fetch badges' });
    }
  };
}

// ---------- GET /games/:id/rewards-summary ----------

export function getRewardsSummaryController(pool: Pool) {
  return async (req: Request, res: Response): Promise<void> => {
    try {
      const gameId = req.params.id as string;
      const game = await findGameById(pool, gameId);
      if (!game) {
        res.status(404).json({ code: 'GAME_NOT_FOUND', message: 'Game not found' });
        return;
      }
      if (game.user_id !== req.userId) {
        res.status(403).json({ code: 'FORBIDDEN', message: 'Not your game' });
        return;
      }

      const badgeCount = await pool.query(
        'SELECT COUNT(*) FROM user_badges WHERE user_id = $1',
        [game.user_id],
      );

      res.json({
        totalXp: game.total_xp,
        totalCoins: game.total_coins,
        currentLevel: game.current_level,
        badgesEarned: parseInt(badgeCount.rows[0].count, 10),
        streakCurrent: game.streak_current,
        streakLongest: game.streak_longest,
        netWorth: parseInt(game.net_worth, 10),
        chiScore: game.chi_score,
        budgetScore: game.budget_score,
      });
    } catch (err) {
      console.error('Get rewards summary error:', (err as Error).message);
      res.status(500).json({ code: 'INTERNAL_ERROR', message: 'Failed to fetch rewards summary' });
    }
  };
}

// ---------- POST /games/:id/spend-coins ----------

const spendCoinsSchema = z.object({
  item: z.enum(['hint', 'streak_shield']),
  cardId: z.string().uuid().optional(),
  idempotencyKey: z.string().uuid(),
});

const COIN_COSTS: Record<string, number> = {
  hint: 50,
  streak_shield: 100,
};

export function spendCoinsController(pool: Pool) {
  return async (req: Request, res: Response): Promise<void> => {
    const parsed = spendCoinsSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ code: 'VALIDATION_ERROR', message: 'Invalid input', details: parsed.error.flatten().fieldErrors });
      return;
    }

    const { item, cardId, idempotencyKey } = parsed.data;
    const gameId = req.params.id as string;

    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      const game = await findGameById(pool, gameId);
      if (!game) {
        await client.query('ROLLBACK');
        res.status(404).json({ code: 'GAME_NOT_FOUND', message: 'Game not found' });
        return;
      }
      if (game.user_id !== req.userId) {
        await client.query('ROLLBACK');
        res.status(403).json({ code: 'FORBIDDEN', message: 'Not your game' });
        return;
      }
      if (game.status !== 'active') {
        await client.query('ROLLBACK');
        res.status(400).json({ code: 'GAME_NOT_ACTIVE', message: 'Game is not active' });
        return;
      }

      // Check idempotency
      const existing = await client.query(
        "SELECT id FROM game_events WHERE game_id = $1 AND type = 'coin_spend' AND data->>'idempotencyKey' = $2",
        [gameId, idempotencyKey],
      );
      if (existing.rows.length > 0) {
        await client.query('ROLLBACK');
        res.json({ success: true, message: 'Already processed', item, cost: COIN_COSTS[item] });
        return;
      }

      const cost = COIN_COSTS[item];
      if (game.total_coins < cost) {
        await client.query('ROLLBACK');
        res.status(400).json({ code: 'INSUFFICIENT_COINS', message: `Need ${cost} coins, have ${game.total_coins}` });
        return;
      }

      // Deduct coins
      await client.query(
        'UPDATE games SET total_coins = total_coins - $1, updated_at = NOW() WHERE id = $2',
        [cost, gameId],
      );

      // Write coin ledger (negative amount for spending)
      const balRes = await client.query('SELECT total_coins FROM games WHERE id = $1', [gameId]);
      await client.query(
        `INSERT INTO coin_ledger (user_id, partner_id, amount, balance_after, reason)
         VALUES ($1, $2, $3, $4, $5)`,
        [game.user_id, game.partner_id, -cost, balRes.rows[0].total_coins, `Purchase: ${item}`],
      );

      const dateStr = game.current_game_date instanceof Date
        ? game.current_game_date.toISOString().split('T')[0]
        : game.current_game_date;

      let resultData: Record<string, unknown> = { item, cost, idempotencyKey };

      if (item === 'hint') {
        // Hint: reveal best option on a pending card
        if (!cardId) {
          await client.query('ROLLBACK');
          res.status(400).json({ code: 'VALIDATION_ERROR', message: 'cardId required for hint purchase' });
          return;
        }

        const cardRes = await client.query(
          "SELECT gpc.*, dc.options FROM game_pending_cards gpc JOIN decision_cards dc ON dc.id = gpc.card_id WHERE gpc.id = $1 AND gpc.game_id = $2 AND gpc.status = 'pending'",
          [cardId, gameId],
        );

        if (cardRes.rows.length === 0) {
          await client.query('ROLLBACK');
          res.status(404).json({ code: 'CARD_NOT_FOUND', message: 'Pending card not found' });
          return;
        }

        // Find the "best" option (highest XP + coins combined, lowest cost)
        const options = cardRes.rows[0].options as Array<{ id: string; label: string; cost?: number; xp?: number; coins?: number; effects?: { xp?: number; coins?: number; balance_change?: number } }>;
        let bestOption = options[0];
        let bestScore = -Infinity;
        for (const opt of options) {
          const xp = opt.xp ?? opt.effects?.xp ?? 0;
          const coins = opt.coins ?? opt.effects?.coins ?? 0;
          const optCost = opt.cost ?? opt.effects?.balance_change ?? 0;
          const score = xp + coins - optCost;
          if (score > bestScore) {
            bestScore = score;
            bestOption = opt;
          }
        }

        resultData = { ...resultData, bestOptionId: bestOption.id, bestOptionLabel: bestOption.label };
      } else if (item === 'streak_shield') {
        // Streak shield: protect streak for 1 missed day
        await client.query(
          `INSERT INTO game_events (game_id, type, game_date, description, data)
           VALUES ($1, 'streak_shield_active', $2, 'Streak shield activated', $3)`,
          [gameId, dateStr, JSON.stringify({ activatedAt: new Date().toISOString() })],
        );
      }

      // Log the spend event
      await client.query(
        `INSERT INTO game_events (game_id, type, game_date, description, data)
         VALUES ($1, 'coin_spend', $2, $3, $4)`,
        [gameId, dateStr, `Spent ${cost} coins on ${item}`, JSON.stringify(resultData)],
      );

      await client.query('COMMIT');

      res.json({
        success: true,
        item,
        cost,
        remainingCoins: balRes.rows[0].total_coins,
        ...(item === 'hint' ? { bestOptionId: resultData.bestOptionId, bestOptionLabel: resultData.bestOptionLabel } : {}),
      });
    } catch (err) {
      await client.query('ROLLBACK');
      console.error('Spend coins error:', (err as Error).message);
      res.status(500).json({ code: 'INTERNAL_ERROR', message: 'Failed to spend coins' });
    } finally {
      client.release();
    }
  };
}
