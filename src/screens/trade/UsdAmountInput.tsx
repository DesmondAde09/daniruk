import React, { useState } from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';

import { componentColors } from '@/components/palette';
import { validateAmount } from '@/lib/validators';
import { colors, radius, spacing, typography } from '@/theme/tokens';

export interface UsdAmountInputProps {
  label?: string;
  /** Current amount in decimal dollars; null when the field is empty/unparseable. */
  valueUsd: number | null;
  onChangeUsd: (usd: number | null) => void;
  /** Inclusive bounds in USD; wired to `validateAmount` from `@/lib/validators`. */
  minUsd?: number;
  maxUsd?: number;
  /** External error overrides the internal min/max validation message. */
  error?: string | null;
}

/**
 * USD twin of `AmountInput` (which is ₦-prefixed and kobo-based). Trade amounts
 * are denominated in dollars end-to-end (`GiftCardBrand.minUsd/maxUsd`,
 * `getTradeQuote(brandId, amountUsd)`), so a dollar-in/dollar-out field is
 * cleaner than reusing the ₦ component and converting.
 */
export function UsdAmountInput({
  label,
  valueUsd,
  onChangeUsd,
  minUsd,
  maxUsd,
  error,
}: UsdAmountInputProps) {
  const [text, setText] = useState(valueUsd != null ? String(valueUsd) : '');
  const [focused, setFocused] = useState(false);

  const handleChange = (next: string) => {
    const cleaned = next.replace(/[^0-9.]/g, '');
    setText(cleaned);
    const dollars = Number.parseFloat(cleaned);
    onChangeUsd(Number.isNaN(dollars) ? null : dollars);
  };

  const validationError =
    error ??
    (text.length > 0 && minUsd != null && maxUsd != null && valueUsd != null
      ? validateAmount(valueUsd, minUsd, maxUsd, 'Card value')
      : null);
  const hasError = Boolean(validationError);

  return (
    <View style={styles.container}>
      {label ? <Text style={styles.label}>{label}</Text> : null}
      <View style={[styles.inputRow, focused && styles.inputRowFocused, hasError && styles.inputRowError]}>
        <Text style={styles.prefix}>$</Text>
        <TextInput
          testID="usd-amount-input"
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
    borderColor: colors.green[700],
  },
  inputRowError: {
    borderColor: colors.status.error,
  },
  prefix: {
    ...typography.h1,
    color: colors.green[700],
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
