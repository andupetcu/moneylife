import { Request, Response } from 'express';
import { z } from 'zod';
import { v4 as uuid } from 'uuid';
import { logger } from '../utils/logger';

const sendSchema = z.object({
  userId: z.string().uuid(),
  type: z.enum(['reward', 'streak', 'friend', 'classroom', 'system', 'bill_reminder', 'challenge']),
  title: z.string().min(1).max(200),
  body: z.string().min(1).max(1000),
  data: z.record(z.unknown()).optional(),
  channels: z.array(z.enum(['push', 'email', 'in_app'])).default(['push', 'in_app']),
});

// Expo Push API integration stub
export async function sendPushNotification(pushToken: string, title: string, body: string, data?: Record<string, unknown>): Promise<boolean> {
  // In production: POST to https://exp.host/--/api/v2/push/send
  logger.info('Sending push notification', { pushToken: '***', title });
  return true;
}

export async function sendNotification(req: Request, res: Response): Promise<void> {
  const payload = sendSchema.parse(req.body);

  const notification = {
    id: uuid(),
    ...payload,
    read: false,
    sentAt: new Date().toISOString(),
    deliveryStatus: {
      push: payload.channels.includes('push') ? 'queued' : 'skipped',
      email: payload.channels.includes('email') ? 'queued' : 'skipped',
      inApp: payload.channels.includes('in_app') ? 'delivered' : 'skipped',
    },
  };

  // Stub: save to notifications table, queue push/email delivery
  // In production: check user preferences before sending each channel
  // Never log sensitive data from the notification body

  res.status(201).json(notification);
}

// Scheduled notification types
export interface ScheduledNotification {
  id: string;
  userId: string;
  type: string;
  scheduledFor: string;
  title: string;
  body: string;
  status: 'pending' | 'sent' | 'cancelled';
}

export function createBillReminder(userId: string, billName: string, dueDate: string, amount: number): ScheduledNotification {
  return {
    id: uuid(),
    userId,
    type: 'bill_reminder',
    scheduledFor: new Date(new Date(dueDate).getTime() - 24 * 60 * 60 * 1000).toISOString(),
    title: 'Bill Due Tomorrow',
    body: `Your ${billName} payment of ${amount} is due tomorrow.`,
    status: 'pending',
  };
}

export function createStreakWarning(userId: string, currentStreak: number, lastActionDate: string): ScheduledNotification {
  const lastAction = new Date(lastActionDate);
  // Warn 4 hours before grace period ends
  const warnAt = new Date(lastAction.getTime() + 20 * 60 * 60 * 1000);
  return {
    id: uuid(),
    userId,
    type: 'streak',
    scheduledFor: warnAt.toISOString(),
    title: `Don't lose your ${currentStreak}-day streak!`,
    body: 'Play now to keep your streak alive and maintain your bonus multiplier.',
    status: 'pending',
  };
}
