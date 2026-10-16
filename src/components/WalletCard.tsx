import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import type { Wallet } from '@/data/types';
import { formatCrypto, formatNaira } from '@/lib/currency';
import { cardPadding, colors, fontFamily, radius, spacing, typography } from '@/theme/tokens';

import { Icon } from './Icon';
import { componentColors } from './palette';

const MASKED_BALANCE = '₦••••••';

export interface WalletCardProps {
  wallet: Wallet;
  balanceHidden: boolean;
  onToggleBalance: () => void;
  onReceive: () => void;
  onWithdraw: () => void;
}

/** Green.800 wallet card from design 4.png: NGN balance + eye toggle, crypto row, Receive/Withdraw. */
export function WalletCard({
  wallet,
  balanceHidden,
  onToggleBalance,
  onReceive,
  onWithdraw,
}: WalletCardProps) {
  return (
    <View style={styles.card}>
      <View style={styles.balanceHeader}>
        <Text style={styles.caption}>NGN wallet balance</Text>
        <Pressable
          onPress={onToggleBalance}
          accessibilityRole="button"
          accessibilityLabel={balanceHidden ? 'Show balance' : 'Hide balance'}
          hitSlop={8}
          style={({ pressed }) => [styles.eyeButton, pressed && styles.pressed]}
        >
          <Icon name={balanceHidden ? 'eye-off' : 'eye'} size={20} color={componentColors.mutedOnDark} />
        </Pressable>
      </View>
      <Text style={styles.balance}>
        {balanceHidden ? MASKED_BALANCE : formatNaira(wallet.ngn.balanceKobo)}
      </Text>

      <View style={styles.cryptoRow}>
        <View style={styles.cryptoLeft}>
          <View style={styles.btcBadge}>
            <Text style={styles.btcGlyph}>₿</Text>
          </View>
          <Text style={styles.caption}>Crypto balance</Text>
        </View>
        <View style={styles.cryptoAmounts}>
          {wallet.crypto.map((holding) => (
            <Text key={holding.asset} style={styles.cryptoAmount}>
              {formatCrypto(holding.balance, holding.asset)}
            </Text>
          ))}
        </View>
      </View>

      <View style={styles.divider} />

      <View style={styles.actions}>
        <Pressable
          onPress={onReceive}
          accessibilityRole="button"
          style={({ pressed }) => [styles.actionButton, pressed && styles.pressed]}
        >
          <Icon name="arrow-down-left" size={18} color={colors.text.inverse} />
          <Text style={styles.actionLabel}>Receive</Text>
        </Pressable>
        <Pressable
          onPress={onWithdraw}
          accessibilityRole="button"
          style={({ pressed }) => [styles.actionButton, pressed && styles.pressed]}
        >
          <Icon name="arrow-up-right" size={18} color={colors.text.inverse} />
          <Text style={styles.actionLabel}>Withdraw</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.green[800],
    borderRadius: radius.lg,
    padding: cardPadding,
    alignSelf: 'stretch',
  },
  balanceHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  caption: {
    ...typography.caption,
    color: componentColors.mutedOnDark,
  },
  eyeButton: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: -spacing[3],
  },
  balance: {
    ...typography.balance,
    color: colors.text.inverse,
    marginTop: spacing[1],
  },
  cryptoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: spacing[4],
  },
  cryptoLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
  },
  btcBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: componentColors.btcOrange,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btcGlyph: {
    ...typography.caption,
    fontFamily: fontFamily.bold,
    color: colors.text.inverse,
  },
  cryptoAmounts: {
    alignItems: 'flex-end',
  },
  cryptoAmount: {
    ...typography.bodyMedium,
    color: colors.text.inverse,
  },
  divider: {
    height: 1,
    backgroundColor: colors.overlay.onDark,
    marginVertical: cardPadding,
  },
  actions: {
    flexDirection: 'row',
    gap: spacing[3],
  },
  actionButton: {
    flex: 1,
    height: 48,
    borderRadius: radius.md,
    backgroundColor: colors.overlay.onDark,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing[2],
  },
  actionLabel: {
    ...typography.button,
    color: colors.text.inverse,
  },
  pressed: {
    opacity: 0.85,
  },
});
