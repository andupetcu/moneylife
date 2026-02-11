import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';

import { MLButton } from '../src/components/MLButton';
import { ThemeProvider } from '../src/theme/TenantTheme';

const wrap = (ui: React.ReactElement): React.ReactElement => (
  <ThemeProvider>{ui}</ThemeProvider>
);

describe('MLButton', () => {
  it('renders with translated text', () => {
    const { getByText } = render(wrap(
      <MLButton titleKey="common.confirm" onPress={() => {}} />
    ));
    expect(getByText('Confirm')).toBeTruthy();
  });

  it('calls onPress when pressed', () => {
    const onPress = jest.fn();
    const { getByText } = render(wrap(
      <MLButton titleKey="common.confirm" onPress={onPress} />
    ));
    fireEvent.press(getByText('Confirm'));
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it('does not call onPress when disabled', () => {
    const onPress = jest.fn();
    const { getByText } = render(wrap(
      <MLButton titleKey="common.confirm" onPress={onPress} disabled />
    ));
    fireEvent.press(getByText('Confirm'));
    expect(onPress).not.toHaveBeenCalled();
  });

  it('shows loading indicator when loading', () => {
    const { queryByText, getByTestId } = render(wrap(
      <MLButton titleKey="common.confirm" onPress={() => {}} loading testID="btn" />
    ));
    expect(queryByText('Confirm')).toBeNull();
  });

  it('renders with different variants', () => {
    const variants = ['primary', 'secondary', 'outline', 'ghost', 'danger'] as const;
    variants.forEach((variant) => {
      const { getByText } = render(wrap(
        <MLButton titleKey="common.confirm" onPress={() => {}} variant={variant} />
      ));
      expect(getByText('Confirm')).toBeTruthy();
    });
  });

  it('renders with different sizes', () => {
    const sizes = ['small', 'medium', 'large'] as const;
    sizes.forEach((size) => {
      const { getByText } = render(wrap(
        <MLButton titleKey="common.confirm" onPress={() => {}} size={size} />
      ));
      expect(getByText('Confirm')).toBeTruthy();
    });
  });

  it('supports testID', () => {
    const { getByTestId } = render(wrap(
      <MLButton titleKey="common.confirm" onPress={() => {}} testID="my-btn" />
    ));
    expect(getByTestId('my-btn')).toBeTruthy();
  });

  it('renders with title params', () => {
    const { getByText } = render(wrap(
      <MLButton titleKey="rewards.level" titleParams={{ level: 5 }} onPress={() => {}} />
    ));
    expect(getByText('Level 5')).toBeTruthy();
  });
});
