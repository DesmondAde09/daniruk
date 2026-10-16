import { Stack } from 'expo-router';

import { ToastProvider } from '@/components';
import { SessionProvider, useSession } from '@/auth/SessionProvider';
import { ThemeProvider } from '@/theme/ThemeProvider';

/**
 * Auth gate (SDK 57 protected routes): while the mock session hydrates, render
 * nothing (ThemeProvider already gates on fonts). Signed-out users can reach
 * onboarding and the auth group; once signed in those routes become guarded and
 * the router redirects to the first available screen — the `(tabs)` group.
 */
function AuthGate() {
  const { status } = useSession();

  if (status === 'loading') {
    return null;
  }

  const signedIn = status === 'signedIn';

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Protected guard={signedIn}>
        <Stack.Screen name="(tabs)" />
      </Stack.Protected>
      <Stack.Protected guard={!signedIn}>
        <Stack.Screen name="index" />
        <Stack.Screen name="(auth)" />
      </Stack.Protected>
    </Stack>
  );
}

export default function RootLayout() {
  return (
    <ThemeProvider>
      <SessionProvider>
        <ToastProvider>
          <AuthGate />
        </ToastProvider>
      </SessionProvider>
    </ThemeProvider>
  );
}
