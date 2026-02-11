import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { useTranslation } from 'react-i18next';

import {
  MLCard,
  MLButton,
  MLLoading,
  CreditHealthGauge,
  BudgetRing,
  useTheme,
  formatCurrency,
  formatMonthYear,
} from '@moneylife/ui-kit';
import { useMonthlyReportQuery } from '../../../../src/hooks/useGameQuery';
import { useGameStore } from '../../../../src/stores/useGameStore';

export default function MonthlyReviewScreen(): React.ReactElement {
  const { t } = useTranslation();
  const theme = useTheme();
  const { gameId } = useLocalSearchParams<{ gameId: string }>();
  const game = useGameStore((s) => s.currentGame);

  const month = game?.currentDate.month ?? 1;
  const year = game?.currentDate.year ?? 2026;
  const { data: report, isLoading, isError, refetch } = useMonthlyReportQuery(gameId, year, month);

  if (isLoading) return <MLLoading fullScreen testID="review-loading" />;

  if (isError || !report) {
    return (
      <View style={[styles.centered, { backgroundColor: theme.colors.background }]}>
        <Text style={[{ color: theme.colors.danger, ...theme.typography.bodyMedium }]}>{t('error.generic')}</Text>
        <MLButton titleKey="common.retry" onPress={() => refetch()} variant="outline" />
      </View>
    );
  }

  const currency = game?.currency ?? 'USD';

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      contentContainerStyle={styles.content}
      testID="monthly-review-screen"
    >
      <Text style={[styles.title, { color: theme.colors.text, ...theme.typography.displaySmall }]}>
        {t('monthlyReview.title')}
      </Text>
      <Text style={[{ color: theme.colors.textSecondary, ...theme.typography.headlineSmall }]}>
        {formatMonthYear(report.month, report.year)}
      </Text>

      {/* Financial summary */}
      <MLCard variant="elevated" padding="large">
        {([
          ['income', report.income],
          ['expenses', report.expenses],
          ['savings', report.savings],
          ['debtPayments', report.debtPayments],
          ['investmentChange', report.investmentChange],
          ['netWorthChange', report.netWorthChange],
          ['netWorth', report.netWorth],
        ] as const).map(([key, value]) => (
          <View key={key} style={styles.summaryRow}>
            <Text style={[{ color: theme.colors.textSecondary, ...theme.typography.bodyMedium }]}>
              {t(`monthlyReview.${key}`)}
            </Text>
            <Text style={[{
              color: value >= 0 ? theme.colors.text : theme.colors.danger,
              ...theme.typography.labelLarge,
            }]}>
              {formatCurrency(value, currency)}
            </Text>
          </View>
        ))}
      </MLCard>

      {/* Credit Health */}
      <MLCard variant="elevated">
        <CreditHealthGauge
          score={report.creditHealthIndex}
          trend="stable"
          showFactors={false}
        />
      </MLCard>

      {/* Budget */}
      <MLCard variant="elevated">
        <BudgetRing
          allocated={report.income}
          spent={report.expenses}
          currencyCode={currency}
          score={report.budgetScore}
        />
      </MLCard>

      {/* XP & Coins earned */}
      <View style={styles.rewardsRow}>
        <MLCard variant="outlined" padding="medium">
          <Text style={[{ color: theme.colors.primary, ...theme.typography.headlineMedium }]}>
            {t('monthlyReview.xpEarned')}
          </Text>
          <Text style={[{ color: theme.colors.primary, ...theme.typography.displaySmall }]}>
            +{report.xpEarned}
          </Text>
        </MLCard>
        <MLCard variant="outlined" padding="medium">
          <Text style={[{ color: theme.colors.accent, ...theme.typography.headlineMedium }]}>
            {t('monthlyReview.coinsEarned')}
          </Text>
          <Text style={[{ color: theme.colors.accent, ...theme.typography.displaySmall }]}>
            +{report.coinsEarned}
          </Text>
        </MLCard>
      </View>

      {/* Highlights */}
      {report.highlights.length > 0 && (
        <MLCard variant="outlined" padding="medium">
          <Text style={[{ color: theme.colors.success, ...theme.typography.labelLarge, marginBottom: 8 }]}>
            {t('monthlyReview.highlights')}
          </Text>
          {report.highlights.map((h, i) => (
            <Text key={i} style={[{ color: theme.colors.text, ...theme.typography.bodySmall }]}>• {h}</Text>
          ))}
        </MLCard>
      )}

      {/* Warnings */}
      {report.warnings.length > 0 && (
        <MLCard variant="outlined" padding="medium">
          <Text style={[{ color: theme.colors.warning, ...theme.typography.labelLarge, marginBottom: 8 }]}>
            {t('monthlyReview.warnings')}
          </Text>
          {report.warnings.map((w, i) => (
            <Text key={i} style={[{ color: theme.colors.text, ...theme.typography.bodySmall }]}>⚠ {w}</Text>
          ))}
        </MLCard>
      )}

      <MLButton titleKey="monthlyReview.dismiss" onPress={() => {}} testID="dismiss-review" />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 16, gap: 16, paddingBottom: 32 },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24, gap: 16 },
  title: { marginBottom: 4 },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 6 },
  rewardsRow: { flexDirection: 'row', gap: 12 },
});
