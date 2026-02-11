import React from 'react';

import { ThemeProvider as UIKitThemeProvider, TenantThemeConfig } from '@moneylife/ui-kit';

export interface AppThemeProviderProps {
  tenantConfig?: TenantThemeConfig;
  children: React.ReactNode;
}

/**
 * ThemeProvider — wraps ui-kit's ThemeProvider with tenant configuration.
 * In production, tenant config is fetched from partner service.
 */
export function AppThemeProvider({
  tenantConfig,
  children,
}: AppThemeProviderProps): React.ReactElement {
  return (
    <UIKitThemeProvider tenantConfig={tenantConfig}>
      {children}
    </UIKitThemeProvider>
  );
}
