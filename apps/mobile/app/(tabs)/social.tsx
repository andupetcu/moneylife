import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';

import { MLButton, MLCard, MLLoading, useTheme } from '@moneylife/ui-kit';
import { useLeaderboardQuery } from '../../src/hooks/useRewardsQuery';

export default function SocialScreen(): React.ReactElement {
  const { t } = useTranslation();
  const theme = useTheme();

  const globalQuery = useLeaderboardQuery('global');

  if (globalQuery.isLoading) {
    return <MLLoading fullScreen testID="social-loading" />;
  }

  if (globalQuery.isError) {
    return (
      <View style={[styles.centered, { backgroundColor: theme.colors.background }]}>
        <Text style={[{ color: theme.colors.danger, ...theme.typography.bodyMedium }]}>{t('error.generic')}</Text>
        <MLButton titleKey="common.retry" onPress={() => globalQuery.refetch()} variant="outline" />
      </View>
    );
  }

  const leaderboard = globalQuery.data ?? [];

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      contentContainerStyle={styles.content}
      testID="social-screen"
    >
      <Text style={[styles.sectionTitle, { color: theme.colors.text, ...theme.typography.headlineMedium }]}>
        {t('social.leaderboard')}
      </Text>

      {leaderboard.length === 0 ? (
        <Text style={[{ color: theme.colors.textTertiary, ...theme.typography.bodyMedium }]}>
          {t('common.noResults')}
        </Text>
      ) : (
        leaderboard.map((entry) => (
          <MLCard key={entry.userId} variant="outlined" padding="small">
            <View style={styles.leaderboardRow}>
              <Text style={[{ color: theme.colors.text, ...theme.typography.labelLarge }]}>
                #{entry.rank}
              </Text>
              <Text style={[{ color: theme.colors.text, ...theme.typography.bodyMedium, flex: 1 }]}>
                {entry.displayName}
              </Text>
              <Text style={[{ color: theme.colors.primary, ...theme.typography.labelLarge }]}>
                {entry.score.toLocaleString()} XP
              </Text>
            </View>
          </MLCard>
        ))
      )}

      <Text style={[styles.sectionTitle, { color: theme.colors.text, ...theme.typography.headlineMedium }]}>
        {t('social.friends')}
      </Text>
      <MLButton titleKey="social.addFriend" onPress={() => {}} variant="outline" />

      <Text style={[styles.sectionTitle, { color: theme.colors.text, ...theme.typography.headlineMedium }]}>
        {t('social.challenges')}
      </Text>
      <Text style={[{ color: theme.colors.textTertiary, ...theme.typography.bodyMedium }]}>
        {t('social.noChallenges')}
      </Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 16, gap: 12, paddingBottom: 32 },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24, gap: 16 },
  sectionTitle: { marginTop: 8 },
  leaderboardRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
});
