import { handleNotification, registerForPushNotifications } from '../services/notification-handler';

describe('notification-handler', () => {
  it('registerForPushNotifications returns null in test env', async () => {
    const token = await registerForPushNotifications();
    expect(token).toBeNull();
  });

  it('handleNotification does not throw for bill_reminder', () => {
    expect(() => handleNotification({ type: 'bill_reminder', title: 'Bill Due', body: 'Pay rent' })).not.toThrow();
  });

  it('handleNotification does not throw for badge_earned', () => {
    expect(() => handleNotification({ type: 'badge_earned', title: 'Badge!', body: 'You earned a badge' })).not.toThrow();
  });

  it('handleNotification handles unknown type', () => {
    expect(() => handleNotification({ type: 'unknown', title: 'Test', body: 'Test' })).not.toThrow();
  });
});
