import React from 'react';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';

import { useTheme } from '../theme/TenantTheme';

export interface MLLoadingProps {
  messageKey?: string;
  messageParams?: Record<string, string | number>;
  size?: 'small' | 'large';
  fullScreen?: boolean;
  testID?: string;
}

export function MLLoading({
  messageKey = 'common.loading',
  messageParams,
  size = 'large',
  fullScreen = false,
  testID,
}: MLLoadingProps): React.ReactElement {
  const { t } = useTranslation();
  const theme = useTheme();

  const content = (
    <View
      style={[styles.container, fullScreen && styles.fullScreen]}
      accessibilityLabel={t('accessibility.loading')}
      accessibilityRole="progressbar"
      testID={testID}
    >
      <ActivityIndicator
        size={size}
        color={theme.colors.primary}
      />
      {messageKey && (
        <Text
          style={[
            styles.text,
            {
              color: theme.colors.textSecondary,
              ...theme.typography.bodyMedium,
            },
          ]}
        >
          {t(messageKey, messageParams ?? {})}
        </Text>
      )}
    </View>
  );

  return content;
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  fullScreen: {
    flex: 1,
  },
  text: {
    marginTop: 12,
  },
});
