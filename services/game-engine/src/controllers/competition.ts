import { Request, Response } from 'express';
import { Pool } from 'pg';
import { z } from 'zod';

// ─── Extended Leaderboards ─────────────────────────────────────

export function weeklyXpLeaderboardController(pool: Pool) {
  return async (req: Request, res: Response): Promise<void> => {
    try {
      const userId = req.userId!;
      // Find Monday of current week
      const result = await pool.query(
        `SELECT u.id AS user_id, u.display_name,
                COALESCE(SUM(xl.amount), 0)::int AS score
         FROM users u
         JOIN xp_ledger xl ON xl.user_id = u.id
           AND xl.created_at >= date_trunc('week', NOW())
         GROUP BY u.id, u.display_name
         ORDER BY score DESC
         LIMIT 50`,
      );

      res.json({
        entries: result.rows.map((r, i) => ({
          rank: i + 1,
          userId: r.user_id,
          displayName: r.display_name,
          avatarInitial: r.display_name?.charAt(0)?.toUpperCase() || '?',
          score: r.score,
          isYou: r.user_id === userId,
        })),
      });
    } catch (err) {
      console.error('Weekly XP leaderboard error:', (err as Error).message);
      res.status(500).json({ code: 'INTERNAL_ERROR', message: 'Failed to fetch leaderboard' });
    }
  };
}

export function streaksLeaderboardController(pool: Pool) {
  return async (req: Request, res: Response): Promise<void> => {
    try {
      const userId = req.userId!;

      const result = await pool.query(
        `SELECT u.id AS user_id, u.display_name,
                COALESCE(g.streak_longest, 0)::int AS score
         FROM users u
         JOIN LATERAL (
           SELECT streak_longest
           FROM games
           WHERE user_id = u.id AND deleted_at IS NULL
           ORDER BY updated_at DESC
           LIMIT 1
         ) g ON true
         ORDER BY score DESC
         LIMIT 50`,
      );

      res.json({
        entries: result.rows.map((r, i) => ({
          rank: i + 1,
          userId: r.user_id,
          displayName: r.display_name,
          avatarInitial: r.display_name?.charAt(0)?.toUpperCase() || '?',
          score: r.score,
          isYou: r.user_id === userId,
        })),
      });
    } catch (err) {
      console.error('Streaks leaderboard error:', (err as Error).message);
      res.status(500).json({ code: 'INTERNAL_ERROR', message: 'Failed to fetch leaderboard' });
    }
  };
}

export function creditLeaderboardController(pool: Pool) {
  return async (req: Request, res: Response): Promise<void> => {
    try {
      const userId = req.userId!;

      const result = await pool.query(
        `SELECT u.id AS user_id, u.display_name,
                COALESCE(g.chi_score, 0)::int AS score
         FROM users u
         JOIN LATERAL (
           SELECT chi_score
           FROM games
           WHERE user_id = u.id AND deleted_at IS NULL
           ORDER BY updated_at DESC
           LIMIT 1
         ) g ON true
         ORDER BY score DESC
         LIMIT 50`,
      );

      res.json({
        entries: result.rows.map((r, i) => ({
          rank: i + 1,
          userId: r.user_id,
          displayName: r.display_name,
          avatarInitial: r.display_name?.charAt(0)?.toUpperCase() || '?',
          score: r.score,
          isYou: r.user_id === userId,
        })),
      });
    } catch (err) {
      console.error('Credit leaderboard error:', (err as Error).message);
      res.status(500).json({ code: 'INTERNAL_ERROR', message: 'Failed to fetch leaderboard' });
    }
  };
}

export function badgesLeaderboardController(pool: Pool) {
  return async (req: Request, res: Response): Promise<void> => {
    try {
      const userId = req.userId!;

      const result = await pool.query(
        `SELECT u.id AS user_id, u.display_name,
                COUNT(ub.id)::int AS score
         FROM users u
         JOIN user_badges ub ON ub.user_id = u.id
         GROUP BY u.id, u.display_name
         ORDER BY score DESC
         LIMIT 50`,
      );

      res.json({
        entries: result.rows.map((r, i) => ({
          rank: i + 1,
          userId: r.user_id,
          displayName: r.display_name,
          avatarInitial: r.display_name?.charAt(0)?.toUpperCase() || '?',
          score: r.score,
          isYou: r.user_id === userId,
        })),
      });
    } catch (err) {
      console.error('Badges leaderboard error:', (err as Error).message);
      res.status(500).json({ code: 'INTERNAL_ERROR', message: 'Failed to fetch leaderboard' });
    }
  };
}

export function challengesLeaderboardController(pool: Pool) {
  return async (req: Request, res: Response): Promise<void> => {
    try {
      const userId = req.userId!;

      const result = await pool.query(
        `SELECT u.id AS user_id, u.display_name,
                COUNT(udc.id)::int AS score
         FROM users u
         JOIN user_daily_challenges udc ON udc.user_id = u.id AND udc.status = 'completed'
         GROUP BY u.id, u.display_name
         ORDER BY score DESC
         LIMIT 50`,
      );

      res.json({
        entries: result.rows.map((r, i) => ({
          rank: i + 1,
          userId: r.user_id,
          displayName: r.display_name,
          avatarInitial: r.display_name?.charAt(0)?.toUpperCase() || '?',
          score: r.score,
          isYou: r.user_id === userId,
        })),
      });
    } catch (err) {
      console.error('Challenges leaderboard error:', (err as Error).message);
      res.status(500).json({ code: 'INTERNAL_ERROR', message: 'Failed to fetch leaderboard' });
    }
  };
}

// ─── Friend Challenges ─────────────────────────────────────────

const createChallengeSchema = z.object({
  opponentId: z.string().uuid(),
  gameId: z.string().uuid(),
  challengeType: z.enum(['savings_rate', 'net_worth_growth', 'xp_earned']).default('savings_rate'),
  durationDays: z.number().int().min(1).max(30).default(7),
});

export function createChallengeController(pool: Pool) {
  return async (req: Request, res: Response): Promise<void> => {
    try {
      const userId = req.userId!;
      const parsed = createChallengeSchema.safeParse(req.body);
      if (!parsed.success) {
        res.status(400).json({ code: 'VALIDATION_ERROR', details: parsed.error.flatten().fieldErrors });
        return;
      }

      const { opponentId, gameId, challengeType, durationDays } = parsed.data;

      if (userId === opponentId) {
        res.status(400).json({ code: 'CANNOT_CHALLENGE_SELF', message: 'Cannot challenge yourself' });
        return;
      }

      // Verify friendship
      const [a, b] = userId < opponentId ? [userId, opponentId] : [opponentId, userId];
      const friendship = await pool.query(
        "SELECT id FROM friendships WHERE user_id_a = $1 AND user_id_b = $2 AND status = 'accepted'",
        [a, b],
      );
      if (friendship.rows.length === 0) {
        res.status(400).json({ code: 'NOT_FRIENDS', message: 'You must be friends to challenge' });
        return;
      }

      // Verify game ownership
      const game = await pool.query(
        'SELECT id FROM games WHERE id = $1 AND user_id = $2 AND deleted_at IS NULL',
        [gameId, userId],
      );
      if (game.rows.length === 0) {
        res.status(404).json({ code: 'GAME_NOT_FOUND', message: 'Game not found' });
        return;
      }

      const result = await pool.query(
        `INSERT INTO friend_challenges (challenger_id, opponent_id, challenger_game_id, challenge_type, duration_days)
         VALUES ($1, $2, $3, $4, $5)
         RETURNING *`,
        [userId, opponentId, gameId, challengeType, durationDays],
      );

      const c = result.rows[0];
      res.status(201).json({
        id: c.id,
        challengerId: c.challenger_id,
        opponentId: c.opponent_id,
        challengeType: c.challenge_type,
        durationDays: c.duration_days,
        status: c.status,
        rewardXp: c.reward_xp,
        rewardCoins: c.reward_coins,
        createdAt: c.created_at,
      });
    } catch (err) {
      console.error('Create challenge error:', (err as Error).message);
      res.status(500).json({ code: 'INTERNAL_ERROR', message: 'Failed to create challenge' });
    }
  };
}

export function listChallengesController(pool: Pool) {
  return async (req: Request, res: Response): Promise<void> => {
    try {
      const userId = req.userId!;

      const result = await pool.query(
        `SELECT fc.*,
                cu.display_name AS challenger_name,
                ou.display_name AS opponent_name
         FROM friend_challenges fc
         JOIN users cu ON cu.id = fc.challenger_id
         JOIN users ou ON ou.id = fc.opponent_id
         WHERE fc.challenger_id = $1 OR fc.opponent_id = $1
         ORDER BY
           CASE fc.status
             WHEN 'active' THEN 0
             WHEN 'pending' THEN 1
             WHEN 'completed' THEN 2
             ELSE 3
           END,
           fc.created_at DESC
         LIMIT 50`,
        [userId],
      );

      res.json({
        challenges: result.rows.map(r => ({
          id: r.id,
          challengerId: r.challenger_id,
          challengerName: r.challenger_name,
          opponentId: r.opponent_id,
          opponentName: r.opponent_name,
          challengeType: r.challenge_type,
          durationDays: r.duration_days,
          startGameDate: r.start_game_date,
          endGameDate: r.end_game_date,
          challengerScore: parseFloat(r.challenger_score) || 0,
          opponentScore: parseFloat(r.opponent_score) || 0,
          status: r.status,
          winnerId: r.winner_id,
          rewardXp: r.reward_xp,
          rewardCoins: r.reward_coins,
          createdAt: r.created_at,
          isChallenger: r.challenger_id === userId,
        })),
      });
    } catch (err) {
      console.error('List challenges error:', (err as Error).message);
      res.status(500).json({ code: 'INTERNAL_ERROR', message: 'Failed to list challenges' });
    }
  };
}

export function acceptChallengeController(pool: Pool) {
  return async (req: Request, res: Response): Promise<void> => {
    try {
      const userId = req.userId!;
      const { id } = req.params;
      const gameId = req.body.gameId;

      if (!gameId) {
        res.status(400).json({ code: 'VALIDATION_ERROR', message: 'gameId is required' });
        return;
      }

      const challenge = await pool.query(
        "SELECT * FROM friend_challenges WHERE id = $1 AND opponent_id = $2 AND status = 'pending'",
        [id, userId],
      );
      if (challenge.rows.length === 0) {
        res.status(404).json({ code: 'CHALLENGE_NOT_FOUND', message: 'Challenge not found' });
        return;
      }

      // Verify game ownership
      const game = await pool.query(
        'SELECT id, current_date AS game_date FROM games WHERE id = $1 AND user_id = $2 AND deleted_at IS NULL',
        [gameId, userId],
      );
      if (game.rows.length === 0) {
        res.status(404).json({ code: 'GAME_NOT_FOUND', message: 'Game not found' });
        return;
      }

      const c = challenge.rows[0];
      const startDate = new Date();
      const endDate = new Date(startDate);
      endDate.setDate(endDate.getDate() + c.duration_days);

      await pool.query(
        `UPDATE friend_challenges
         SET opponent_game_id = $1, status = 'active',
             start_game_date = $2, end_game_date = $3, updated_at = NOW()
         WHERE id = $4`,
        [gameId, startDate.toISOString().split('T')[0], endDate.toISOString().split('T')[0], id],
      );

      res.json({ success: true });
    } catch (err) {
      console.error('Accept challenge error:', (err as Error).message);
      res.status(500).json({ code: 'INTERNAL_ERROR', message: 'Failed to accept challenge' });
    }
  };
}

export function declineChallengeController(pool: Pool) {
  return async (req: Request, res: Response): Promise<void> => {
    try {
      const userId = req.userId!;
      const { id } = req.params;

      const result = await pool.query(
        "UPDATE friend_challenges SET status = 'declined', updated_at = NOW() WHERE id = $1 AND opponent_id = $2 AND status = 'pending' RETURNING id",
        [id, userId],
      );
      if (result.rows.length === 0) {
        res.status(404).json({ code: 'CHALLENGE_NOT_FOUND', message: 'Challenge not found' });
        return;
      }

      res.json({ success: true });
    } catch (err) {
      console.error('Decline challenge error:', (err as Error).message);
      res.status(500).json({ code: 'INTERNAL_ERROR', message: 'Failed to decline challenge' });
    }
  };
}

export function getChallengeController(pool: Pool) {
  return async (req: Request, res: Response): Promise<void> => {
    try {
      const userId = req.userId!;
      const { id } = req.params;

      const result = await pool.query(
        `SELECT fc.*,
                cu.display_name AS challenger_name,
                ou.display_name AS opponent_name
         FROM friend_challenges fc
         JOIN users cu ON cu.id = fc.challenger_id
         JOIN users ou ON ou.id = fc.opponent_id
         WHERE fc.id = $1 AND (fc.challenger_id = $2 OR fc.opponent_id = $2)`,
        [id, userId],
      );

      if (result.rows.length === 0) {
        res.status(404).json({ code: 'CHALLENGE_NOT_FOUND', message: 'Challenge not found' });
        return;
      }

      const r = result.rows[0];

      // Calculate live scores for active challenges
      let challengerScore = parseFloat(r.challenger_score) || 0;
      let opponentScore = parseFloat(r.opponent_score) || 0;

      if (r.status === 'active' && r.start_game_date && r.end_game_date) {
        if (r.challenge_type === 'xp_earned') {
          const cXp = await pool.query(
            `SELECT COALESCE(SUM(amount), 0)::int AS score FROM xp_ledger
             WHERE user_id = $1 AND created_at >= $2 AND created_at <= $3`,
            [r.challenger_id, r.start_game_date, r.end_game_date],
          );
          const oXp = await pool.query(
            `SELECT COALESCE(SUM(amount), 0)::int AS score FROM xp_ledger
             WHERE user_id = $1 AND created_at >= $2 AND created_at <= $3`,
            [r.opponent_id, r.start_game_date, r.end_game_date],
          );
          challengerScore = cXp.rows[0].score;
          opponentScore = oXp.rows[0].score;
        } else if (r.challenge_type === 'net_worth_growth') {
          const getNetWorth = async (gameId: string) => {
            const res = await pool.query('SELECT net_worth FROM games WHERE id = $1', [gameId]);
            return res.rows[0]?.net_worth ? parseInt(res.rows[0].net_worth, 10) : 0;
          };
          challengerScore = await getNetWorth(r.challenger_game_id);
          if (r.opponent_game_id) opponentScore = await getNetWorth(r.opponent_game_id);
        }

        // Update stored scores
        await pool.query(
          'UPDATE friend_challenges SET challenger_score = $1, opponent_score = $2 WHERE id = $3',
          [challengerScore, opponentScore, id],
        );
      }

      res.json({
        id: r.id,
        challengerId: r.challenger_id,
        challengerName: r.challenger_name,
        opponentId: r.opponent_id,
        opponentName: r.opponent_name,
        challengeType: r.challenge_type,
        durationDays: r.duration_days,
        startGameDate: r.start_game_date,
        endGameDate: r.end_game_date,
        challengerScore,
        opponentScore,
        status: r.status,
        winnerId: r.winner_id,
        rewardXp: r.reward_xp,
        rewardCoins: r.reward_coins,
        createdAt: r.created_at,
        isChallenger: r.challenger_id === userId,
      });
    } catch (err) {
      console.error('Get challenge error:', (err as Error).message);
      res.status(500).json({ code: 'INTERNAL_ERROR', message: 'Failed to get challenge' });
    }
  };
}

// ─── Coin Shop ──────────────────────────────────────────────────

export function listShopItemsController(pool: Pool) {
  return async (req: Request, res: Response): Promise<void> => {
    try {
      const userId = req.userId!;

      const result = await pool.query(
        `SELECT csi.*,
                COALESCE(ui.owned_count, 0)::int AS owned_count
         FROM coin_shop_items csi
         LEFT JOIN (
           SELECT item_id, COUNT(*)::int AS owned_count
           FROM user_items
           WHERE user_id = $1 AND used_at IS NULL
           GROUP BY item_id
         ) ui ON ui.item_id = csi.id
         WHERE csi.active = true
         ORDER BY csi.sort_order`,
        [userId],
      );

      res.json({
        items: result.rows.map(r => ({
          id: r.id,
          itemKey: r.item_key,
          name: r.name,
          description: r.description,
          category: r.category,
          price: r.price,
          icon: r.icon,
          effectType: r.effect_type,
          effectDurationHours: r.effect_duration_hours,
          maxOwned: r.max_owned,
          ownedCount: r.owned_count,
        })),
      });
    } catch (err) {
      console.error('List shop items error:', (err as Error).message);
      res.status(500).json({ code: 'INTERNAL_ERROR', message: 'Failed to list shop items' });
    }
  };
}

const buyItemSchema = z.object({
  itemKey: z.string().min(1),
  gameId: z.string().uuid(),
});

export function buyItemController(pool: Pool) {
  return async (req: Request, res: Response): Promise<void> => {
    try {
      const userId = req.userId!;
      const parsed = buyItemSchema.safeParse(req.body);
      if (!parsed.success) {
        res.status(400).json({ code: 'VALIDATION_ERROR', details: parsed.error.flatten().fieldErrors });
        return;
      }

      const { itemKey, gameId } = parsed.data;

      // Get item
      const itemRes = await pool.query(
        'SELECT * FROM coin_shop_items WHERE item_key = $1 AND active = true',
        [itemKey],
      );
      if (itemRes.rows.length === 0) {
        res.status(404).json({ code: 'ITEM_NOT_FOUND', message: 'Item not found' });
        return;
      }
      const item = itemRes.rows[0];

      // Check max owned
      if (item.max_owned > 0) {
        const ownedRes = await pool.query(
          'SELECT COUNT(*)::int AS cnt FROM user_items WHERE user_id = $1 AND item_id = $2 AND used_at IS NULL',
          [userId, item.id],
        );
        if (ownedRes.rows[0].cnt >= item.max_owned) {
          res.status(400).json({ code: 'MAX_OWNED', message: 'You already own the maximum of this item' });
          return;
        }
      }

      // Check user has enough coins
      const gameRes = await pool.query(
        'SELECT total_coins FROM games WHERE id = $1 AND user_id = $2 AND deleted_at IS NULL',
        [gameId, userId],
      );
      if (gameRes.rows.length === 0) {
        res.status(404).json({ code: 'GAME_NOT_FOUND', message: 'Game not found' });
        return;
      }
      const coins = gameRes.rows[0].total_coins || 0;
      if (coins < item.price) {
        res.status(400).json({ code: 'INSUFFICIENT_COINS', message: 'Not enough coins' });
        return;
      }

      // Transaction: deduct coins + insert user_item + coin_ledger
      const client = await pool.connect();
      try {
        await client.query('BEGIN');

        await client.query(
          'UPDATE games SET total_coins = total_coins - $1, updated_at = NOW() WHERE id = $2',
          [item.price, gameId],
        );

        const balanceResult = await client.query(
          'SELECT total_coins FROM games WHERE id = $1',
          [gameId],
        );
        const balanceAfter = balanceResult.rows[0]?.total_coins ?? 0;

        await client.query(
          `INSERT INTO coin_ledger (user_id, amount, balance_after, reason, reference_id)
           VALUES ($1, $2, $3, $4, $5)`,
          [userId, -item.price, balanceAfter, `Shop purchase: ${item.name}`, item.id],
        );

        const expiresAt = item.effect_duration_hours
          ? new Date(Date.now() + item.effect_duration_hours * 3600000).toISOString()
          : null;

        await client.query(
          `INSERT INTO user_items (user_id, item_id, game_id, quantity, expires_at)
           VALUES ($1, $2, $3, 1, $4)`,
          [userId, item.id, gameId, expiresAt],
        );

        await client.query('COMMIT');

        const remaining = await pool.query('SELECT total_coins FROM games WHERE id = $1', [gameId]);

        res.json({
          success: true,
          remainingCoins: remaining.rows[0]?.total_coins || 0,
          item: {
            id: item.id,
            itemKey: item.item_key,
            name: item.name,
            icon: item.icon,
          },
        });
      } catch (err) {
        await client.query('ROLLBACK');
        throw err;
      } finally {
        client.release();
      }
    } catch (err) {
      console.error('Buy item error:', (err as Error).message);
      res.status(500).json({ code: 'INTERNAL_ERROR', message: 'Failed to buy item' });
    }
  };
}

export function listInventoryController(pool: Pool) {
  return async (req: Request, res: Response): Promise<void> => {
    try {
      const userId = req.userId!;

      const result = await pool.query(
        `SELECT ui.id, ui.quantity, ui.used_at, ui.expires_at, ui.created_at,
                csi.item_key, csi.name, csi.description, csi.category,
                csi.icon, csi.effect_type, csi.effect_duration_hours
         FROM user_items ui
         JOIN coin_shop_items csi ON csi.id = ui.item_id
         WHERE ui.user_id = $1
         ORDER BY ui.created_at DESC`,
        [userId],
      );

      res.json({
        items: result.rows.map(r => ({
          id: r.id,
          itemKey: r.item_key,
          name: r.name,
          description: r.description,
          category: r.category,
          icon: r.icon,
          effectType: r.effect_type,
          quantity: r.quantity,
          usedAt: r.used_at,
          expiresAt: r.expires_at,
          createdAt: r.created_at,
        })),
      });
    } catch (err) {
      console.error('List inventory error:', (err as Error).message);
      res.status(500).json({ code: 'INTERNAL_ERROR', message: 'Failed to list inventory' });
    }
  };
}

export function useItemController(pool: Pool) {
  return async (req: Request, res: Response): Promise<void> => {
    try {
      const userId = req.userId!;
      const { itemId } = req.params;

      const result = await pool.query(
        'UPDATE user_items SET used_at = NOW() WHERE id = $1 AND user_id = $2 AND used_at IS NULL RETURNING id',
        [itemId, userId],
      );

      if (result.rows.length === 0) {
        res.status(404).json({ code: 'ITEM_NOT_FOUND', message: 'Item not found or already used' });
        return;
      }

      res.json({ success: true });
    } catch (err) {
      console.error('Use item error:', (err as Error).message);
      res.status(500).json({ code: 'INTERNAL_ERROR', message: 'Failed to use item' });
    }
  };
}

// ─── Achievement Sharing ────────────────────────────────────────

const shareSchema = z.object({
  badgeId: z.string().optional(),
  shareType: z.enum(['badge', 'level_up', 'streak_milestone', 'net_worth_milestone']),
  sharePlatform: z.enum(['twitter', 'whatsapp', 'clipboard']).optional(),
  shareData: z.record(z.unknown()).optional(),
});

export function logShareController(pool: Pool) {
  return async (req: Request, res: Response): Promise<void> => {
    try {
      const userId = req.userId!;
      const parsed = shareSchema.safeParse(req.body);
      if (!parsed.success) {
        res.status(400).json({ code: 'VALIDATION_ERROR', details: parsed.error.flatten().fieldErrors });
        return;
      }

      const { badgeId, shareType, sharePlatform, shareData } = parsed.data;

      await pool.query(
        `INSERT INTO achievement_shares (user_id, badge_id, share_type, share_platform, share_data)
         VALUES ($1, $2, $3, $4, $5)`,
        [userId, badgeId || null, shareType, sharePlatform || null, JSON.stringify(shareData || {})],
      );

      res.status(201).json({ success: true });
    } catch (err) {
      console.error('Log share error:', (err as Error).message);
      res.status(500).json({ code: 'INTERNAL_ERROR', message: 'Failed to log share' });
    }
  };
}
