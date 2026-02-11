import React from 'react';
import { View, Text, Modal, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';

import { useTheme } from '../theme/TenantTheme';
import { MLButton } from './MLButton';

export interface MLDialogProps {
  visible: boolean;
  titleKey: string;
  titleParams?: Record<string, string | number>;
  messageKey: string;
  messageParams?: Record<string, string | number>;
  confirmKey?: string;
  cancelKey?: string;
  onConfirm: () => void;
  onCancel?: () => void;
  variant?: 'info' | 'warning' | 'danger';
  testID?: string;
}

export function MLDialog({
  visible,
  titleKey,
  titleParams,
  messageKey,
  messageParams,
  confirmKey = 'common.confirm',
  cancelKey = 'common.cancel',
  onConfirm,
  onCancel,
  variant = 'info',
  testID,
}: MLDialogProps): React.ReactElement {
  const { t } = useTranslation();
  const theme = useTheme();

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      testID={testID}
    >
      <View style={styles.overlay}>
        <View
          style={[
            styles.dialog,
            {
              backgroundColor: theme.colors.surface,
              borderRadius: theme.borderRadius.xl,
            },
          ]}
        >
          <Text
            style={[
              styles.title,
              {
                color: theme.colors.text,
                ...theme.typography.headlineMedium,
              },
            ]}
          >
            {t(titleKey, titleParams ?? {})}
          </Text>
          <Text
            style={[
              styles.message,
              {
                color: theme.colors.textSecondary,
                ...theme.typography.bodyMedium,
              },
            ]}
          >
            {t(messageKey, messageParams ?? {})}
          </Text>
          <View style={styles.actions}>
            {onCancel && (
              <View style={styles.actionButton}>
                <MLButton
                  titleKey={cancelKey}
                  onPress={onCancel}
                  variant="ghost"
                  testID={testID ? `${testID}-cancel` : undefined}
                />
              </View>
            )}
            <View style={styles.actionButton}>
              <MLButton
                titleKey={confirmKey}
                onPress={onConfirm}
                variant={variant === 'danger' ? 'danger' : 'primary'}
                testID={testID ? `${testID}-confirm` : undefined}
              />
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  dialog: {
    width: '100%',
    maxWidth: 400,
    padding: 24,
  },
  title: {
    marginBottom: 8,
  },
  message: {
    marginBottom: 24,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 8,
  },
  actionButton: {
    minWidth: 80,
  },
});
