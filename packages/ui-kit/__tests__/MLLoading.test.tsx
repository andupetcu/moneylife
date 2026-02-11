import React from 'react';
import { render } from '@testing-library/react-native';

import { MLLoading } from '../src/components/MLLoading';
import { ThemeProvider } from '../src/theme/TenantTheme';

const wrap = (ui: React.ReactElement): React.ReactElement => (
  <ThemeProvider>{ui}</ThemeProvider>
);

describe('MLLoading', () => {
  it('renders with default message', () => {
    const { getByText } = render(wrap(<MLLoading />));
    expect(getByText('Loading…')).toBeTruthy();
  });

  it('renders with custom message key', () => {
    const { getByText } = render(wrap(
      <MLLoading messageKey="game.processing" />
    ));
    expect(getByText('Processing your decision…')).toBeTruthy();
  });

  it('supports testID', () => {
    const { getByTestId } = render(wrap(
      <MLLoading testID="loader" />
    ));
    expect(getByTestId('loader')).toBeTruthy();
  });

  it('renders fullScreen mode', () => {
    const { getByTestId } = render(wrap(
      <MLLoading fullScreen testID="loader" />
    ));
    expect(getByTestId('loader')).toBeTruthy();
  });
});
