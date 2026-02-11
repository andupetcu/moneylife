import React, { useEffect, useCallback } from 'react';

import { useGameStore } from '../stores/useGameStore';
import { flushOfflineQueue, getOfflineQueueSize } from '../services/api-client';

export interface SyncProviderProps {
  children: React.ReactNode;
}

/**
 * SyncProvider — monitors connectivity and flushes offline queue when back online.
 */
export function SyncProvider({ children }: SyncProviderProps): React.ReactElement {
  const { isOffline, setOffline } = useGameStore();

  const syncOfflineActions = useCallback(async (): Promise<void> => {
    if (getOfflineQueueSize() > 0) {
      await flushOfflineQueue();
    }
  }, []);

  useEffect(() => {
    // In production, use NetInfo to detect connectivity changes
    // import NetInfo from '@react-native-community/netinfo';
    // const unsubscribe = NetInfo.addEventListener(state => {
    //   setOffline(!state.isConnected);
    //   if (state.isConnected) syncOfflineActions();
    // });
    // return unsubscribe;

    // For now, periodically try to sync
    const interval = setInterval(() => {
      if (!isOffline && getOfflineQueueSize() > 0) {
        syncOfflineActions();
      }
    }, 30000);

    return () => clearInterval(interval);
  }, [isOffline, setOffline, syncOfflineActions]);

  return <>{children}</>;
}
