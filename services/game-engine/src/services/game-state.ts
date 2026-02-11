import type { GameState } from '@moneylife/shared-types';
import type { GameRow } from '../models/game.js';
import type { AccountRow } from '../models/account.js';

export function buildGameState(game: GameRow, accounts: AccountRow[]): GameState {
  const d = game.current_game_date;
  return {
    id: game.id,
    userId: game.user_id,
    partnerId: game.partner_id,
    persona: game.persona as GameState['persona'],
    region: game.region as GameState['region'],
    currency: game.currency_code as GameState['currency'],
    difficulty: game.difficulty as GameState['difficulty'],
    currentDate: {
      year: d.getFullYear(),
      month: d.getMonth() + 1,
      day: d.getDate(),
    },
    currentLevel: game.current_level,
    totalXp: game.total_xp,
    totalCoins: game.total_coins,
    status: game.status as GameState['status'],
    accounts: accounts.map(a => ({
      id: a.id,
      type: a.type as import('@moneylife/shared-types').AccountType,
      name: a.name,
      balance: parseInt(a.balance, 10),
      interestRate: parseFloat(a.interest_rate),
      creditLimit: a.credit_limit ? parseInt(a.credit_limit, 10) : undefined,
      minimumPayment: undefined,
      monthlyPayment: a.monthly_payment ? parseInt(a.monthly_payment, 10) : undefined,
      remainingBalance: a.remaining_principal ? parseInt(a.remaining_principal, 10) : undefined,
      isActive: a.status === 'active',
    })),
    pendingCards: [],
    activeGoals: [],
    householdMembers: [],
    monthlyIncome: parseInt(game.monthly_income, 10),
    monthlyExpenses: 0,
    netWorth: parseInt(game.net_worth, 10),
    creditHealthIndex: {
      overall: game.chi_score,
      factors: {
        paymentHistory: game.chi_payment_history,
        utilization: game.chi_utilization,
        accountAge: game.chi_credit_age,
        creditMix: game.chi_credit_mix,
        newCredit: game.chi_new_inquiries,
      },
      trend: 'stable',
      lastUpdated: {
        year: d.getFullYear(),
        month: d.getMonth() + 1,
        day: d.getDate(),
      },
    },
    budgetScore: game.budget_score,
    streakDays: game.streak_current,
    rngSeed: game.random_seed,
    createdAt: game.created_at.toISOString(),
    updatedAt: game.updated_at.toISOString(),
  };
}
