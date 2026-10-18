import { router } from 'expo-router';
import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ErrorState, Icon, IconButton, Loading, useToast, type IconName } from '@/components';
import { componentColors } from '@/components/palette';
import { getWallet } from '@/data/wallet';
import { useAsync } from '@/hooks/useAsync';
import { formatNaira } from '@/lib/currency';
import { ServiceScreenHeader, serviceScreenStyles } from '@/screens/services/serviceShared';
import { cardPadding, cardShadow, colors, hitTarget, radius, screenPadding, spacing, typography } from '@/theme/tokens';

interface FundingMethod {
  id: 'bank-transfer' | 'debit-card' | 'ussd';
  icon: IconName;
  tileColor: string;
  recommended?: boolean;
  title: string;
  caption: string;
  feeNote: string;
}

const FUNDING_METHODS: FundingMethod[] = [
  {
    id: 'bank-transfer',
    icon: 'wallet',
    tileColor: colors.gold[50],
    recommended: true,
    title: 'Bank transfer',
    caption: 'Transfer to your personalized account',
    feeNote: 'No fee · Instant',
  },
  {
    id: 'debit-card',
    icon: 'card',
    tileColor: colors.blue[100],
    title: 'Debit card',
    caption: 'Fund with a Nigerian bank card',
    feeNote: '1.5% fee · Instant',
  },
  {
    id: 'ussd',
    icon: 'grid',
    tileColor: colors.yellow[100],
    title: 'USSD',
    caption: "Pay with your bank's USSD code",
    feeNote: 'Bank charges may apply',
  },
];

/**
 * Add money — funding-method picker (design some_screens/2.jpg), opened from
 * the wallet card's "Add money" button. Routed via `src/app/wallet/add-money.tsx`.
 * Only bank transfer has a designed flow (some_screens/1.jpg); the other
 * methods are themed placeholders that surface a toast.
 */
export function AddMoneyScreen() {
  const wallet = useAsync(getWallet);
  const toast = useToast();

  const handleMethodPress = (method: FundingMethod) => {
    if (method.id === 'bank-transfer') {
      router.push('/wallet/bank-transfer');
    } else {
      toast.show(`${method.title} is coming soon`);
    }
  };

  return (
    <SafeAreaView style={serviceScreenStyles.screen} edges={['top']}>
      <ServiceScreenHeader
        title="Add money"
        trailing={
          <IconButton
            icon="help-circle"
            variant="plain"
            onPress={() => toast.show('Support is coming soon')}
            accessibilityLabel="Support"
          />
        }
      />

      {wallet.loading && !wallet.data ? (
        <Loading label="Loading your wallet…" />
      ) : wallet.error || !wallet.data ? (
        <View style={serviceScreenStyles.stateContent}>
          <ErrorState
            title="Couldn't load your wallet"
            caption="We couldn't load your balance. Please try again."
            onRetry={wallet.reload}
          />
        </View>
      ) : (
        <ScrollView
          style={serviceScreenStyles.screen}
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.balanceCard}>
            <Text style={styles.balanceEyebrow}>NGN wallet balance</Text>
            <Text style={styles.balanceAmount}>{formatNaira(wallet.data.ngn.balanceKobo)}</Text>
            <Text style={styles.balanceCaption}>
              Funds added to your wallet are available instantly.
            </Text>
          </View>

          <View style={styles.heading}>
            <Text style={styles.eyebrow}>Fund your wallet</Text>
            <Text style={styles.title}>Choose how to add money</Text>
            <Text style={styles.subtitle}>
              Select a secure funding method. Bank transfer has no Daniruk fee.
            </Text>
          </View>

          <View style={styles.methods}>
            {FUNDING_METHODS.map((method) => (
              <Pressable
                key={method.id}
                testID={`funding-method-${method.id}`}
                onPress={() => handleMethodPress(method)}
                accessibilityRole="button"
                style={({ pressed }) => [styles.methodRow, pressed && styles.pressed]}
              >
                <View style={[styles.methodTile, { backgroundColor: method.tileColor }]}>
                  <Icon name={method.icon} size={22} color={colors.gold[700]} />
                </View>
                <View style={styles.methodText}>
                  {method.recommended ? (
                    <Text style={styles.recommended}>Recommended</Text>
                  ) : null}
                  <Text style={styles.methodTitle}>{method.title}</Text>
                  <Text style={styles.methodCaption}>{method.caption}</Text>
                  <Text style={styles.methodFee}>{method.feeNote}</Text>
                </View>
                <Icon name="chevron-right" size={18} color={colors.text.muted} />
              </Pressable>
            ))}
          </View>

          <View style={styles.secureNote}>
            <Icon name="shield-check" size={22} color={colors.gold[700]} />
            <View style={styles.secureText}>
              <Text style={styles.secureTitle}>Secure wallet funding</Text>
              <Text style={styles.secureCaption}>
                Every deposit is monitored and protected. Only send money from an account in
                your name.
              </Text>
            </View>
          </View>
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: screenPadding,
    paddingTop: spacing[4],
    paddingBottom: spacing[10],
    gap: spacing[5],
  },
  balanceCard: {
    backgroundColor: colors.gold[800],
    borderRadius: radius.lg,
    padding: cardPadding,
    gap: spacing[2],
    ...cardShadow(),
  },
  balanceEyebrow: {
    ...typography.eyebrow,
    color: componentColors.mutedOnDark,
  },
  balanceAmount: {
    ...typography.balance,
    color: colors.text.inverse,
  },
  balanceCaption: {
    ...typography.body,
    color: componentColors.mutedOnDark,
  },
  heading: {
    gap: spacing[1],
  },
  eyebrow: {
    ...typography.eyebrow,
    color: colors.gold[700],
  },
  title: {
    ...typography.h1,
    color: colors.text.primary,
  },
  subtitle: {
    ...typography.body,
    color: colors.text.body,
  },
  methods: {
    gap: spacing[3],
  },
  methodRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[3],
    minHeight: hitTarget,
    backgroundColor: colors.surface.card,
    borderRadius: radius.lg,
    padding: spacing[4],
    alignSelf: 'stretch',
  },
  methodTile: {
    width: 48,
    height: 48,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  methodText: {
    flex: 1,
    gap: spacing[1],
  },
  recommended: {
    ...typography.eyebrow,
    color: colors.gold[700],
  },
  methodTitle: {
    ...typography.bodyMedium,
    color: colors.text.primary,
  },
  methodCaption: {
    ...typography.caption,
    color: colors.text.muted,
  },
  methodFee: {
    ...typography.caption,
    color: colors.gold[700],
  },
  secureNote: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing[3],
    backgroundColor: colors.gold[50],
    borderRadius: radius.lg,
    padding: cardPadding,
  },
  secureText: {
    flex: 1,
    gap: spacing[1],
  },
  secureTitle: {
    ...typography.bodyMedium,
    color: colors.text.primary,
  },
  secureCaption: {
    ...typography.caption,
    color: colors.text.body,
  },
  pressed: {
    opacity: 0.85,
  },
});
