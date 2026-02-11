import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';

import { DecisionCardView } from '../src/components/DecisionCardView';
import { ThemeProvider } from '../src/theme/TenantTheme';

const wrap = (ui: React.ReactElement): React.ReactElement => (
  <ThemeProvider>{ui}</ThemeProvider>
);

const mockCard = {
  id: 'card-1',
  category: 'groceries',
  title: 'Weekly Grocery Shopping',
  description: 'Time to stock up. How much do you want to spend?',
  options: [
    {
      id: 'opt-1',
      label: 'Budget shopping',
      description: 'Buy only essentials',
      consequences: [{ type: 'balance_change', amount: -3000, narrative: 'Spent on groceries' }],
      xpReward: 15,
      coinReward: 5,
    },
    {
      id: 'opt-2',
      label: 'Premium shopping',
      description: 'Buy premium brands',
      consequences: [{ type: 'balance_change', amount: -8000, narrative: 'Spent on premium groceries' }],
      xpReward: 5,
      coinReward: 1,
    },
  ],
  isBonus: false,
  stakeLevel: 'low' as const,
};

describe('DecisionCardView', () => {
  it('renders card title and description', () => {
    const { getByText } = render(wrap(
      <DecisionCardView card={mockCard} onSelectOption={() => {}} isProcessing={false} currencyCode="RON" />
    ));
    expect(getByText('Weekly Grocery Shopping')).toBeTruthy();
    expect(getByText('Time to stock up. How much do you want to spend?')).toBeTruthy();
  });

  it('renders all options', () => {
    const { getByText } = render(wrap(
      <DecisionCardView card={mockCard} onSelectOption={() => {}} isProcessing={false} currencyCode="RON" />
    ));
    expect(getByText('Budget shopping')).toBeTruthy();
    expect(getByText('Premium shopping')).toBeTruthy();
  });

  it('calls onSelectOption with correct option id', () => {
    const onSelect = jest.fn();
    const { getByText } = render(wrap(
      <DecisionCardView card={mockCard} onSelectOption={onSelect} isProcessing={false} currencyCode="RON" />
    ));
    fireEvent.press(getByText('Budget shopping'));
    expect(onSelect).toHaveBeenCalledWith('opt-1');
  });

  it('shows processing state', () => {
    const { getByText } = render(wrap(
      <DecisionCardView card={mockCard} onSelectOption={() => {}} isProcessing={true} currencyCode="RON" />
    ));
    expect(getByText('Processing your decision…')).toBeTruthy();
  });

  it('renders bonus badge for bonus cards', () => {
    const bonusCard = { ...mockCard, isBonus: true };
    const { getByText } = render(wrap(
      <DecisionCardView card={bonusCard} onSelectOption={() => {}} isProcessing={false} currencyCode="RON" />
    ));
    expect(getByText('Bonus card')).toBeTruthy();
  });

  it('renders stake level badge', () => {
    const highCard = { ...mockCard, stakeLevel: 'high' as const };
    const { getByText } = render(wrap(
      <DecisionCardView card={highCard} onSelectOption={() => {}} isProcessing={false} currencyCode="USD" />
    ));
    expect(getByText('High stakes')).toBeTruthy();
  });

  it('renders XP and coin rewards', () => {
    const { getByText } = render(wrap(
      <DecisionCardView card={mockCard} onSelectOption={() => {}} isProcessing={false} currencyCode="USD" />
    ));
    expect(getByText('+15 XP')).toBeTruthy();
    expect(getByText('+5 coins')).toBeTruthy();
  });

  it('supports testID', () => {
    const { getByTestId } = render(wrap(
      <DecisionCardView card={mockCard} onSelectOption={() => {}} isProcessing={false} currencyCode="USD" testID="dc" />
    ));
    expect(getByTestId('dc')).toBeTruthy();
  });
});
