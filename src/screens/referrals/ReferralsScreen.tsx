import React from 'react';
import { ScrollView, Share, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button, ErrorState, Icon, Loading, useToast } from '@/components';
import { getReferralSummary } from '@/data/referrals';
import type { ReferralSummary } from '@/data/types';
import { useAsync } from '@/hooks/useAsync';
import { copyToClipboard } from '@/lib/clipboard';
import { formatNaira } from '@/lib/currency';
import { ServiceScreenHeader, serviceScreenStyles, SummaryRow } from '@/screens/services/serviceShared';
import { cardPadding, cardShadow, colors, radius, spacing, typography } from '@/theme/tokens';

/**
 * Refer & earn (ticket 10), reached from Home's referral card. Routed via the
 * thin wrapper at `src/app/referrals.tsx`. Copy uses the graceful-fallback
 * clipboard helper; share uses React Native's built-in Share API.
 */
export function ReferralsScreen() {
  const summary = useAsync(getReferralSummary);

  return (
    <SafeAreaView style={serviceScreenStyles.screen} edges={['top']}>
      <ServiceScreenHeader title="Refer & earn" />

      {summary.loading && !summary.data ? (
        <Loading label="Loading referrals…" />
      ) : summary.error || !summary.data ? (
        <View style={serviceScreenStyles.stateContent}>
          <ErrorState
            title="Couldn't load referrals"
            caption="We couldn't load your referral summary. Please try again."
            onRetry={summary.reload}
          />
        </View>
      ) : (
        <ReferralBody summary={summary.data} />
      )}
    </SafeAreaView>
  );
}

function ReferralBody({ summary }: { summary: ReferralSummary }) {
  const toast = useToast();

  const handleCopy = async () => {
    await copyToClipboard(summary.code);
    toast.show('Invite code copied');
  };

  const handleShare = async () => {
    await Share.share({
      message: `Join me on Daniruk — trade gift cards and pay bills in Naira. Use my code ${summary.code} when you sign up.`,
    });
  };

  return (
    <ScrollView
      style={serviceScreenStyles.screen}
      contentContainerStyle={serviceScreenStyles.content}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.codeCard}>
        <Text style={styles.codeEyebrow}>Your invite code</Text>
        <Text style={styles.code}>{summary.code}</Text>
        <Text style={styles.codeCaption}>
          Earn ₦5,000 for every friend who joins and completes their first trade.
        </Text>
        <View style={styles.codeActions}>
          <Button title="Copy code" variant="ghost" onPress={handleCopy} />
          <Button title="Share invite" showArrow onPress={handleShare} />
        </View>
      </View>

      <View style={styles.statsCard}>
        <SummaryRow label="Friends joined" value={String(summary.invitedCount)} />
        <SummaryRow label="Total earned" value={formatNaira(summary.earnedKobo)} />
      </View>

      <View style={styles.howCard}>
        <View style={styles.howRow}>
          <Icon name="gift" size={20} color={colors.purple[600]} />
          <Text style={styles.howText}>
            Your friend signs up with your code and completes a trade.
          </Text>
        </View>
        <View style={styles.howRow}>
          <Icon name="check" size={20} color={colors.purple[600]} />
          <Text style={styles.howText}>₦5,000 lands in your NGN wallet instantly.</Text>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  codeCard: {
    alignItems: 'center',
    gap: spacing[3],
    backgroundColor: colors.purple[200],
    borderRadius: radius.lg,
    padding: cardPadding,
    ...cardShadow(),
  },
  codeEyebrow: {
    ...typography.eyebrow,
    color: colors.purple[600],
  },
  code: {
    ...typography.balance,
    color: colors.text.primary,
    letterSpacing: 2,
  },
  codeCaption: {
    ...typography.body,
    color: colors.text.body,
    textAlign: 'center',
  },
  codeActions: {
    flexDirection: 'row',
    gap: spacing[3],
    marginTop: spacing[2],
  },
  statsCard: {
    backgroundColor: colors.surface.card,
    borderRadius: radius.lg,
    padding: cardPadding,
    gap: spacing[4],
    ...cardShadow(),
  },
  howCard: {
    gap: spacing[3],
    backgroundColor: colors.surface.subtle,
    borderRadius: radius.lg,
    padding: cardPadding,
  },
  howRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing[3],
  },
  howText: {
    flex: 1,
    ...typography.body,
    color: colors.text.body,
  },
});
