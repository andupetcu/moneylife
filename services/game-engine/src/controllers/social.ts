import { Request, Response } from 'express';
import { Pool } from 'pg';
import { z } from 'zod';

// ─── Friends ────────────────────────────────────────────────────

const sendRequestSchema = z.object({
  targetUserId: z.string().uuid(),
});

export function sendFriendRequestController(pool: Pool) {
  return async (req: Request, res: Response): Promise<void> => {
    try {
      const parsed = sendRequestSchema.safeParse(req.body);
      if (!parsed.success) {
        res.status(400).json({ code: 'VALIDATION_ERROR', details: parsed.error.flatten().fieldErrors });
        return;
      }
      const userId = req.userId!;
      const { targetUserId } = parsed.data;

      if (userId === targetUserId) {
        res.status(400).json({ code: 'CANNOT_FRIEND_SELF', message: 'Cannot send friend request to yourself' });
        return;
      }

      // Check target user exists
      const userCheck = await pool.query('SELECT id FROM users WHERE id = $1', [targetUserId]);
      if (userCheck.rows.length === 0) {
        res.status(404).json({ code: 'USER_NOT_FOUND', message: 'User not found' });
        return;
      }

      // Check for existing friendship
      const [a, b] = userId < targetUserId ? [userId, targetUserId] : [targetUserId, userId];
      const existingFriendship = await pool.query(
        "SELECT id, status FROM friendships WHERE user_id_a = $1 AND user_id_b = $2",
        [a, b],
      );
      if (existingFriendship.rows.length > 0) {
        const fs = existingFriendship.rows[0];
        if (fs.status === 'accepted') {
          res.status(400).json({ code: 'ALREADY_FRIENDS', message: 'Already friends' });
          return;
        }
        if (fs.status === 'blocked') {
          res.status(400).json({ code: 'BLOCKED', message: 'Cannot send request' });
          return;
        }
      }

      // Check for existing pending request
      const existingReq = await pool.query(
        "SELECT id FROM friend_requests WHERE from_user_id = $1 AND to_user_id = $2 AND status = 'pending'",
        [userId, targetUserId],
      );
      if (existingReq.rows.length > 0) {
        res.status(400).json({ code: 'REQUEST_EXISTS', message: 'Friend request already sent' });
        return;
      }

      // Check for reverse pending request — auto-accept
      const reverseReq = await pool.query(
        "SELECT id FROM friend_requests WHERE from_user_id = $1 AND to_user_id = $2 AND status = 'pending'",
        [targetUserId, userId],
      );
      if (reverseReq.rows.length > 0) {
        const client = await pool.connect();
        try {
          await client.query('BEGIN');
          await client.query(
            "UPDATE friend_requests SET status = 'accepted', updated_at = NOW() WHERE id = $1",
            [reverseReq.rows[0].id],
          );
          await client.query(
            `INSERT INTO friendships (user_id_a, user_id_b, initiated_by, status, partner_id)
             VALUES ($1, $2, $3, 'accepted', $4)
             ON CONFLICT (user_id_a, user_id_b) DO UPDATE SET status = 'accepted', updated_at = NOW()`,
            [a, b, targetUserId, req.partnerId ?? null],
          );
          await client.query('COMMIT');
          res.json({ success: true, message: 'Friend request auto-accepted (mutual request)' });
        } catch (err) {
          await client.query('ROLLBACK');
          throw err;
        } finally {
          client.release();
        }
        return;
      }

      await pool.query(
        `INSERT INTO friend_requests (from_user_id, to_user_id, partner_id, status)
         VALUES ($1, $2, $3, 'pending')`,
        [userId, targetUserId, req.partnerId ?? null],
      );

      res.status(201).json({ success: true, message: 'Friend request sent' });
    } catch (err) {
      console.error('Send friend request error:', (err as Error).message);
      res.status(500).json({ code: 'INTERNAL_ERROR', message: 'Failed to send friend request' });
    }
  };
}

export function acceptFriendRequestController(pool: Pool) {
  return async (req: Request, res: Response): Promise<void> => {
    try {
      const userId = req.userId!;
      const { requestId } = req.params;

      const reqRow = await pool.query(
        "SELECT * FROM friend_requests WHERE id = $1 AND to_user_id = $2 AND status = 'pending'",
        [requestId, userId],
      );
      if (reqRow.rows.length === 0) {
        res.status(404).json({ code: 'REQUEST_NOT_FOUND', message: 'Friend request not found' });
        return;
      }

      const fr = reqRow.rows[0];
      const [a, b] = fr.from_user_id < userId ? [fr.from_user_id, userId] : [userId, fr.from_user_id];

      const client = await pool.connect();
      try {
        await client.query('BEGIN');
        await client.query(
          "UPDATE friend_requests SET status = 'accepted', updated_at = NOW() WHERE id = $1",
          [requestId],
        );
        await client.query(
          `INSERT INTO friendships (user_id_a, user_id_b, initiated_by, status, partner_id)
           VALUES ($1, $2, $3, 'accepted', $4)
           ON CONFLICT (user_id_a, user_id_b) DO UPDATE SET status = 'accepted', updated_at = NOW()`,
          [a, b, fr.from_user_id, fr.partner_id],
        );
        await client.query('COMMIT');
      } catch (err) {
        await client.query('ROLLBACK');
        throw err;
      } finally {
        client.release();
      }

      res.json({ success: true });
    } catch (err) {
      console.error('Accept friend request error:', (err as Error).message);
      res.status(500).json({ code: 'INTERNAL_ERROR', message: 'Failed to accept friend request' });
    }
  };
}

export function rejectFriendRequestController(pool: Pool) {
  return async (req: Request, res: Response): Promise<void> => {
    try {
      const userId = req.userId!;
      const { requestId } = req.params;

      const result = await pool.query(
        "UPDATE friend_requests SET status = 'rejected', updated_at = NOW() WHERE id = $1 AND to_user_id = $2 AND status = 'pending' RETURNING id",
        [requestId, userId],
      );
      if (result.rows.length === 0) {
        res.status(404).json({ code: 'REQUEST_NOT_FOUND', message: 'Friend request not found' });
        return;
      }

      res.json({ success: true });
    } catch (err) {
      console.error('Reject friend request error:', (err as Error).message);
      res.status(500).json({ code: 'INTERNAL_ERROR', message: 'Failed to reject friend request' });
    }
  };
}

export function removeFriendController(pool: Pool) {
  return async (req: Request, res: Response): Promise<void> => {
    try {
      const userId = req.userId!;
      const { friendshipId } = req.params;

      const result = await pool.query(
        "DELETE FROM friendships WHERE id = $1 AND (user_id_a = $2 OR user_id_b = $2) RETURNING id",
        [friendshipId, userId],
      );
      if (result.rows.length === 0) {
        res.status(404).json({ code: 'FRIENDSHIP_NOT_FOUND', message: 'Friendship not found' });
        return;
      }

      res.json({ success: true });
    } catch (err) {
      console.error('Remove friend error:', (err as Error).message);
      res.status(500).json({ code: 'INTERNAL_ERROR', message: 'Failed to remove friend' });
    }
  };
}

export function listFriendsController(pool: Pool) {
  return async (req: Request, res: Response): Promise<void> => {
    try {
      const userId = req.userId!;

      const result = await pool.query(
        `SELECT f.id AS friendship_id,
                CASE WHEN f.user_id_a = $1 THEN f.user_id_b ELSE f.user_id_a END AS friend_id,
                u.display_name,
                u.email,
                f.created_at AS friends_since,
                g.current_level AS level,
                g.total_xp AS xp,
                g.net_worth
         FROM friendships f
         JOIN users u ON u.id = CASE WHEN f.user_id_a = $1 THEN f.user_id_b ELSE f.user_id_a END
         LEFT JOIN LATERAL (
           SELECT current_level, total_xp, net_worth
           FROM games
           WHERE user_id = CASE WHEN f.user_id_a = $1 THEN f.user_id_b ELSE f.user_id_a END
             AND deleted_at IS NULL
           ORDER BY updated_at DESC
           LIMIT 1
         ) g ON true
         WHERE (f.user_id_a = $1 OR f.user_id_b = $1) AND f.status = 'accepted'
         ORDER BY u.display_name`,
        [userId],
      );

      res.json({
        friends: result.rows.map(r => ({
          friendshipId: r.friendship_id,
          userId: r.friend_id,
          displayName: r.display_name,
          email: r.email,
          friendsSince: r.friends_since,
          level: r.level ?? 0,
          xp: r.xp ?? 0,
          netWorth: r.net_worth ? parseInt(r.net_worth, 10) : 0,
        })),
      });
    } catch (err) {
      console.error('List friends error:', (err as Error).message);
      res.status(500).json({ code: 'INTERNAL_ERROR', message: 'Failed to list friends' });
    }
  };
}

export function listFriendRequestsController(pool: Pool) {
  return async (req: Request, res: Response): Promise<void> => {
    try {
      const userId = req.userId!;

      const result = await pool.query(
        `SELECT fr.id, fr.from_user_id, fr.created_at,
                u.display_name, u.email
         FROM friend_requests fr
         JOIN users u ON u.id = fr.from_user_id
         WHERE fr.to_user_id = $1 AND fr.status = 'pending'
         ORDER BY fr.created_at DESC`,
        [userId],
      );

      res.json({
        requests: result.rows.map(r => ({
          id: r.id,
          fromUserId: r.from_user_id,
          displayName: r.display_name,
          email: r.email,
          createdAt: r.created_at,
        })),
      });
    } catch (err) {
      console.error('List friend requests error:', (err as Error).message);
      res.status(500).json({ code: 'INTERNAL_ERROR', message: 'Failed to list friend requests' });
    }
  };
}

export function searchUsersController(pool: Pool) {
  return async (req: Request, res: Response): Promise<void> => {
    try {
      const userId = req.userId!;
      const query = (req.query.q as string || '').trim();
      if (query.length < 2) {
        res.status(400).json({ code: 'QUERY_TOO_SHORT', message: 'Search query must be at least 2 characters' });
        return;
      }

      const result = await pool.query(
        `SELECT id, display_name, email
         FROM users
         WHERE id != $1
           AND (display_name ILIKE $2 OR email ILIKE $2)
         LIMIT 20`,
        [userId, `%${query}%`],
      );

      res.json({
        users: result.rows.map(r => ({
          id: r.id,
          displayName: r.display_name,
          email: r.email,
        })),
      });
    } catch (err) {
      console.error('Search users error:', (err as Error).message);
      res.status(500).json({ code: 'INTERNAL_ERROR', message: 'Failed to search users' });
    }
  };
}

// ─── Leaderboards ───────────────────────────────────────────────

export function globalLeaderboardController(pool: Pool) {
  return async (req: Request, res: Response): Promise<void> => {
    try {
      const limit = Math.min(parseInt(req.query.limit as string, 10) || 50, 50);
      const offset = parseInt(req.query.offset as string, 10) || 0;

      const result = await pool.query(
        `SELECT u.id AS user_id, u.display_name,
                g.current_level AS level, g.total_xp AS xp, g.net_worth
         FROM users u
         JOIN LATERAL (
           SELECT current_level, total_xp, net_worth
           FROM games
           WHERE user_id = u.id AND deleted_at IS NULL
           ORDER BY updated_at DESC
           LIMIT 1
         ) g ON true
         ORDER BY g.net_worth::bigint DESC
         LIMIT $1 OFFSET $2`,
        [limit, offset],
      );

      const countRes = await pool.query(
        `SELECT COUNT(*) FROM users u WHERE EXISTS (SELECT 1 FROM games WHERE user_id = u.id AND deleted_at IS NULL)`,
      );

      res.json({
        entries: result.rows.map((r, i) => ({
          rank: offset + i + 1,
          userId: r.user_id,
          displayName: r.display_name,
          level: r.level,
          xp: r.xp,
          netWorth: parseInt(r.net_worth, 10),
        })),
        total: parseInt(countRes.rows[0].count, 10),
        limit,
        offset,
      });
    } catch (err) {
      console.error('Global leaderboard error:', (err as Error).message);
      res.status(500).json({ code: 'INTERNAL_ERROR', message: 'Failed to fetch leaderboard' });
    }
  };
}

export function friendsLeaderboardController(pool: Pool) {
  return async (req: Request, res: Response): Promise<void> => {
    try {
      const userId = req.userId!;

      // Get friend IDs + self
      const result = await pool.query(
        `WITH friend_ids AS (
           SELECT CASE WHEN user_id_a = $1 THEN user_id_b ELSE user_id_a END AS uid
           FROM friendships
           WHERE (user_id_a = $1 OR user_id_b = $1) AND status = 'accepted'
           UNION ALL
           SELECT $1
         )
         SELECT u.id AS user_id, u.display_name,
                g.current_level AS level, g.total_xp AS xp, g.net_worth
         FROM friend_ids fi
         JOIN users u ON u.id = fi.uid
         JOIN LATERAL (
           SELECT current_level, total_xp, net_worth
           FROM games
           WHERE user_id = u.id AND deleted_at IS NULL
           ORDER BY updated_at DESC
           LIMIT 1
         ) g ON true
         ORDER BY g.net_worth::bigint DESC`,
        [userId],
      );

      res.json({
        entries: result.rows.map((r, i) => ({
          rank: i + 1,
          userId: r.user_id,
          displayName: r.display_name,
          level: r.level,
          xp: r.xp,
          netWorth: parseInt(r.net_worth, 10),
          isMe: r.user_id === userId,
        })),
      });
    } catch (err) {
      console.error('Friends leaderboard error:', (err as Error).message);
      res.status(500).json({ code: 'INTERNAL_ERROR', message: 'Failed to fetch friends leaderboard' });
    }
  };
}

export function levelLeaderboardController(pool: Pool) {
  return async (req: Request, res: Response): Promise<void> => {
    try {
      const limit = Math.min(parseInt(req.query.limit as string, 10) || 50, 50);
      const offset = parseInt(req.query.offset as string, 10) || 0;

      const result = await pool.query(
        `SELECT u.id AS user_id, u.display_name,
                g.current_level AS level, g.total_xp AS xp, g.net_worth
         FROM users u
         JOIN LATERAL (
           SELECT current_level, total_xp, net_worth
           FROM games
           WHERE user_id = u.id AND deleted_at IS NULL
           ORDER BY updated_at DESC
           LIMIT 1
         ) g ON true
         ORDER BY g.current_level DESC, g.total_xp DESC
         LIMIT $1 OFFSET $2`,
        [limit, offset],
      );

      res.json({
        entries: result.rows.map((r, i) => ({
          rank: offset + i + 1,
          userId: r.user_id,
          displayName: r.display_name,
          level: r.level,
          xp: r.xp,
          netWorth: parseInt(r.net_worth, 10),
        })),
      });
    } catch (err) {
      console.error('Level leaderboard error:', (err as Error).message);
      res.status(500).json({ code: 'INTERNAL_ERROR', message: 'Failed to fetch level leaderboard' });
    }
  };
}

// ─── Classrooms ─────────────────────────────────────────────────

const createClassroomSchema = z.object({
  name: z.string().min(1).max(200),
  description: z.string().max(1000).optional().default(''),
});

function generateJoinCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 8; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}

export function createClassroomController(pool: Pool) {
  return async (req: Request, res: Response): Promise<void> => {
    try {
      const userId = req.userId!;
      const role = req.userRole;

      if (role !== 'teacher' && role !== 'admin') {
        res.status(403).json({ code: 'FORBIDDEN', message: 'Only teachers can create classrooms' });
        return;
      }

      const parsed = createClassroomSchema.safeParse(req.body);
      if (!parsed.success) {
        res.status(400).json({ code: 'VALIDATION_ERROR', details: parsed.error.flatten().fieldErrors });
        return;
      }

      const { name, description } = parsed.data;
      const joinCode = generateJoinCode();

      const result = await pool.query(
        `INSERT INTO classrooms (teacher_id, partner_id, name, join_code, config)
         VALUES ($1, $2, $3, $4, $5)
         RETURNING id, name, join_code, status, created_at`,
        [userId, req.partnerId ?? null, name, joinCode, JSON.stringify({ description })],
      );

      const classroom = result.rows[0];
      res.status(201).json({
        id: classroom.id,
        name: classroom.name,
        joinCode: classroom.join_code,
        status: classroom.status,
        createdAt: classroom.created_at,
      });
    } catch (err) {
      console.error('Create classroom error:', (err as Error).message);
      res.status(500).json({ code: 'INTERNAL_ERROR', message: 'Failed to create classroom' });
    }
  };
}

export function joinClassroomController(pool: Pool) {
  return async (req: Request, res: Response): Promise<void> => {
    try {
      const userId = req.userId!;
      const joinCode = (req.body.joinCode as string || '').trim().toUpperCase();

      if (!joinCode) {
        res.status(400).json({ code: 'VALIDATION_ERROR', message: 'Join code is required' });
        return;
      }

      const classroom = await pool.query(
        "SELECT id, teacher_id FROM classrooms WHERE join_code = $1 AND status = 'active'",
        [joinCode],
      );
      if (classroom.rows.length === 0) {
        res.status(404).json({ code: 'CLASSROOM_NOT_FOUND', message: 'Invalid join code' });
        return;
      }

      const classroomId = classroom.rows[0].id;
      if (classroom.rows[0].teacher_id === userId) {
        res.status(400).json({ code: 'ALREADY_TEACHER', message: 'You are the teacher of this classroom' });
        return;
      }

      // Check already member
      const existing = await pool.query(
        "SELECT id FROM classroom_members WHERE classroom_id = $1 AND user_id = $2 AND status = 'active'",
        [classroomId, userId],
      );
      if (existing.rows.length > 0) {
        res.status(400).json({ code: 'ALREADY_MEMBER', message: 'Already a member of this classroom' });
        return;
      }

      await pool.query(
        `INSERT INTO classroom_members (classroom_id, user_id, partner_id, status)
         VALUES ($1, $2, $3, 'active')
         ON CONFLICT (classroom_id, user_id) DO UPDATE SET status = 'active', joined_at = NOW()`,
        [classroomId, userId, req.partnerId ?? null],
      );

      res.json({ success: true, classroomId });
    } catch (err) {
      console.error('Join classroom error:', (err as Error).message);
      res.status(500).json({ code: 'INTERNAL_ERROR', message: 'Failed to join classroom' });
    }
  };
}

export function listClassroomsController(pool: Pool) {
  return async (req: Request, res: Response): Promise<void> => {
    try {
      const userId = req.userId!;

      // Classrooms I teach
      const taught = await pool.query(
        `SELECT c.id, c.name, c.join_code, c.config, c.status, c.created_at,
                (SELECT COUNT(*) FROM classroom_members cm WHERE cm.classroom_id = c.id AND cm.status = 'active') AS member_count
         FROM classrooms c
         WHERE c.teacher_id = $1 AND c.status = 'active'
         ORDER BY c.created_at DESC`,
        [userId],
      );

      // Classrooms I'm a member of
      const joined = await pool.query(
        `SELECT c.id, c.name, c.join_code, c.config, c.status, c.created_at,
                u.display_name AS teacher_name,
                (SELECT COUNT(*) FROM classroom_members cm WHERE cm.classroom_id = c.id AND cm.status = 'active') AS member_count
         FROM classroom_members m
         JOIN classrooms c ON c.id = m.classroom_id
         JOIN users u ON u.id = c.teacher_id
         WHERE m.user_id = $1 AND m.status = 'active' AND c.status = 'active'
         ORDER BY m.joined_at DESC`,
        [userId],
      );

      res.json({
        teaching: taught.rows.map(r => ({
          id: r.id,
          name: r.name,
          joinCode: r.join_code,
          description: r.config?.description || '',
          status: r.status,
          memberCount: parseInt(r.member_count, 10),
          createdAt: r.created_at,
          role: 'teacher',
        })),
        enrolled: joined.rows.map(r => ({
          id: r.id,
          name: r.name,
          teacherName: r.teacher_name,
          description: r.config?.description || '',
          status: r.status,
          memberCount: parseInt(r.member_count, 10),
          createdAt: r.created_at,
          role: 'student',
        })),
      });
    } catch (err) {
      console.error('List classrooms error:', (err as Error).message);
      res.status(500).json({ code: 'INTERNAL_ERROR', message: 'Failed to list classrooms' });
    }
  };
}

export function getClassroomController(pool: Pool) {
  return async (req: Request, res: Response): Promise<void> => {
    try {
      const userId = req.userId!;
      const { id } = req.params;

      const classroom = await pool.query(
        `SELECT c.*, u.display_name AS teacher_name
         FROM classrooms c
         JOIN users u ON u.id = c.teacher_id
         WHERE c.id = $1`,
        [id],
      );
      if (classroom.rows.length === 0) {
        res.status(404).json({ code: 'CLASSROOM_NOT_FOUND', message: 'Classroom not found' });
        return;
      }

      const cr = classroom.rows[0];

      // Verify membership
      const isTeacher = cr.teacher_id === userId;
      if (!isTeacher) {
        const membership = await pool.query(
          "SELECT id FROM classroom_members WHERE classroom_id = $1 AND user_id = $2 AND status = 'active'",
          [id, userId],
        );
        if (membership.rows.length === 0) {
          res.status(403).json({ code: 'NOT_A_MEMBER', message: 'You are not a member of this classroom' });
          return;
        }
      }

      // Get members with stats
      const members = await pool.query(
        `SELECT u.id AS user_id, u.display_name,
                g.current_level AS level, g.total_xp AS xp, g.net_worth
         FROM classroom_members cm
         JOIN users u ON u.id = cm.user_id
         LEFT JOIN LATERAL (
           SELECT current_level, total_xp, net_worth
           FROM games
           WHERE user_id = u.id AND deleted_at IS NULL
           ORDER BY updated_at DESC
           LIMIT 1
         ) g ON true
         WHERE cm.classroom_id = $1 AND cm.status = 'active'
         ORDER BY u.display_name`,
        [id],
      );

      res.json({
        id: cr.id,
        name: cr.name,
        joinCode: isTeacher ? cr.join_code : undefined,
        description: cr.config?.description || '',
        teacherName: cr.teacher_name,
        isTeacher,
        status: cr.status,
        createdAt: cr.created_at,
        members: members.rows.map(m => ({
          userId: m.user_id,
          displayName: m.display_name,
          level: m.level ?? 0,
          xp: m.xp ?? 0,
          netWorth: m.net_worth ? parseInt(m.net_worth, 10) : 0,
        })),
      });
    } catch (err) {
      console.error('Get classroom error:', (err as Error).message);
      res.status(500).json({ code: 'INTERNAL_ERROR', message: 'Failed to get classroom' });
    }
  };
}

export function classroomLeaderboardController(pool: Pool) {
  return async (req: Request, res: Response): Promise<void> => {
    try {
      const userId = req.userId!;
      const { id } = req.params;

      // Verify membership
      const classroom = await pool.query('SELECT teacher_id FROM classrooms WHERE id = $1', [id]);
      if (classroom.rows.length === 0) {
        res.status(404).json({ code: 'CLASSROOM_NOT_FOUND', message: 'Classroom not found' });
        return;
      }

      const isTeacher = classroom.rows[0].teacher_id === userId;
      if (!isTeacher) {
        const membership = await pool.query(
          "SELECT id FROM classroom_members WHERE classroom_id = $1 AND user_id = $2 AND status = 'active'",
          [id, userId],
        );
        if (membership.rows.length === 0) {
          res.status(403).json({ code: 'NOT_A_MEMBER', message: 'You are not a member of this classroom' });
          return;
        }
      }

      const result = await pool.query(
        `SELECT u.id AS user_id, u.display_name,
                g.current_level AS level, g.total_xp AS xp, g.net_worth
         FROM classroom_members cm
         JOIN users u ON u.id = cm.user_id
         JOIN LATERAL (
           SELECT current_level, total_xp, net_worth
           FROM games
           WHERE user_id = u.id AND deleted_at IS NULL
           ORDER BY updated_at DESC
           LIMIT 1
         ) g ON true
         WHERE cm.classroom_id = $1 AND cm.status = 'active'
         ORDER BY g.net_worth::bigint DESC`,
        [id],
      );

      res.json({
        entries: result.rows.map((r, i) => ({
          rank: i + 1,
          userId: r.user_id,
          displayName: r.display_name,
          level: r.level,
          xp: r.xp,
          netWorth: parseInt(r.net_worth, 10),
          isMe: r.user_id === userId,
        })),
      });
    } catch (err) {
      console.error('Classroom leaderboard error:', (err as Error).message);
      res.status(500).json({ code: 'INTERNAL_ERROR', message: 'Failed to fetch classroom leaderboard' });
    }
  };
}
