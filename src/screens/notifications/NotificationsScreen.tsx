import React, { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { EmptyState, ErrorState, Loading } from '@/components';
import { getNotifications, markAllRead, markRead } from '@/data/notifications';
import type { AppNotification } from '@/data/types';
import { useAsync } from '@/hooks/useAsync';
import { formatRelativeDay } from '@/lib/greeting';
import { ServiceScreenHeader, serviceScreenStyles } from '@/screens/services/serviceShared';
import { colors, hitTarget, radius, screenPadding, spacing, typography } from '@/theme/tokens';

/**
 * Notifications list (ticket 10), opened from Home's bell. Routed via the thin
 * wrapper at `src/app/notifications.tsx`. Read state lives locally after load
 * so taps and "Mark all read" update instantly; Home refetches on focus, which
 * clears the bell badge.
 */
export function NotificationsScreen() {
  const result = useAsync(getNotifications);
  // Local copy takes over after the first read/unread interaction; until then
  // the loaded data renders directly (avoids syncing state in an effect).
  const [overrides, setOverrides] = useState<AppNotification[] | null>(null);
  const items = overrides ?? result.data ?? [];

  const hasUnread = items.some((notification) => !notification.read);

  const handlePress = async (notification: AppNotification) => {
    if (notification.read) return;
    setOverrides(
      items.map((entry) => (entry.id === notification.id ? { ...entry, read: true } : entry)),
    );
    await markRead(notification.id);
  };

  const handleMarkAllRead = async () => {
    setOverrides(items.map((entry) => ({ ...entry, read: true })));
    await markAllRead();
  };

  return (
    <SafeAreaView style={serviceScreenStyles.screen} edges={['top']}>
      <View style={styles.headerRow}>
        <View style={styles.headerTitleWrap}>
          <ServiceScreenHeader title="Notifications" />
        </View>
        {hasUnread ? (
          <Pressable
            onPress={handleMarkAllRead}
            accessibilityRole="button"
            style={styles.markAll}
            hitSlop={spacing[2]}
          >
            <Text style={styles.markAllText}>Mark all read</Text>
          </Pressable>
        ) : null}
      </View>

      {result.loading && !result.data ? (
        <Loading label="Loading notifications…" />
      ) : result.error ? (
        <View style={serviceScreenStyles.stateContent}>
          <ErrorState
            title="Couldn't load notifications"
            caption="We couldn't load your notifications. Please try again."
            onRetry={result.reload}
          />
        </View>
      ) : items.length === 0 ? (
        <View style={serviceScreenStyles.stateContent}>
          <EmptyState
            icon="bell"
            title="No notifications"
            caption="Trades, payments and security alerts will show up here."
          />
        </View>
      ) : (
        <ScrollView
          style={serviceScreenStyles.screen}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
        >
          {items.map((notification) => (
            <Pressable
              key={notification.id}
              testID={`notification-${notification.id}`}
              onPress={() => handlePress(notification)}
              accessibilityRole="button"
              style={({ pressed }) => [
                styles.row,
                !notification.read && styles.rowUnread,
                pressed && styles.rowPressed,
              ]}
            >
              <View style={styles.dotSlot}>
                {!notification.read ? <View style={styles.unreadDot} /> : null}
              </View>
              <View style={styles.rowText}>
                <Text style={[styles.rowTitle, notification.read && styles.rowTitleRead]}>
                  {notification.title}
                </Text>
                <Text style={styles.rowBody}>{notification.body}</Text>
                <Text style={styles.rowTime}>{formatRelativeDay(notification.createdAt)}</Text>
              </View>
            </Pressable>
          ))}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingRight: screenPadding,
  },
  headerTitleWrap: {
    flex: 1,
  },
  markAll: {
    minHeight: hitTarget,
    justifyContent: 'center',
  },
  markAllText: {
    ...typography.bodyMedium,
    color: colors.gold[700],
  },
  list: {
    paddingHorizontal: screenPadding,
    paddingTop: spacing[2],
    paddingBottom: spacing[10],
    gap: spacing[2],
  },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing[2],
    backgroundColor: colors.surface.card,
    borderRadius: radius.lg,
    padding: spacing[4],
  },
  rowUnread: {
    backgroundColor: colors.gold[50],
  },
  rowPressed: {
    opacity: 0.85,
  },
  dotSlot: {
    width: 10,
    paddingTop: spacing[2],
    alignItems: 'center',
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: radius.pill,
    backgroundColor: colors.gold[700],
  },
  rowText: {
    flex: 1,
    gap: spacing[1],
  },
  rowTitle: {
    ...typography.bodyMedium,
    color: colors.text.primary,
  },
  rowTitleRead: {
    color: colors.text.body,
  },
  rowBody: {
    ...typography.body,
    color: colors.text.body,
  },
  rowTime: {
    ...typography.caption,
    color: colors.text.muted,
  },
});
