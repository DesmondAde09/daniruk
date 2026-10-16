import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import type { TransactionStatus } from '@/data/types';
import { colors, fontFamily, radius, spacing, typography } from '@/theme/tokens';

import { componentColors } from './palette';

export interface StatusBadgeProps {
  status: TransactionStatus;
}

const statusConfig: Record<TransactionStatus, { label: string; backgroundColor: string; color: string }> = {
  successful: { label: 'Successful', backgroundColor: colors.green[100], color: colors.green[700] },
  pending: { label: 'Pending', backgroundColor: colors.yellow[100], color: colors.status.pending },
  failed: { label: 'Failed', backgroundColor: componentColors.errorTint, color: colors.status.error },
};

export function StatusBadge({ status }: StatusBadgeProps) {
  const config = statusConfig[status];
  return (
    <View style={[styles.badge, { backgroundColor: config.backgroundColor }]}>
      <Text style={[styles.label, { color: config.color }]}>{config.label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    alignSelf: 'flex-start',
    borderRadius: radius.pill,
    paddingHorizontal: spacing[2],
    paddingVertical: 2,
  },
  label: {
    ...typography.caption,
    fontFamily: fontFamily.medium,
  },
});
