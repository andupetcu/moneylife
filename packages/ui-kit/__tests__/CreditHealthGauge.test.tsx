import React from 'react';
import { render } from '@testing-library/react-native';

import { CreditHealthGauge } from '../src/components/CreditHealthGauge';
import { ThemeProvider } from '../src/theme/TenantTheme';

const wrap = (ui: React.ReactElement): React.ReactElement => (
  <ThemeProvider>{ui}</ThemeProvider>
);

const defaultFactors = {
  paymentHistory: 95,
  utilization: 20,
  accountAge: 60,
  creditMix: 70,
  newCredit: 85,
};

describe('CreditHealthGauge', () => {
  it('renders score value', () => {
    const { getByText } = render(wrap(
      <CreditHealthGauge score={750} trend="stable" />
    ));
    expect(getByText('750')).toBeTruthy();
  });

  it('renders Excellent for score >= 750', () => {
    const { getByText } = render(wrap(
      <CreditHealthGauge score={800} trend="improving" />
    ));
    expect(getByText('Excellent')).toBeTruthy();
  });

  it('renders Good for score >= 670', () => {
    const { getByText } = render(wrap(
      <CreditHealthGauge score={700} trend="stable" />
    ));
    expect(getByText('Good')).toBeTruthy();
  });

  it('renders Fair for score >= 580', () => {
    const { getByText } = render(wrap(
      <CreditHealthGauge score={600} trend="declining" />
    ));
    expect(getByText('Fair')).toBeTruthy();
  });

  it('renders Poor for score >= 500', () => {
    const { getByText } = render(wrap(
      <CreditHealthGauge score={520} trend="declining" />
    ));
    expect(getByText('Poor')).toBeTruthy();
  });

  it('renders Very poor for score < 500', () => {
    const { getByText } = render(wrap(
      <CreditHealthGauge score={400} trend="declining" />
    ));
    expect(getByText('Very poor')).toBeTruthy();
  });

  it('shows trend indicator', () => {
    const { getByText } = render(wrap(
      <CreditHealthGauge score={750} trend="improving" />
    ));
    expect(getByText(/Improving/)).toBeTruthy();
  });

  it('renders factors when provided', () => {
    const { getByText } = render(wrap(
      <CreditHealthGauge score={750} trend="stable" factors={defaultFactors} />
    ));
    expect(getByText(/Payment history/)).toBeTruthy();
    expect(getByText(/Credit utilization/)).toBeTruthy();
  });

  it('hides factors when showFactors is false', () => {
    const { queryByText } = render(wrap(
      <CreditHealthGauge score={750} trend="stable" factors={defaultFactors} showFactors={false} />
    ));
    expect(queryByText(/Payment history/)).toBeNull();
  });

  it('supports testID', () => {
    const { getByTestId } = render(wrap(
      <CreditHealthGauge score={750} trend="stable" testID="gauge" />
    ));
    expect(getByTestId('gauge')).toBeTruthy();
  });
});
