import React from 'react';
import { render } from '@testing-library/react-native';

import { BalanceCard } from '../src/components/BalanceCard';
import { ThemeProvider } from '../src/theme/TenantTheme';

const wrap = (ui: React.ReactElement): React.ReactElement => (
  <ThemeProvider>{ui}</ThemeProvider>
);

describe('BalanceCard', () => {
  it('renders account name and formatted balance', () => {
    const { getByText } = render(wrap(
      <BalanceCard
        accountType="checking"
        accountName="Main Account"
        balance={500000}
        currencyCode="RON"
      />
    ));
    expect(getByText('Main Account')).toBeTruthy();
  });

  it('renders negative balance with danger color', () => {
    const { getByText } = render(wrap(
      <BalanceCard
        accountType="checking"
        accountName="Overdrawn"
        balance={-10000}
        currencyCode="USD"
      />
    ));
    expect(getByText('Overdrawn')).toBeTruthy();
  });

  it('renders interest rate when provided', () => {
    const { getByText } = render(wrap(
      <BalanceCard
        accountType="savings"
        accountName="Savings"
        balance={200000}
        currencyCode="EUR"
        interestRate={0.025}
      />
    ));
    expect(getByText(/2\.5%/)).toBeTruthy();
  });

  it('renders credit utilization for credit cards', () => {
    const { getByText } = render(wrap(
      <BalanceCard
        accountType="credit_card"
        accountName="Visa"
        balance={-250000}
        currencyCode="USD"
        creditLimit={500000}
      />
    ));
    expect(getByText(/50%/)).toBeTruthy();
  });

  it('renders inactive badge when not active', () => {
    const { getByText } = render(wrap(
      <BalanceCard
        accountType="checking"
        accountName="Closed"
        balance={0}
        currencyCode="USD"
        isActive={false}
      />
    ));
    expect(getByText('Closed')).toBeTruthy();
  });

  it('supports testID', () => {
    const { getByTestId } = render(wrap(
      <BalanceCard
        accountType="checking"
        accountName="Test"
        balance={100}
        currencyCode="USD"
        testID="balance-card"
      />
    ));
    expect(getByTestId('balance-card')).toBeTruthy();
  });
});
