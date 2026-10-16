import { Stack } from 'expo-router';

/** Auth stack — each screen renders the shared white-sheet chrome itself. */
export default function AuthLayout() {
  return <Stack screenOptions={{ headerShown: false, animation: 'slide_from_right' }} />;
}
