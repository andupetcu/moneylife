import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';

import { MLButton, useTheme } from '@moneylife/ui-kit';

export default function SocialAuthScreen(): React.ReactElement {
  const { t } = useTranslation();
  const theme = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Text style={[styles.title, { color: theme.colors.text, ...theme.typography.headlineLarge }]}>
        {t('auth.orContinueWith')}
      </Text>
      <View style={styles.buttons}>
        <MLButton titleKey="auth.googleSignIn" onPress={() => {}} variant="outline" testID="social-google" />
        <MLButton titleKey="auth.appleSignIn" onPress={() => {}} variant="outline" testID="social-apple" />
        <MLButton titleKey="auth.facebookSignIn" onPress={() => {}} variant="outline" testID="social-facebook" />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 24 },
  title: { textAlign: 'center', marginBottom: 24 },
  buttons: { gap: 12 },
});
