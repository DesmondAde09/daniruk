import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import type { Transaction, TransactionType } from '@/data/types';
import { formatSignedKobo } from '@/lib/currency';
import { formatRelativeDay } from '@/lib/greeting';
import { colors, radius, spacing, typography } from '@/theme/tokens';

import { Icon, type IconName } from './Icon';
import { StatusBadge } from './StatusBadge';

export interface TransactionRowProps {
  transaction: Transaction;
  onPress?: () => void;
}

const typeIcon: Record<TransactionType, IconName> = {
  trade: 'gift',
  airtime: 'phone',
  data: 'wifi',
  electricity: 'bolt',
  flight: 'plane',
  receive: 'arrow-down-left',
  withdraw: 'arrow-up-right',
};

/** Transaction list row: type icon, title, timestamp + reference, signed amount, status. */
export function TransactionRow({ transaction, onPress }: TransactionRowProps) {
  const credit = transaction.amountKobo > 0;
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole={onPress ? 'button' : undefined}
      style={({ pressed }) => [styles.row, pressed && styles.pressed]}
    >
      <View style={styles.iconTile}>
        <Icon name={typeIcon[transaction.type]} size={20} color={colors.green[700]} />
      </View>
      <View style={styles.details}>
        <Text style={styles.title} numberOfLines={1}>
          {transaction.title}
        </Text>
        <Text style={styles.caption} numberOfLines={1}>
          {`${formatRelativeDay(transaction.createdAt)} · ${transaction.reference}`}
        </Text>
      </View>
      <View style={styles.right}>
        <Text style={[styles.amount, credit ? styles.amountCredit : styles.amountDebit]}>
          {formatSignedKobo(transaction.amountKobo)}
        </Text>
        <StatusBadge status={transaction.status} />
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[3],
    backgroundColor: colors.surface.card,
    borderRadius: radius.lg,
    padding: spacing[4],
    alignSelf: 'stretch',
  },
  pressed: {
    opacity: 0.85,
  },
  iconTile: {
    width: 44,
    height: 44,
    borderRadius: radius.md,
    backgroundColor: colors.green[100],
    alignItems: 'center',
    justifyContent: 'center',
  },
  details: {
    flex: 1,
    gap: spacing[1],
  },
  title: {
    ...typography.bodyMedium,
    color: colors.text.primary,
  },
  caption: {
    ...typography.caption,
    color: colors.text.muted,
  },
  right: {
    alignItems: 'flex-end',
    gap: spacing[1],
  },
  amount: {
    ...typography.bodyMedium,
  },
  amountCredit: {
    color: colors.green[700],
  },
  amountDebit: {
    color: colors.text.primary,
  },
});
