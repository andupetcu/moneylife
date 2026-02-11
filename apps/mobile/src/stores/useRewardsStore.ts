import { create } from 'zustand';

import type { Badge, RewardCatalogItem } from '@moneylife/shared-types';

export interface RewardsStore {
  totalXp: number;
  totalCoins: number;
  currentLevel: number;
  streakDays: number;
  badges: Badge[];
  catalog: RewardCatalogItem[];

  setRewardsData: (data: {
    totalXp: number;
    totalCoins: number;
    currentLevel: number;
    streakDays: number;
  }) => void;
  setBadges: (badges: Badge[]) => void;
  setCatalog: (catalog: RewardCatalogItem[]) => void;
  addBadge: (badge: Badge) => void;
  updateCoins: (delta: number) => void;
  updateXp: (delta: number) => void;
}

export const useRewardsStore = create<RewardsStore>((set) => ({
  totalXp: 0,
  totalCoins: 0,
  currentLevel: 1,
  streakDays: 0,
  badges: [],
  catalog: [],

  setRewardsData: (data) => set(data),

  setBadges: (badges) => set({ badges }),

  setCatalog: (catalog) => set({ catalog }),

  addBadge: (badge) =>
    set((state) => ({ badges: [...state.badges, badge] })),

  updateCoins: (delta) =>
    set((state) => ({ totalCoins: state.totalCoins + delta })),

  updateXp: (delta) =>
    set((state) => ({ totalXp: state.totalXp + delta })),
}));
