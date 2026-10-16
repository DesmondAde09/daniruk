import React from 'react';
import { StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { EmptyState } from '@/components';
import { colors } from '@/theme/tokens';

/** Placeholder until the trade flow lands (later ticket). */
export default function TradeScreen() {
  return (
    <SafeAreaView style={styles.screen} edges={['top']}>
      <EmptyState icon="gift" title="Trade" caption="Coming in a later ticket." />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.surface.base,
    justifyContent: 'center',
  },
});
