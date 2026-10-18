import React, { useState } from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';

import { validateAmount } from '@/lib/validators';
import { colors, radius, spacing, typography } from '@/theme/tokens';

import { componentColors } from './palette';

export interface AmountInputProps {
  label?: string;
  /** Current amount in kobo; null when the field is empty/unparseable. */
  valueKobo: number | null;
  onChangeKobo: (kobo: number | null) => void;
  /** Inclusive bounds in kobo; wired to `validateAmount` from `@/lib/validators`. */
  minKobo?: number;
  maxKobo?: number;
  /** External error overrides the internal min/max validation message. */
  error?: string | null;
}

/** Large ₦-prefixed numeric input with optional min/max validation. */
export function AmountInput({
  label,
  valueKobo,
  onChangeKobo,
  minKobo,
  maxKobo,
  error,
}: AmountInputProps) {
  const [text, setText] = useState(valueKobo != null ? String(valueKobo / 100) : '');
  const [focused, setFocused] = useState(false);

  const handleChange = (next: string) => {
    const cleaned = next.replace(/[^0-9.]/g, '');
    setText(cleaned);
    const naira = Number.parseFloat(cleaned);
    onChangeKobo(Number.isNaN(naira) ? null : Math.round(naira * 100));
  };

  const naira = valueKobo != null ? valueKobo / 100 : Number.NaN;
  const validationError =
    error ??
    (text.length > 0 && minKobo != null && maxKobo != null
      ? validateAmount(naira, minKobo / 100, maxKobo / 100, 'Amount')
      : null);
  const hasError = Boolean(validationError);

  return (
    <View style={styles.container}>
      {label ? <Text style={styles.label}>{label}</Text> : null}
      <View style={[styles.inputRow, focused && styles.inputRowFocused, hasError && styles.inputRowError]}>
        <Text style={styles.prefix}>₦</Text>
        <TextInput
          testID="amount-input"
          style={styles.input}
          value={text}
          onChangeText={handleChange}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          keyboardType="decimal-pad"
          placeholder="0.00"
          placeholderTextColor={colors.text.muted}
        />
      </View>
      {hasError && <Text style={styles.errorText}>{validationError}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignSelf: 'stretch',
    gap: spacing[2],
  },
  label: {
    ...typography.label,
    color: colors.text.primary,
  },
  inputRow: {
    minHeight: 64,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: componentColors.border,
    backgroundColor: colors.surface.card,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing[4],
    gap: spacing[2],
  },
  inputRowFocused: {
    borderColor: colors.gold[700],
  },
  inputRowError: {
    borderColor: colors.status.error,
  },
  prefix: {
    ...typography.h1,
    color: colors.gold[700],
  },
  input: {
    flex: 1,
    ...typography.h1,
    color: colors.text.primary,
    paddingVertical: 0,
  },
  errorText: {
    ...typography.caption,
    color: colors.status.error,
  },
});
