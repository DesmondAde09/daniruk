import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { colors, fontFamily, hitTarget, typography } from '@/theme/tokens';

export interface AvatarProps {
  initials: string;
  size?: number;
}

/** Initials circle: avatar.bg background, green.900 text. */
export function Avatar({ initials, size = hitTarget }: AvatarProps) {
  return (
    <View
      accessibilityLabel={`Avatar for ${initials}`}
      style={[styles.circle, { width: size, height: size, borderRadius: size / 2 }]}
    >
      <Text style={[styles.initials, { fontSize: size * 0.36 }]}>{initials}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  circle: {
    backgroundColor: colors.avatar.bg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  initials: {
    ...typography.label,
    fontFamily: fontFamily.semiBold,
    color: colors.green[900],
  },
});
