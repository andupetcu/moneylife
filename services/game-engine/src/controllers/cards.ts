import { Request, Response } from 'express';
import { Pool } from 'pg';
import { findGameById } from '../models/game.js';

export function getPendingCardsController(pool: Pool) {
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

      const result = await pool.query(
        `SELECT gpc.*, dc.title, dc.description, dc.category, dc.options
         FROM game_pending_cards gpc
         JOIN decision_cards dc ON dc.id = gpc.card_id
         WHERE gpc.game_id = $1 AND gpc.status = 'pending'
         ORDER BY gpc.presented_game_date`,
        [game.id],
      );

      res.json({
        cards: result.rows.map(r => ({
          id: r.id,
          cardId: r.card_id,
          title: r.title,
          description: r.description,
          category: r.category,
          options: r.options,
          presentedDate: r.presented_game_date,
          expiresDate: r.expires_game_date,
          status: r.status,
        })),
      });
    } catch (err) {
      console.error('Get pending cards error:', (err as Error).message);
      res.status(500).json({ code: 'INTERNAL_ERROR', message: 'Failed to fetch cards' });
    }
  };
}
