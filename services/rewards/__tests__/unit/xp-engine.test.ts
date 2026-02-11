import { getXpForAction, XP_RULES } from '../../src/services/xp-engine';

describe('XP Engine', () => {
  describe('getXpForAction', () => {
    it('returns base XP for card decision (any)', () => {
      expect(getXpForAction('CARD_DECISION_ANY')).toBe(5);
    });

    it('returns base XP for optimal card decision', () => {
      expect(getXpForAction('CARD_DECISION_OPTIMAL')).toBe(20);
    });

    it('returns base XP for good card decision', () => {
      expect(getXpForAction('CARD_DECISION_GOOD')).toBe(12);
    });

    it('returns XP for paying bill on time', () => {
      expect(getXpForAction('PAY_BILL_ON_TIME')).toBe(10);
    });

    it('returns XP for paying CC in full', () => {
      expect(getXpForAction('PAY_CC_FULL')).toBe(20);
    });

    it('returns XP for paying CC minimum', () => {
      expect(getXpForAction('PAY_CC_MINIMUM')).toBe(8);
    });

    it('returns XP for savings deposit', () => {
      expect(getXpForAction('SAVINGS_DEPOSIT')).toBe(5);
    });

    it('returns scaled XP for small savings goal', () => {
      expect(getXpForAction('REACH_SAVINGS_GOAL_SMALL')).toBe(50);
    });

    it('returns scaled XP for medium savings goal', () => {
      expect(getXpForAction('REACH_SAVINGS_GOAL_MEDIUM')).toBe(100);
    });

    it('returns scaled XP for large savings goal', () => {
      expect(getXpForAction('REACH_SAVINGS_GOAL_LARGE')).toBe(200);
    });

    it('returns XP for advancing a day', () => {
      expect(getXpForAction('ADVANCE_DAY')).toBe(3);
    });

    it('returns 0 for unknown action', () => {
      expect(getXpForAction('NONEXISTENT_ACTION')).toBe(0);
    });

    it('multiplies level completion XP by level', () => {
      expect(getXpForAction('COMPLETE_LEVEL', { level: 1 })).toBe(250);
      expect(getXpForAction('COMPLETE_LEVEL', { level: 5 })).toBe(1250);
      expect(getXpForAction('COMPLETE_LEVEL', { level: 8 })).toBe(2000);
    });

    it('returns base XP for level completion without level context', () => {
      expect(getXpForAction('COMPLETE_LEVEL')).toBe(250);
    });

    it('returns XP for tutorial step', () => {
      expect(getXpForAction('TUTORIAL_STEP')).toBe(15);
    });

    it('returns XP for first action of day', () => {
      expect(getXpForAction('FIRST_ACTION_OF_DAY')).toBe(5);
    });

    it('returns XP for investment purchase', () => {
      expect(getXpForAction('INVESTMENT_PURCHASE')).toBe(10);
    });

    it('returns XP for creating budget', () => {
      expect(getXpForAction('CREATE_BUDGET')).toBe(25);
    });

    it('returns XP for budget adherence 90%', () => {
      expect(getXpForAction('BUDGET_ADHERENCE_90')).toBe(50);
    });

    it('returns XP for budget adherence 75%', () => {
      expect(getXpForAction('BUDGET_ADHERENCE_75')).toBe(30);
    });

    it('returns XP for filing taxes', () => {
      expect(getXpForAction('FILE_TAXES')).toBe(100);
    });

    it('returns XP for handling emergency with insurance', () => {
      expect(getXpForAction('HANDLE_EMERGENCY_INSURED')).toBe(25);
    });

    it('returns XP for handling emergency with savings', () => {
      expect(getXpForAction('HANDLE_EMERGENCY_SAVINGS')).toBe(50);
    });

    it('returns XP for handling emergency with debt', () => {
      expect(getXpForAction('HANDLE_EMERGENCY_DEBT')).toBe(10);
    });

    it('returns XP for paying off loan', () => {
      expect(getXpForAction('PAY_OFF_LOAN')).toBe(200);
    });

    it('returns XP for maintaining CHI >= 750', () => {
      expect(getXpForAction('MAINTAIN_CHI_750_3M')).toBe(150);
    });

    it('returns XP for bankruptcy recovery', () => {
      expect(getXpForAction('RECOVER_BANKRUPTCY')).toBe(200);
    });
  });

  describe('XP_RULES', () => {
    it('has frequency caps defined for capped actions', () => {
      expect(XP_RULES.SAVINGS_DEPOSIT.frequencyCap).toBe('3_per_day');
      expect(XP_RULES.PAY_CC_FULL.frequencyCap).toBe('1_per_month');
      expect(XP_RULES.ADVANCE_DAY.frequencyCap).toBe('per_day');
    });

    it('covers all expected action types', () => {
      const expectedActions = [
        'CARD_DECISION_ANY', 'CARD_DECISION_OPTIMAL', 'CARD_DECISION_GOOD',
        'PAY_BILL_ON_TIME', 'PAY_CC_FULL', 'PAY_CC_MINIMUM',
        'SAVINGS_DEPOSIT', 'ADVANCE_DAY', 'COMPLETE_LEVEL',
        'CREATE_BUDGET', 'FILE_TAXES',
      ];
      for (const action of expectedActions) {
        expect(XP_RULES[action]).toBeDefined();
      }
    });
  });
});
