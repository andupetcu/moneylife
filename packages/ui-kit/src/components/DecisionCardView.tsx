import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';

import { useTheme } from '../theme/TenantTheme';
import { formatCurrency, formatCurrencySigned } from '../utils/currency-formatter';
import { MLCard } from './MLCard';
import { MLButton } from './MLButton';

export interface CardOption {
  id: string;
  label: string;
  description: string;
  consequences: Array<{
    type: string;
    amount: number;
    narrative: string;
  }>;
  xpReward: number;
  coinReward: number;
}

export interface DecisionCardViewProps {
  card: {
    id: string;
    category: string;
    title: string;
    description: string;
    options: CardOption[];
    isBonus: boolean;
    stakeLevel: 'low' | 'medium' | 'high' | 'critical';
  };
  onSelectOption: (optionId: string) => void;
  isProcessing: boolean;
  currencyCode: string;
  testID?: string;
}

const STAKE_COLORS: Record<string, string> = {
  low: '#10B981',
  medium: '#F59E0B',
  high: '#EF4444',
  critical: '#7C3AED',
};

export function DecisionCardView({
  card,
  onSelectOption,
  isProcessing,
  currencyCode,
  testID,
}: DecisionCardViewProps): React.ReactElement {
  const { t } = useTranslation();
  const theme = useTheme();

  const stakeKey = `game.stake${card.stakeLevel.charAt(0).toUpperCase() + card.stakeLevel.slice(1)}` as const;
  const stakeColor = STAKE_COLORS[card.stakeLevel] ?? theme.colors.textSecondary;

  return (
    <MLCard variant="elevated" testID={testID}>
      <View
        style={styles.container}
        accessibilityLabel={t('accessibility.decisionCard', {
          title: card.title,
          stakeLevel: t(stakeKey),
          optionCount: card.options.length,
        })}
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.badges}>
            <View style={[styles.stakeBadge, { backgroundColor: stakeColor }]}>
              <Text style={[styles.stakeBadgeText, { ...theme.typography.labelSmall, color: theme.colors.textInverse }]}>
                {t(stakeKey)}
              </Text>
            </View>
            {card.isBonus && (
              <View style={[styles.bonusBadge, { backgroundColor: theme.colors.accent }]}>
                <Text style={[styles.stakeBadgeText, { ...theme.typography.labelSmall, color: theme.colors.textInverse }]}>
                  {t('game.bonusCard')}
                </Text>
              </View>
            )}
          </View>
          <Text style={[styles.category, { color: theme.colors.textTertiary, ...theme.typography.labelSmall }]}>
            {card.category}
          </Text>
        </View>

        {/* Title & description */}
        <Text style={[styles.title, { color: theme.colors.text, ...theme.typography.headlineMedium }]}>
          {card.title}
        </Text>
        <Text style={[styles.description, { color: theme.colors.textSecondary, ...theme.typography.bodyMedium }]}>
          {card.description}
        </Text>

        {/* Options */}
        <View style={styles.options}>
          {card.options.map((option) => (
            <TouchableOpacity
              key={option.id}
              style={[
                styles.optionCard,
                {
                  borderColor: theme.colors.border,
                  borderRadius: theme.borderRadius.md,
                  backgroundColor: theme.colors.backgroundSecondary,
                },
              ]}
              onPress={() => onSelectOption(option.id)}
              disabled={isProcessing}
              accessibilityLabel={`${option.label}: ${option.description}`}
              accessibilityRole="button"
            >
              <Text style={[styles.optionLabel, { color: theme.colors.text, ...theme.typography.labelLarge }]}>
                {option.label}
              </Text>
              <Text style={[styles.optionDesc, { color: theme.colors.textSecondary, ...theme.typography.bodySmall }]}>
                {option.description}
              </Text>

              {/* Consequences preview */}
              <View style={styles.consequencesList}>
                {option.consequences.map((c, i) => (
                  <Text
                    key={i}
                    style={[
                      styles.consequence,
                      {
                        color: c.amount >= 0 ? theme.colors.success : theme.colors.danger,
                        ...theme.typography.bodySmall,
                      },
                    ]}
                  >
                    {formatCurrencySigned(c.amount, currencyCode)} · {c.narrative}
                  </Text>
                ))}
              </View>

              {/* Rewards */}
              <View style={styles.rewards}>
                {option.xpReward > 0 && (
                  <Text style={[styles.reward, { color: theme.colors.primary, ...theme.typography.labelSmall }]}>
                    {t('game.xpReward', { amount: option.xpReward })}
                  </Text>
                )}
                {option.coinReward > 0 && (
                  <Text style={[styles.reward, { color: theme.colors.accent, ...theme.typography.labelSmall }]}>
                    {t('game.coinReward', { amount: option.coinReward })}
                  </Text>
                )}
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {isProcessing && (
          <Text style={[styles.processing, { color: theme.colors.textSecondary, ...theme.typography.bodySmall }]}>
            {t('game.processing')}
          </Text>
        )}
      </View>
    </MLCard>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 4,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  badges: {
    flexDirection: 'row',
    gap: 6,
  },
  stakeBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
  },
  bonusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
  },
  stakeBadgeText: {},
  category: {
    textTransform: 'uppercase',
  },
  title: {
    marginBottom: 8,
  },
  description: {
    marginBottom: 16,
  },
  options: {
    gap: 12,
  },
  optionCard: {
    padding: 16,
    borderWidth: 1,
  },
  optionLabel: {
    marginBottom: 4,
  },
  optionDesc: {
    marginBottom: 8,
  },
  consequencesList: {
    gap: 2,
    marginBottom: 8,
  },
  consequence: {},
  rewards: {
    flexDirection: 'row',
    gap: 12,
  },
  reward: {},
  processing: {
    marginTop: 12,
    textAlign: 'center',
  },
});
