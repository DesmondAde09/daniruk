import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { colors, radius, spacing, typography } from '@/theme/tokens';

import { Icon, type IconName } from './Icon';
import { componentColors } from './palette';

export interface PillProps {
  label: string;
  icon?: IconName;
}

/** Outlined "Secured" pill — designed to sit on the dark onboarding background. */
export function Pill({ label, icon = 'shield-check' }: PillProps) {
  return (
    <View style={styles.pill}>
      <Icon name={icon} size={14} color={colors.text.inverse} />
      <Text style={styles.label}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[1],
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: componentColors.borderOnDark,
    paddingHorizontal: spacing[3],
    paddingVertical: spacing[1],
  },
  label: {
    ...typography.caption,
    color: colors.text.inverse,
  },
});
