import type { GameDate } from './game.js';

export type TransactionType =
  | 'income' | 'expense' | 'transfer' | 'interest_credit'
  | 'interest_debit' | 'fee' | 'loan_payment' | 'loan_disbursement'
  | 'investment_buy' | 'investment_sell' | 'dividend'
  | 'insurance_premium' | 'insurance_claim' | 'tax_payment'
  | 'bnpl_purchase' | 'bnpl_installment';

export interface Transaction {
  id: string;
  gameId: string;
  date: GameDate;
  type: TransactionType;
  category: string;
  description: string;
  entries: LedgerEntry[];
  metadata?: Record<string, unknown>;
}

export interface LedgerEntry {
  accountId: string;
  amount: number;
  balanceAfter: number;
}

export interface MonthlyReport {
  gameId: string;
  month: number;
  year: number;
  income: number;
  expenses: number;
  savings: number;
  debtPayments: number;
  investmentChange: number;
  netWorthChange: number;
  netWorth: number;
  budgetScore: number;
  creditHealthIndex: number;
  xpEarned: number;
  coinsEarned: number;
  badgesEarned: string[];
  highlights: string[];
  warnings: string[];
}
