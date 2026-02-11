import { createGameSchema, submitActionSchema } from '../../src/validators';

describe('Game Engine Validators', () => {
  describe('createGameSchema', () => {
    it('should accept valid game creation', () => {
      const result = createGameSchema.safeParse({
        persona: 'young_adult',
        difficulty: 'normal',
        currencyCode: 'USD',
      });
      expect(result.success).toBe(true);
    });

    it('should accept all personas', () => {
      for (const persona of ['teen', 'student', 'young_adult', 'parent']) {
        const result = createGameSchema.safeParse({ persona, difficulty: 'normal', currencyCode: 'USD' });
        expect(result.success).toBe(true);
      }
    });

    it('should accept all difficulties', () => {
      for (const difficulty of ['easy', 'normal', 'hard']) {
        const result = createGameSchema.safeParse({ persona: 'teen', difficulty, currencyCode: 'USD' });
        expect(result.success).toBe(true);
      }
    });

    it('should reject invalid persona', () => {
      const result = createGameSchema.safeParse({ persona: 'invalid', difficulty: 'normal', currencyCode: 'USD' });
      expect(result.success).toBe(false);
    });

    it('should reject invalid difficulty', () => {
      const result = createGameSchema.safeParse({ persona: 'teen', difficulty: 'extreme', currencyCode: 'USD' });
      expect(result.success).toBe(false);
    });

    it('should reject missing currency', () => {
      const result = createGameSchema.safeParse({ persona: 'teen', difficulty: 'normal' });
      expect(result.success).toBe(false);
    });

    it('should accept optional region', () => {
      const result = createGameSchema.safeParse({
        persona: 'young_adult', difficulty: 'normal', currencyCode: 'RON', region: 'ro',
      });
      expect(result.success).toBe(true);
    });

    it('should default region to us', () => {
      const result = createGameSchema.safeParse({ persona: 'teen', difficulty: 'easy', currencyCode: 'USD' });
      expect(result.success).toBe(true);
      if (result.success) expect(result.data.region).toBe('us');
    });
  });

  describe('submitActionSchema', () => {
    it('should accept valid action', () => {
      const result = submitActionSchema.safeParse({
        type: 'advance_day',
        idempotencyKey: '550e8400-e29b-41d4-a716-446655440000',
      });
      expect(result.success).toBe(true);
    });

    it('should accept all action types', () => {
      const types = [
        'advance_day', 'decide_card', 'transfer', 'set_budget', 'set_autopay',
        'open_account', 'close_account', 'set_goal', 'buy_insurance', 'file_claim',
        'invest', 'sell_investment',
      ];
      for (const type of types) {
        const result = submitActionSchema.safeParse({
          type,
          idempotencyKey: '550e8400-e29b-41d4-a716-446655440000',
        });
        expect(result.success).toBe(true);
      }
    });

    it('should reject invalid action type', () => {
      const result = submitActionSchema.safeParse({
        type: 'invalid_action',
        idempotencyKey: '550e8400-e29b-41d4-a716-446655440000',
      });
      expect(result.success).toBe(false);
    });

    it('should reject non-UUID idempotency key', () => {
      const result = submitActionSchema.safeParse({
        type: 'advance_day',
        idempotencyKey: 'not-a-uuid',
      });
      expect(result.success).toBe(false);
    });

    it('should reject missing idempotency key', () => {
      const result = submitActionSchema.safeParse({ type: 'advance_day' });
      expect(result.success).toBe(false);
    });

    it('should accept payload', () => {
      const result = submitActionSchema.safeParse({
        type: 'transfer',
        idempotencyKey: '550e8400-e29b-41d4-a716-446655440000',
        payload: { fromAccountId: 'acc-1', toAccountId: 'acc-2', amount: 10000 },
      });
      expect(result.success).toBe(true);
    });

    it('should default payload to empty object', () => {
      const result = submitActionSchema.safeParse({
        type: 'advance_day',
        idempotencyKey: '550e8400-e29b-41d4-a716-446655440000',
      });
      expect(result.success).toBe(true);
      if (result.success) expect(result.data.payload).toEqual({});
    });
  });
});
