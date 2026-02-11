// packages/simulation-engine/src/ledger.ts
// Double-entry accounting ledger — all money operations must balance

import type { LedgerEntry, Transaction, TransactionType } from '@moneylife/shared-types';
import type { GameDate } from '@moneylife/shared-types';
import { GameplayError } from '@moneylife/shared-types';

export interface AccountBalance {
  accountId: string;
  balance: number;
}

export interface CreateTransactionInput {
  gameId: string;
  date: GameDate;
  type: TransactionType;
  category: string;
  description: string;
  entries: Array<{ accountId: string; amount: number }>;
  metadata?: Record<string, unknown>;
}

let txCounter = 0;

/**
 * Generate a unique transaction ID.
 */
export function generateTransactionId(): string {
  return `tx-${Date.now()}-${++txCounter}`;
}

/**
 * Validate that a set of ledger entries balances to zero.
 * In double-entry accounting, debits and credits must always sum to 0.
 */
export function validateEntries(entries: Array<{ accountId: string; amount: number }>): void {
  if (entries.length < 2) {
    throw new GameplayError('UNBALANCED_TRANSACTION', 'Transaction must have at least 2 entries');
  }

  const sum = entries.reduce((acc, e) => acc + e.amount, 0);

  // Allow for tiny floating-point drift, but we work in integers so sum must be exactly 0
  if (sum !== 0) {
    throw new GameplayError(
      'UNBALANCED_TRANSACTION',
      `Transaction entries do not balance: sum = ${sum}`,
    );
  }
}

/**
 * Create a double-entry transaction.
 * Validates balance, updates account balances, returns the transaction.
 */
export function createTransaction(
  input: CreateTransactionInput,
  balances: Map<string, number>,
): Transaction {
  validateEntries(input.entries);

  const ledgerEntries: LedgerEntry[] = input.entries.map((entry) => {
    const currentBalance = balances.get(entry.accountId) ?? 0;
    const newBalance = currentBalance + entry.amount;
    balances.set(entry.accountId, newBalance);

    return {
      accountId: entry.accountId,
      amount: entry.amount,
      balanceAfter: newBalance,
    };
  });

  return {
    id: generateTransactionId(),
    gameId: input.gameId,
    date: input.date,
    type: input.type,
    category: input.category,
    description: input.description,
    entries: ledgerEntries,
    metadata: input.metadata,
  };
}

/**
 * Batch-create multiple transactions atomically.
 * If any transaction fails validation, none are applied.
 */
export function createTransactionBatch(
  inputs: CreateTransactionInput[],
  balances: Map<string, number>,
): Transaction[] {
  // Snapshot balances for rollback
  const snapshot = new Map(balances);

  try {
    const transactions: Transaction[] = [];
    for (const input of inputs) {
      transactions.push(createTransaction(input, balances));
    }
    return transactions;
  } catch (error) {
    // Rollback
    balances.clear();
    for (const [k, v] of snapshot) {
      balances.set(k, v);
    }
    throw error;
  }
}

/**
 * Create a simple two-account transfer transaction.
 * Positive amount moves money FROM fromAccount TO toAccount.
 */
export function createTransferTransaction(
  gameId: string,
  date: GameDate,
  fromAccountId: string,
  toAccountId: string,
  amount: number,
  type: TransactionType,
  category: string,
  description: string,
  balances: Map<string, number>,
): Transaction {
  if (amount <= 0) {
    throw new GameplayError('INVALID_AMOUNT', 'Transfer amount must be positive');
  }

  return createTransaction(
    {
      gameId,
      date,
      type,
      category,
      description,
      entries: [
        { accountId: fromAccountId, amount: -amount },
        { accountId: toAccountId, amount: amount },
      ],
    },
    balances,
  );
}

/**
 * Verify ledger integrity — all transactions in a list balance.
 */
export function verifyLedgerIntegrity(transactions: Transaction[]): boolean {
  for (const tx of transactions) {
    const sum = tx.entries.reduce((acc, e) => acc + e.amount, 0);
    if (sum !== 0) {
      return false;
    }
  }
  return true;
}
