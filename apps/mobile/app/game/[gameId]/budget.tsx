import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { useTranslation } from 'react-i18next';

import { MLCard, MLButton, MLLoading, BudgetRing, useTheme, formatCurrency } from '@moneylife/ui-kit';
import { useGameStore } from '../../../../src/stores/useGameStore';
import { useGameQuery } from '../../../../src/hooks/useGameQuery';

export default function BudgetScreen(): React.ReactElement {
  const { t } = useTranslation();
  const theme = useTheme();
  const { gameId } = useLocalSearchParams<{ gameId: string }>();
  const { isLoading, isError, refetch } = useGameQuery(gameId);
  const game = useGameStore((s) => s.currentGame);

  if (isLoading) return <MLLoading fullScreen testID="budget-loading" />;

  if (isError || !game) {
    return (
      <View style={[styles.centered, { backgroundColor: theme.colors.background }]}>
        <Text style={[{ color: theme.colors.danger, ...theme.typography.bodyMedium }]}>{t('error.generic')}</Text>
        <MLButton titleKey="common.retry" onPress={() => refetch()} variant="outline" />
      </View>
    );
  }

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      contentContainerStyle={styles.content}
      testID="budget-screen"
    >
      <Text style={[{ color: theme.colors.text, ...theme.typography.headlineLarge }]}>
        {t('budget.title')}
      </Text>

      <BudgetRing
        allocated={game.monthlyIncome}
        spent={game.monthlyExpenses}
        currencyCode={game.currency}
        score={game.budgetScore}
        testID="budget-ring"
      />

      {/* Budget score */}
      <MLCard variant="elevated" padding="large">
        <Text style={[{ color: theme.colors.textSecondary, ...theme.typography.labelMedium }]}>
          {t('budget.budgetScore')}
        </Text>
        <Text style={[{ color: theme.colors.text, ...theme.typography.displayMedium }]}>
          {game.budgetScore}/100
        </Text>
      </MLCard>

      {/* Income vs Expenses */}
      <MLCard variant="outlined" padding="medium">
        <View style={styles.row}>
          <Text style={[{ color: theme.colors.textSecondary, ...theme.typography.bodyMedium }]}>
            {t('home.monthlyIncome')}
          </Text>
          <Text style={[{ color: theme.colors.success, ...theme.typography.labelLarge }]}>
            {formatCurrency(game.monthlyIncome, game.currency)}
          </Text>
        </View>
        <View style={styles.row}>
          <Text style={[{ color: theme.colors.textSecondary, ...theme.typography.bodyMedium }]}>
            {t('home.monthlyExpenses')}
          </Text>
          <Text style={[{ color: theme.colors.danger, ...theme.typography.labelLarge }]}>
            {formatCurrency(game.monthlyExpenses, game.currency)}
          </Text>
        </View>
      </MLCard>

      {game.budgetScore === 0 ? (
        <View style={styles.emptyState}>
          <Text style={[{ color: theme.colors.textTertiary, ...theme.typography.bodyMedium, textAlign: 'center' }]}>
            {t('budget.noBudget')}
          </Text>
          <Text style={[{ color: theme.colors.textTertiary, ...theme.typography.bodySmall, textAlign: 'center' }]}>
            {t('budget.setBudgetHint')}
          </Text>
          <MLButton titleKey="budget.createBudget" onPress={() => {}} />
        </View>
      ) : (
        <MLButton titleKey="budget.editBudget" onPress={() => {}} variant="outline" />
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 16, gap: 16, paddingBottom: 32 },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24, gap: 16 },
  row: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 6 },
  emptyState: { gap: 8, alignItems: 'center', padding: 16 },
});
