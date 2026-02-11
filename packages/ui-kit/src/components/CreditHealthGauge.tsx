import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';

import { useTheme } from '../theme/TenantTheme';

export interface CreditHealthGaugeProps {
  score: number;
  trend: 'improving' | 'stable' | 'declining';
  factors?: {
    paymentHistory: number;
    utilization: number;
    accountAge: number;
    creditMix: number;
    newCredit: number;
  };
  showFactors?: boolean;
  testID?: string;
}

function getRating(score: number): string {
  if (score >= 750) return 'excellent';
  if (score >= 670) return 'good';
  if (score >= 580) return 'fair';
  if (score >= 500) return 'poor';
  return 'veryPoor';
}

function getScoreColor(
  score: number,
  colors: Record<string, string>,
): string {
  if (score >= 750) return colors.creditExcellent;
  if (score >= 670) return colors.creditGood;
  if (score >= 580) return colors.creditFair;
  if (score >= 500) return colors.creditPoor;
  return colors.creditVeryPoor;
}

export function CreditHealthGauge({
  score,
  trend,
  factors,
  showFactors = true,
  testID,
}: CreditHealthGaugeProps): React.ReactElement {
  const { t } = useTranslation();
  const theme = useTheme();

  const rating = getRating(score);
  const scoreColor = getScoreColor(score, theme.colors);
  const percentage = Math.round(((score - 300) / 550) * 100);

  const trendIcon = trend === 'improving' ? '↑' : trend === 'declining' ? '↓' : '→';

  return (
    <View
      style={styles.container}
      accessibilityLabel={t('accessibility.creditGauge', {
        score,
        rating: t(`creditHealth.${rating}`),
      })}
      testID={testID}
    >
      <View style={styles.scoreSection}>
        <Text
          style={[
            styles.scoreValue,
            { color: scoreColor, ...theme.typography.displayLarge },
          ]}
        >
          {score}
        </Text>
        <Text
          style={[
            styles.scoreLabel,
            { color: scoreColor, ...theme.typography.labelLarge },
          ]}
        >
          {t(`creditHealth.${rating}`)}
        </Text>
        <Text
          style={[
            styles.trend,
            {
              color:
                trend === 'improving'
                  ? theme.colors.success
                  : trend === 'declining'
                    ? theme.colors.danger
                    : theme.colors.textSecondary,
              ...theme.typography.bodySmall,
            },
          ]}
        >
          {trendIcon} {t(`creditHealth.${trend}`)}
        </Text>
      </View>

      {/* Gauge bar */}
      <View style={[styles.gaugeBar, { backgroundColor: theme.colors.backgroundTertiary }]}>
        <View
          style={[
            styles.gaugeFill,
            {
              backgroundColor: scoreColor,
              width: `${percentage}%`,
            },
          ]}
        />
      </View>
      <View style={styles.gaugeLabels}>
        <Text style={[styles.gaugeLabel, { color: theme.colors.textTertiary, ...theme.typography.caption }]}>
          300
        </Text>
        <Text style={[styles.gaugeLabel, { color: theme.colors.textTertiary, ...theme.typography.caption }]}>
          850
        </Text>
      </View>

      {showFactors && factors && (
        <View style={styles.factors}>
          {(
            [
              ['paymentHistory', factors.paymentHistory, 35],
              ['utilization', factors.utilization, 30],
              ['accountAge', factors.accountAge, 15],
              ['creditMix', factors.creditMix, 10],
              ['newCredit', factors.newCredit, 10],
            ] as const
          ).map(([key, value, weight]) => (
            <View key={key} style={styles.factorRow}>
              <Text
                style={[
                  styles.factorLabel,
                  { color: theme.colors.textSecondary, ...theme.typography.bodySmall },
                ]}
              >
                {t(`creditHealth.${key}`)} ({weight}%)
              </Text>
              <View
                style={[
                  styles.factorBar,
                  { backgroundColor: theme.colors.backgroundTertiary },
                ]}
              >
                <View
                  style={[
                    styles.factorFill,
                    {
                      backgroundColor: getScoreColor(
                        300 + (value / 100) * 550,
                        theme.colors,
                      ),
                      width: `${value}%`,
                    },
                  ]}
                />
              </View>
              <Text
                style={[
                  styles.factorValue,
                  { color: theme.colors.text, ...theme.typography.labelSmall },
                ]}
              >
                {value}
              </Text>
            </View>
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  scoreSection: {
    alignItems: 'center',
    marginBottom: 16,
  },
  scoreValue: {},
  scoreLabel: {
    marginTop: 4,
  },
  trend: {
    marginTop: 4,
  },
  gaugeBar: {
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 4,
  },
  gaugeFill: {
    height: '100%',
    borderRadius: 4,
  },
  gaugeLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  gaugeLabel: {},
  factors: {
    gap: 10,
  },
  factorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  factorLabel: {
    width: 140,
  },
  factorBar: {
    flex: 1,
    height: 6,
    borderRadius: 3,
    overflow: 'hidden',
  },
  factorFill: {
    height: '100%',
    borderRadius: 3,
  },
  factorValue: {
    width: 30,
    textAlign: 'right',
  },
});
