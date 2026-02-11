import { Request, Response } from 'express';
import { z } from 'zod';

const searchSchema = z.object({
  q: z.string().optional(),
  email: z.string().optional(),
  partnerId: z.string().optional(),
  role: z.string().optional(),
  status: z.string().optional(),
  limit: z.coerce.number().min(1).max(100).default(20),
  offset: z.coerce.number().min(0).default(0),
});

export async function searchUsers(req: Request, res: Response): Promise<void> {
  const params = searchSchema.parse(req.query);
  // Stub: query users table with filters, partner_id scoping
  res.json({ users: [], total: 0, ...params });
}

export async function getUser(req: Request, res: Response): Promise<void> {
  const userId = req.params.id;
  // Stub: query full user profile with game stats
  res.json({
    id: userId,
    email: 'user@example.com',
    displayName: 'Test User',
    role: 'player',
    status: 'active',
    partnerId: null,
    gamesPlayed: 0,
    totalXp: 0,
    totalCoins: 0,
    badgesEarned: 0,
    createdAt: new Date().toISOString(),
  });
}

const updateUserSchema = z.object({
  role: z.enum(['player', 'teacher', 'partner_admin', 'system_admin']).optional(),
  status: z.enum(['active', 'suspended', 'deleted']).optional(),
  partnerId: z.string().uuid().nullable().optional(),
});

export async function updateUser(req: Request, res: Response): Promise<void> {
  const userId = req.params.id;
  const body = updateUserSchema.parse(req.body);
  // Stub: update user record
  res.json({ id: userId, ...body, updatedAt: new Date().toISOString() });
}

export async function suspendUser(req: Request, res: Response): Promise<void> {
  const userId = req.params.id;
  const { reason } = z.object({ reason: z.string().min(1) }).parse(req.body);
  // Stub: set status = 'suspended', record reason, invalidate sessions
  res.json({ id: userId, status: 'suspended', reason, suspendedAt: new Date().toISOString() });
}
