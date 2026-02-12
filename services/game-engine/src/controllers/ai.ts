import { Request, Response } from 'express';
import { Pool } from 'pg';
import { findGameById } from '../models/game.js';
import { findAccountsByGameId } from '../models/account.js';
import {
  isAIAvailable,
  getFinancialAdvice,
  getCardHint,
  getDailySummary,
  getRemainingCalls,
} from '../services/ai-advisor.js';

// ---------------------------------------------------------------------------
// Shared helpers
// ---------------------------------------------------------------------------

async function loadGameForAI(pool: Pool, req: Request, res: Response) {
  if (!isAIAvailable()) {
    res.status(503).json({ code: 'AI_UNAVAILABLE', message: 'AI advisor is not configured' });
    return null;
  }

  const gameId = req.params.id as string;
  const game = await findGameById(pool, gameId);
  if (!game) {
    res.status(404).json({ code: 'GAME_NOT_FOUND', message: 'Game not found' });
    return null;
  }
  if (game.user_id !== req.userId) {
    res.status(403).json({ code: 'FORBIDDEN', message: 'Not your game' });
    return null;
  }
  if (game.status !== 'active') {
    res.status(400).json({ code: 'GAME_NOT_ACTIVE', message: 'Game is not active' });
    return null;
  }

  const accounts = await findAccountsByGameId(pool, gameId);
  return { game, accounts };
}

// ---------------------------------------------------------------------------
// POST /games/:id/ai/advice
// ---------------------------------------------------------------------------

export function getAdviceController(pool: Pool) {
  return async (req: Request, res: Response): Promise<void> => {
    try {
      const ctx = await loadGameForAI(pool, req, res);
      if (!ctx) return;

      const question = req.body?.question as string | undefined;
      const advice = await getFinancialAdvice(pool, ctx.game, ctx.accounts, question);

      res.json({
        advice,
        remainingCalls: getRemainingCalls(ctx.game.id),
      });
    } catch (err) {
      const msg = (err as Error).message;
      if (msg.includes('limit reached')) {
        res.status(429).json({ code: 'RATE_LIMITED', message: msg });
        return;
      }
      console.error('AI advice error:', msg);
      res.status(500).json({ code: 'AI_ERROR', message: 'Failed to get AI advice' });
    }
  };
}

// ---------------------------------------------------------------------------
// POST /games/:id/ai/card-hint/:cardId
// ---------------------------------------------------------------------------

const HINT_COST = 50;

export function getCardHintController(pool: Pool) {
  return async (req: Request, res: Response): Promise<void> => {
    const client = await pool.connect();
    try {
      const ctx = await loadGameForAI(pool, req, res);
      if (!ctx) { client.release(); return; }

      const cardId = req.params.cardId as string;

      // Load the pending card with decision card details
      const cardRes = await pool.query(
        `SELECT gpc.id, gpc.card_id, dc.title, dc.description, dc.category, dc.options
         FROM game_pending_cards gpc
         JOIN decision_cards dc ON dc.id = gpc.card_id
         WHERE gpc.id = $1 AND gpc.game_id = $2 AND gpc.status = 'pending'`,
        [cardId, ctx.game.id],
      );

      if (cardRes.rows.length === 0) {
        client.release();
        res.status(404).json({ code: 'CARD_NOT_FOUND', message: 'Pending card not found' });
        return;
      }

      // Deduct coins
      if (ctx.game.total_coins < HINT_COST) {
        client.release();
        res.status(400).json({
          code: 'INSUFFICIENT_COINS',
          message: `Need ${HINT_COST} coins, have ${ctx.game.total_coins}`,
        });
        return;
      }

      await client.query('BEGIN');

      await client.query(
        'UPDATE games SET total_coins = total_coins - $1, updated_at = NOW() WHERE id = $2',
        [HINT_COST, ctx.game.id],
      );

      const balRes = await client.query('SELECT total_coins FROM games WHERE id = $1', [ctx.game.id]);
      const remainingCoins = balRes.rows[0].total_coins;

      await client.query(
        `INSERT INTO coin_ledger (user_id, partner_id, amount, balance_after, reason)
         VALUES ($1, $2, $3, $4, $5)`,
        [ctx.game.user_id, ctx.game.partner_id, -HINT_COST, remainingCoins, 'Purchase: ai_hint'],
      );

      const dateStr = ctx.game.current_game_date instanceof Date
        ? ctx.game.current_game_date.toISOString().split('T')[0]
        : ctx.game.current_game_date;

      await client.query(
        `INSERT INTO game_events (game_id, type, game_date, description, data)
         VALUES ($1, 'coin_spend', $2, $3, $4)`,
        [ctx.game.id, dateStr, `Spent ${HINT_COST} coins on AI hint`, JSON.stringify({ item: 'ai_hint', cost: HINT_COST, cardId })],
      );

      await client.query('COMMIT');

      // Now call AI
      const hint = await getCardHint(pool, ctx.game, ctx.accounts, cardRes.rows[0]);

      res.json({
        hint,
        cost: HINT_COST,
        remainingCoins,
        remainingCalls: getRemainingCalls(ctx.game.id),
      });
    } catch (err) {
      await client.query('ROLLBACK').catch(() => {});
      const msg = (err as Error).message;
      if (msg.includes('limit reached')) {
        res.status(429).json({ code: 'RATE_LIMITED', message: msg });
        return;
      }
      console.error('AI card hint error:', msg);
      res.status(500).json({ code: 'AI_ERROR', message: 'Failed to get AI hint' });
    } finally {
      client.release();
    }
  };
}

// ---------------------------------------------------------------------------
// GET /games/:id/ai/daily-summary
// ---------------------------------------------------------------------------

export function getDailySummaryController(pool: Pool) {
  return async (req: Request, res: Response): Promise<void> => {
    try {
      const ctx = await loadGameForAI(pool, req, res);
      if (!ctx) return;

      const summary = await getDailySummary(pool, ctx.game, ctx.accounts);

      res.json({
        summary,
        remainingCalls: getRemainingCalls(ctx.game.id),
      });
    } catch (err) {
      const msg = (err as Error).message;
      if (msg.includes('limit reached')) {
        res.status(429).json({ code: 'RATE_LIMITED', message: msg });
        return;
      }
      console.error('AI daily summary error:', msg);
      res.status(500).json({ code: 'AI_ERROR', message: 'Failed to get daily summary' });
    }
  };
}

// ---------------------------------------------------------------------------
// GET /games/:id/ai/status  — check if AI is available + remaining calls
// ---------------------------------------------------------------------------

export function getAIStatusController(pool: Pool) {
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

      res.json({
        available: isAIAvailable(),
        remainingCalls: isAIAvailable() ? getRemainingCalls(gameId) : 0,
        totalCoins: game.total_coins,
        hintCost: HINT_COST,
      });
    } catch (err) {
      console.error('AI status error:', (err as Error).message);
      res.status(500).json({ code: 'INTERNAL_ERROR', message: 'Failed to get AI status' });
    }
  };
}
