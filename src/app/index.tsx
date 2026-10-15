import { StyleSheet, View } from 'react-native';

import { useTheme } from '@/theme/ThemeProvider';

/** Placeholder until the onboarding/auth flow lands (ticket 04). */
export default function Index() {
  const { colors } = useTheme();
  return <View style={[styles.screen, { backgroundColor: colors.surface.page }]} />;
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
});
