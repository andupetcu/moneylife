import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';

import { useTheme } from '../theme/TenantTheme';

export interface MLCardProps {
  children: React.ReactNode;
  variant?: 'default' | 'elevated' | 'outlined';
  padding?: 'none' | 'small' | 'medium' | 'large';
  accessibilityLabel?: string;
  testID?: string;
}

export function MLCard({
  children,
  variant = 'default',
  padding = 'medium',
  accessibilityLabel,
  testID,
}: MLCardProps): React.ReactElement {
  const theme = useTheme();

  const containerStyles: ViewStyle[] = [
    styles.base,
    {
      backgroundColor: theme.colors.surface,
      borderRadius: theme.borderRadius.lg,
      padding:
        padding === 'none'
          ? 0
          : padding === 'small'
            ? theme.spacing.sm
            : padding === 'large'
              ? theme.spacing.xl
              : theme.spacing.lg,
    },
    ...(variant === 'elevated' ? [styles.elevated] : []),
    ...(variant === 'outlined' ? [{ borderWidth: 1, borderColor: theme.colors.border } as ViewStyle] : []),
  ];

  return (
    <View
      style={containerStyles}
      accessibilityLabel={accessibilityLabel}
      testID={testID}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  base: {
    overflow: 'hidden',
  },
  elevated: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
});
