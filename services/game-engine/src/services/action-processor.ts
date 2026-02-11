import { Pool } from 'pg';
import type { GameAction, GameActionResult } from '@moneylife/shared-types';
import { advanceDay, isLastDayOfMonth } from '@moneylife/simulation-engine';
import type { GameRow } from '../models/game.js';
import { findAccountsByGameId } from '../models/account.js';
import { buildGameState } from './game-state.js';

export async function processAction(
  pool: Pool,
  game: GameRow,
  action: GameAction,
): Promise<GameActionResult> {
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    // Optimistic locking
    const lockResult = await client.query(
      'SELECT state_version FROM games WHERE id = $1 FOR UPDATE',
      [game.id],
    );

    if (lockResult.rows.length === 0) {
      await client.query('ROLLBACK');
      return { success: false, newState: {}, events: [], rewards: [], errors: [{ code: 'GAME_NOT_FOUND', message: 'Game not found' }] };
    }

    const accounts = await findAccountsByGameId(pool, game.id);
    const gameState = buildGameState(game, accounts);
    const currentDate = gameState.currentDate;

    if (action.type === 'advance_day') {
      // Check for unresolved pending cards
      const pendingCards = await client.query(
        "SELECT COUNT(*) FROM game_pending_cards WHERE game_id = $1 AND status = 'pending'",
        [game.id],
      );
      if (parseInt(pendingCards.rows[0].count, 10) > 0) {
        await client.query('ROLLBACK');
        return {
          success: false, newState: {}, events: [], rewards: [],
          errors: [{ code: 'PENDING_CARDS', message: 'Resolve all pending decision cards before advancing' }],
        };
      }

      const nextDate = advanceDay(currentDate);
      const dateStr = `${nextDate.year}-${String(nextDate.month).padStart(2, '0')}-${String(nextDate.day).padStart(2, '0')}`;

      await client.query(
        'UPDATE games SET current_game_date = $1, state_version = state_version + 1, updated_at = NOW() WHERE id = $2',
        [dateStr, game.id],
      );

      await client.query('COMMIT');

      return {
        success: true,
        newState: { currentDate: nextDate },
        events: [{ type: 'day_advanced', description: 'Day advanced', timestamp: nextDate, data: {} }],
        rewards: [],
      };
    } else if (action.type === 'decide_card') {
      const cardId = action.payload.cardId as string;
      const optionId = action.payload.optionId as string;

      if (!cardId || !optionId) {
        await client.query('ROLLBACK');
        return { success: false, newState: {}, events: [], rewards: [], errors: [{ code: 'VALIDATION_ERROR', message: 'cardId and optionId are required' }] };
      }

      const cardResult = await client.query(
        "UPDATE game_pending_cards SET selected_option_id = $1, resolved_at = NOW(), status = 'resolved' WHERE id = $2 AND game_id = $3 AND status = 'pending' RETURNING *",
        [optionId, cardId, game.id],
      );

      if (cardResult.rows.length === 0) {
        await client.query('ROLLBACK');
        return { success: false, newState: {}, events: [], rewards: [], errors: [{ code: 'CARD_NOT_FOUND', message: 'Pending card not found' }] };
      }

      await client.query('UPDATE games SET state_version = state_version + 1, updated_at = NOW() WHERE id = $1', [game.id]);
      await client.query('COMMIT');

      return {
        success: true,
        newState: {},
        events: [{ type: 'card_decided', description: `Decided card ${cardId}`, timestamp: currentDate, data: { cardId, optionId } }],
        rewards: [],
      };
    } else if (action.type === 'transfer') {
      const fromAccountId = action.payload.fromAccountId as string;
      const toAccountId = action.payload.toAccountId as string;
      const amount = action.payload.amount as number;

      if (!fromAccountId || !toAccountId || !amount || amount <= 0) {
        await client.query('ROLLBACK');
        return { success: false, newState: {}, events: [], rewards: [], errors: [{ code: 'VALIDATION_ERROR', message: 'fromAccountId, toAccountId, and positive amount are required' }] };
      }

      const fromAccount = accounts.find(a => a.id === fromAccountId);
      if (!fromAccount || parseInt(fromAccount.balance, 10) < amount) {
        await client.query('ROLLBACK');
        return { success: false, newState: {}, events: [], rewards: [], errors: [{ code: 'INSUFFICIENT_FUNDS', message: 'Insufficient funds for transfer' }] };
      }

      await client.query('UPDATE game_accounts SET balance = balance - $1 WHERE id = $2', [amount, fromAccountId]);
      await client.query('UPDATE game_accounts SET balance = balance + $1 WHERE id = $2', [amount, toAccountId]);

      const gameDate = game.current_game_date.toISOString().split('T')[0];
      const fromBalAfter = parseInt(fromAccount.balance, 10) - amount;
      await client.query(
        `INSERT INTO transactions (game_id, account_id, game_date, type, category, amount, balance_after, description, idempotency_key)
         VALUES ($1, $2, $3, 'transfer', 'transfer', $4, $5, $6, $7)`,
        [game.id, fromAccountId, gameDate, -amount, fromBalAfter, 'Transfer out', action.idempotencyKey],
      );

      const toAccount = accounts.find(a => a.id === toAccountId);
      const toBalAfter = parseInt(toAccount?.balance ?? '0', 10) + amount;
      await client.query(
        `INSERT INTO transactions (game_id, account_id, game_date, type, category, amount, balance_after, description)
         VALUES ($1, $2, $3, 'transfer', 'transfer', $4, $5, $6)`,
        [game.id, toAccountId, gameDate, amount, toBalAfter, 'Transfer in'],
      );

      await client.query('UPDATE games SET state_version = state_version + 1, updated_at = NOW() WHERE id = $1', [game.id]);
      await client.query('COMMIT');

      return {
        success: true,
        newState: {},
        events: [{ type: 'transfer', description: `Transferred ${amount} cents`, timestamp: currentDate, data: { fromAccountId, toAccountId, amount } }],
        rewards: [],
      };
    } else {
      // Generic action - update version
      await client.query('UPDATE games SET state_version = state_version + 1, updated_at = NOW() WHERE id = $1', [game.id]);
      await client.query('COMMIT');

      return {
        success: true,
        newState: {},
        events: [{ type: action.type, description: `Processed ${action.type}`, timestamp: currentDate, data: action.payload }],
        rewards: [],
      };
    }
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}
