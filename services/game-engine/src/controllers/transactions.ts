import { Request, Response } from 'express';
import { Pool } from 'pg';
import { findGameById } from '../models/game.js';
import { findTransactionsByGameId } from '../models/transaction.js';

export function getTransactionsController(pool: Pool) {
  return async (req: Request, res: Response): Promise<void> => {
    try {
      const game = await findGameById(pool, req.params.id as string);
      if (!game) {
        res.status(404).json({ code: 'GAME_NOT_FOUND', message: 'Game not found' });
        return;
      }
      if (game.user_id !== req.userId) {
        res.status(403).json({ code: 'FORBIDDEN', message: 'Not your game' });
        return;
      }

      const limit = Math.min(parseInt(req.query.limit as string, 10) || 50, 100);
      const offset = parseInt(req.query.offset as string, 10) || 0;

      const transactions = await findTransactionsByGameId(pool, game.id, limit, offset);

      res.json({
        transactions: transactions.map(t => ({
          id: t.id,
          gameDate: t.game_date,
          type: t.type,
          category: t.category,
          amount: parseInt(t.amount, 10),
          balanceAfter: parseInt(t.balance_after, 10),
          description: t.description,
          isAutomated: t.is_automated,
        })),
        pagination: { limit, offset, hasMore: transactions.length === limit },
      });
    } catch (err) {
      console.error('Get transactions error:', (err as Error).message);
      res.status(500).json({ code: 'INTERNAL_ERROR', message: 'Failed to fetch transactions' });
    }
  };
}
