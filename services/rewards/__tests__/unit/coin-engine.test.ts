import { getCoinsForAction, getDailyLoginCoins, COIN_RULES } from '../../src/services/coin-engine';

describe('Coin Engine', () => {
  describe('getCoinsForAction', () => {
    it('returns coins for smart card decision', () => {
      expect(getCoinsForAction('CARD_DECISION_SMART')).toBe(6);
    });

    it('returns minimum coins for any card decision', () => {
      expect(getCoinsForAction('CARD_DECISION_ANY')).toBe(1);
    });

    it('returns coins for completing daily cards', () => {
      expect(getCoinsForAction('COMPLETE_DAILY_CARDS')).toBe(5);
    });

    it('returns coins for weekly challenge', () => {
      expect(getCoinsForAction('WEEKLY_CHALLENGE')).toBe(35);
    });

    it('returns coins for monthly challenge', () => {
      expect(getCoinsForAction('MONTHLY_CHALLENGE')).toBe(175);
    });

    it('multiplies level up coins by level', () => {
      expect(getCoinsForAction('LEVEL_UP', { level: 1 })).toBe(100);
      expect(getCoinsForAction('LEVEL_UP', { level: 4 })).toBe(400);
      expect(getCoinsForAction('LEVEL_UP', { level: 8 })).toBe(800);
    });

    it('returns coins for common badge', () => {
      expect(getCoinsForAction('BADGE_COMMON')).toBe(10);
    });

    it('returns coins for rare badge', () => {
      expect(getCoinsForAction('BADGE_RARE')).toBe(25);
    });

    it('returns coins for epic badge', () => {
      expect(getCoinsForAction('BADGE_EPIC')).toBe(50);
    });

    it('returns coins for legendary badge', () => {
      expect(getCoinsForAction('BADGE_LEGENDARY')).toBe(100);
    });

    it('returns coins for referral', () => {
      expect(getCoinsForAction('REFERRAL')).toBe(200);
    });

    it('returns coins for perfect budget month', () => {
      expect(getCoinsForAction('PERFECT_BUDGET_MONTH')).toBe(50);
    });

    it('returns coins for h2h win', () => {
      expect(getCoinsForAction('H2H_WIN')).toBe(50);
    });

    it('returns coins for h2h loss (participation)', () => {
      expect(getCoinsForAction('H2H_LOSS')).toBe(15);
    });

    it('returns coins for first game completion', () => {
      expect(getCoinsForAction('FIRST_GAME_COMPLETION')).toBe(1000);
    });

    it('returns 0 for unknown action', () => {
      expect(getCoinsForAction('UNKNOWN_ACTION')).toBe(0);
    });
  });

  describe('getDailyLoginCoins', () => {
    it('returns 1 coin for day 1 (first day)', () => {
      expect(getDailyLoginCoins(1)).toBe(1);
    });

    it('returns 2 coins for days 2-6', () => {
      expect(getDailyLoginCoins(2)).toBe(2);
      expect(getDailyLoginCoins(6)).toBe(2);
    });

    it('returns 3 coins for day 7+', () => {
      expect(getDailyLoginCoins(7)).toBe(3);
      expect(getDailyLoginCoins(30)).toBe(3);
      expect(getDailyLoginCoins(100)).toBe(3);
    });

    it('returns 1 coin for streak of 0', () => {
      expect(getDailyLoginCoins(0)).toBe(1);
    });
  });
});
