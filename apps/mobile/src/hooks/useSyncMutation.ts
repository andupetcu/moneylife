import { useMutation, useQueryClient } from '@tanstack/react-query';

import type { GameAction, GameActionResult } from '@moneylife/shared-types';
import { submitAction, queueOfflineAction } from '../services/api-client';
import { useGameStore } from '../stores/useGameStore';
import { useRewardsStore } from '../stores/useRewardsStore';

export function useSyncMutation(gameId: string) {
  const queryClient = useQueryClient();
  const { updateGamePartial, isOffline } = useGameStore();
  const { updateXp, updateCoins, addBadge } = useRewardsStore();

  return useMutation<GameActionResult, Error, GameAction>({
    mutationFn: async (action: GameAction) => {
      if (isOffline) {
        queueOfflineAction(gameId, action);
        throw new Error('OFFLINE_QUEUED');
      }
      return submitAction(gameId, action);
    },
    onSuccess: (result) => {
      // Update game state from server response
      if (result.newState) {
        updateGamePartial(result.newState);
      }

      // Apply rewards
      for (const reward of result.rewards) {
        if (reward.type === 'xp' && reward.amount) {
          updateXp(reward.amount);
        }
        if (reward.type === 'coins' && reward.amount) {
          updateCoins(reward.amount);
        }
        if (reward.type === 'badge' && reward.badgeId) {
          // Badge details fetched separately
        }
      }

      // Invalidate queries to refetch fresh data
      queryClient.invalidateQueries({ queryKey: ['game', gameId] });
      queryClient.invalidateQueries({ queryKey: ['game', gameId, 'cards'] });
    },
  });
}
