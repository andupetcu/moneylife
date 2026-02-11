import React, { useState } from 'react';
import { View, Text, ScrollView, Switch, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';

import { MLButton, MLCard, MLDialog, useTheme } from '@moneylife/ui-kit';
import { useAuthStore } from '../../src/stores/useAuthStore';
import { useSettingsStore } from '../../src/stores/useSettingsStore';
import { logout } from '../../src/services/api-client';

export default function ProfileScreen(): React.ReactElement {
  const { t } = useTranslation();
  const theme = useTheme();
  const { user, logout: clearAuth } = useAuthStore();
  const settings = useSettingsStore();
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);

  const handleLogout = async (): Promise<void> => {
    await logout();
    clearAuth();
    setShowLogoutDialog(false);
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      contentContainerStyle={styles.content}
      testID="profile-screen"
    >
      {/* User info */}
      <MLCard variant="elevated" padding="large">
        <Text style={[{ color: theme.colors.text, ...theme.typography.headlineMedium }]}>
          {user?.displayName ?? t('profile.title')}
        </Text>
        <Text style={[{ color: theme.colors.textSecondary, ...theme.typography.bodyMedium }]}>
          {user?.email ?? ''}
        </Text>
      </MLCard>

      {/* Settings */}
      <Text style={[styles.sectionTitle, { color: theme.colors.text, ...theme.typography.headlineSmall }]}>
        {t('profile.settings')}
      </Text>

      <MLCard variant="outlined" padding="medium">
        <View style={styles.settingRow}>
          <Text style={[{ color: theme.colors.text, ...theme.typography.bodyMedium }]}>
            {t('profile.pushNotifications')}
          </Text>
          <Switch
            value={settings.pushNotifications}
            onValueChange={settings.setPushNotifications}
            trackColor={{ true: theme.colors.primary }}
          />
        </View>
        <View style={styles.settingRow}>
          <Text style={[{ color: theme.colors.text, ...theme.typography.bodyMedium }]}>
            {t('profile.emailNotifications')}
          </Text>
          <Switch
            value={settings.emailNotifications}
            onValueChange={settings.setEmailNotifications}
            trackColor={{ true: theme.colors.primary }}
          />
        </View>
        <View style={styles.settingRow}>
          <Text style={[{ color: theme.colors.text, ...theme.typography.bodyMedium }]}>
            {t('profile.sound')}
          </Text>
          <Switch
            value={settings.soundEnabled}
            onValueChange={settings.setSoundEnabled}
            trackColor={{ true: theme.colors.primary }}
          />
        </View>
        <View style={styles.settingRow}>
          <Text style={[{ color: theme.colors.text, ...theme.typography.bodyMedium }]}>
            {t('profile.haptics')}
          </Text>
          <Switch
            value={settings.hapticsEnabled}
            onValueChange={settings.setHapticsEnabled}
            trackColor={{ true: theme.colors.primary }}
          />
        </View>
      </MLCard>

      {/* Actions */}
      <View style={styles.actions}>
        <MLButton titleKey="profile.exportData" onPress={() => {}} variant="outline" />
        <MLButton titleKey="auth.logOut" onPress={() => setShowLogoutDialog(true)} variant="danger" />
      </View>

      <MLDialog
        visible={showLogoutDialog}
        titleKey="auth.logOut"
        messageKey="auth.logOutConfirm"
        onConfirm={handleLogout}
        onCancel={() => setShowLogoutDialog(false)}
        variant="warning"
        testID="logout-dialog"
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 16, gap: 16, paddingBottom: 32 },
  sectionTitle: { marginTop: 8 },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  actions: { gap: 12, marginTop: 16 },
});
