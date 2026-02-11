import { useQuery } from '@tanstack/react-query';

import { getGame, getPendingCards, getMonthlyReport, getTransactions } from '../services/api-client';
import { useGameStore } from '../stores/useGameStore';

export function useGameQuery(gameId: string | undefined) {
  const setGame = useGameStore((s) => s.setGame);

  return useQuery({
    queryKey: ['game', gameId],
    queryFn: async () => {
      if (!gameId) throw new Error('No game ID');
      const game = await getGame(gameId);
      setGame(game);
      return game;
    },
    enabled: !!gameId,
    staleTime: 30_000,
  });
}

export function usePendingCardsQuery(gameId: string | undefined) {
  const setPendingCards = useGameStore((s) => s.setPendingCards);

  return useQuery({
    queryKey: ['game', gameId, 'cards'],
    queryFn: async () => {
      if (!gameId) throw new Error('No game ID');
      const cards = await getPendingCards(gameId);
      setPendingCards(cards);
      return cards;
    },
    enabled: !!gameId,
    staleTime: 10_000,
  });
}

export function useMonthlyReportQuery(
  gameId: string | undefined,
  year: number,
  month: number,
) {
  return useQuery({
    queryKey: ['game', gameId, 'report', year, month],
    queryFn: () => {
      if (!gameId) throw new Error('No game ID');
      return getMonthlyReport(gameId, year, month);
    },
    enabled: !!gameId,
    staleTime: 60_000,
  });
}

export function useTransactionsQuery(
  gameId: string | undefined,
  options?: { limit?: number; cursor?: string },
) {
  return useQuery({
    queryKey: ['game', gameId, 'transactions', options],
    queryFn: () => {
      if (!gameId) throw new Error('No game ID');
      return getTransactions(gameId, options);
    },
    enabled: !!gameId,
    staleTime: 15_000,
  });
}
