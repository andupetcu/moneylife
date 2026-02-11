export type PersonaType = 'teen' | 'student' | 'young_adult' | 'parent';
export type RegionCode = 'ro' | 'pl' | 'hu' | 'cz' | 'gb' | 'de' | 'fr' | 'us';
export type CurrencyCode = 'RON' | 'PLN' | 'HUF' | 'CZK' | 'GBP' | 'EUR' | 'USD';
export type DifficultyMode = 'easy' | 'normal' | 'hard';

export interface GameDate {
  year: number;
  month: number;
  day: number;
}

export interface GameState {
  id: string;
  userId: string;
  partnerId: string | null;
  persona: PersonaType;
  region: RegionCode;
  currency: CurrencyCode;
  difficulty: DifficultyMode;
  currentDate: GameDate;
  currentLevel: number;
  totalXp: number;
  totalCoins: number;
  status: 'active' | 'paused' | 'bankrupt' | 'completed';
  accounts: GameAccount[];
  pendingCards: DecisionCard[];
  activeGoals: SavingsGoal[];
  householdMembers: HouseholdMember[];
  monthlyIncome: number;
  monthlyExpenses: number;
  netWorth: number;
  creditHealthIndex: CreditHealthIndex;
  budgetScore: number;
  streakDays: number;
  rngSeed: string;
  createdAt: string;
  updatedAt: string;
}

export type AccountType =
  | 'checking' | 'savings' | 'credit_card'
  | 'personal_loan' | 'auto_loan' | 'student_loan' | 'mortgage'
  | 'bnpl' | 'investment' | 'insurance' | 'prepaid';

export interface GameAccount {
  id: string;
  type: AccountType;
  name: string;
  balance: number;
  interestRate: number;
  creditLimit?: number;
  minimumPayment?: number;
  monthlyPayment?: number;
  remainingBalance?: number;
  isActive: boolean;
}

export type CardCategory =
  | 'groceries' | 'shopping' | 'housing' | 'transport'
  | 'health' | 'entertainment' | 'education' | 'career'
  | 'emergency' | 'investment' | 'insurance' | 'social'
  | 'subscription' | 'debt' | 'savings' | 'tax';

export interface DecisionCard {
  id: string;
  category: CardCategory;
  title: string;
  description: string;
  options: CardOption[];
  expiresOnDay: GameDate;
  isBonus: boolean;
  stakeLevel: 'low' | 'medium' | 'high' | 'critical';
}

export interface CardOption {
  id: string;
  label: string;
  description: string;
  consequences: Consequence[];
  xpReward: number;
  coinReward: number;
}

export type ConsequenceType =
  | 'balance_change' | 'new_account' | 'close_account'
  | 'rate_change' | 'fee' | 'income_change'
  | 'bill_add' | 'bill_remove' | 'credit_health_change'
  | 'household_change' | 'unlock_feature';

export interface Consequence {
  type: ConsequenceType;
  accountType?: AccountType;
  amount: number;
  recurring?: boolean;
  recurringMonths?: number;
  creditHealthImpact?: Partial<CreditHealthFactors>;
  narrative: string;
}

export interface CreditHealthIndex {
  overall: number;
  factors: CreditHealthFactors;
  trend: 'improving' | 'stable' | 'declining';
  lastUpdated: GameDate;
}

export interface CreditHealthFactors {
  paymentHistory: number;
  utilization: number;
  accountAge: number;
  creditMix: number;
  newCredit: number;
}

export interface SavingsGoal {
  id: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  deadline?: GameDate;
}

export interface HouseholdMember {
  id: string;
  type: 'partner' | 'child' | 'dependent';
  name: string;
}

export interface GameAction {
  type: GameActionType;
  payload: Record<string, unknown>;
  clientTimestamp: string;
  idempotencyKey: string;
}

export type GameActionType =
  | 'advance_day'
  | 'decide_card'
  | 'transfer'
  | 'set_budget'
  | 'set_autopay'
  | 'open_account'
  | 'close_account'
  | 'set_goal'
  | 'buy_insurance'
  | 'file_claim'
  | 'invest'
  | 'sell_investment';

export interface GameActionResult {
  success: boolean;
  newState: Partial<GameState>;
  events: GameEvent[];
  rewards: RewardGrant[];
  errors?: GameError[];
}

export interface GameEvent {
  type: string;
  description: string;
  timestamp: GameDate;
  data: Record<string, unknown>;
}

export interface RewardGrant {
  type: 'xp' | 'coins' | 'badge';
  amount?: number;
  badgeId?: string;
  reason: string;
}

export interface GameError {
  code: string;
  message: string;
  field?: string;
}
