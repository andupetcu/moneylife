import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { useTranslation } from 'react-i18next';

import {
  BalanceCard,
  TransactionList,
  MLLoading,
  MLButton,
  useTheme,
} from '@moneylife/ui-kit';
import { useGameStore } from '../../../../../src/stores/useGameStore';
import { useTransactionsQuery } from '../../../../../src/hooks/useGameQuery';

export default function AccountDetailScreen(): React.ReactElement {
  const { t } = useTranslation();
  const theme = useTheme();
  const { gameId, accountId } = useLocalSearchParams<{ gameId: string; accountId: string }>();
  const game = useGameStore((s) => s.currentGame);
  const account = game?.accounts.find((a) => a.id === accountId);

  const txQuery = useTransactionsQuery(gameId, { limit: 50 });

  if (txQuery.isLoading) return <MLLoading fullScreen testID="account-loading" />;

  if (!account || !game) {
    return (
      <View style={[styles.centered, { backgroundColor: theme.colors.background }]}>
        <Text style={[{ color: theme.colors.textTertiary, ...theme.typography.bodyMedium }]}>
          {t('error.notFound')}
        </Text>
      </View>
    );
  }

  if (txQuery.isError) {
    return (
      <View style={[styles.centered, { backgroundColor: theme.colors.background }]}>
        <Text style={[{ color: theme.colors.danger, ...theme.typography.bodyMedium }]}>{t('error.generic')}</Text>
        <MLButton titleKey="common.retry" onPress={() => txQuery.refetch()} variant="outline" />
      </View>
    );
  }

  // Filter transactions for this account
  const transactions = (txQuery.data ?? [])
    .filter((tx) => tx.entries.some((e) => e.accountId === accountId))
    .map((tx) => {
      const entry = tx.entries.find((e) => e.accountId === accountId)!;
      return {
        id: tx.id,
        date: tx.date,
        type: tx.type,
        category: tx.category,
        description: tx.description,
        amount: entry.amount,
        balanceAfter: entry.balanceAfter,
      };
    });

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      contentContainerStyle={styles.content}
      testID="account-detail-screen"
    >
      <BalanceCard
        accountType={account.type}
        accountName={account.name}
        balance={account.balance}
        currencyCode={game.currency}
        interestRate={account.interestRate}
        creditLimit={account.creditLimit}
        isActive={account.isActive}
      />

      <Text style={[styles.sectionTitle, { color: theme.colors.text, ...theme.typography.headlineSmall }]}>
        {t('accounts.transactions')}
      </Text>

      <TransactionList
        transactions={transactions}
        currencyCode={game.currency}
        testID="account-transactions"
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 16, gap: 16, paddingBottom: 32 },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 },
  sectionTitle: { marginTop: 8 },
});
