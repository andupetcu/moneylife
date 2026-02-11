import React from 'react';
import { render } from '@testing-library/react-native';

import { TransactionList, TransactionItem } from '../src/components/TransactionList';
import { ThemeProvider } from '../src/theme/TenantTheme';

const wrap = (ui: React.ReactElement): React.ReactElement => (
  <ThemeProvider>{ui}</ThemeProvider>
);

const mockTransactions: TransactionItem[] = [
  {
    id: '1',
    date: { year: 2026, month: 1, day: 15 },
    type: 'expense',
    category: 'groceries',
    description: 'Supermarket purchase',
    amount: -15000,
    balanceAfter: 485000,
  },
  {
    id: '2',
    date: { year: 2026, month: 1, day: 14 },
    type: 'income',
    category: 'salary',
    description: 'Monthly salary',
    amount: 350000,
    balanceAfter: 500000,
  },
];

describe('TransactionList', () => {
  it('renders transactions', () => {
    const { getByText } = render(wrap(
      <TransactionList transactions={mockTransactions} currencyCode="RON" />
    ));
    expect(getByText('Supermarket purchase')).toBeTruthy();
    expect(getByText('Monthly salary')).toBeTruthy();
  });

  it('renders empty state when no transactions', () => {
    const { getByText } = render(wrap(
      <TransactionList transactions={[]} currencyCode="RON" />
    ));
    expect(getByText('No transactions yet')).toBeTruthy();
  });

  it('renders custom empty message', () => {
    const { getByText } = render(wrap(
      <TransactionList
        transactions={[]}
        currencyCode="USD"
        emptyMessageKey="empty.noTransactions"
      />
    ));
    expect(getByText('No transactions yet')).toBeTruthy();
  });

  it('supports testID', () => {
    const { getByTestId } = render(wrap(
      <TransactionList
        transactions={mockTransactions}
        currencyCode="RON"
        testID="tx-list"
      />
    ));
    expect(getByTestId('tx-list')).toBeTruthy();
  });
});
