import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { useTranslation } from 'react-i18next';

import { DecisionCardView, MLLoading, MLButton, useTheme } from '@moneylife/ui-kit';
import { useGameStore } from '../../../../../src/stores/useGameStore';
import { useSyncMutation } from '../../../../../src/hooks/useSyncMutation';

export default function CardDetailScreen(): React.ReactElement {
  const { t } = useTranslation();
  const theme = useTheme();
  const { gameId, cardId } = useLocalSearchParams<{ gameId: string; cardId: string }>();
  const game = useGameStore((s) => s.currentGame);
  const mutation = useSyncMutation(gameId ?? '');

  const card = game?.pendingCards.find((c) => c.id === cardId);

  if (!game) {
    return <MLLoading fullScreen />;
  }

  if (!card) {
    return (
      <View style={[styles.centered, { backgroundColor: theme.colors.background }]}>
        <Text style={[{ color: theme.colors.textTertiary, ...theme.typography.bodyMedium }]}>
          {t('error.notFound')}
        </Text>
      </View>
    );
  }

  const handleSelectOption = (optionId: string): void => {
    mutation.mutate({
      type: 'decide_card',
      payload: { cardId, optionId },
      clientTimestamp: new Date().toISOString(),
      idempotencyKey: String(Date.now()),
    });
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      contentContainerStyle={styles.content}
      testID="card-detail-screen"
    >
      <DecisionCardView
        card={card}
        onSelectOption={handleSelectOption}
        isProcessing={mutation.isPending}
        currencyCode={game.currency}
        testID="decision-card"
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 16, gap: 16, paddingBottom: 32 },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 },
});
