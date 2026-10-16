import React, { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { AuthScaffold } from '@/auth/AuthScaffold';
import { Button, Icon, TextField } from '@/components';
import { validateEmail } from '@/lib/validators';
import { colors, radius, spacing, typography } from '@/theme/tokens';

/**
 * Forgot-password placeholder (SPEC.md resolution 8): themed single screen —
 * no email is actually sent; submitting shows the success state inline.
 */
export default function ForgotPasswordScreen() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);

  const handleSubmit = () => {
    const emailError = validateEmail(email);
    if (emailError) {
      setError(emailError);
      return;
    }
    setError(null);
    setSent(true);
  };

  return (
    <AuthScaffold
      title="Reset your password"
      subtitle="Enter the email linked to your account and we'll send you a link to reset your password."
    >
      <View style={styles.iconWrap}>
        <Icon name="lock" size={28} color={colors.green[700]} />
      </View>
      {sent ? (
        <View style={styles.successNote}>
          <Icon name="check" size={18} color={colors.green[700]} />
          <Text style={styles.successText}>
            If an account exists for {email.trim()}, a reset link is on its way.
          </Text>
        </View>
      ) : (
        <>
          <TextField
            label="Email address"
            placeholder="you@example.com"
            value={email}
            onChangeText={(text) => {
              setEmail(text);
              if (error) setError(null);
            }}
            error={error}
            keyboardType="email-address"
            autoCapitalize="none"
            autoComplete="email"
            textContentType="emailAddress"
          />
          <Text style={styles.note}>
            Placeholder flow — no email is sent in this build.
          </Text>
          <Button title="Send reset link" showArrow onPress={handleSubmit} />
        </>
      )}
    </AuthScaffold>
  );
}

const styles = StyleSheet.create({
  iconWrap: {
    width: 64,
    height: 64,
    borderRadius: radius.pill,
    backgroundColor: colors.green[50],
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
  },
  successNote: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[3],
    backgroundColor: colors.surface.subtle,
    borderRadius: radius.md,
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[4],
  },
  successText: {
    flex: 1,
    ...typography.bodyMedium,
    color: colors.text.primary,
  },
  note: {
    ...typography.caption,
    color: colors.text.muted,
    marginTop: -spacing[2],
  },
});
