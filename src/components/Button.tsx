import React from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text } from 'react-native';

import { colors, radius, spacing, typography } from '@/theme/tokens';

import { Icon } from './Icon';

export type ButtonVariant = 'primary' | 'accent' | 'ghost';

export interface ButtonProps {
  title: string;
  onPress?: () => void;
  variant?: ButtonVariant;
  /** Shows an arrow-right icon after the label (CTAs in the designs). */
  showArrow?: boolean;
  disabled?: boolean;
  /** Spinner replaces the label; the button keeps its size and ignores presses. */
  loading?: boolean;
  /** Defaults to true; pass false to size the button to its content. */
  fullWidth?: boolean;
}

const spinnerColor: Record<ButtonVariant, string> = {
  primary: colors.text.inverse,
  accent: colors.gold[900],
  ghost: colors.gold[700],
};

export function Button({
  title,
  onPress,
  variant = 'primary',
  showArrow = false,
  disabled = false,
  loading = false,
  fullWidth = true,
}: ButtonProps) {
  const inactive = disabled || loading;
  return (
    <Pressable
      onPress={inactive ? undefined : onPress}
      disabled={inactive}
      accessibilityRole="button"
      accessibilityState={{ disabled: inactive, busy: loading }}
      style={({ pressed }) => [
        styles.base,
        fullWidth && styles.fullWidth,
        variant === 'primary' && styles.primary,
        variant === 'accent' && styles.accent,
        variant === 'ghost' && styles.ghost,
        pressed && !inactive && styles.pressed,
        disabled && styles.disabled,
      ]}
    >
      {loading ? (
        <ActivityIndicator testID="button-loading" color={spinnerColor[variant]} />
      ) : (
        <>
          <Text
            style={[
              styles.label,
              variant === 'primary' && styles.labelPrimary,
              variant === 'accent' && styles.labelAccent,
              variant === 'ghost' && styles.labelGhost,
            ]}
          >
            {title}
          </Text>
          {showArrow && (
            <Icon
              name="arrow-right"
              size={20}
              color={variant === 'primary' ? colors.text.inverse : colors.gold[900]}
            />
          )}
        </>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    height: 56,
    borderRadius: radius.lg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing[2],
    paddingHorizontal: spacing[6],
  },
  fullWidth: {
    alignSelf: 'stretch',
  },
  primary: {
    backgroundColor: colors.gold[700],
  },
  accent: {
    backgroundColor: colors.accent[400],
  },
  ghost: {
    backgroundColor: 'transparent',
  },
  pressed: {
    opacity: 0.85,
  },
  disabled: {
    opacity: 0.5,
  },
  label: {
    ...typography.button,
  },
  labelPrimary: {
    color: colors.text.inverse,
  },
  labelAccent: {
    color: colors.gold[900],
  },
  labelGhost: {
    color: colors.gold[700],
  },
});
