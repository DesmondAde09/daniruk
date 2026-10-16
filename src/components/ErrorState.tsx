import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { colors, spacing, typography } from '@/theme/tokens';

import { Button } from './Button';
import { Icon } from './Icon';
import { componentColors } from './palette';

export interface ErrorStateProps {
  title?: string;
  caption?: string;
  onRetry?: () => void;
  retryLabel?: string;
}

/** Error counterpart of EmptyState: error-tinted icon + retry button. */
export function ErrorState({
  title = 'Something went wrong',
  caption = 'We could not load this. Please try again.',
  onRetry,
  retryLabel = 'Try again',
}: ErrorStateProps) {
  return (
    <View style={styles.container}>
      <View style={styles.iconCircle}>
        <Icon name="close" size={32} color={colors.status.error} />
      </View>
      <Text style={styles.title}>{title}</Text>
      {caption ? <Text style={styles.caption}>{caption}</Text> : null}
      {onRetry ? <Button title={retryLabel} onPress={onRetry} fullWidth={false} /> : null}
    </View>
  );
}

const ICON_CIRCLE = 72;

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    alignSelf: 'stretch',
    paddingHorizontal: spacing[8],
    paddingVertical: spacing[10],
    gap: spacing[3],
  },
  iconCircle: {
    width: ICON_CIRCLE,
    height: ICON_CIRCLE,
    borderRadius: ICON_CIRCLE / 2,
    backgroundColor: componentColors.errorTint,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing[1],
  },
  title: {
    ...typography.h2,
    color: colors.text.primary,
    textAlign: 'center',
  },
  caption: {
    ...typography.body,
    color: colors.text.body,
    textAlign: 'center',
  },
});
