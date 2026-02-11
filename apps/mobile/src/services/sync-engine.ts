/**
 * Sync engine — handles offline/online sync for game state.
 * In production, integrates with WatermelonDB for structured offline storage.
 */

import { flushOfflineQueue, getOfflineQueueSize } from './api-client';

export interface SyncStatus {
  lastSyncAt: string | null;
  pendingActions: number;
  isOnline: boolean;
}

let lastSyncAt: string | null = null;
let isOnline = true;

export function getSyncStatus(): SyncStatus {
  return {
    lastSyncAt,
    pendingActions: getOfflineQueueSize(),
    isOnline,
  };
}

export function setOnlineStatus(online: boolean): void {
  isOnline = online;
}

export async function performSync(): Promise<void> {
  if (!isOnline) return;

  if (getOfflineQueueSize() > 0) {
    await flushOfflineQueue();
  }

  lastSyncAt = new Date().toISOString();
}
