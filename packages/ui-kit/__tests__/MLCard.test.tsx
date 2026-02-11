import React from 'react';
import { Text } from 'react-native';
import { render } from '@testing-library/react-native';

import { MLCard } from '../src/components/MLCard';
import { ThemeProvider } from '../src/theme/TenantTheme';

const wrap = (ui: React.ReactElement): React.ReactElement => (
  <ThemeProvider>{ui}</ThemeProvider>
);

describe('MLCard', () => {
  it('renders children', () => {
    const { getByText } = render(wrap(
      <MLCard><Text>Hello</Text></MLCard>
    ));
    expect(getByText('Hello')).toBeTruthy();
  });

  it('supports elevated variant', () => {
    const { getByTestId } = render(wrap(
      <MLCard variant="elevated" testID="card"><Text>Test</Text></MLCard>
    ));
    expect(getByTestId('card')).toBeTruthy();
  });

  it('supports outlined variant', () => {
    const { getByTestId } = render(wrap(
      <MLCard variant="outlined" testID="card"><Text>Test</Text></MLCard>
    ));
    expect(getByTestId('card')).toBeTruthy();
  });

  it('supports different padding sizes', () => {
    const paddings = ['none', 'small', 'medium', 'large'] as const;
    paddings.forEach((p) => {
      const { getByText } = render(wrap(
        <MLCard padding={p}><Text>Content</Text></MLCard>
      ));
      expect(getByText('Content')).toBeTruthy();
    });
  });

  it('supports accessibilityLabel', () => {
    const { getByLabelText } = render(wrap(
      <MLCard accessibilityLabel="My card"><Text>Content</Text></MLCard>
    ));
    expect(getByLabelText('My card')).toBeTruthy();
  });
});
