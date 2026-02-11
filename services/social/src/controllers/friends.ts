import { Request, Response } from 'express';
import { z } from 'zod';
import { v4 as uuid } from 'uuid';

const addFriendSchema = z.object({
  code: z.string().min(1).optional(),
  userId: z.string().uuid().optional(),
}).refine((d) => d.code || d.userId, { message: 'Either code or userId required' });

export async function getFriends(req: Request, res: Response): Promise<void> {
  const userId = req.user!.sub;
  // Stub: query friendships table where (user_id_a = userId OR user_id_b = userId) AND status = 'accepted'
  res.json({ userId, friends: [], total: 0 });
}

export async function addFriend(req: Request, res: Response): Promise<void> {
  const userId = req.user!.sub;
  const body = addFriendSchema.parse(req.body);
  // Stub: create friendship record
  res.status(201).json({ id: uuid(), userId, targetCode: body.code, targetUserId: body.userId, status: 'pending', createdAt: new Date().toISOString() });
}

export async function sendFriendRequest(req: Request, res: Response): Promise<void> {
  const userId = req.user!.sub;
  const { targetUserId } = z.object({ targetUserId: z.string().uuid() }).parse(req.body);
  // Stub: ensure no existing friendship, create with status 'pending'
  // Ensure user_id_a < user_id_b for uniqueness
  const [a, b] = [userId, targetUserId].sort();
  res.status(201).json({ id: uuid(), userIdA: a, userIdB: b, status: 'pending', initiatedBy: userId, createdAt: new Date().toISOString() });
}

export async function acceptFriendRequest(req: Request, res: Response): Promise<void> {
  const requestId = req.params.requestId;
  // Stub: update friendship status to 'accepted'
  res.json({ id: requestId, status: 'accepted' });
}

export async function rejectFriendRequest(req: Request, res: Response): Promise<void> {
  const requestId = req.params.requestId;
  // Stub: soft-delete or update status
  res.json({ id: requestId, status: 'rejected' });
}

export async function removeFriend(req: Request, res: Response): Promise<void> {
  const friendId = req.params.friendId;
  // Stub: soft-delete friendship
  res.status(204).send();
}
