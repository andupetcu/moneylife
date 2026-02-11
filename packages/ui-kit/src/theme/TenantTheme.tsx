import React, { createContext, useContext, useMemo } from 'react';
import { TextStyle } from 'react-native';

import { colors } from './colors';
import { typography } from './typography';
import { spacing, borderRadius } from './spacing';

/**
 * TenantTheme — white-label theming support.
 * Partners provide color overrides; the ThemeProvider merges them with defaults.
 */
export interface TenantThemeConfig {
  colors?: Partial<typeof colors>;
  typography?: Partial<Record<string, TextStyle>>;
  spacing?: Partial<typeof spacing>;
  borderRadius?: Partial<typeof borderRadius>;
  branding?: {
    appName?: string;
    logoUri?: string;
    faviconUri?: string;
  };
}

export interface Theme {
  colors: typeof colors;
  typography: typeof typography;
  spacing: typeof spacing;
  borderRadius: typeof borderRadius;
  branding: {
    appName: string;
    logoUri: string | null;
    faviconUri: string | null;
  };
}

const defaultTheme: Theme = {
  colors,
  typography,
  spacing,
  borderRadius,
  branding: {
    appName: 'MoneyLife',
    logoUri: null,
    faviconUri: null,
  },
};

const ThemeContext = createContext<Theme>(defaultTheme);

export interface ThemeProviderProps {
  tenantConfig?: TenantThemeConfig;
  children: React.ReactNode;
}

export function ThemeProvider({ tenantConfig, children }: ThemeProviderProps): React.ReactElement {
  const theme = useMemo<Theme>(() => {
    if (!tenantConfig) return defaultTheme;

    return {
      colors: { ...colors, ...tenantConfig.colors },
      typography: { ...typography, ...tenantConfig.typography } as typeof typography,
      spacing: { ...spacing, ...tenantConfig.spacing } as typeof spacing,
      borderRadius: { ...borderRadius, ...tenantConfig.borderRadius } as typeof borderRadius,
      branding: {
        appName: tenantConfig.branding?.appName ?? 'MoneyLife',
        logoUri: tenantConfig.branding?.logoUri ?? null,
        faviconUri: tenantConfig.branding?.faviconUri ?? null,
      },
    };
  }, [tenantConfig]);

  return <ThemeContext.Provider value={theme}>{children}</ThemeContext.Provider>;
}

/**
 * Hook to access the current theme.
 */
export function useTheme(): Theme {
  return useContext(ThemeContext);
}

export { defaultTheme };
