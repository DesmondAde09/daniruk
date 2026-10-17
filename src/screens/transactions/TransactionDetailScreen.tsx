import { router, useLocalSearchParams } from 'expo-router';
import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button, ErrorState, IconButton, Loading, StatusBadge } from '@/components';
import { getTransaction } from '@/data/transactions';
import type { Transaction } from '@/data/types';
import { useAsync } from '@/hooks/useAsync';
import { formatSignedKobo } from '@/lib/currency';
import { formatRelativeDay } from '@/lib/greeting';
import { cardPadding, cardShadow, colors, radius, screenPadding, spacing, typography } from '@/theme/tokens';

/** "cardValue" -> "Card value", "meterNumber" -> "Meter number". */
function humanizeMetaKey(key: string): string {
  const spaced = key.replace(/([A-Z])/g, ' $1').trim();
  return spaced.charAt(0).toUpperCase() + spaced.slice(1);
}

function MetaRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.metaRow}>
      <Text style={styles.metaLabel}>{label}</Text>
      <Text style={styles.metaValue} numberOfLines={2}>
        {value}
      </Text>
    </View>
  );
}

/**
 * Transaction detail (ticket 06). Routed via the thin wrapper at
 * `src/app/transactions/[id].tsx`. `getTransaction` rejects on unknown ids,
 * which surfaces as the retryable error state below.
 */
export function TransactionDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const transaction = useAsync(() => getTransaction(id));

  return (
    <SafeAreaView style={styles.screen} edges={['top']}>
      <View style={styles.header}>
        <IconButton
          icon="chevron-left"
          variant="outline"
          onPress={() => router.back()}
          accessibilityLabel="Go back"
        />
        <Text style={styles.headerTitle}>Transaction</Text>
        <View style={styles.headerSpacer} />
      </View>

      {transaction.loading && !transaction.data ? (
        <Loading label="Loading transaction…" />
      ) : transaction.error || !transaction.data ? (
        <View style={styles.stateContent}>
          <ErrorState
            title="Transaction not found"
            caption="We couldn't load this transaction. Please try again."
            onRetry={transaction.reload}
          />
        </View>
      ) : (
        <DetailBody transaction={transaction.data} />
      )}
    </SafeAreaView>
  );
}

function DetailBody({ transaction }: { transaction: Transaction }) {
  const credit = transaction.amountKobo > 0;
  const metaEntries = Object.entries(transaction.meta ?? {});

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.hero}>
        <Text style={[styles.amount, credit ? styles.amountCredit : styles.amountDebit]}>
          {formatSignedKobo(transaction.amountKobo)}
        </Text>
        <Text style={styles.heroTitle}>{transaction.title}</Text>
        <StatusBadge status={transaction.status} />
        <Text style={styles.timestamp}>{formatRelativeDay(transaction.createdAt)}</Text>
      </View>

      <View style={styles.detailCard}>
        {metaEntries.map(([key, value]) => (
          <MetaRow key={key} label={humanizeMetaKey(key)} value={value} />
        ))}
        <MetaRow label="Reference" value={transaction.reference} />
      </View>

      {transaction.status === 'failed' ? (
        // The support screen is a later ticket; the button is a themed placeholder.
        <Button title="Contact support" variant="ghost" />
      ) : null}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.surface.base,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: screenPadding,
    paddingVertical: spacing[2],
    gap: spacing[3],
  },
  headerTitle: {
    ...typography.h2,
    color: colors.text.primary,
    flex: 1,
    textAlign: 'center',
  },
  headerSpacer: {
    width: 44,
  },
  stateContent: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: screenPadding,
  },
  content: {
    paddingHorizontal: screenPadding,
    paddingTop: spacing[4],
    paddingBottom: spacing[10],
    gap: spacing[6],
  },
  hero: {
    alignItems: 'center',
    gap: spacing[2],
  },
  amount: {
    ...typography.balance,
  },
  amountCredit: {
    color: colors.green[700],
  },
  amountDebit: {
    color: colors.text.primary,
  },
  heroTitle: {
    ...typography.bodyMedium,
    color: colors.text.body,
  },
  timestamp: {
    ...typography.caption,
    color: colors.text.muted,
  },
  detailCard: {
    backgroundColor: colors.surface.card,
    borderRadius: radius.lg,
    padding: cardPadding,
    gap: spacing[4],
    ...cardShadow(),
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing[4],
  },
  metaLabel: {
    ...typography.body,
    color: colors.text.muted,
  },
  metaValue: {
    ...typography.bodyMedium,
    color: colors.text.primary,
    flexShrink: 1,
    textAlign: 'right',
  },
});
