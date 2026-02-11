import React from 'react';
import { Text } from 'react-native';
import { render } from '@testing-library/react-native';

import { ThemeProvider, useTheme } from '../src/theme/TenantTheme';
import { colors } from '../src/theme/colors';

function ThemeConsumer(): React.ReactElement {
  const theme = useTheme();
  return <Text testID="color">{theme.colors.primary}</Text>;
}

describe('TenantTheme', () => {
  it('provides default theme', () => {
    const { getByTestId } = render(
      <ThemeProvider>
        <ThemeConsumer />
      </ThemeProvider>
    );
    expect(getByTestId('color').props.children).toBe(colors.primary);
  });

  it('merges tenant config overrides', () => {
    const { getByTestId } = render(
      <ThemeProvider tenantConfig={{ colors: { primary: '#FF0000' } }}>
        <ThemeConsumer />
      </ThemeProvider>
    );
    expect(getByTestId('color').props.children).toBe('#FF0000');
  });

  it('provides default branding', () => {
    function BrandConsumer(): React.ReactElement {
      const theme = useTheme();
      return <Text testID="brand">{theme.branding.appName}</Text>;
    }
    const { getByTestId } = render(
      <ThemeProvider>
        <BrandConsumer />
      </ThemeProvider>
    );
    expect(getByTestId('brand').props.children).toBe('MoneyLife');
  });

  it('overrides branding with tenant config', () => {
    function BrandConsumer(): React.ReactElement {
      const theme = useTheme();
      return <Text testID="brand">{theme.branding.appName}</Text>;
    }
    const { getByTestId } = render(
      <ThemeProvider tenantConfig={{ branding: { appName: 'BankApp' } }}>
        <BrandConsumer />
      </ThemeProvider>
    );
    expect(getByTestId('brand').props.children).toBe('BankApp');
  });
});
