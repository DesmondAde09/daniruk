import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { colors, fontFamily, radius, spacing, typography } from '@/theme/tokens';

import { Icon, type IconName } from './Icon';
import { componentColors } from './palette';

export type ServiceTileVariant = 'flights' | 'electricity' | 'airtime' | 'data';

export interface ServiceTileProps {
  variant: ServiceTileVariant;
  label: string;
  onPress?: () => void;
}

/** Pastel icon-tile config per service; shared with the services index list rows. */
export const serviceTileVariantConfig: Record<
  ServiceTileVariant,
  { icon: IconName; backgroundColor: string; color: string }
> = {
  flights: { icon: 'plane', backgroundColor: colors.purple[100], color: colors.purple[600] },
  electricity: { icon: 'bolt', backgroundColor: colors.yellow[100], color: colors.status.pending },
  airtime: { icon: 'phone', backgroundColor: colors.gold[50], color: colors.gold[700] },
  data: { icon: 'wifi', backgroundColor: colors.blue[100], color: componentColors.blue600 },
};

/** White quick-service card with a pastel icon square and label (design 4.png). */
export function ServiceTile({ variant, label, onPress }: ServiceTileProps) {
  const config = serviceTileVariantConfig[variant];
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      testID={`service-tile-${variant}`}
      style={({ pressed }) => [styles.card, pressed && styles.pressed]}
    >
      <View style={[styles.iconTile, { backgroundColor: config.backgroundColor }]}>
        <Icon name={config.icon} size={22} color={config.color} />
      </View>
      <Text style={styles.label}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    backgroundColor: colors.surface.card,
    borderRadius: radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing[4],
    paddingHorizontal: spacing[2],
    gap: spacing[2],
  },
  iconTile: {
    width: 48,
    height: 48,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    ...typography.caption,
    fontFamily: fontFamily.medium,
    color: colors.text.primary,
  },
  pressed: {
    opacity: 0.85,
  },
});
