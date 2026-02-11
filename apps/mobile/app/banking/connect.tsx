import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';

import { MLButton, MLCard, useTheme } from '@moneylife/ui-kit';

export default function BankingConnectScreen(): React.ReactElement {
  const { t } = useTranslation();
  const theme = useTheme();

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      contentContainerStyle={styles.content}
      testID="banking-connect-screen"
    >
      <Text style={[{ color: theme.colors.text, ...theme.typography.headlineLarge }]}>
        {t('banking.connect')}
      </Text>
      <Text style={[{ color: theme.colors.textSecondary, ...theme.typography.bodyMedium }]}>
        {t('banking.connectDesc')}
      </Text>

      <MLCard variant="elevated" padding="large">
        <Text style={[{ color: theme.colors.text, ...theme.typography.bodyMedium, textAlign: 'center' }]}>
          {t('banking.noLinkedAccounts')}
        </Text>
        <MLButton titleKey="banking.connect" onPress={() => {}} testID="connect-bank" />
      </MLCard>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 16, gap: 16, paddingBottom: 32 },
});
