import React, { useEffect, useState } from 'react';
import * as SecureStore from 'expo-secure-store';

import { useAuthStore } from '../stores/useAuthStore';

const TOKEN_KEY = 'moneylife_access_token';

export interface AuthProviderProps {
  children: React.ReactNode;
}

/**
 * AuthProvider — checks for stored tokens on mount and restores auth state.
 */
export function AuthProvider({ children }: AuthProviderProps): React.ReactElement {
  const { setLoading, setAuthenticated } = useAuthStore();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    async function restoreAuth(): Promise<void> {
      try {
        const token = await SecureStore.getItemAsync(TOKEN_KEY);
        if (token) {
          // In production, validate token with server and get user profile
          // For now, mark as needing re-auth
          setLoading(false);
        } else {
          setLoading(false);
        }
      } catch {
        setLoading(false);
      } finally {
        setReady(true);
      }
    }
    restoreAuth();
  }, [setLoading]);

  if (!ready) return <></>;

  return <>{children}</>;
}
