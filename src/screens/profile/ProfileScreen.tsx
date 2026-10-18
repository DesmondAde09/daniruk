import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useSession } from '@/auth/SessionProvider';
import { Avatar, BottomSheet, Button, ListItem, Loading, useToast } from '@/components';
import { cardPadding, cardShadow, colors, radius, screenPadding, spacing, typography } from '@/theme/tokens';

const MENU_ITEMS = [
  { icon: 'user', label: 'Edit profile' },
  { icon: 'shield', label: 'Security' },
  { icon: 'help-circle', label: 'Support' },
] as const;

/**
 * Profile tab (ticket 10): identity header, account menu, log out.
 * Routed via the thin wrapper at `src/app/(tabs)/profile.tsx`. The menu rows
 * are themed placeholders (SPEC resolution 9) — they surface a toast instead
 * of navigating to screens the mock doesn't have. Signing out clears the mock
 * session; the root auth gate then redirects to onboarding.
 */
export function ProfileScreen() {
  const { user, signOut } = useSession();
  const toast = useToast();
  const [confirmVisible, setConfirmVisible] = useState(false);
  const [signingOut, setSigningOut] = useState(false);

  if (!user) {
    return (
      <SafeAreaView style={styles.screen} edges={['top']}>
        <Loading label="Loading profile…" />
      </SafeAreaView>
    );
  }

  const handleSignOut = async () => {
    setSigningOut(true);
    try {
      await signOut();
    } finally {
      setSigningOut(false);
      setConfirmVisible(false);
    }
  };

  return (
    <SafeAreaView style={styles.screen} edges={['top']}>
      <ScrollView
        style={styles.screen}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.title}>Profile</Text>

        <View style={styles.identityCard}>
          <Avatar initials={user.avatarInitials} size={64} />
          <Text style={styles.name}>{user.fullName}</Text>
          <Text style={styles.email}>{user.email}</Text>
        </View>

        <View style={styles.menuCard}>
          {MENU_ITEMS.map((item) => (
            <ListItem
              key={item.label}
              icon={item.icon}
              label={item.label}
              onPress={() => toast.show(`${item.label} is coming soon`)}
            />
          ))}
        </View>

        <View style={styles.menuCard}>
          <ListItem
            icon="log-out"
            label="Log out"
            destructive
            onPress={() => setConfirmVisible(true)}
          />
        </View>
      </ScrollView>

      <BottomSheet
        visible={confirmVisible}
        onClose={() => (signingOut ? null : setConfirmVisible(false))}
        title="Log out of Daniruk?"
        actions={
          <>
            <Button title="Log out" loading={signingOut} onPress={handleSignOut} />
            <Button
              title="Cancel"
              variant="ghost"
              disabled={signingOut}
              onPress={() => setConfirmVisible(false)}
            />
          </>
        }
      >
        <Text style={styles.sheetCopy}>
          You can sign back in anytime with your email and password.
        </Text>
      </BottomSheet>
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
    paddingTop: spacing[4],
    paddingBottom: spacing[10],
    gap: spacing[5],
  },
  title: {
    ...typography.h1,
    color: colors.text.primary,
  },
  identityCard: {
    alignItems: 'center',
    gap: spacing[2],
    backgroundColor: colors.surface.card,
    borderRadius: radius.lg,
    padding: cardPadding,
    ...cardShadow(),
  },
  name: {
    ...typography.h2,
    color: colors.text.primary,
  },
  email: {
    ...typography.body,
    color: colors.text.body,
  },
  menuCard: {
    backgroundColor: colors.surface.card,
    borderRadius: radius.lg,
    paddingHorizontal: cardPadding,
    paddingVertical: spacing[2],
    ...cardShadow(),
  },
  sheetCopy: {
    ...typography.body,
    color: colors.text.body,
  },
});
