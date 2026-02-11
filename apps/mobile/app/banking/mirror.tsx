import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';

import { MLCard, MLLoading, useTheme } from '@moneylife/ui-kit';

export default function MirrorModeScreen(): React.ReactElement {
  const { t } = useTranslation();
  const theme = useTheme();

  // Empty state — no linked accounts
  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      contentContainerStyle={styles.content}
      testID="mirror-mode-screen"
    >
      <Text style={[{ color: theme.colors.text, ...theme.typography.headlineLarge }]}>
        {t('banking.mirrorMode')}
      </Text>
      <Text style={[{ color: theme.colors.textSecondary, ...theme.typography.bodyMedium }]}>
        {t('banking.mirrorModeDesc')}
      </Text>

      <MLCard variant="outlined" padding="large">
        <Text style={[{ color: theme.colors.textTertiary, ...theme.typography.bodyMedium, textAlign: 'center' }]}>
          {t('banking.noLinkedAccounts')}
        </Text>
      </MLCard>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 16, gap: 16, paddingBottom: 32 },
});
