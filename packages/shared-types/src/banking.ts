// packages/shared-types/src/banking.ts

export interface LinkedAccount {
  id: string;
  userId: string;
  provider: BankingProvider;
  institutionName: string;
  accountName: string;
  accountType: string;
  lastSynced: string;
  status: 'active' | 'error' | 'disconnected';
}

export type BankingProvider = 'plaid' | 'truelayer' | 'salt_edge';

export interface SyncedTransaction {
  id: string;
  linkedAccountId: string;
  date: string;
  amount: number;
  currency: string;
  description: string;
  category: string;
  merchantName?: string;
}

export interface MirrorComparison {
  gameId: string;
  linkedAccountId: string;
  month: number;
  year: number;
  gameSpending: Record<string, number>;
  realSpending: Record<string, number>;
  insights: string[];
}
