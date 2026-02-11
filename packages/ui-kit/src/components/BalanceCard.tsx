import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';

import { useTheme } from '../theme/TenantTheme';
import { formatCurrency } from '../utils/currency-formatter';
import { MLCard } from './MLCard';

export interface BalanceCardProps {
  accountType: string;
  accountName: string;
  balance: number;
  currencyCode: string;
  interestRate?: number;
  creditLimit?: number;
  isActive?: boolean;
  onPress?: () => void;
  testID?: string;
}

export function BalanceCard({
  accountType,
  accountName,
  balance,
  currencyCode,
  interestRate,
  creditLimit,
  isActive = true,
  onPress,
  testID,
}: BalanceCardProps): React.ReactElement {
  const { t } = useTranslation();
  const theme = useTheme();

  const isNegative = balance < 0;
  const balanceColor = isNegative ? theme.colors.danger : theme.colors.text;
  const formattedBalance = formatCurrency(Math.abs(balance), currencyCode);
  const displayBalance = isNegative ? `-${formattedBalance}` : formattedBalance;

  const accountTypeKey = `accounts.${accountType === 'credit_card' ? 'creditCard' : accountType}`;

  const utilization =
    creditLimit && creditLimit > 0
      ? Math.round((Math.abs(balance) / creditLimit) * 100)
      : undefined;

  return (
    <MLCard
      variant="elevated"
      testID={testID}
    >
      <View
        style={styles.container}
        accessibilityLabel={t('accessibility.balanceCard', {
          accountType: t(accountTypeKey),
          balance: displayBalance,
        })}
      >
        <View style={styles.header}>
          <Text
            style={[
              styles.accountName,
              { color: theme.colors.textSecondary, ...theme.typography.labelMedium },
            ]}
          >
            {accountName}
          </Text>
          {!isActive && (
            <View
              style={[
                styles.inactiveBadge,
                { backgroundColor: theme.colors.backgroundTertiary },
              ]}
            >
              <Text
                style={[
                  styles.inactiveText,
                  { color: theme.colors.textTertiary, ...theme.typography.labelSmall },
                ]}
              >
                {t('accounts.closeAccount')}
              </Text>
            </View>
          )}
        </View>

        <Text
          style={[
            styles.balance,
            { color: balanceColor, ...theme.typography.displayMedium },
          ]}
        >
          {displayBalance}
        </Text>

        <View style={styles.details}>
          <Text
            style={[
              styles.type,
              { color: theme.colors.textSecondary, ...theme.typography.bodySmall },
            ]}
          >
            {t(accountTypeKey)}
          </Text>

          {interestRate !== undefined && (
            <Text
              style={[
                styles.rate,
                { color: theme.colors.textTertiary, ...theme.typography.bodySmall },
              ]}
            >
              {t('accounts.interestRate')}: {(interestRate * 100).toFixed(1)}%
            </Text>
          )}

          {utilization !== undefined && (
            <Text
              style={[
                styles.utilization,
                {
                  color:
                    utilization > 90
                      ? theme.colors.danger
                      : utilization > 50
                        ? theme.colors.warning
                        : theme.colors.textTertiary,
                  ...theme.typography.bodySmall,
                },
              ]}
            >
              {t('accounts.utilization')}: {utilization}%
            </Text>
          )}
        </View>
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
    marginBottom: 8,
  },
  accountName: {},
  inactiveBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  inactiveText: {},
  balance: {
    marginBottom: 8,
  },
  details: {
    gap: 4,
  },
  type: {},
  rate: {},
  utilization: {},
});
