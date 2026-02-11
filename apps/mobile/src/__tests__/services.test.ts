import { queueOfflineAction, getOfflineQueueSize } from '../services/api-client';
import { getSyncStatus, setOnlineStatus, performSync } from '../services/sync-engine';

// We can't test full API client without mocking axios, but we test the offline queue logic
describe('api-client offline queue', () => {
  it('queues actions when called', () => {
    const initialSize = getOfflineQueueSize();
    queueOfflineAction('game-1', {
      type: 'advance_day',
      payload: {},
      clientTimestamp: new Date().toISOString(),
      idempotencyKey: 'key-1',
    });
    expect(getOfflineQueueSize()).toBe(initialSize + 1);
  });
});

describe('sync-engine', () => {
  it('returns sync status', () => {
    const status = getSyncStatus();
    expect(status).toHaveProperty('lastSyncAt');
    expect(status).toHaveProperty('pendingActions');
    expect(status).toHaveProperty('isOnline');
  });

  it('sets online status', () => {
    setOnlineStatus(false);
    expect(getSyncStatus().isOnline).toBe(false);
    setOnlineStatus(true);
    expect(getSyncStatus().isOnline).toBe(true);
  });
});
