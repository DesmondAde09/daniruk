import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { colors, hitTarget, radius, spacing, typography } from '@/theme/tokens';

import { Icon, type IconName } from './Icon';
import { componentColors } from './palette';

export interface ListItemProps {
  icon: IconName;
  label: string;
  onPress?: () => void;
  /** Red icon + label for actions like Log out. */
  destructive?: boolean;
}

/** Profile menu row: icon tile, label, chevron. */
export function ListItem({ icon, label, onPress, destructive = false }: ListItemProps) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      style={({ pressed }) => [styles.row, pressed && styles.pressed]}
    >
      <View style={[styles.iconTile, destructive && styles.iconTileDestructive]}>
        <Icon
          name={icon}
          size={20}
          color={destructive ? colors.status.error : colors.gold[700]}
        />
      </View>
      <Text style={[styles.label, destructive && styles.labelDestructive]}>{label}</Text>
      <Icon name="chevron-right" size={18} color={colors.text.muted} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[3],
    minHeight: hitTarget,
    paddingVertical: spacing[2],
    alignSelf: 'stretch',
  },
  pressed: {
    opacity: 0.85,
  },
  iconTile: {
    width: 40,
    height: 40,
    borderRadius: radius.md,
    backgroundColor: colors.gold[50],
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconTileDestructive: {
    backgroundColor: componentColors.errorTint,
  },
  label: {
    flex: 1,
    ...typography.bodyMedium,
    color: colors.text.primary,
  },
  labelDestructive: {
    color: colors.status.error,
  },
});
