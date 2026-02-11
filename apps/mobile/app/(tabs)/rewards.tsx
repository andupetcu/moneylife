import React from 'react';
import { View, Text, ScrollView, FlatList, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';

import { MLButton, MLCard, MLLoading, useTheme } from '@moneylife/ui-kit';
import { useRewardsStore } from '../../src/stores/useRewardsStore';
import { useGameStore } from '../../src/stores/useGameStore';
import { useBadgesQuery, useRewardCatalogQuery } from '../../src/hooks/useRewardsQuery';

export default function RewardsScreen(): React.ReactElement {
  const { t } = useTranslation();
  const theme = useTheme();
  const { totalXp, totalCoins, currentLevel, streakDays, badges } = useRewardsStore();
  const gameId = useGameStore((s) => s.currentGame?.id);

  const badgesQuery = useBadgesQuery(gameId);
  const catalogQuery = useRewardCatalogQuery();

  if (badgesQuery.isLoading || catalogQuery.isLoading) {
    return <MLLoading fullScreen testID="rewards-loading" />;
  }

  if (badgesQuery.isError) {
    return (
      <View style={[styles.centered, { backgroundColor: theme.colors.background }]}>
        <Text style={[{ color: theme.colors.danger, ...theme.typography.bodyMedium }]}>
          {t('error.generic')}
        </Text>
        <MLButton titleKey="common.retry" onPress={() => badgesQuery.refetch()} variant="outline" />
      </View>
    );
  }

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      contentContainerStyle={styles.content}
      testID="rewards-screen"
    >
      {/* Stats */}
      <View style={styles.statsGrid}>
        <MLCard variant="elevated" padding="medium">
          <Text style={[{ color: theme.colors.textSecondary, ...theme.typography.labelSmall }]}>
            {t('rewards.xp')}
          </Text>
          <Text style={[{ color: theme.colors.primary, ...theme.typography.displaySmall }]}>
            {totalXp.toLocaleString()}
          </Text>
        </MLCard>
        <MLCard variant="elevated" padding="medium">
          <Text style={[{ color: theme.colors.textSecondary, ...theme.typography.labelSmall }]}>
            {t('rewards.coins')}
          </Text>
          <Text style={[{ color: theme.colors.accent, ...theme.typography.displaySmall }]}>
            {t('rewards.coinsCount', { count: totalCoins })}
          </Text>
        </MLCard>
        <MLCard variant="elevated" padding="medium">
          <Text style={[{ color: theme.colors.textSecondary, ...theme.typography.labelSmall }]}>
            {t('rewards.level', { level: currentLevel })}
          </Text>
        </MLCard>
        <MLCard variant="elevated" padding="medium">
          <Text style={[{ color: theme.colors.textSecondary, ...theme.typography.labelSmall }]}>
            {t('rewards.streak')}
          </Text>
          <Text style={[{ color: theme.colors.success, ...theme.typography.displaySmall }]}>
            {t('rewards.streakDays', { count: streakDays })}
          </Text>
        </MLCard>
      </View>

      {/* Badges */}
      <Text style={[styles.sectionTitle, { color: theme.colors.text, ...theme.typography.headlineMedium }]}>
        {t('rewards.badgeCollection')}
      </Text>
      {badges.length === 0 ? (
        <Text style={[{ color: theme.colors.textTertiary, ...theme.typography.bodyMedium }]}>
          {t('rewards.noBadges')}
        </Text>
      ) : (
        <View style={styles.badgeGrid}>
          {badges.map((badge) => (
            <MLCard key={badge.id} variant="outlined" padding="small">
              <Text style={[{ color: theme.colors.text, ...theme.typography.labelLarge }]}>
                {badge.name}
              </Text>
              <Text style={[{
                color: badge.rarity === 'legendary' ? theme.colors.rarityLegendary
                  : badge.rarity === 'epic' ? theme.colors.rarityEpic
                  : badge.rarity === 'rare' ? theme.colors.rarityRare
                  : theme.colors.rarityCommon,
                ...theme.typography.labelSmall,
              }]}>
                {t(`rewards.rarity${badge.rarity.charAt(0).toUpperCase() + badge.rarity.slice(1)}`)}
              </Text>
              <Text style={[{ color: theme.colors.textSecondary, ...theme.typography.bodySmall }]}>
                {badge.description}
              </Text>
            </MLCard>
          ))}
        </View>
      )}

      {/* Catalog */}
      <Text style={[styles.sectionTitle, { color: theme.colors.text, ...theme.typography.headlineMedium }]}>
        {t('rewards.catalog')}
      </Text>
      {catalogQuery.data?.length === 0 ? (
        <Text style={[{ color: theme.colors.textTertiary, ...theme.typography.bodyMedium }]}>
          {t('rewards.noRewards')}
        </Text>
      ) : (
        catalogQuery.data?.map((item) => (
          <MLCard key={item.id} variant="outlined" padding="medium">
            <Text style={[{ color: theme.colors.text, ...theme.typography.labelLarge }]}>
              {item.name}
            </Text>
            <Text style={[{ color: theme.colors.textSecondary, ...theme.typography.bodySmall }]}>
              {item.description}
            </Text>
            <MLButton
              titleKey="rewards.redeem"
              titleParams={{ cost: item.coinCost }}
              onPress={() => {}}
              variant="secondary"
              size="small"
              disabled={totalCoins < item.coinCost}
            />
          </MLCard>
        ))
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 16, gap: 16, paddingBottom: 32 },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24, gap: 16 },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  sectionTitle: { marginTop: 8 },
  badgeGrid: { gap: 8 },
});
