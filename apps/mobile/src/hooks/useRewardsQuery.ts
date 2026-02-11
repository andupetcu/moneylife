import { useQuery } from '@tanstack/react-query';

import { getBadges, getRewardCatalog, getLeaderboard } from '../services/api-client';
import { useRewardsStore } from '../stores/useRewardsStore';

export function useBadgesQuery(gameId: string | undefined) {
  const setBadges = useRewardsStore((s) => s.setBadges);

  return useQuery({
    queryKey: ['game', gameId, 'badges'],
    queryFn: async () => {
      if (!gameId) throw new Error('No game ID');
      const badges = await getBadges(gameId);
      setBadges(badges);
      return badges;
    },
    enabled: !!gameId,
    staleTime: 60_000,
  });
}

export function useRewardCatalogQuery() {
  const setCatalog = useRewardsStore((s) => s.setCatalog);

  return useQuery({
    queryKey: ['rewards', 'catalog'],
    queryFn: async () => {
      const catalog = await getRewardCatalog();
      setCatalog(catalog);
      return catalog;
    },
    staleTime: 300_000,
  });
}

export function useLeaderboardQuery(
  type: string,
  options?: { classroomId?: string },
) {
  return useQuery({
    queryKey: ['social', 'leaderboard', type, options],
    queryFn: () => getLeaderboard(type, options),
    staleTime: 30_000,
  });
}
