'use client';

import React, { useEffect, useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { I18nextProvider } from 'react-i18next';

import { ThemeProvider } from '@moneylife/ui-kit';
import { AuthProvider } from '../src/lib/auth-context';
import { ToastProvider } from '../src/components/Toast';
import { CelebrationProvider } from '../src/lib/celebration-context';
import CelebrationOverlay from '../src/components/CelebrationOverlay';
import i18n from '../src/i18n';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      staleTime: 30_000,
    },
  },
});

export function Providers({ children }: { children: React.ReactNode }): React.ReactElement {
  const [ready, setReady] = useState(i18n.isInitialized);

  useEffect(() => {
    if (i18n.isInitialized) {
      setReady(true);
    } else {
      const onInit = (): void => setReady(true);
      i18n.on('initialized', onInit);
      return () => { i18n.off('initialized', onInit); };
    }
  }, []);

  if (!ready) {
    return <div style={{ minHeight: '100vh' }} />;
  }

  return (
    <I18nextProvider i18n={i18n}>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider>
          <AuthProvider>
            <CelebrationProvider>
              <ToastProvider>
                {children}
                <CelebrationOverlay />
              </ToastProvider>
            </CelebrationProvider>
          </AuthProvider>
        </ThemeProvider>
      </QueryClientProvider>
    </I18nextProvider>
  );
}
