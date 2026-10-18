import React, { useRef } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { colors, radius, spacing, typography } from '@/theme/tokens';

import { componentColors } from './palette';

export interface OTPInputProps {
  value: string;
  onChange: (code: string) => void;
  /** Called once the code reaches `length` digits. */
  onComplete?: (code: string) => void;
  length?: number;
}

/**
 * Six-cell one-time-code input. A single hidden TextInput captures the digits
 * (so auto-advance and backspace behave natively); cells render its value.
 */
export function OTPInput({ value, onChange, onComplete, length = 6 }: OTPInputProps) {
  const inputRef = useRef<TextInput>(null);

  const handleChange = (text: string) => {
    const digits = text.replace(/\D/g, '').slice(0, length);
    onChange(digits);
    if (digits.length === length) {
      onComplete?.(digits);
    }
  };

  return (
    <Pressable
      style={styles.container}
      onPress={() => inputRef.current?.focus()}
      accessibilityRole="none"
    >
      <TextInput
        ref={inputRef}
        testID="otp-input"
        style={styles.hiddenInput}
        value={value}
        onChangeText={handleChange}
        keyboardType="number-pad"
        textContentType="oneTimeCode"
        autoComplete="sms-otp"
        maxLength={length}
        accessibilityLabel="One-time code"
      />
      <View style={styles.cells} pointerEvents="none">
        {Array.from({ length }, (_, index) => {
          const digit = value[index] ?? '';
          const active = index === value.length;
          return (
            <View key={index} style={[styles.cell, active && styles.cellActive]}>
              <Text style={styles.cellText}>{digit}</Text>
            </View>
          );
        })}
      </View>
    </Pressable>
  );
}

const CELL_SIZE = 48;

const styles = StyleSheet.create({
  container: {
    alignSelf: 'stretch',
  },
  hiddenInput: {
    position: 'absolute',
    width: 1,
    height: 1,
    opacity: 0,
  },
  cells: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: spacing[2],
  },
  cell: {
    width: CELL_SIZE,
    height: 56,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: componentColors.border,
    backgroundColor: colors.surface.card,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cellActive: {
    borderColor: colors.gold[700],
  },
  cellText: {
    ...typography.h2,
    color: colors.text.primary,
  },
});
