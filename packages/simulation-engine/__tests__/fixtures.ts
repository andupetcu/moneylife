// packages/simulation-engine/__tests__/fixtures.ts

export const FIXTURES = {
  baseGame: {
    persona: 'young_adult' as const,
    region: 'ro' as const,
    currency: 'RON' as const,
    difficulty: 'normal' as const,
    currentDate: { year: 2026, month: 1, day: 1 },
    currentLevel: 1,
    accounts: [
      { id: 'checking-1', type: 'checking' as const, balance: 500000 },
      { id: 'savings-1', type: 'savings' as const, balance: 200000, interestRate: 0.025 },
    ],
    monthlyIncome: 350000,
    rngSeed: 'test-seed-001',
  },
  debtGame: {
    persona: 'young_adult' as const,
    currentDate: { year: 2026, month: 6, day: 1 },
    accounts: [
      { id: 'checking-1', type: 'checking' as const, balance: -10000 },
      { id: 'cc-1', type: 'credit_card' as const, balance: -490000, creditLimit: 500000 },
      { id: 'loan-1', type: 'personal_loan' as const, remainingBalance: 2000000 },
    ],
  },
  advancedGame: {
    persona: 'young_adult' as const,
    currentLevel: 5,
    currentDate: { year: 2027, month: 3, day: 15 },
    accounts: [
      { id: 'checking-1', type: 'checking' as const, balance: 1500000 },
      { id: 'savings-1', type: 'savings' as const, balance: 3000000 },
      { id: 'cc-1', type: 'credit_card' as const, balance: -50000, creditLimit: 1000000 },
      { id: 'invest-1', type: 'investment' as const, balance: 500000 },
    ],
  },
};
