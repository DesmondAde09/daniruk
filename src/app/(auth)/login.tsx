import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';

import { AuthScaffold } from '@/auth/AuthScaffold';
import { useSession } from '@/auth/SessionProvider';
import { Button, TextField } from '@/components';
import { validateEmail, validatePassword } from '@/lib/validators';
import { colors, spacing, typography } from '@/theme/tokens';

/** Log in screen (design 2.png). */
export default function LoginScreen() {
  const router = useRouter();
  const { signIn } = useSession();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    const emailError = validateEmail(email);
    const passwordError = validatePassword(password);
    if (emailError || passwordError) {
      setErrors({
        email: emailError ?? undefined,
        password: passwordError ?? undefined,
      });
      return;
    }
    setErrors({});
    setSubmitting(true);
    try {
      // Session flips to signedIn; the root layout's protected routes
      // then redirect to the (tabs) group automatically.
      await signIn(email, password);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AuthScaffold
      title="Good to see you again"
      subtitle="Sign in to continue to your account."
      activeTab="login"
    >
      <TextField
        label="Email address"
        placeholder="you@example.com"
        value={email}
        onChangeText={(text) => {
          setEmail(text);
          if (errors.email) setErrors((prev) => ({ ...prev, email: undefined }));
        }}
        error={errors.email}
        keyboardType="email-address"
        autoCapitalize="none"
        autoComplete="email"
        textContentType="emailAddress"
      />
      <View style={styles.passwordGroup}>
        <TextField
          label="Password"
          placeholder="Minimum 8 characters"
          value={password}
          onChangeText={(text) => {
            setPassword(text);
            if (errors.password) setErrors((prev) => ({ ...prev, password: undefined }));
          }}
          error={errors.password}
          secure
          autoCapitalize="none"
          autoComplete="password"
          textContentType="password"
        />
        <Pressable
          onPress={() => router.push('/(auth)/forgot-password')}
          accessibilityRole="link"
          hitSlop={8}
          style={({ pressed }) => [styles.forgotLink, pressed && styles.pressed]}
        >
          <Text style={styles.forgotLinkText}>Forgot password?</Text>
        </Pressable>
      </View>
      <Button
        title="Log in securely"
        showArrow
        loading={submitting}
        onPress={handleSubmit}
      />
    </AuthScaffold>
  );
}

const styles = StyleSheet.create({
  passwordGroup: {
    gap: spacing[3],
  },
  forgotLink: {
    alignSelf: 'flex-end',
    minHeight: 44,
    justifyContent: 'center',
  },
  forgotLinkText: {
    ...typography.label,
    color: colors.green[700],
  },
  pressed: {
    opacity: 0.85,
  },
});
