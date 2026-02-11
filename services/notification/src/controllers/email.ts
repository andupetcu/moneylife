import { logger } from '../utils/logger';

// SendGrid email integration stub

export interface EmailPayload {
  to: string;
  templateId: string;
  dynamicData: Record<string, unknown>;
}

export type EmailTemplate = 'welcome' | 'password_reset' | 'weekly_digest' | 'streak_broken' | 'reward_fulfilled';

const TEMPLATE_IDS: Record<EmailTemplate, string> = {
  welcome: 'd-welcome-template-id',
  password_reset: 'd-password-reset-id',
  weekly_digest: 'd-weekly-digest-id',
  streak_broken: 'd-streak-broken-id',
  reward_fulfilled: 'd-reward-fulfilled-id',
};

export async function sendEmail(to: string, template: EmailTemplate, data: Record<string, unknown>): Promise<boolean> {
  const templateId = TEMPLATE_IDS[template];
  if (!templateId) {
    logger.error('Unknown email template', { template });
    return false;
  }

  // In production: use SendGrid API
  // POST https://api.sendgrid.com/v3/mail/send
  // Never log email addresses or sensitive data
  logger.info('Sending email', { template, templateId });
  return true;
}

export async function sendWelcomeEmail(email: string, displayName: string): Promise<boolean> {
  return sendEmail(email, 'welcome', { displayName });
}

export async function sendPasswordResetEmail(email: string, resetLink: string): Promise<boolean> {
  return sendEmail(email, 'password_reset', { resetLink });
}

export async function sendWeeklyDigest(email: string, data: { xpEarned: number; coinsEarned: number; badgesEarned: number; streakDays: number }): Promise<boolean> {
  return sendEmail(email, 'weekly_digest', data);
}
