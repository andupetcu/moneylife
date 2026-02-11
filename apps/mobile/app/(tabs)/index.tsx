import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';

import {
  MLButton,
  MLCard,
  MLLoading,
  BalanceCard,
  CreditHealthGauge,
  useTheme,
  formatCurrency,
} from '@moneylife/ui-kit';
import { useGameStore } from '../../src/stores/useGameStore';
import { useAuthStore } from '../../src/stores/useAuthStore';
import { useGameQuery } from '../../src/hooks/useGameQuery';

export default function HomeScreen(): React.ReactElement {
  const { t } = useTranslation();
  const theme = useTheme();
  const router = useRouter();
  const { user } = useAuthStore();
  const { currentGame } = useGameStore();

  const gameId = currentGame?.id;
  const { isLoading, isError, error, refetch } = useGameQuery(gameId);

  // Loading state
  if (isLoading) {
    return <MLLoading fullScreen testID="home-loading" />;
  }

  // Error state
  if (isError) {
    return (
      <View style={[styles.centered, { backgroundColor: theme.colors.background }]}>
        <Text style={[{ color: theme.colors.danger, ...theme.typography.bodyMedium }]}>
          {t('error.generic')}
        </Text>
        <MLButton titleKey="common.retry" onPress={() => refetch()} variant="outline" />
      </View>
    );
  }

  // Empty state — no active game
  if (!currentGame) {
    return (
      <View style={[styles.centered, { backgroundColor: theme.colors.background }]}>
        <Text style={[styles.emptyTitle, { color: theme.colors.text, ...theme.typography.headlineLarge }]}>
          {t('home.noActiveGame')}
        </Text>
        <Text style={[styles.emptySubtitle, { color: theme.colors.textSecondary, ...theme.typography.bodyMedium }]}>
          {t('empty.noGames')}
        </Text>
        <MLButton titleKey="home.startNewGame" onPress={() => {}} testID="start-game" />
      </View>
    );
  }

  // Loaded state
  const timeOfDay = new Date().getHours() < 12
    ? t('home.greetingMorning')
    : new Date().getHours() < 18
      ? t('home.greetingAfternoon')
      : t('home.greetingEvening');

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      contentContainerStyle={styles.content}
      testID="home-screen"
    >
      {/* Greeting */}
      <Text style={[styles.greeting, { color: theme.colors.text, ...theme.typography.headlineLarge }]}>
        {t('home.greeting', { timeOfDay, name: user?.displayName ?? '' })}
      </Text>

      {/* Level & streak */}
      <View style={styles.statsRow}>
        <MLCard variant="outlined" padding="small">
          <Text style={[{ color: theme.colors.primary, ...theme.typography.labelLarge }]}>
            {t('home.currentLevel', { level: currentGame.currentLevel })}
          </Text>
        </MLCard>
        <MLCard variant="outlined" padding="small">
          <Text style={[{ color: theme.colors.accent, ...theme.typography.labelLarge }]}>
            {t('home.streakDays', { count: currentGame.streakDays })}
          </Text>
        </MLCard>
      </View>

      {/* Net worth */}
      <MLCard variant="elevated" padding="large">
        <Text style={[{ color: theme.colors.textSecondary, ...theme.typography.labelMedium }]}>
          {t('home.netWorth')}
        </Text>
        <Text style={[{ color: theme.colors.text, ...theme.typography.displayMedium }]}>
          {formatCurrency(currentGame.netWorth, currentGame.currency)}
        </Text>
      </MLCard>

      {/* Pending decisions */}
      {currentGame.pendingCards.length > 0 && (
        <MLCard variant="outlined" padding="medium">
          <Text style={[{ color: theme.colors.accent, ...theme.typography.labelLarge }]}>
            {t('home.pendingCards', { count: currentGame.pendingCards.length })}
          </Text>
          <MLButton
            titleKey="game.makeDecision"
            onPress={() => router.push(`/game/${currentGame.id}/daily`)}
            size="small"
            variant="secondary"
          />
        </MLCard>
      )}

      {/* Quick actions */}
      <Text style={[styles.sectionTitle, { color: theme.colors.text, ...theme.typography.headlineSmall }]}>
        {t('home.quickActions')}
      </Text>
      <View style={styles.actions}>
        <MLButton
          titleKey="home.advanceDay"
          onPress={() => router.push(`/game/${currentGame.id}/daily`)}
          variant="primary"
          size="small"
        />
        <MLButton
          titleKey="home.viewBudget"
          onPress={() => router.push(`/game/${currentGame.id}/budget`)}
          variant="outline"
          size="small"
        />
        <MLButton
          titleKey="home.viewAccounts"
          onPress={() => {}}
          variant="outline"
          size="small"
        />
      </View>

      {/* Accounts summary */}
      {currentGame.accounts.map((account) => (
        <BalanceCard
          key={account.id}
          accountType={account.type}
          accountName={account.name}
          balance={account.balance}
          currencyCode={currentGame.currency}
          interestRate={account.interestRate}
          creditLimit={account.creditLimit}
          isActive={account.isActive}
          testID={`account-${account.id}`}
        />
      ))}

      {/* Credit Health */}
      <MLCard variant="elevated">
        <CreditHealthGauge
          score={currentGame.creditHealthIndex.overall}
          trend={currentGame.creditHealthIndex.trend}
          factors={currentGame.creditHealthIndex.factors}
          testID="credit-gauge"
        />
      </MLCard>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 16, gap: 16, paddingBottom: 32 },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24, gap: 16 },
  greeting: { marginBottom: 4 },
  statsRow: { flexDirection: 'row', gap: 12 },
  sectionTitle: { marginTop: 8 },
  actions: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  emptyTitle: { textAlign: 'center' },
  emptySubtitle: { textAlign: 'center', marginBottom: 16 },
});
