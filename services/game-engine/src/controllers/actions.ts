import { Request, Response } from 'express';
import { Pool } from 'pg';
import { submitActionSchema } from '../validators.js';
import { findGameById } from '../models/game.js';
import { processAction } from '../services/action-processor.js';

export function submitActionController(pool: Pool) {
  return async (req: Request, res: Response): Promise<void> => {
    const parsed = submitActionSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ code: 'VALIDATION_ERROR', message: 'Invalid input', details: parsed.error.flatten().fieldErrors });
      return;
    }

    const { type, payload, idempotencyKey } = parsed.data;
    const gameId = req.params.id as string;

    try {
      // Check idempotency
      const existing = await pool.query(
        'SELECT response FROM idempotency_keys WHERE key = $1 AND game_id = $2',
        [idempotencyKey, gameId],
      );

      if (existing.rows.length > 0) {
        res.json(existing.rows[0].response);
        return;
      }

      const game = await findGameById(pool, gameId);
      if (!game) {
        res.status(404).json({ code: 'GAME_NOT_FOUND', message: 'Game not found' });
        return;
      }

      if (game.user_id !== req.userId) {
        res.status(403).json({ code: 'FORBIDDEN', message: 'Not your game' });
        return;
      }

      if (game.status !== 'active') {
        res.status(400).json({ code: 'GAME_NOT_ACTIVE', message: 'Game is not active' });
        return;
      }

      const result = await processAction(pool, game, {
        type: type as import('@moneylife/shared-types').GameActionType,
        payload,
        clientTimestamp: new Date().toISOString(),
        idempotencyKey,
      });

      // Store idempotency key
      await pool.query(
        'INSERT INTO idempotency_keys (key, game_id, action_type, response) VALUES ($1, $2, $3, $4) ON CONFLICT (key) DO NOTHING',
        [idempotencyKey, gameId, type, JSON.stringify(result)],
      );

      if (result.success) {
        res.json(result);
      } else {
        res.status(400).json(result);
      }
    } catch (err) {
      console.error('Submit action error:', (err as Error).message);
      res.status(500).json({ code: 'INTERNAL_ERROR', message: 'Failed to process action' });
    }
  };
}
