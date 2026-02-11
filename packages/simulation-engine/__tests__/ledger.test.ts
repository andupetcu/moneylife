// packages/simulation-engine/__tests__/ledger.test.ts

import {
  validateEntries,
  createTransaction,
  createTransactionBatch,
  createTransferTransaction,
  verifyLedgerIntegrity,
} from '../src/ledger';
import { GameplayError } from '@moneylife/shared-types';

describe('Ledger', () => {
  const date = { year: 2026, month: 1, day: 15 };

  describe('validateEntries', () => {
    it('should accept balanced entries', () => {
      expect(() =>
        validateEntries([
          { accountId: 'a', amount: 1000 },
          { accountId: 'b', amount: -1000 },
        ]),
      ).not.toThrow();
    });

    it('should reject unbalanced entries', () => {
      expect(() =>
        validateEntries([
          { accountId: 'a', amount: 1000 },
          { accountId: 'b', amount: -500 },
        ]),
      ).toThrow(GameplayError);
    });

    it('should reject single entry', () => {
      expect(() => validateEntries([{ accountId: 'a', amount: 1000 }])).toThrow(
        'at least 2 entries',
      );
    });

    it('should accept multi-entry balanced transaction', () => {
      expect(() =>
        validateEntries([
          { accountId: 'a', amount: 1000 },
          { accountId: 'b', amount: -600 },
          { accountId: 'c', amount: -400 },
        ]),
      ).not.toThrow();
    });

    it('should reject entries summing to non-zero', () => {
      expect(() =>
        validateEntries([
          { accountId: 'a', amount: 1000 },
          { accountId: 'b', amount: -999 },
        ]),
      ).toThrow('do not balance');
    });

    it('should accept zero-amount balanced entries', () => {
      expect(() =>
        validateEntries([
          { accountId: 'a', amount: 0 },
          { accountId: 'b', amount: 0 },
        ]),
      ).not.toThrow();
    });
  });

  describe('createTransaction', () => {
    it('should create a valid transaction and update balances', () => {
      const balances = new Map([['a', 5000], ['b', 0]]);
      const tx = createTransaction(
        {
          gameId: 'game-1',
          date,
          type: 'transfer',
          category: 'transfer',
          description: 'Test transfer',
          entries: [
            { accountId: 'a', amount: -1000 },
            { accountId: 'b', amount: 1000 },
          ],
        },
        balances,
      );

      expect(tx.entries).toHaveLength(2);
      expect(tx.entries[0].balanceAfter).toBe(4000);
      expect(tx.entries[1].balanceAfter).toBe(1000);
      expect(balances.get('a')).toBe(4000);
      expect(balances.get('b')).toBe(1000);
    });

    it('should allow negative balances (overdraft)', () => {
      const balances = new Map([['a', 100], ['b', 0]]);
      const tx = createTransaction(
        {
          gameId: 'game-1',
          date,
          type: 'expense',
          category: 'bill',
          description: 'Bill payment',
          entries: [
            { accountId: 'a', amount: -500 },
            { accountId: 'b', amount: 500 },
          ],
        },
        balances,
      );

      expect(tx.entries[0].balanceAfter).toBe(-400);
      expect(balances.get('a')).toBe(-400);
    });

    it('should reject unbalanced transaction', () => {
      const balances = new Map([['a', 5000]]);
      expect(() =>
        createTransaction(
          {
            gameId: 'game-1',
            date,
            type: 'expense',
            category: 'bill',
            description: 'Bad',
            entries: [{ accountId: 'a', amount: -1000 }],
          },
          balances,
        ),
      ).toThrow();
    });

    it('should handle new accounts (not in balances map)', () => {
      const balances = new Map<string, number>();
      const tx = createTransaction(
        {
          gameId: 'game-1',
          date,
          type: 'income',
          category: 'salary',
          description: 'First salary',
          entries: [
            { accountId: 'income-source', amount: -300000 },
            { accountId: 'checking', amount: 300000 },
          ],
        },
        balances,
      );

      expect(balances.get('checking')).toBe(300000);
      expect(balances.get('income-source')).toBe(-300000);
    });
  });

  describe('createTransactionBatch', () => {
    it('should apply all transactions atomically', () => {
      const balances = new Map([['a', 10000], ['b', 0], ['c', 0]]);
      const txs = createTransactionBatch(
        [
          {
            gameId: 'g',
            date,
            type: 'transfer',
            category: 'x',
            description: 'x',
            entries: [
              { accountId: 'a', amount: -3000 },
              { accountId: 'b', amount: 3000 },
            ],
          },
          {
            gameId: 'g',
            date,
            type: 'transfer',
            category: 'x',
            description: 'x',
            entries: [
              { accountId: 'b', amount: -1000 },
              { accountId: 'c', amount: 1000 },
            ],
          },
        ],
        balances,
      );

      expect(txs).toHaveLength(2);
      expect(balances.get('a')).toBe(7000);
      expect(balances.get('b')).toBe(2000);
      expect(balances.get('c')).toBe(1000);
    });

    it('should rollback on failure', () => {
      const balances = new Map([['a', 10000], ['b', 0]]);
      expect(() =>
        createTransactionBatch(
          [
            {
              gameId: 'g',
              date,
              type: 'transfer',
              category: 'x',
              description: 'x',
              entries: [
                { accountId: 'a', amount: -3000 },
                { accountId: 'b', amount: 3000 },
              ],
            },
            {
              gameId: 'g',
              date,
              type: 'transfer',
              category: 'x',
              description: 'bad',
              entries: [{ accountId: 'a', amount: -1000 }], // unbalanced
            },
          ],
          balances,
        ),
      ).toThrow();

      // Balances should be rolled back
      expect(balances.get('a')).toBe(10000);
      expect(balances.get('b')).toBe(0);
    });
  });

  describe('createTransferTransaction', () => {
    it('should create a valid transfer', () => {
      const balances = new Map([['a', 5000], ['b', 0]]);
      const tx = createTransferTransaction('g', date, 'a', 'b', 2000, 'transfer', 'transfer', 'Move money', balances);
      expect(balances.get('a')).toBe(3000);
      expect(balances.get('b')).toBe(2000);
      expect(tx.entries).toHaveLength(2);
    });

    it('should reject zero amount', () => {
      const balances = new Map([['a', 5000], ['b', 0]]);
      expect(() =>
        createTransferTransaction('g', date, 'a', 'b', 0, 'transfer', 'transfer', 'Bad', balances),
      ).toThrow('positive');
    });

    it('should reject negative amount', () => {
      const balances = new Map([['a', 5000], ['b', 0]]);
      expect(() =>
        createTransferTransaction('g', date, 'a', 'b', -100, 'transfer', 'transfer', 'Bad', balances),
      ).toThrow('positive');
    });
  });

  describe('verifyLedgerIntegrity', () => {
    it('should return true for balanced transactions', () => {
      const txs = [
        {
          id: '1', gameId: 'g', date, type: 'transfer' as const, category: 'x', description: 'x',
          entries: [
            { accountId: 'a', amount: -1000, balanceAfter: 4000 },
            { accountId: 'b', amount: 1000, balanceAfter: 1000 },
          ],
        },
      ];
      expect(verifyLedgerIntegrity(txs)).toBe(true);
    });

    it('should return false for unbalanced transactions', () => {
      const txs = [
        {
          id: '1', gameId: 'g', date, type: 'transfer' as const, category: 'x', description: 'x',
          entries: [
            { accountId: 'a', amount: -1000, balanceAfter: 4000 },
            { accountId: 'b', amount: 999, balanceAfter: 999 },
          ],
        },
      ];
      expect(verifyLedgerIntegrity(txs)).toBe(false);
    });

    it('should handle empty transaction list', () => {
      expect(verifyLedgerIntegrity([])).toBe(true);
    });
  });

  describe('Property: every transaction always balances', () => {
    // Property-based tests
    it('should always balance regardless of amounts (positive)', () => {
      for (let i = 1; i <= 50; i++) {
        const amount = i * 137; // Arbitrary amounts
        const balances = new Map([['a', 1000000], ['b', 0]]);
        const tx = createTransferTransaction('g', date, 'a', 'b', amount, 'transfer', 'x', 'x', balances);
        const sum = tx.entries.reduce((s, e) => s + e.amount, 0);
        expect(sum).toBe(0);
      }
    });

    it('should always balance with multi-entry transactions', () => {
      for (let i = 1; i <= 20; i++) {
        const a1 = i * 100;
        const a2 = i * 200;
        const a3 = -(a1 + a2);
        const balances = new Map([['x', 0], ['y', 0], ['z', 0]]);
        const tx = createTransaction({
          gameId: 'g', date, type: 'expense', category: 'x', description: 'x',
          entries: [
            { accountId: 'x', amount: a1 },
            { accountId: 'y', amount: a2 },
            { accountId: 'z', amount: a3 },
          ],
        }, balances);
        const sum = tx.entries.reduce((s, e) => s + e.amount, 0);
        expect(sum).toBe(0);
      }
    });

    it('should maintain balance after batch operations', () => {
      const balances = new Map([['a', 100000], ['b', 50000], ['c', 0]]);
      const initial = Array.from(balances.values()).reduce((s, v) => s + v, 0);

      createTransactionBatch([
        { gameId: 'g', date, type: 'transfer', category: 'x', description: 'x',
          entries: [{ accountId: 'a', amount: -5000 }, { accountId: 'b', amount: 5000 }] },
        { gameId: 'g', date, type: 'transfer', category: 'x', description: 'x',
          entries: [{ accountId: 'b', amount: -10000 }, { accountId: 'c', amount: 10000 }] },
      ], balances);

      const final = Array.from(balances.values()).reduce((s, v) => s + v, 0);
      expect(final).toBe(initial);
    });
  });
});
