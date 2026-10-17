import { router, useFocusEffect } from 'expo-router';
import React, { useCallback, useMemo, useRef, useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { EmptyState, ErrorState, RowSkeleton, TransactionRow } from '@/components';
import { getTransactions } from '@/data/transactions';
import type { Transaction, TransactionType } from '@/data/types';
import { useAsync } from '@/hooks/useAsync';
import { colors, hitTarget, radius, screenPadding, spacing, typography } from '@/theme/tokens';

type FilterKey = 'all' | 'trades' | 'services' | 'in' | 'out';

const SERVICE_TYPES: TransactionType[] = ['airtime', 'data', 'electricity', 'flight'];

/**
 * Filter mapping (ticket 06 decision): `getTransactions` only filters by a
 * single type, so the screen fetches the full ledger once and narrows it
 * client-side. Trades/Services match on type sets; Money in/out match on the
 * signed amount (credit/debit) rather than type lists, so the direction
 * filters stay correct if new transaction types are added later.
 */
const filters: { key: FilterKey; label: string; match: (transaction: Transaction) => boolean }[] = [
  { key: 'all', label: 'All', match: () => true },
  { key: 'trades', label: 'Trades', match: (t) => t.type === 'trade' },
  { key: 'services', label: 'Services', match: (t) => SERVICE_TYPES.includes(t.type) },
  { key: 'in', label: 'Money in', match: (t) => t.amountKobo > 0 },
  { key: 'out', label: 'Money out', match: (t) => t.amountKobo < 0 },
];

const emptyCopy: Record<FilterKey, { title: string; caption: string }> = {
  all: { title: 'No transactions yet', caption: 'Your activity will show up here.' },
  trades: { title: 'No trades yet', caption: 'Gift-card trades you complete will show up here.' },
  services: {
    title: 'No service payments yet',
    caption: 'Airtime, data, electricity and flight payments will show up here.',
  },
  in: { title: 'No money in yet', caption: 'Completed trades and crypto deposits land here.' },
  out: { title: 'No money out yet', caption: 'Payments and withdrawals will show up here.' },
};

const SKELETON_COUNT = 5;

/**
 * Transactions tab (ticket 06): full ledger with a themed filter chip row.
 * SegmentedToggle is built for 2–3 full-width options, so five filters use a
 * horizontal chip row that extends the theme (questionnaire resolution 9):
 * active chip = green.700 fill + inverse text; inactive = white card.
 * Routed via the thin wrapper at `src/app/(tabs)/transactions.tsx`.
 */
export function TransactionsScreen() {
  const activity = useAsync(() => getTransactions());
  const [filter, setFilter] = useState<FilterKey>('all');

  // The tab stays mounted while flows (e.g. a trade) push on top; refetch when
  // it regains focus so new transactions appear. The ref skips the first focus,
  // which coincides with the mount fetch.
  const reloadActivity = activity.reload;
  const firstFocus = useRef(true);
  useFocusEffect(
    useCallback(() => {
      if (firstFocus.current) {
        firstFocus.current = false;
        return;
      }
      reloadActivity();
    }, [reloadActivity]),
  );

  const activeFilter = filters.find((entry) => entry.key === filter) ?? filters[0];
  const visible = useMemo(
    () => (activity.data ?? []).filter(activeFilter.match),
    [activity.data, activeFilter],
  );

  return (
    <SafeAreaView style={styles.screen} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.title}>Transactions</Text>
        <Text style={styles.subtitle}>Your full history, filterable by type.</Text>
      </View>

      <View style={styles.chipRow}>
        {filters.map((entry) => {
          const active = entry.key === filter;
          return (
            <Pressable
              key={entry.key}
              testID={`filter-chip-${entry.key}`}
              onPress={() => setFilter(entry.key)}
              accessibilityRole="button"
              accessibilityState={{ selected: active }}
              style={({ pressed }) => [
                styles.chip,
                active ? styles.chipActive : styles.chipInactive,
                pressed && styles.pressed,
              ]}
            >
              <Text style={[styles.chipLabel, active ? styles.chipLabelActive : styles.chipLabelInactive]}>
                {entry.label}
              </Text>
            </Pressable>
          );
        })}
      </View>

      {activity.loading && !activity.data ? (
        <View style={styles.listContent}>
          {Array.from({ length: SKELETON_COUNT }, (_, index) => (
            <RowSkeleton key={index} />
          ))}
        </View>
      ) : activity.error ? (
        <View style={styles.listContent}>
          <ErrorState title="Couldn't load transactions" onRetry={activity.reload} />
        </View>
      ) : visible.length === 0 ? (
        <View style={styles.listContent}>
          <EmptyState
            icon="receipt"
            title={emptyCopy[filter].title}
            caption={emptyCopy[filter].caption}
          />
        </View>
      ) : (
        <FlatList
          data={visible}
          keyExtractor={(transaction) => transaction.id}
          renderItem={({ item }) => (
            <TransactionRow
              transaction={item}
              onPress={() => router.push(`/transactions/${item.id}`)}
            />
          )}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.surface.base,
  },
  header: {
    paddingHorizontal: screenPadding,
    paddingTop: spacing[2],
    paddingBottom: spacing[4],
    gap: spacing[1],
  },
  title: {
    ...typography.h1,
    color: colors.text.primary,
  },
  subtitle: {
    ...typography.body,
    color: colors.text.muted,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: screenPadding,
    paddingBottom: spacing[4],
    gap: spacing[2],
  },
  chip: {
    minHeight: hitTarget,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing[4],
  },
  chipActive: {
    backgroundColor: colors.green[700],
  },
  chipInactive: {
    backgroundColor: colors.surface.card,
  },
  pressed: {
    opacity: 0.85,
  },
  chipLabel: {
    ...typography.label,
  },
  chipLabelActive: {
    color: colors.text.inverse,
  },
  chipLabelInactive: {
    color: colors.text.body,
  },
  listContent: {
    paddingHorizontal: screenPadding,
    paddingBottom: spacing[10],
    gap: spacing[3],
  },
  separator: {
    height: spacing[3],
  },
});
