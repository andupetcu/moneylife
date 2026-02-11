/**
 * Notification handler — registers push tokens and handles incoming notifications.
 */

export interface NotificationPayload {
  type: string;
  title: string;
  body: string;
  data?: Record<string, unknown>;
}

/**
 * Register device for push notifications.
 * In production, uses expo-notifications to get push token and sends to server.
 */
export async function registerForPushNotifications(): Promise<string | null> {
  // In production:
  // const { status } = await Notifications.requestPermissionsAsync();
  // if (status !== 'granted') return null;
  // const token = await Notifications.getExpoPushTokenAsync();
  // await apiClient.post('/notifications/register-device', { token: token.data });
  // return token.data;
  return null;
}

/**
 * Handle incoming notification.
 */
export function handleNotification(payload: NotificationPayload): void {
  // Route to appropriate screen based on notification type
  switch (payload.type) {
    case 'bill_reminder':
    case 'card_pending':
    case 'streak_warning':
    case 'challenge_deadline':
    case 'badge_earned':
    case 'level_up':
      // Navigation handled by notification response listener
      break;
    default:
      break;
  }
}
