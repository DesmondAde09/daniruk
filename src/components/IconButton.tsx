import React from 'react';
import { Pressable, StyleSheet } from 'react-native';

import { colors, hitTarget } from '@/theme/tokens';

import { Icon, type IconName } from './Icon';
import { componentColors } from './palette';

export interface IconButtonProps {
  icon: IconName;
  onPress?: () => void;
  accessibilityLabel: string;
  /** `outline` = white circle with hairline border (auth back button); `plain` = transparent. */
  variant?: 'outline' | 'plain';
  color?: string;
  iconSize?: number;
  /** Bell only: shows the red unread dot. */
  unreadDot?: boolean;
}

/** Circular 44pt icon-only button. */
export function IconButton({
  icon,
  onPress,
  accessibilityLabel,
  variant = 'plain',
  color = colors.text.primary,
  iconSize = 22,
  unreadDot = false,
}: IconButtonProps) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      hitSlop={8}
      style={({ pressed }) => [
        styles.base,
        variant === 'outline' && styles.outline,
        pressed && styles.pressed,
      ]}
    >
      <Icon name={icon} size={iconSize} color={color} unreadDot={unreadDot} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    width: hitTarget,
    height: hitTarget,
    borderRadius: hitTarget / 2,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
  },
  outline: {
    backgroundColor: colors.surface.card,
    borderWidth: 1,
    borderColor: componentColors.border,
  },
  pressed: {
    opacity: 0.85,
  },
});
