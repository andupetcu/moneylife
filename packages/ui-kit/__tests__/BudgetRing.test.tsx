import React from 'react';
import { render } from '@testing-library/react-native';

import { BudgetRing } from '../src/components/BudgetRing';
import { ThemeProvider } from '../src/theme/TenantTheme';

const wrap = (ui: React.ReactElement): React.ReactElement => (
  <ThemeProvider>{ui}</ThemeProvider>
);

describe('BudgetRing', () => {
  it('renders percentage', () => {
    const { getByText } = render(wrap(
      <BudgetRing allocated={100000} spent={50000} currencyCode="USD" />
    ));
    expect(getByText('50%')).toBeTruthy();
  });

  it('renders on track status when under 75%', () => {
    const { getByText } = render(wrap(
      <BudgetRing allocated={100000} spent={30000} currencyCode="USD" />
    ));
    expect(getByText('On track')).toBeTruthy();
  });

  it('renders needs attention when between 75-100%', () => {
    const { getByText } = render(wrap(
      <BudgetRing allocated={100000} spent={80000} currencyCode="USD" />
    ));
    expect(getByText('Needs attention')).toBeTruthy();
  });

  it('renders overspent when over budget', () => {
    const { getByText } = render(wrap(
      <BudgetRing allocated={100000} spent={120000} currencyCode="USD" />
    ));
    expect(getByText('Overspent')).toBeTruthy();
  });

  it('renders category when provided', () => {
    const { getByText } = render(wrap(
      <BudgetRing allocated={100000} spent={50000} currencyCode="USD" category="Groceries" />
    ));
    expect(getByText('Groceries')).toBeTruthy();
  });

  it('renders budget score when provided', () => {
    const { getByText } = render(wrap(
      <BudgetRing allocated={100000} spent={50000} currencyCode="USD" score={85} />
    ));
    expect(getByText('85/100')).toBeTruthy();
  });

  it('handles zero allocation', () => {
    const { getByText } = render(wrap(
      <BudgetRing allocated={0} spent={0} currencyCode="USD" />
    ));
    expect(getByText('0%')).toBeTruthy();
  });

  it('supports testID', () => {
    const { getByTestId } = render(wrap(
      <BudgetRing allocated={100000} spent={50000} currencyCode="USD" testID="ring" />
    ));
    expect(getByTestId('ring')).toBeTruthy();
  });
});
