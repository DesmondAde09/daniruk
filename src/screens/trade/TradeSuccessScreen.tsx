import { router, useLocalSearchParams } from 'expo-router';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button, Icon } from '@/components';
import { formatSignedKobo } from '@/lib/currency';
import { colors, screenPadding, spacing, typography } from '@/theme/tokens';

type SuccessParams = {
  transactionId: string;
  amountKobo: string;
  brandName?: string;
}

/**
 * Trade flow step 4 (ticket 07): success state after `submitTrade`.
 * Routed via the thin wrapper at `src/app/trade/success.tsx`. The review
 * screen `replace`s onto this route so back-navigation skips the form.
 */
export function TradeSuccessScreen() {
  const params = useLocalSearchParams<SuccessParams>();
  const amountKobo = Number.parseInt(params.amountKobo ?? '', 10);
  const hasAmount = Number.isInteger(amountKobo);

  return (
    <SafeAreaView style={styles.screen} edges={['top', 'bottom']}>
      <View style={styles.content}>
        <View style={styles.checkCircle}>
          <Icon name="check" size={40} color={colors.gold[700]} />
        </View>
        <Text style={styles.title}>Trade successful</Text>
        {hasAmount ? <Text style={styles.amount}>{formatSignedKobo(amountKobo)}</Text> : null}
        <Text style={styles.caption}>
          {`Your ${params.brandName ?? 'gift card'} payout has been added to your Naira wallet.`}
        </Text>
      </View>

      <View style={styles.actions}>
        {params.transactionId ? (
          <Button
            title="View transaction"
            showArrow
            onPress={() => router.push(`/transactions/${params.transactionId}`)}
          />
        ) : null}
        <Button
          title="Back to home"
          variant={params.transactionId ? 'ghost' : 'primary'}
          onPress={() => router.dismissTo('/(tabs)')}
        />
      </View>
    </SafeAreaView>
  );
}

const CHECK_CIRCLE = 96;

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.surface.base,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: screenPadding,
    gap: spacing[3],
  },
  checkCircle: {
    width: CHECK_CIRCLE,
    height: CHECK_CIRCLE,
    borderRadius: CHECK_CIRCLE / 2,
    backgroundColor: colors.gold[50],
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing[2],
  },
  title: {
    ...typography.h1,
    color: colors.text.primary,
    textAlign: 'center',
  },
  amount: {
    ...typography.balance,
    color: colors.gold[700],
  },
  caption: {
    ...typography.body,
    color: colors.text.body,
    textAlign: 'center',
  },
  actions: {
    paddingHorizontal: screenPadding,
    paddingBottom: spacing[4],
    gap: spacing[2],
  },
});
