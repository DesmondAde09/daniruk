import { router, useFocusEffect } from 'expo-router';
import React, { useCallback, useRef, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useSession } from '@/auth/SessionProvider';
import {
  BannerCard,
  EmptyState,
  ErrorState,
  Icon,
  RowSkeleton,
  ScreenHeader,
  SectionHeader,
  ServiceTile,
  TransactionRow,
  WalletCard,
} from '@/components';
import { getNotifications } from '@/data/notifications';
import { getTransactions } from '@/data/transactions';
import { getWallet } from '@/data/wallet';
import { useAsync } from '@/hooks/useAsync';
import { greeting } from '@/lib/greeting';
import { colors, radius, screenPadding, spacing, typography } from '@/theme/tokens';

/** Recent transactions preview size on Home. */
const RECENT_COUNT = 3;

/**
 * Home (designs 3.png + 4.png). Routed via the thin wrapper at
 * `src/app/(tabs)/index.tsx`; lives here so its tests sit outside `src/app/`
 * (every file under `src/app/` is treated as a route).
 */
export function HomeScreen() {
  const { user } = useSession();
  const wallet = useAsync(getWallet);
  const activity = useAsync(() => getTransactions());
  const notifications = useAsync(getNotifications);
  const [balanceHidden, setBalanceHidden] = useState(false);

  // Tab screens stay mounted while flows (e.g. a trade) push on top, so the
  // mount-time fetch above is stale on return. Refetch when the tab regains
  // focus; the ref skips the first focus, which coincides with the mount fetch.
  const reloadWallet = wallet.reload;
  const reloadActivity = activity.reload;
  const reloadNotifications = notifications.reload;
  const firstFocus = useRef(true);
  useFocusEffect(
    useCallback(() => {
      if (firstFocus.current) {
        firstFocus.current = false;
        return;
      }
      reloadWallet();
      reloadActivity();
      reloadNotifications();
    }, [reloadWallet, reloadActivity, reloadNotifications]),
  );

  // The auth gate guarantees a signed-in user here; fallbacks cover the
  // render before the session finishes hydrating.
  const firstName = user?.fullName.split(' ')[0] ?? 'there';
  const initials = user?.avatarInitials ?? '';
  const hasUnread = notifications.data?.some((notification) => !notification.read) ?? false;

  return (
    <SafeAreaView style={styles.screen} edges={['top']}>
      <ScrollView
        style={styles.screen}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <ScreenHeader
          variant="home"
          initials={initials}
          hasUnread={hasUnread}
          onPressBell={() => router.push('/notifications')}
          onPressAvatar={() => router.push('/profile')}
        />

        <View style={styles.greetingBlock}>
          <Text style={styles.greetingCaption}>{`${greeting()}, ${firstName}`}</Text>
          <Text style={styles.greetingTitle}>What would you like to do?</Text>
        </View>

        {wallet.loading && !wallet.data ? (
          <View style={styles.walletSkeleton} testID="wallet-skeleton" />
        ) : wallet.error ? (
          <ErrorState onRetry={wallet.reload} />
        ) : wallet.data ? (
          <WalletCard
            wallet={wallet.data}
            balanceHidden={balanceHidden}
            onToggleBalance={() => setBalanceHidden((hidden) => !hidden)}
            onReceive={() => router.push('/wallet/receive')}
            onWithdraw={() => router.push('/wallet/withdraw')}
          />
        ) : null}

        <BannerCard variant="trade" onPress={() => router.push('/trade')} />

        <View style={styles.section}>
          <SectionHeader
            eyebrow="EVERYDAY"
            title="Quick services"
            linkLabel="View all"
            onLinkPress={() => router.push('/services')}
          />
          <View style={styles.servicesRow}>
            <ServiceTile
              variant="flights"
              label="Flights"
              onPress={() => router.push('/services/flights')}
            />
            <ServiceTile
              variant="electricity"
              label="Electricity"
              onPress={() => router.push('/services/electricity')}
            />
            <ServiceTile
              variant="airtime"
              label="Airtime"
              onPress={() => router.push('/services/airtime')}
            />
            <ServiceTile
              variant="data"
              label="Data"
              onPress={() => router.push('/services/data')}
            />
          </View>
        </View>

        <BannerCard variant="referral" onPress={() => router.push('/referrals')} />

        <View style={styles.section}>
          <SectionHeader
            eyebrow="ACTIVITY"
            title="Recent transactions"
            linkLabel="See all"
            onLinkPress={() => router.push('/transactions')}
          />
          {activity.loading && !activity.data ? (
            <View style={styles.transactionList}>
              <RowSkeleton />
              <RowSkeleton />
              <RowSkeleton />
            </View>
          ) : activity.error ? (
            <ErrorState title="Couldn't load activity" onRetry={activity.reload} />
          ) : activity.data && activity.data.length === 0 ? (
            <EmptyState
              icon="receipt"
              title="No transactions yet"
              caption="Your recent activity will show up here."
            />
          ) : (
            <View style={styles.transactionList}>
              {activity.data?.slice(0, RECENT_COUNT).map((transaction) => (
                <TransactionRow
                  key={transaction.id}
                  transaction={transaction}
                  onPress={() => router.push(`/transactions/${transaction.id}`)}
                />
              ))}
            </View>
          )}
        </View>

        <View style={styles.secureNote}>
          <View style={styles.secureIconTile}>
            <Icon name="shield-check" size={22} color={colors.green[700]} />
          </View>
          <View style={styles.secureText}>
            <Text style={styles.secureTitle}>Protected by Daniruk Secure</Text>
            <Text style={styles.secureCaption}>
              Every transaction is monitored around the clock.
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.surface.base,
  },
  content: {
    paddingHorizontal: screenPadding,
    paddingTop: spacing[2],
    paddingBottom: spacing[10],
    gap: spacing[6],
  },
  greetingBlock: {
    gap: spacing[1],
  },
  greetingCaption: {
    ...typography.body,
    color: colors.text.muted,
  },
  greetingTitle: {
    ...typography.h1,
    color: colors.text.primary,
  },
  walletSkeleton: {
    height: 200,
    borderRadius: radius.lg,
    backgroundColor: colors.surface.page,
    alignSelf: 'stretch',
  },
  section: {
    gap: spacing[4],
  },
  servicesRow: {
    flexDirection: 'row',
    gap: spacing[3],
  },
  transactionList: {
    gap: spacing[3],
  },
  secureNote: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[3],
    backgroundColor: colors.surface.subtle,
    borderRadius: radius.lg,
    padding: spacing[4],
    alignSelf: 'stretch',
  },
  secureIconTile: {
    width: 44,
    height: 44,
    borderRadius: radius.md,
    backgroundColor: colors.green[50],
    alignItems: 'center',
    justifyContent: 'center',
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
    color: colors.text.muted,
  },
});
