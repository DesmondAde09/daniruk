import React, { useCallback, useState } from 'react';
import { StyleSheet, Text } from 'react-native';
import { useLocalSearchParams } from 'expo-router';

import { AuthScaffold } from '@/auth/AuthScaffold';
import { useSession } from '@/auth/SessionProvider';
import { Button, OTPInput, useToast } from '@/components';
import { colors, spacing, typography } from '@/theme/tokens';

/** Mock OTP verification (SPEC.md: any 6-digit code is accepted). */
export default function OtpScreen() {
  const { email } = useLocalSearchParams<{ email?: string }>();
  const { user, verifyOtp } = useSession();
  const toast = useToast();

  const [code, setCode] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [verifying, setVerifying] = useState(false);

  const destination = email ?? user?.email ?? 'your email address';

  const handleVerify = useCallback(
    async (digits: string) => {
      if (verifying) return;
      setVerifying(true);
      setError(null);
      try {
        const accepted = await verifyOtp(digits);
        if (!accepted) {
          setError("That code doesn't look right. Check it and try again.");
          setCode('');
        }
        // On success the session flips to signedIn and the root layout's
        // protected routes redirect to the (tabs) group automatically.
      } finally {
        setVerifying(false);
      }
    },
    [verifyOtp, verifying],
  );

  return (
    <AuthScaffold
      title="Check your email"
      subtitle={`We sent a 6-digit verification code to ${destination}. Enter it below to secure your account.`}
    >
      <OTPInput
        value={code}
        onChange={(next) => {
          setCode(next);
          if (error) setError(null);
        }}
        onComplete={handleVerify}
      />
      {error ? (
        <Text style={styles.errorText} accessibilityLiveRegion="polite">
          {error}
        </Text>
      ) : null}
      <Button
        title="Verify code"
        showArrow
        loading={verifying}
        disabled={code.length < 6}
        onPress={() => handleVerify(code)}
      />
      <Button
        title="Resend code"
        variant="ghost"
        onPress={() => toast.show('Code resent')}
      />
    </AuthScaffold>
  );
}

const styles = StyleSheet.create({
  errorText: {
    ...typography.caption,
    color: colors.status.error,
    marginTop: -spacing[2],
  },
});
