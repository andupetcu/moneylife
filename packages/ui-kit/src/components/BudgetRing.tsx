import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';

import { useTheme } from '../theme/TenantTheme';
import { formatCurrency } from '../utils/currency-formatter';

export interface BudgetRingProps {
  allocated: number;
  spent: number;
  currencyCode: string;
  category?: string;
  score?: number;
  testID?: string;
}

export function BudgetRing({
  allocated,
  spent,
  currencyCode,
  category,
  score,
  testID,
}: BudgetRingProps): React.ReactElement {
  const { t } = useTranslation();
  const theme = useTheme();

  const percentage = allocated > 0 ? Math.round((spent / allocated) * 100) : 0;
  const remaining = allocated - spent;
  const isOverBudget = remaining < 0;

  const ringColor = isOverBudget
    ? theme.colors.danger
    : percentage > 75
      ? theme.colors.warning
      : theme.colors.success;

  const statusKey = isOverBudget
    ? 'budget.overSpent'
    : percentage > 75
      ? 'budget.needsAttention'
      : 'budget.onTrack';

  // Simple circle representation (SVG would be ideal but keeping RN-compatible)
  const circumference = 2 * Math.PI * 40;
  const strokeDashoffset = circumference - (Math.min(percentage, 100) / 100) * circumference;

  return (
    <View
      style={styles.container}
      accessibilityLabel={t('accessibility.budgetRing', {
        percentage,
        remaining: formatCurrency(Math.abs(remaining), currencyCode),
      })}
      testID={testID}
    >
      {/* Ring visualization using View-based approach */}
      <View style={styles.ringContainer}>
        <View
          style={[
            styles.ringOuter,
            { borderColor: theme.colors.backgroundTertiary },
          ]}
        >
          <View
            style={[
              styles.ringInner,
              { backgroundColor: theme.colors.surface },
            ]}
          >
            <Text
              style={[
                styles.percentageText,
                { color: ringColor, ...theme.typography.displaySmall },
              ]}
            >
              {percentage}%
            </Text>
            <Text
              style={[
                styles.statusText,
                { color: theme.colors.textSecondary, ...theme.typography.caption },
              ]}
            >
              {t(statusKey)}
            </Text>
          </View>
        </View>
      </View>

      {category && (
        <Text
          style={[
            styles.category,
            { color: theme.colors.text, ...theme.typography.labelLarge },
          ]}
        >
          {category}
        </Text>
      )}

      <View style={styles.details}>
        <View style={styles.detailRow}>
          <Text
            style={[
              styles.detailLabel,
              { color: theme.colors.textSecondary, ...theme.typography.bodySmall },
            ]}
          >
            {t('budget.allocated')}
          </Text>
          <Text
            style={[
              styles.detailValue,
              { color: theme.colors.text, ...theme.typography.bodySmall },
            ]}
          >
            {formatCurrency(allocated, currencyCode)}
          </Text>
        </View>
        <View style={styles.detailRow}>
          <Text
            style={[
              styles.detailLabel,
              { color: theme.colors.textSecondary, ...theme.typography.bodySmall },
            ]}
          >
            {t('budget.spent')}
          </Text>
          <Text
            style={[
              styles.detailValue,
              { color: theme.colors.text, ...theme.typography.bodySmall },
            ]}
          >
            {formatCurrency(spent, currencyCode)}
          </Text>
        </View>
        <View style={styles.detailRow}>
          <Text
            style={[
              styles.detailLabel,
              { color: theme.colors.textSecondary, ...theme.typography.bodySmall },
            ]}
          >
            {isOverBudget ? t('budget.overBudget') : t('budget.remaining')}
          </Text>
          <Text
            style={[
              styles.detailValue,
              { color: isOverBudget ? theme.colors.danger : theme.colors.success, ...theme.typography.labelLarge },
            ]}
          >
            {formatCurrency(Math.abs(remaining), currencyCode)}
          </Text>
        </View>
      </View>

      {score !== undefined && (
        <View style={[styles.scoreRow, { backgroundColor: theme.colors.backgroundSecondary, borderRadius: theme.borderRadius.md }]}>
          <Text style={[{ color: theme.colors.textSecondary, ...theme.typography.bodySmall }]}>
            {t('budget.budgetScore')}
          </Text>
          <Text style={[{ color: theme.colors.text, ...theme.typography.headlineSmall }]}>
            {score}/100
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    padding: 16,
  },
  ringContainer: {
    marginBottom: 16,
  },
  ringOuter: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  ringInner: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  percentageText: {},
  statusText: {
    marginTop: 2,
  },
  category: {
    marginBottom: 12,
    textAlign: 'center',
  },
  details: {
    width: '100%',
    gap: 6,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  detailLabel: {},
  detailValue: {},
  scoreRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    marginTop: 12,
    padding: 12,
  },
});
