import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';

import {
  MLButton,
  MLCard,
  MLLoading,
  DecisionCardView,
  useTheme,
  formatCurrency,
  formatGameDate,
} from '@moneylife/ui-kit';
import { useGameQuery, usePendingCardsQuery } from '../../../../src/hooks/useGameQuery';
import { useSyncMutation } from '../../../../src/hooks/useSyncMutation';
import { useGameStore } from '../../../../src/stores/useGameStore';
import { v4 as uuid } from 'react-native-uuid';

export default function DailyScreen(): React.ReactElement {
  const { t } = useTranslation();
  const theme = useTheme();
  const router = useRouter();
  const { gameId } = useLocalSearchParams<{ gameId: string }>();

  const { isLoading, isError } = useGameQuery(gameId);
  const cardsQuery = usePendingCardsQuery(gameId);
  const mutation = useSyncMutation(gameId ?? '');
  const game = useGameStore((s) => s.currentGame);
  const pendingCards = useGameStore((s) => s.pendingCards);

  if (isLoading || cardsQuery.isLoading) {
    return <MLLoading fullScreen testID="daily-loading" />;
  }

  if (isError || cardsQuery.isError || !game) {
    return (
      <View style={[styles.centered, { backgroundColor: theme.colors.background }]}>
        <Text style={[{ color: theme.colors.danger, ...theme.typography.bodyMedium }]}>{t('error.generic')}</Text>
        <MLButton titleKey="common.retry" onPress={() => cardsQuery.refetch()} variant="outline" />
      </View>
    );
  }

  const handleAdvanceDay = (): void => {
    mutation.mutate({
      type: 'advance_day',
      payload: {},
      clientTimestamp: new Date().toISOString(),
      idempotencyKey: String(Date.now()),
    });
  };

  const handleSelectOption = (cardId: string, optionId: string): void => {
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
      testID="daily-screen"
    >
      {/* Day header */}
      <Text style={[styles.dayTitle, { color: theme.colors.text, ...theme.typography.headlineLarge }]}>
        {formatGameDate(game.currentDate)}
      </Text>
      <Text style={[{ color: theme.colors.textSecondary, ...theme.typography.bodyMedium }]}>
        {t('game.dailySummary', { day: game.currentDate.day, month: game.currentDate.month })}
      </Text>

      {/* Balances summary */}
      <MLCard variant="elevated" padding="medium">
        <View style={styles.balanceRow}>
          <View>
            <Text style={[{ color: theme.colors.textSecondary, ...theme.typography.labelSmall }]}>
              {t('home.totalBalance')}
            </Text>
            <Text style={[{ color: theme.colors.text, ...theme.typography.headlineMedium }]}>
              {formatCurrency(
                game.accounts.reduce((sum, a) => sum + a.balance, 0),
                game.currency,
              )}
            </Text>
          </View>
          <View>
            <Text style={[{ color: theme.colors.textSecondary, ...theme.typography.labelSmall }]}>
              {t('home.netWorth')}
            </Text>
            <Text style={[{ color: theme.colors.text, ...theme.typography.headlineMedium }]}>
              {formatCurrency(game.netWorth, game.currency)}
            </Text>
          </View>
        </View>
      </MLCard>

      {/* Pending cards */}
      {pendingCards.length === 0 ? (
        <MLCard variant="outlined" padding="medium">
          <Text style={[{ color: theme.colors.textTertiary, ...theme.typography.bodyMedium, textAlign: 'center' }]}>
            {t('home.noPendingCards')}
          </Text>
        </MLCard>
      ) : (
        pendingCards.map((card) => (
          <DecisionCardView
            key={card.id}
            card={card}
            onSelectOption={(optionId) => handleSelectOption(card.id, optionId)}
            isProcessing={mutation.isPending}
            currencyCode={game.currency}
            testID={`card-${card.id}`}
          />
        ))
      )}

      {/* Advance day button */}
      <MLButton
        titleKey="home.advanceDay"
        onPress={handleAdvanceDay}
        loading={mutation.isPending}
        disabled={pendingCards.length > 0}
        testID="advance-day"
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 16, gap: 16, paddingBottom: 32 },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24, gap: 16 },
  dayTitle: { marginBottom: 4 },
  balanceRow: { flexDirection: 'row', justifyContent: 'space-between' },
});
