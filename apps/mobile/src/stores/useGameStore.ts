import { create } from 'zustand';

import type { GameState, DecisionCard } from '@moneylife/shared-types';

export interface GameStore {
  currentGame: GameState | null;
  pendingCards: DecisionCard[];
  isOffline: boolean;
  isLoading: boolean;

  setGame: (game: GameState) => void;
  setPendingCards: (cards: DecisionCard[]) => void;
  setOffline: (offline: boolean) => void;
  setLoading: (loading: boolean) => void;
  clearGame: () => void;
  updateGamePartial: (partial: Partial<GameState>) => void;
}

export const useGameStore = create<GameStore>((set) => ({
  currentGame: null,
  pendingCards: [],
  isOffline: false,
  isLoading: false,

  setGame: (game) =>
    set({ currentGame: game, pendingCards: game.pendingCards }),

  setPendingCards: (cards) =>
    set({ pendingCards: cards }),

  setOffline: (offline) =>
    set({ isOffline: offline }),

  setLoading: (loading) =>
    set({ isLoading: loading }),

  clearGame: () =>
    set({ currentGame: null, pendingCards: [] }),

  updateGamePartial: (partial) =>
    set((state) => ({
      currentGame: state.currentGame
        ? { ...state.currentGame, ...partial }
        : null,
    })),
}));
