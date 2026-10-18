import React, { type ReactNode } from 'react';
import {
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Icon, ScreenHeader, SegmentedToggle } from '@/components';
import { colors, radius, spacing, typography } from '@/theme/tokens';

export type AuthTab = 'login' | 'signup';

export interface AuthScaffoldProps {
  title: string;
  subtitle: string;
  /** Renders the Log in / Sign up toggle synced to the route; omitted on OTP/forgot-password. */
  activeTab?: AuthTab;
  /** Set false on screens that should not offer a back button. */
  showBack?: boolean;
  children: ReactNode;
}

/**
 * Shared auth screen chrome (designs 2.png/5.png): the white rounded sheet on
 * surface.page, ScreenHeader auth variant, gold eyebrow, h1 + gray subtitle,
 * optional segmented toggle, and the bank-grade encryption lock note.
 */
export function AuthScaffold({
  title,
  subtitle,
  activeTab,
  showBack = true,
  children,
}: AuthScaffoldProps) {
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const handleTabChange = (tab: AuthTab) => {
    if (tab === activeTab) return;
    router.replace(tab === 'login' ? '/(auth)/login' : '/(auth)/signup');
  };

  return (
    <View style={[styles.page, { paddingTop: insets.top }]}>
      <StatusBar style="dark" />
      <View style={styles.sheet}>
        <KeyboardAvoidingView
          style={styles.flex}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          <ScrollView
            style={styles.flex}
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <Pressable onPress={Keyboard.dismiss} accessible={false}>
              <ScreenHeader
                variant="auth"
                onBack={showBack && router.canGoBack() ? () => router.back() : undefined}
              />
              <View style={styles.heading}>
                <Text style={styles.eyebrow}>Welcome to Daniruk</Text>
                <Text style={styles.title}>{title}</Text>
                <Text style={styles.subtitle}>{subtitle}</Text>
              </View>
              {activeTab ? (
                <SegmentedToggle
                  options={[
                    { value: 'login', label: 'Log in' },
                    { value: 'signup', label: 'Sign up' },
                  ]}
                  value={activeTab}
                  onChange={handleTabChange}
                />
              ) : null}
              <View style={styles.body}>{children}</View>
              <View style={styles.lockNote}>
                <Icon name="lock" size={18} color={colors.gold[700]} />
                <Text style={styles.lockNoteText}>
                  Your information is protected with bank-grade encryption.
                </Text>
              </View>
            </Pressable>
          </ScrollView>
        </KeyboardAvoidingView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  page: {
    flex: 1,
    backgroundColor: colors.surface.page,
  },
  sheet: {
    flex: 1,
    backgroundColor: colors.surface.card,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
  },
  flex: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: spacing[6],
    paddingTop: spacing[3],
    paddingBottom: spacing[10],
  },
  heading: {
    marginTop: spacing[8],
    marginBottom: spacing[8],
    gap: spacing[2],
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
  body: {
    marginTop: spacing[8],
    gap: spacing[5],
  },
  lockNote: {
    marginTop: spacing[8],
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[3],
    backgroundColor: colors.surface.subtle,
    borderRadius: radius.md,
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[4],
  },
  lockNoteText: {
    flex: 1,
    ...typography.caption,
    color: colors.text.body,
  },
});
