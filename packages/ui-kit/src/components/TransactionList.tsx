import React from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';

import { useTheme } from '../theme/TenantTheme';
import { formatCurrency, formatCurrencySigned } from '../utils/currency-formatter';
import { formatGameDateShort, GameDate } from '../utils/date-formatter';

export interface TransactionItem {
  id: string;
  date: GameDate;
  type: string;
  category: string;
  description: string;
  amount: number;
  balanceAfter: number;
}

export interface TransactionListProps {
  transactions: TransactionItem[];
  currencyCode: string;
  emptyMessageKey?: string;
  onTransactionPress?: (id: string) => void;
  testID?: string;
}

export function TransactionList({
  transactions,
  currencyCode,
  emptyMessageKey = 'accounts.noTransactions',
  onTransactionPress,
  testID,
}: TransactionListProps): React.ReactElement {
  const { t } = useTranslation();
  const theme = useTheme();

  if (transactions.length === 0) {
    return (
      <View style={styles.empty} testID={testID}>
        <Text
          style={[
            styles.emptyText,
            { color: theme.colors.textTertiary, ...theme.typography.bodyMedium },
          ]}
        >
          {t(emptyMessageKey)}
        </Text>
      </View>
    );
  }

  const renderItem = ({ item }: { item: TransactionItem }): React.ReactElement => {
    const isPositive = item.amount > 0;

    return (
      <View
        style={[styles.row, { borderBottomColor: theme.colors.borderLight }]}
        accessibilityLabel={t('accessibility.transactionItem', {
          description: item.description,
          amount: formatCurrencySigned(item.amount, currencyCode),
          date: formatGameDateShort(item.date),
        })}
      >
        <View style={styles.rowLeft}>
          <Text
            style={[
              styles.description,
              { color: theme.colors.text, ...theme.typography.bodyMedium },
            ]}
            numberOfLines={1}
          >
            {item.description}
          </Text>
          <Text
            style={[
              styles.category,
              { color: theme.colors.textTertiary, ...theme.typography.bodySmall },
            ]}
          >
            {formatGameDateShort(item.date)} · {item.category}
          </Text>
        </View>
        <View style={styles.rowRight}>
          <Text
            style={[
              styles.amount,
              {
                color: isPositive ? theme.colors.success : theme.colors.text,
                ...theme.typography.labelLarge,
              },
            ]}
          >
            {formatCurrencySigned(item.amount, currencyCode)}
          </Text>
          <Text
            style={[
              styles.balanceAfter,
              { color: theme.colors.textTertiary, ...theme.typography.caption },
            ]}
          >
            {formatCurrency(item.balanceAfter, currencyCode)}
          </Text>
        </View>
      </View>
    );
  };

  return (
    <FlatList
      data={transactions}
      keyExtractor={(item) => item.id}
      renderItem={renderItem}
      testID={testID}
    />
  );
}

const styles = StyleSheet.create({
  empty: {
    padding: 24,
    alignItems: 'center',
  },
  emptyText: {
    textAlign: 'center',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  rowLeft: {
    flex: 1,
    marginRight: 12,
  },
  description: {},
  category: {
    marginTop: 2,
  },
  rowRight: {
    alignItems: 'flex-end',
  },
  amount: {},
  balanceAfter: {
    marginTop: 2,
  },
});
