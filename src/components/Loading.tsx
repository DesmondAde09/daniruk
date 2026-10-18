import React from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

import { colors, radius, spacing, typography } from '@/theme/tokens';

import { componentColors } from './palette';

export interface LoadingProps {
  label?: string;
}

/** Centered gold spinner with an optional caption. */
export function Loading({ label }: LoadingProps) {
  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color={colors.gold[700]} />
      {label ? <Text style={styles.label}>{label}</Text> : null}
    </View>
  );
}

/** Placeholder matching TransactionRow's layout for loading lists. */
export function RowSkeleton() {
  return (
    <View style={styles.row} testID="row-skeleton">
      <View style={styles.iconBlock} />
      <View style={styles.lines}>
        <View style={[styles.line, styles.lineWide]} />
        <View style={[styles.line, styles.lineNarrow]} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing[3],
    padding: spacing[8],
  },
  label: {
    ...typography.body,
    color: colors.text.body,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[3],
    backgroundColor: colors.surface.card,
    borderRadius: radius.lg,
    padding: spacing[4],
    alignSelf: 'stretch',
  },
  iconBlock: {
    width: 44,
    height: 44,
    borderRadius: radius.md,
    backgroundColor: componentColors.skeleton,
  },
  lines: {
    flex: 1,
    gap: spacing[2],
  },
  line: {
    height: 12,
    borderRadius: radius.sm,
    backgroundColor: componentColors.skeleton,
  },
  lineWide: {
    width: '60%',
  },
  lineNarrow: {
    width: '40%',
  },
});
