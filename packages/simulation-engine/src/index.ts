// Stub simulation-engine - will be replaced by parallel agent
import type {
  GameState,
  GameAction,
  GameActionResult,
  GameAccount,
  DecisionCard,
  PersonaType,
  DifficultyMode,
  CurrencyCode,
  RegionCode,
  CreditHealthIndex,
  GameDate,
} from '@moneylife/shared-types';

export interface CreateGameParams {
  userId: string;
  persona: PersonaType;
  difficulty: DifficultyMode;
  currency: CurrencyCode;
  region: RegionCode;
  partnerId?: string | null;
}

export function createInitialGameState(params: CreateGameParams): Omit<GameState, 'id' | 'createdAt' | 'updatedAt'> {
  const defaultChi: CreditHealthIndex = {
    overall: 650,
    factors: { paymentHistory: 70, utilization: 80, accountAge: 30, creditMix: 30, newCredit: 100 },
    trend: 'stable',
    lastUpdated: { year: 2026, month: 1, day: 1 },
  };

  return {
    userId: params.userId,
    partnerId: params.partnerId ?? null,
    persona: params.persona,
    region: params.region,
    currency: params.currency,
    difficulty: params.difficulty,
    currentDate: { year: 2026, month: 1, day: 1 },
    currentLevel: 1,
    totalXp: 0,
    totalCoins: 0,
    status: 'active',
    accounts: getStartingAccounts(params.persona),
    pendingCards: [],
    activeGoals: [],
    householdMembers: [],
    monthlyIncome: 350000,
    monthlyExpenses: 120000,
    netWorth: 200000,
    creditHealthIndex: defaultChi,
    budgetScore: 50,
    streakDays: 0,
    rngSeed: Math.random().toString(36).slice(2),
  };
}

function getStartingAccounts(_persona: PersonaType): GameAccount[] {
  return [
    { id: 'acc-checking-1', type: 'checking', name: 'Checking', balance: 200000, interestRate: 0.0001, isActive: true },
    { id: 'acc-savings-1', type: 'savings', name: 'Savings', balance: 50000, interestRate: 0.025, isActive: true },
  ];
}

export function processGameAction(_state: GameState, action: GameAction): GameActionResult {
  return {
    success: true,
    newState: {},
    events: [{ type: action.type, description: `Processed ${action.type}`, timestamp: { year: 2026, month: 1, day: 1 }, data: {} }],
    rewards: [],
  };
}

export function advanceDay(state: GameState): GameActionResult {
  const nextDate = incrementDate(state.currentDate);
  return {
    success: true,
    newState: { currentDate: nextDate },
    events: [{ type: 'day_advanced', description: 'Day advanced', timestamp: nextDate, data: {} }],
    rewards: [],
  };
}

export function generateDailyCards(_state: GameState): DecisionCard[] {
  return [];
}

export function isMonthEnd(date: GameDate): boolean {
  const daysInMonth = new Date(date.year, date.month, 0).getDate();
  return date.day >= daysInMonth;
}

export function processMonthEnd(_state: GameState): GameActionResult {
  return { success: true, newState: {}, events: [], rewards: [] };
}

function incrementDate(date: GameDate): GameDate {
  const d = new Date(date.year, date.month - 1, date.day + 1);
  return { year: d.getFullYear(), month: d.getMonth() + 1, day: d.getDate() };
}

export { incrementDate };
