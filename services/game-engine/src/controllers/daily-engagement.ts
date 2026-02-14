import { Request, Response } from 'express';
import { Pool } from 'pg';
import { findGameById } from '../models/game.js';

// ---------- Daily Tip ----------

export function getDailyTipController(pool: Pool) {
  return async (req: Request, res: Response): Promise<void> => {
    try {
      const game = await findGameById(pool, req.params.id as string);
      if (!game) { res.status(404).json({ code: 'GAME_NOT_FOUND', message: 'Game not found' }); return; }
      if (game.user_id !== req.userId) { res.status(403).json({ code: 'FORBIDDEN', message: 'Not your game' }); return; }

      const result = await pool.query(
        `SELECT id, category, tip_text, tip_source FROM daily_tips
         WHERE (persona IS NULL OR persona = $1)
           AND min_level <= $2
           AND id NOT IN (SELECT tip_id FROM user_tip_history WHERE user_id = $3 AND game_id = $4)
         ORDER BY RANDOM() LIMIT 1`,
        [game.persona, game.current_level, req.userId, game.id],
      );

      if (result.rows.length === 0) {
        res.json({ tip: null, message: 'All tips seen' });
        return;
      }

      const tip = result.rows[0];

      // Record that this tip was shown
      await pool.query(
        `INSERT INTO user_tip_history (user_id, game_id, tip_id) VALUES ($1, $2, $3)`,
        [req.userId, game.id, tip.id],
      );

      res.json({
        id: tip.id,
        category: tip.category,
        tipText: tip.tip_text,
        tipSource: tip.tip_source,
      });
    } catch (err) {
      console.error('Get daily tip error:', (err as Error).message);
      res.status(500).json({ code: 'INTERNAL_ERROR', message: 'Failed to get daily tip' });
    }
  };
}

export function markTipUsefulController(pool: Pool) {
  return async (req: Request, res: Response): Promise<void> => {
    try {
      const game = await findGameById(pool, req.params.id as string);
      if (!game) { res.status(404).json({ code: 'GAME_NOT_FOUND', message: 'Game not found' }); return; }
      if (game.user_id !== req.userId) { res.status(403).json({ code: 'FORBIDDEN', message: 'Not your game' }); return; }

      await pool.query(
        `UPDATE user_tip_history SET marked_useful = true WHERE user_id = $1 AND game_id = $2 AND tip_id = $3`,
        [req.userId, game.id, req.params.tipId],
      );

      res.json({ success: true });
    } catch (err) {
      console.error('Mark tip useful error:', (err as Error).message);
      res.status(500).json({ code: 'INTERNAL_ERROR', message: 'Failed to mark tip useful' });
    }
  };
}

// ---------- Daily Challenge ----------

export function getDailyChallengeController(pool: Pool) {
  return async (req: Request, res: Response): Promise<void> => {
    try {
      const game = await findGameById(pool, req.params.id as string);
      if (!game) { res.status(404).json({ code: 'GAME_NOT_FOUND', message: 'Game not found' }); return; }
      if (game.user_id !== req.userId) { res.status(403).json({ code: 'FORBIDDEN', message: 'Not your game' }); return; }

      const gameDate = game.current_game_date instanceof Date
        ? game.current_game_date.toISOString().split('T')[0]
        : String(game.current_game_date);

      // Check if there's already a challenge for today
      const existing = await pool.query(
        `SELECT udc.id, udc.status, udc.game_date, udc.completed_at,
                dc.id as challenge_id, dc.challenge_type, dc.title, dc.description,
                dc.reward_xp, dc.reward_coins, dc.check_type, dc.check_params
         FROM user_daily_challenges udc
         JOIN daily_challenges dc ON dc.id = udc.challenge_id
         WHERE udc.user_id = $1 AND udc.game_id = $2 AND udc.game_date = $3`,
        [req.userId, game.id, gameDate],
      );

      if (existing.rows.length > 0) {
        const row = existing.rows[0];
        res.json({
          id: row.challenge_id,
          challengeType: row.challenge_type,
          title: row.title,
          description: row.description,
          rewardXp: row.reward_xp,
          rewardCoins: row.reward_coins,
          checkType: row.check_type,
          status: row.status,
          gameDate: row.game_date,
        });
        return;
      }

      // Pick a random matching challenge
      const challenge = await pool.query(
        `SELECT * FROM daily_challenges
         WHERE (persona IS NULL OR persona = $1)
           AND min_level <= $2
         ORDER BY RANDOM() LIMIT 1`,
        [game.persona, game.current_level],
      );

      if (challenge.rows.length === 0) {
        res.json({ challenge: null, message: 'No challenges available' });
        return;
      }

      const ch = challenge.rows[0];

      // Assign it to the user for today
      await pool.query(
        `INSERT INTO user_daily_challenges (user_id, game_id, challenge_id, game_date, status)
         VALUES ($1, $2, $3, $4, 'active')`,
        [req.userId, game.id, ch.id, gameDate],
      );

      res.json({
        id: ch.id,
        challengeType: ch.challenge_type,
        title: ch.title,
        description: ch.description,
        rewardXp: ch.reward_xp,
        rewardCoins: ch.reward_coins,
        checkType: ch.check_type,
        status: 'active',
        gameDate,
      });
    } catch (err) {
      console.error('Get daily challenge error:', (err as Error).message);
      res.status(500).json({ code: 'INTERNAL_ERROR', message: 'Failed to get daily challenge' });
    }
  };
}

export function completeDailyChallengeController(pool: Pool) {
  return async (req: Request, res: Response): Promise<void> => {
    try {
      const game = await findGameById(pool, req.params.id as string);
      if (!game) { res.status(404).json({ code: 'GAME_NOT_FOUND', message: 'Game not found' }); return; }
      if (game.user_id !== req.userId) { res.status(403).json({ code: 'FORBIDDEN', message: 'Not your game' }); return; }

      const gameDate = game.current_game_date instanceof Date
        ? game.current_game_date.toISOString().split('T')[0]
        : String(game.current_game_date);

      // Get today's active challenge
      const existing = await pool.query(
        `SELECT udc.id, udc.status,
                dc.reward_xp, dc.reward_coins, dc.check_type, dc.check_params
         FROM user_daily_challenges udc
         JOIN daily_challenges dc ON dc.id = udc.challenge_id
         WHERE udc.user_id = $1 AND udc.game_id = $2 AND udc.game_date = $3 AND udc.status = 'active'`,
        [req.userId, game.id, gameDate],
      );

      if (existing.rows.length === 0) {
        res.status(404).json({ code: 'NO_ACTIVE_CHALLENGE', message: 'No active challenge for today' });
        return;
      }

      const ch = existing.rows[0];
      const xpEarned = ch.reward_xp;
      const coinsEarned = ch.reward_coins;

      const client = await pool.connect();
      try {
        await client.query('BEGIN');

        // Mark challenge completed
        await client.query(
          `UPDATE user_daily_challenges SET status = 'completed', completed_at = NOW() WHERE id = $1`,
          [ch.id],
        );

        // Award XP
        await client.query(
          `UPDATE games SET total_xp = total_xp + $1, total_coins = total_coins + $2, updated_at = NOW() WHERE id = $3`,
          [xpEarned, coinsEarned, game.id],
        );

        // XP ledger
        const xpRes = await client.query('SELECT total_xp FROM games WHERE id = $1', [game.id]);
        await client.query(
          `INSERT INTO xp_ledger (user_id, game_id, partner_id, amount, balance_after, reason)
           VALUES ($1, $2, $3, $4, $5, $6)`,
          [req.userId, game.id, game.partner_id, xpEarned, xpRes.rows[0].total_xp, 'daily challenge'],
        );

        // Coin ledger
        const coinRes = await client.query('SELECT total_coins FROM games WHERE id = $1', [game.id]);
        await client.query(
          `INSERT INTO coin_ledger (user_id, partner_id, amount, balance_after, reason)
           VALUES ($1, $2, $3, $4, $5)`,
          [req.userId, game.partner_id, coinsEarned, coinRes.rows[0].total_coins, 'daily challenge'],
        );

        await client.query('COMMIT');

        res.json({ xpEarned, coinsEarned });
      } catch (err) {
        await client.query('ROLLBACK');
        throw err;
      } finally {
        client.release();
      }
    } catch (err) {
      console.error('Complete daily challenge error:', (err as Error).message);
      res.status(500).json({ code: 'INTERNAL_ERROR', message: 'Failed to complete daily challenge' });
    }
  };
}

// ---------- Login Calendar / Daily Rewards ----------

export function getLoginCalendarController(pool: Pool) {
  return async (req: Request, res: Response): Promise<void> => {
    try {
      const game = await findGameById(pool, req.params.id as string);
      if (!game) { res.status(404).json({ code: 'GAME_NOT_FOUND', message: 'Game not found' }); return; }
      if (game.user_id !== req.userId) { res.status(403).json({ code: 'FORBIDDEN', message: 'Not your game' }); return; }

      const gameDate = game.current_game_date instanceof Date
        ? game.current_game_date
        : new Date(String(game.current_game_date));

      const monthStart = `${gameDate.getFullYear()}-${String(gameDate.getMonth() + 1).padStart(2, '0')}-01`;

      const result = await pool.query(
        `SELECT game_date, reward_coins, streak_day FROM login_rewards
         WHERE user_id = $1 AND game_id = $2 AND game_date >= $3
         ORDER BY game_date ASC`,
        [req.userId, game.id, monthStart],
      );

      res.json(result.rows.map(r => ({
        gameDate: r.game_date instanceof Date ? r.game_date.toISOString().split('T')[0] : String(r.game_date),
        rewardCoins: r.reward_coins,
        streakDay: r.streak_day,
      })));
    } catch (err) {
      console.error('Get login calendar error:', (err as Error).message);
      res.status(500).json({ code: 'INTERNAL_ERROR', message: 'Failed to get login calendar' });
    }
  };
}

export function claimLoginRewardController(pool: Pool) {
  return async (req: Request, res: Response): Promise<void> => {
    try {
      const game = await findGameById(pool, req.params.id as string);
      if (!game) { res.status(404).json({ code: 'GAME_NOT_FOUND', message: 'Game not found' }); return; }
      if (game.user_id !== req.userId) { res.status(403).json({ code: 'FORBIDDEN', message: 'Not your game' }); return; }

      const gameDate = game.current_game_date instanceof Date
        ? game.current_game_date.toISOString().split('T')[0]
        : String(game.current_game_date);

      // Check if already claimed today
      const existing = await pool.query(
        `SELECT * FROM login_rewards WHERE user_id = $1 AND game_id = $2 AND game_date = $3`,
        [req.userId, game.id, gameDate],
      );

      if (existing.rows.length > 0) {
        const row = existing.rows[0];
        res.json({
          gameDate: row.game_date instanceof Date ? row.game_date.toISOString().split('T')[0] : String(row.game_date),
          rewardCoins: row.reward_coins,
          streakDay: row.streak_day,
          alreadyClaimed: true,
        });
        return;
      }

      // Calculate streak by checking if yesterday exists
      const yesterday = new Date(gameDate);
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = yesterday.toISOString().split('T')[0];

      const yesterdayReward = await pool.query(
        `SELECT streak_day FROM login_rewards WHERE user_id = $1 AND game_id = $2 AND game_date = $3`,
        [req.userId, game.id, yesterdayStr],
      );

      const streakDay = yesterdayReward.rows.length > 0 ? yesterdayReward.rows[0].streak_day + 1 : 1;

      // Calculate coins based on streak
      let rewardCoins = 5; // day 1-2
      if (streakDay >= 30) rewardCoins = 200;
      else if (streakDay >= 14) rewardCoins = 100;
      else if (streakDay >= 7) rewardCoins = 50;
      else if (streakDay >= 3) rewardCoins = 10;

      const client = await pool.connect();
      try {
        await client.query('BEGIN');

        // Insert login reward
        await client.query(
          `INSERT INTO login_rewards (user_id, game_id, game_date, reward_coins, streak_day)
           VALUES ($1, $2, $3, $4, $5)`,
          [req.userId, game.id, gameDate, rewardCoins, streakDay],
        );

        // Award coins
        await client.query(
          `UPDATE games SET total_coins = total_coins + $1, updated_at = NOW() WHERE id = $2`,
          [rewardCoins, game.id],
        );

        // Coin ledger
        const coinRes = await client.query('SELECT total_coins FROM games WHERE id = $1', [game.id]);
        await client.query(
          `INSERT INTO coin_ledger (user_id, partner_id, amount, balance_after, reason)
           VALUES ($1, $2, $3, $4, $5)`,
          [req.userId, game.partner_id, rewardCoins, coinRes.rows[0].total_coins, `login reward day ${streakDay}`],
        );

        await client.query('COMMIT');

        res.json({
          gameDate,
          rewardCoins,
          streakDay,
          alreadyClaimed: false,
        });
      } catch (err) {
        await client.query('ROLLBACK');
        throw err;
      } finally {
        client.release();
      }
    } catch (err) {
      console.error('Claim login reward error:', (err as Error).message);
      res.status(500).json({ code: 'INTERNAL_ERROR', message: 'Failed to claim login reward' });
    }
  };
}
