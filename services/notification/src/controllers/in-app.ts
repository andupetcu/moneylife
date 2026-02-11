import { Request, Response } from 'express';
import { z } from 'zod';
import { v4 as uuid } from 'uuid';

export type NotificationType = 'reward' | 'streak' | 'friend' | 'classroom' | 'system' | 'bill_reminder' | 'challenge';

export interface Notification {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  body: string;
  data?: Record<string, unknown>;
  read: boolean;
  createdAt: string;
}

export async function getNotifications(req: Request, res: Response): Promise<void> {
  const userId = req.user!.sub;
  const limit = Math.min(Number(req.query.limit) || 20, 100);
  const offset = Number(req.query.offset) || 0;
  const unreadOnly = req.query.unreadOnly === 'true';

  // Stub: query notifications table filtered by user_id and partner_id
  res.json({ userId, notifications: [], total: 0, unreadCount: 0, limit, offset });
}

export async function markRead(req: Request, res: Response): Promise<void> {
  const notificationId = req.params.id;
  // Stub: update notification set read = true where id = notificationId and user_id = userId
  res.json({ id: notificationId, read: true });
}

export async function markAllRead(req: Request, res: Response): Promise<void> {
  const userId = req.user!.sub;
  // Stub: update all unread notifications for user
  res.json({ userId, updatedCount: 0 });
}

const preferencesSchema = z.object({
  pushEnabled: z.boolean().optional(),
  emailEnabled: z.boolean().optional(),
  emailDigest: z.enum(['daily', 'weekly', 'never']).optional(),
  streakReminders: z.boolean().optional(),
  billReminders: z.boolean().optional(),
  challengeNotifications: z.boolean().optional(),
  friendNotifications: z.boolean().optional(),
  marketingEmails: z.boolean().optional(),
});

export async function getPreferences(req: Request, res: Response): Promise<void> {
  const userId = req.user!.sub;
  // Stub: query notification_preferences table
  res.json({
    userId,
    pushEnabled: true,
    emailEnabled: true,
    emailDigest: 'weekly',
    streakReminders: true,
    billReminders: true,
    challengeNotifications: true,
    friendNotifications: true,
    marketingEmails: false,
  });
}

export async function updatePreferences(req: Request, res: Response): Promise<void> {
  const userId = req.user!.sub;
  const prefs = preferencesSchema.parse(req.body);
  // Stub: upsert notification_preferences
  res.json({ userId, ...prefs, updatedAt: new Date().toISOString() });
}
