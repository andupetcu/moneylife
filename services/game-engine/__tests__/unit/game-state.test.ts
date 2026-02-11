import { buildGameState } from '../../src/services/game-state';
import type { GameRow } from '../../src/models/game';
import type { AccountRow } from '../../src/models/account';

describe('Game State Builder', () => {
  const baseGame: GameRow = {
    id: 'game-1',
    user_id: 'user-1',
    partner_id: null,
    persona: 'young_adult',
    difficulty: 'normal',
    region: 'us',
    currency_code: 'USD',
    ppp_factor: '1.0',
    current_game_date: new Date('2026-01-15'),
    current_level: 1,
    total_xp: 100,
    level_xp: 100,
    total_coins: 50,
    happiness: 60,
    streak_current: 3,
    streak_longest: 5,
    chi_score: 650,
    chi_payment_history: 70,
    chi_utilization: 80,
    chi_credit_age: 30,
    chi_credit_mix: 30,
    chi_new_inquiries: 100,
    budget_score: 50,
    net_worth: '200000',
    monthly_income: '350000',
    inflation_cumulative: '1.0',
    bankruptcy_count: 0,
    bankruptcy_active: false,
    state_version: '1',
    random_seed: '12345',
    status: 'active',
    created_at: new Date(),
    updated_at: new Date(),
    deleted_at: null,
  };

  const baseAccounts: AccountRow[] = [
    {
      id: 'acc-1',
      game_id: 'game-1',
      type: 'checking',
      name: 'Checking',
      balance: '200000',
      credit_limit: null,
      interest_rate: '0.0001',
      principal: null,
      remaining_principal: null,
      monthly_payment: null,
      term_months: null,
      months_paid: null,
      auto_pay_setting: 'none',
      status: 'active',
      opened_game_date: new Date('2026-01-01'),
      consecutive_missed_payments: 0,
      pending_interest: '0',
      withdrawal_count_this_month: 0,
    },
    {
      id: 'acc-2',
      game_id: 'game-1',
      type: 'savings',
      name: 'Savings',
      balance: '50000',
      credit_limit: null,
      interest_rate: '0.025',
      principal: null,
      remaining_principal: null,
      monthly_payment: null,
      term_months: null,
      months_paid: null,
      auto_pay_setting: 'none',
      status: 'active',
      opened_game_date: new Date('2026-01-01'),
      consecutive_missed_payments: 0,
      pending_interest: '0',
      withdrawal_count_this_month: 0,
    },
  ];

  it('should build game state from DB rows', () => {
    const state = buildGameState(baseGame, baseAccounts);
    expect(state.id).toBe('game-1');
    expect(state.userId).toBe('user-1');
    expect(state.persona).toBe('young_adult');
    expect(state.difficulty).toBe('normal');
    expect(state.currency).toBe('USD');
  });

  it('should correctly parse current date', () => {
    const state = buildGameState(baseGame, baseAccounts);
    expect(state.currentDate.year).toBe(2026);
    expect(state.currentDate.month).toBe(1);
    expect(state.currentDate.day).toBe(15);
  });

  it('should map accounts correctly', () => {
    const state = buildGameState(baseGame, baseAccounts);
    expect(state.accounts).toHaveLength(2);
    expect(state.accounts[0].type).toBe('checking');
    expect(state.accounts[0].balance).toBe(200000);
    expect(state.accounts[1].type).toBe('savings');
    expect(state.accounts[1].interestRate).toBeCloseTo(0.025);
  });

  it('should parse monetary values as integers', () => {
    const state = buildGameState(baseGame, baseAccounts);
    expect(state.netWorth).toBe(200000);
    expect(state.monthlyIncome).toBe(350000);
    expect(Number.isInteger(state.netWorth)).toBe(true);
    expect(Number.isInteger(state.monthlyIncome)).toBe(true);
  });

  it('should include credit health index', () => {
    const state = buildGameState(baseGame, baseAccounts);
    expect(state.creditHealthIndex.overall).toBe(650);
    expect(state.creditHealthIndex.factors.paymentHistory).toBe(70);
    expect(state.creditHealthIndex.factors.utilization).toBe(80);
  });

  it('should handle null partner_id', () => {
    const state = buildGameState(baseGame, baseAccounts);
    expect(state.partnerId).toBeNull();
  });

  it('should handle partner_id', () => {
    const state = buildGameState({ ...baseGame, partner_id: 'partner-1' }, baseAccounts);
    expect(state.partnerId).toBe('partner-1');
  });

  it('should handle credit card with credit limit', () => {
    const ccAccount: AccountRow = {
      ...baseAccounts[0],
      id: 'acc-cc',
      type: 'credit_card',
      name: 'Credit Card',
      balance: '-50000',
      credit_limit: '200000',
      interest_rate: '0.1999',
    };
    const state = buildGameState(baseGame, [ccAccount]);
    expect(state.accounts[0].creditLimit).toBe(200000);
    expect(state.accounts[0].balance).toBe(-50000);
  });

  it('should handle loan with remaining principal', () => {
    const loanAccount: AccountRow = {
      ...baseAccounts[0],
      id: 'acc-loan',
      type: 'student_loan',
      name: 'Student Loan',
      balance: '-1500000',
      remaining_principal: '1500000',
      monthly_payment: '15000',
    };
    const state = buildGameState(baseGame, [loanAccount]);
    expect(state.accounts[0].remainingBalance).toBe(1500000);
    expect(state.accounts[0].monthlyPayment).toBe(15000);
  });

  it('should set empty arrays for pending cards and goals', () => {
    const state = buildGameState(baseGame, baseAccounts);
    expect(state.pendingCards).toEqual([]);
    expect(state.activeGoals).toEqual([]);
    expect(state.householdMembers).toEqual([]);
  });

  it('should include streak days', () => {
    const state = buildGameState(baseGame, baseAccounts);
    expect(state.streakDays).toBe(3);
  });

  it('should include budget score', () => {
    const state = buildGameState(baseGame, baseAccounts);
    expect(state.budgetScore).toBe(50);
  });

  it('should set status correctly', () => {
    const state = buildGameState(baseGame, baseAccounts);
    expect(state.status).toBe('active');

    const pausedState = buildGameState({ ...baseGame, status: 'paused' }, baseAccounts);
    expect(pausedState.status).toBe('paused');

    const bankruptState = buildGameState({ ...baseGame, status: 'bankrupt' }, baseAccounts);
    expect(bankruptState.status).toBe('bankrupt');
  });

  it('should handle empty accounts array', () => {
    const state = buildGameState(baseGame, []);
    expect(state.accounts).toEqual([]);
  });

  it('should include rng seed', () => {
    const state = buildGameState(baseGame, baseAccounts);
    expect(state.rngSeed).toBe('12345');
  });

  it('should include timestamps', () => {
    const state = buildGameState(baseGame, baseAccounts);
    expect(state.createdAt).toBeDefined();
    expect(state.updatedAt).toBeDefined();
  });
});
