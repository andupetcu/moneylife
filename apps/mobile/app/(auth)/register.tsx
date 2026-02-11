import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';

import { MLButton, MLCard, MLLoading, useTheme } from '@moneylife/ui-kit';
import { useAuthStore } from '../../src/stores/useAuthStore';
import { register } from '../../src/services/api-client';

export default function RegisterScreen(): React.ReactElement {
  const { t } = useTranslation();
  const theme = useTheme();
  const router = useRouter();
  const { setAuthenticated } = useAuthStore();

  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleRegister = async (): Promise<void> => {
    if (!email) { setError(t('auth.emailRequired')); return; }
    if (!password) { setError(t('auth.passwordRequired')); return; }
    if (password.length < 8) { setError(t('auth.passwordTooShort')); return; }
    if (password !== confirmPassword) { setError(t('auth.passwordsDoNotMatch')); return; }
    setError(null);
    setIsLoading(true);
    try {
      const result = await register(email, password, displayName);
      setAuthenticated(result.user as never, result.tokens);
      router.replace('/(tabs)');
    } catch {
      setError(t('auth.emailInUse'));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        <Text style={[styles.title, { color: theme.colors.text, ...theme.typography.displayMedium }]}>
          {t('auth.register')}
        </Text>

        <MLCard variant="outlined" padding="large">
          <View style={styles.form}>
            <Text style={[styles.label, { color: theme.colors.textSecondary, ...theme.typography.labelMedium }]}>
              {t('auth.displayName')}
            </Text>
            <TextInput
              style={[styles.input, { color: theme.colors.text, borderColor: theme.colors.border }]}
              value={displayName}
              onChangeText={setDisplayName}
              placeholder={t('auth.displayName')}
              placeholderTextColor={theme.colors.textTertiary}
              accessibilityLabel={t('auth.displayName')}
              testID="register-name"
            />

            <Text style={[styles.label, { color: theme.colors.textSecondary, ...theme.typography.labelMedium }]}>
              {t('auth.email')}
            </Text>
            <TextInput
              style={[styles.input, { color: theme.colors.text, borderColor: theme.colors.border }]}
              value={email}
              onChangeText={setEmail}
              placeholder={t('auth.email')}
              placeholderTextColor={theme.colors.textTertiary}
              keyboardType="email-address"
              autoCapitalize="none"
              autoComplete="email"
              accessibilityLabel={t('auth.email')}
              testID="register-email"
            />

            <Text style={[styles.label, { color: theme.colors.textSecondary, ...theme.typography.labelMedium }]}>
              {t('auth.password')}
            </Text>
            <TextInput
              style={[styles.input, { color: theme.colors.text, borderColor: theme.colors.border }]}
              value={password}
              onChangeText={setPassword}
              placeholder={t('auth.password')}
              placeholderTextColor={theme.colors.textTertiary}
              secureTextEntry
              accessibilityLabel={t('auth.password')}
              testID="register-password"
            />

            <Text style={[styles.label, { color: theme.colors.textSecondary, ...theme.typography.labelMedium }]}>
              {t('auth.confirmPassword')}
            </Text>
            <TextInput
              style={[styles.input, { color: theme.colors.text, borderColor: theme.colors.border }]}
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              placeholder={t('auth.confirmPassword')}
              placeholderTextColor={theme.colors.textTertiary}
              secureTextEntry
              accessibilityLabel={t('auth.confirmPassword')}
              testID="register-confirm"
            />

            {error && (
              <Text style={[styles.error, { color: theme.colors.danger, ...theme.typography.bodySmall }]}>
                {error}
              </Text>
            )}

            {isLoading ? (
              <MLLoading size="small" />
            ) : (
              <MLButton titleKey="auth.register" onPress={handleRegister} testID="register-submit" />
            )}
          </View>
        </MLCard>

        <View style={styles.footer}>
          <Text style={[{ color: theme.colors.textSecondary, ...theme.typography.bodyMedium }]}>
            {t('auth.hasAccount')}
          </Text>
          <MLButton
            titleKey="auth.signIn"
            onPress={() => router.push('/(auth)/login')}
            variant="outline"
            size="small"
          />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { flexGrow: 1, justifyContent: 'center', padding: 24 },
  title: { textAlign: 'center', marginBottom: 32 },
  form: { gap: 12 },
  label: { marginBottom: 4 },
  input: { borderWidth: 1, borderRadius: 8, padding: 12, fontSize: 16 },
  error: { marginTop: 4 },
  footer: { marginTop: 24, alignItems: 'center', gap: 8 },
});
