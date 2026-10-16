import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { colors, hitTarget, radius, spacing, typography } from '@/theme/tokens';

export interface SegmentedToggleOption<T extends string> {
  value: T;
  label: string;
}

export interface SegmentedToggleProps<T extends string> {
  options: SegmentedToggleOption<T>[];
  value: T;
  onChange: (value: T) => void;
}

/**
 * Two-option pill toggle (Log in / Sign up on the auth screens).
 * Active option: white card + green.700 border; inactive: transparent.
 */
export function SegmentedToggle<T extends string>({
  options,
  value,
  onChange,
}: SegmentedToggleProps<T>) {
  return (
    <View style={styles.container}>
      {options.map((option) => {
        const active = option.value === value;
        return (
          <Pressable
            key={option.value}
            testID={`segment-${option.value}`}
            onPress={() => onChange(option.value)}
            accessibilityRole="button"
            accessibilityState={{ selected: active }}
            style={({ pressed }) => [
              styles.option,
              active && styles.optionActive,
              pressed && styles.pressed,
            ]}
          >
            <Text style={[styles.optionLabel, active ? styles.labelActive : styles.labelInactive]}>
              {option.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignSelf: 'stretch',
    backgroundColor: colors.surface.base,
    borderRadius: radius.pill,
    padding: spacing[1],
    gap: spacing[1],
  },
  option: {
    flex: 1,
    minHeight: hitTarget,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
  },
  optionActive: {
    backgroundColor: colors.surface.card,
    borderWidth: 1.5,
    borderColor: colors.green[700],
  },
  pressed: {
    opacity: 0.85,
  },
  optionLabel: {
    ...typography.label,
  },
  labelActive: {
    color: colors.text.primary,
  },
  labelInactive: {
    color: colors.text.body,
  },
});
