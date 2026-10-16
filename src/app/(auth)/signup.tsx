import React, { useState } from 'react';
import { useRouter } from 'expo-router';

import { AuthScaffold } from '@/auth/AuthScaffold';
import { useSession } from '@/auth/SessionProvider';
import { Button, TextField } from '@/components';
import { validateEmail, validateFullName, validatePassword } from '@/lib/validators';

/** Sign up screen (design 5.png). Success routes to the mock OTP step. */
export default function SignupScreen() {
  const router = useRouter();
  const { signUp } = useSession();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<{ fullName?: string; email?: string; password?: string }>(
    {},
  );
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    const fullNameError = validateFullName(fullName);
    const emailError = validateEmail(email);
    const passwordError = validatePassword(password);
    if (fullNameError || emailError || passwordError) {
      setErrors({
        fullName: fullNameError ?? undefined,
        email: emailError ?? undefined,
        password: passwordError ?? undefined,
      });
      return;
    }
    setErrors({});
    setSubmitting(true);
    try {
      await signUp(fullName, email, password);
      router.push({ pathname: '/(auth)/otp', params: { email: email.trim() } });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AuthScaffold
      title="Create your account"
      subtitle="Set up your secure account in a few moments."
      activeTab="signup"
    >
      <TextField
        label="Full name"
        placeholder="First and last name"
        value={fullName}
        onChangeText={(text) => {
          setFullName(text);
          if (errors.fullName) setErrors((prev) => ({ ...prev, fullName: undefined }));
        }}
        error={errors.fullName}
        autoCapitalize="words"
        autoComplete="name"
        textContentType="name"
      />
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
        autoComplete="new-password"
        textContentType="newPassword"
      />
      <Button
        title="Create account"
        showArrow
        loading={submitting}
        onPress={handleSubmit}
      />
    </AuthScaffold>
  );
}
