export type UserRole = 'player' | 'teacher' | 'partner_admin' | 'system_admin';
export type UserStatus = 'active' | 'suspended' | 'deleted';

export interface User {
  id: string;
  email: string;
  displayName: string;
  dateOfBirth?: string;
  timezone?: string;
  locale?: string;
  partnerId?: string | null;
  role: UserRole;
  status: UserStatus;
  createdAt: string;
  updatedAt: string;
}

export interface Device {
  id: string;
  userId: string;
  deviceUuid: string;
  platform: 'ios' | 'android' | 'web';
  appVersion?: string;
  pushToken?: string;
  lastActiveAt: string;
  isActiveSession: boolean;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}
