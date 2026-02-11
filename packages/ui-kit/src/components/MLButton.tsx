import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { useTranslation } from 'react-i18next';

import { useTheme } from '../theme/TenantTheme';

export interface MLButtonProps {
  titleKey: string;
  titleParams?: Record<string, string | number>;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'small' | 'medium' | 'large';
  disabled?: boolean;
  loading?: boolean;
  accessibilityLabel?: string;
  testID?: string;
}

export function MLButton({
  titleKey,
  titleParams,
  onPress,
  variant = 'primary',
  size = 'medium',
  disabled = false,
  loading = false,
  accessibilityLabel,
  testID,
}: MLButtonProps): React.ReactElement {
  const { t } = useTranslation();
  const theme = useTheme();

  const containerStyles: ViewStyle[] = [
    styles.base,
    {
      backgroundColor:
        variant === 'primary'
          ? theme.colors.primary
          : variant === 'secondary'
            ? theme.colors.secondary
            : variant === 'danger'
              ? theme.colors.danger
              : theme.colors.transparent,
      borderWidth: variant === 'outline' ? 1 : 0,
      borderColor: variant === 'outline' ? theme.colors.primary : undefined,
      paddingVertical:
        size === 'small'
          ? theme.spacing.sm
          : size === 'large'
            ? theme.spacing.lg
            : theme.spacing.md,
      paddingHorizontal:
        size === 'small'
          ? theme.spacing.md
          : size === 'large'
            ? theme.spacing.xxl
            : theme.spacing.lg,
      borderRadius: theme.borderRadius.md,
      opacity: disabled || loading ? 0.5 : 1,
    },
  ];

  const textStyles: TextStyle[] = [
    styles.text,
    {
      color:
        variant === 'outline' || variant === 'ghost'
          ? theme.colors.primary
          : theme.colors.textInverse,
      fontSize:
        size === 'small' ? 14 : size === 'large' ? 18 : 16,
      fontWeight: '600',
    },
  ];

  return (
    <TouchableOpacity
      style={containerStyles}
      onPress={onPress}
      disabled={disabled || loading}
      accessibilityLabel={accessibilityLabel ?? t(titleKey, titleParams ?? {})}
      accessibilityRole="button"
      accessibilityState={{ disabled: disabled || loading }}
      testID={testID}
    >
      {loading ? (
        <ActivityIndicator
          color={
            variant === 'outline' || variant === 'ghost'
              ? theme.colors.primary
              : theme.colors.textInverse
          }
          size="small"
        />
      ) : (
        <Text style={textStyles}>{t(titleKey, titleParams ?? {})}</Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  base: {
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  text: {
    textAlign: 'center',
  },
});
