import { create } from 'zustand';

export interface SettingsStore {
  locale: string;
  themeMode: 'light' | 'dark' | 'system';
  pushNotifications: boolean;
  emailNotifications: boolean;
  soundEnabled: boolean;
  hapticsEnabled: boolean;

  setLocale: (locale: string) => void;
  setThemeMode: (mode: 'light' | 'dark' | 'system') => void;
  setPushNotifications: (enabled: boolean) => void;
  setEmailNotifications: (enabled: boolean) => void;
  setSoundEnabled: (enabled: boolean) => void;
  setHapticsEnabled: (enabled: boolean) => void;
}

export const useSettingsStore = create<SettingsStore>((set) => ({
  locale: 'en',
  themeMode: 'system',
  pushNotifications: true,
  emailNotifications: true,
  soundEnabled: true,
  hapticsEnabled: true,

  setLocale: (locale) => set({ locale }),
  setThemeMode: (themeMode) => set({ themeMode }),
  setPushNotifications: (pushNotifications) => set({ pushNotifications }),
  setEmailNotifications: (emailNotifications) => set({ emailNotifications }),
  setSoundEnabled: (soundEnabled) => set({ soundEnabled }),
  setHapticsEnabled: (hapticsEnabled) => set({ hapticsEnabled }),
}));
