import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { colors, spacing, typography } from '@/theme/tokens';

export interface SectionHeaderProps {
  /** Small uppercase label above the title ("EVERYDAY", "ACTIVITY"). */
  eyebrow?: string;
  title: string;
  /** Right-side link ("View all" / "See all"). Renders only with onLinkPress. */
  linkLabel?: string;
  onLinkPress?: () => void;
}

export function SectionHeader({ eyebrow, title, linkLabel, onLinkPress }: SectionHeaderProps) {
  return (
    <View style={styles.container}>
      <View style={styles.titleBlock}>
        {eyebrow ? <Text style={styles.eyebrow}>{eyebrow}</Text> : null}
        <Text style={styles.title}>{title}</Text>
      </View>
      {linkLabel && onLinkPress ? (
        <Pressable
          onPress={onLinkPress}
          accessibilityRole="link"
          hitSlop={8}
          style={({ pressed }) => pressed && styles.pressed}
        >
          <Text style={styles.link}>{linkLabel}</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    alignSelf: 'stretch',
  },
  titleBlock: {
    gap: spacing[1],
  },
  eyebrow: {
    ...typography.eyebrow,
    color: colors.gold[700],
  },
  title: {
    ...typography.h2,
    color: colors.text.primary,
  },
  link: {
    ...typography.label,
    color: colors.gold[700],
  },
  pressed: {
    opacity: 0.85,
  },
});
