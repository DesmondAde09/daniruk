import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { colors, radius, spacing, typography } from '@/theme/tokens';

export interface LogoProps {
  /**
   * `light` = for light backgrounds (auth header, home header):
   * green.700 badge with lime "D", dark wordmark (designs 2/4/5.png).
   * `dark` = for the green onboarding background (design 1.png):
   * lime badge with green.900 "D", white wordmark.
   */
  variant?: 'light' | 'dark';
}

/** Rounded-square "D" badge + "daniruk" wordmark. */
export function Logo({ variant = 'light' }: LogoProps) {
  const onDark = variant === 'dark';
  return (
    <View style={styles.row} accessibilityLabel="daniruk">
      <View style={[styles.badge, onDark ? styles.badgeOnDark : styles.badgeOnLight]}>
        <Text style={[styles.badgeLetter, onDark ? styles.badgeLetterOnDark : styles.badgeLetterOnLight]}>
          D
        </Text>
      </View>
      <Text style={[styles.wordmark, onDark ? styles.wordmarkDark : styles.wordmarkLight]}>
        daniruk
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
  },
  badge: {
    width: 36,
    height: 36,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeOnLight: {
    backgroundColor: colors.green[700],
  },
  badgeOnDark: {
    backgroundColor: colors.lime[400],
  },
  badgeLetter: {
    ...typography.h2,
  },
  badgeLetterOnLight: {
    color: colors.lime[400],
  },
  badgeLetterOnDark: {
    color: colors.green[900],
  },
  wordmark: {
    ...typography.h2,
  },
  wordmarkLight: {
    color: colors.text.primary,
  },
  wordmarkDark: {
    color: colors.text.inverse,
  },
});
