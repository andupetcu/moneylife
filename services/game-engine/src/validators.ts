import { z } from 'zod';

export const createGameSchema = z.object({
  persona: z.enum(['teen', 'student', 'young_adult', 'parent']),
  difficulty: z.enum(['easy', 'normal', 'hard']),
  currencyCode: z.string().min(3).max(5),
  region: z.string().min(2).max(5).optional().default('us'),
});

export const submitActionSchema = z.object({
  type: z.enum([
    'advance_day', 'decide_card', 'transfer', 'set_budget', 'set_autopay',
    'open_account', 'close_account', 'set_goal', 'buy_insurance', 'file_claim',
    'invest', 'sell_investment',
  ]),
  payload: z.record(z.unknown()).default({}),
  clientTimestamp: z.string().datetime().optional(),
  idempotencyKey: z.string().uuid(),
});
