import React, { useState } from 'react';
import {
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
  type TextInputProps,
} from 'react-native';

import { colors, radius, spacing, typography } from '@/theme/tokens';

import { Icon } from './Icon';
import { componentColors } from './palette';

export interface TextFieldProps
  extends Omit<TextInputProps, 'style' | 'secureTextEntry' | 'placeholderTextColor'> {
  label?: string;
  /** Caption error text; also turns the border status.error. */
  error?: string | null;
  /** Password-style field with an eye/eye-off reveal toggle. */
  secure?: boolean;
  disabled?: boolean;
}

/** Labelled 56pt text input with focused/error/disabled states and secure-entry toggle. */
export function TextField({
  label,
  error,
  secure = false,
  disabled = false,
  onFocus,
  onBlur,
  ...inputProps
}: TextFieldProps) {
  const [focused, setFocused] = useState(false);
  const [revealed, setRevealed] = useState(false);
  const hasError = Boolean(error);

  return (
    <View style={styles.container}>
      {label ? <Text style={styles.label}>{label}</Text> : null}
      <View
        style={[
          styles.inputRow,
          focused && styles.inputRowFocused,
          hasError && styles.inputRowError,
          disabled && styles.inputRowDisabled,
        ]}
      >
        <TextInput
          testID="textfield-input"
          style={styles.input}
          placeholderTextColor={colors.text.muted}
          secureTextEntry={secure && !revealed}
          editable={!disabled}
          onFocus={(e) => {
            setFocused(true);
            onFocus?.(e);
          }}
          onBlur={(e) => {
            setFocused(false);
            onBlur?.(e);
          }}
          {...inputProps}
        />
        {secure && (
          <Pressable
            onPress={() => setRevealed((r) => !r)}
            accessibilityRole="button"
            accessibilityLabel={revealed ? 'Hide password' : 'Show password'}
            hitSlop={8}
            style={({ pressed }) => [styles.toggle, pressed && styles.pressed]}
          >
            <Icon name={revealed ? 'eye-off' : 'eye'} size={20} color={colors.text.muted} />
          </Pressable>
        )}
      </View>
      {hasError && <Text style={styles.errorText}>{error}</Text>}
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
    height: 56,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: componentColors.border,
    backgroundColor: colors.surface.card,
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: spacing[4],
    paddingRight: spacing[2],
  },
  inputRowFocused: {
    borderColor: colors.gold[700],
  },
  inputRowError: {
    borderColor: colors.status.error,
  },
  inputRowDisabled: {
    backgroundColor: colors.surface.base,
    opacity: 0.7,
  },
  input: {
    flex: 1,
    height: '100%',
    ...typography.body,
    color: colors.text.primary,
    paddingVertical: 0,
  },
  toggle: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pressed: {
    opacity: 0.85,
  },
  errorText: {
    ...typography.caption,
    color: colors.status.error,
  },
});
