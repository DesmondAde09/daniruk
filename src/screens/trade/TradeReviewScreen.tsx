import { router, useLocalSearchParams } from 'expo-router';
import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { BottomSheet, Button, ErrorState, IconButton, Loading } from '@/components';
import { componentColors } from '@/components/palette';
import { getGiftCardBrand, getTradeQuote, submitTrade } from '@/data/trade';
import type { GiftCardBrand, TradeQuote } from '@/data/types';
import { useAsync } from '@/hooks/useAsync';
import { formatNaira, formatRate, formatUsd } from '@/lib/currency';
import { cardPadding, cardShadow, colors, radius, screenPadding, spacing, typography } from '@/theme/tokens';

type ReviewParams = {
  brandId: string;
  amountUsd: string;
  region?: string;
  cardCode?: string;
  photoAttached?: string;
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.summaryRow}>
      <Text style={styles.summaryLabel}>{label}</Text>
      <Text style={styles.summaryValue} numberOfLines={2}>
        {value}
      </Text>
    </View>
  );
}

/**
 * Trade flow step 3 (ticket 07): live quote review + confirm sheet.
 * Routed via the thin wrapper at `src/app/trade/review.tsx`.
 */
export function TradeReviewScreen() {
  const params = useLocalSearchParams<ReviewParams>();
  const amountUsd = Number.parseFloat(params.amountUsd);

  const quoteState = useAsync(async () => {
    if (!params.brandId || Number.isNaN(amountUsd)) {
      throw new Error('Missing trade details. Go back and enter an amount.');
    }
    const [brand, quote] = await Promise.all([
      getGiftCardBrand(params.brandId),
      getTradeQuote(params.brandId, amountUsd),
    ]);
    return { brand, quote };
  });

  return (
    <SafeAreaView style={styles.screen} edges={['top']}>
      <View style={styles.header}>
        <IconButton
          icon="chevron-left"
          variant="outline"
          onPress={() => router.back()}
          accessibilityLabel="Go back"
        />
        <Text style={styles.headerTitle}>Review trade</Text>
        <View style={styles.headerSpacer} />
      </View>

      {quoteState.loading && !quoteState.data ? (
        <Loading label="Getting your rate…" />
      ) : quoteState.error || !quoteState.data ? (
        <View style={styles.stateContent}>
          <ErrorState
            title="Couldn't get a quote"
            caption={quoteState.error ?? 'Please go back and try again.'}
            onRetry={quoteState.reload}
          />
        </View>
      ) : (
        <ReviewBody
          brand={quoteState.data.brand}
          quote={quoteState.data.quote}
          region={params.region}
          cardCode={params.cardCode}
          photoAttached={params.photoAttached === 'true'}
        />
      )}
    </SafeAreaView>
  );
}

function ReviewBody({
  brand,
  quote,
  region,
  cardCode,
  photoAttached,
}: {
  brand: GiftCardBrand;
  quote: TradeQuote;
  region?: string;
  cardCode?: string;
  photoAttached: boolean;
}) {
  const [confirmVisible, setConfirmVisible] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const handleConfirm = async () => {
    setSubmitting(true);
    setSubmitError(null);
    try {
      const transaction = await submitTrade({
        brandId: brand.id,
        amountUsd: quote.amountUsd,
        ...(cardCode ? { cardCode } : {}),
      });
      router.replace({
        pathname: '/trade/success',
        params: {
          transactionId: transaction.id,
          amountKobo: String(transaction.amountKobo),
          brandName: brand.name,
        },
      });
    } catch (err) {
      setSubmitting(false);
      setSubmitError(err instanceof Error ? err.message : 'Something went wrong');
    }
  };

  return (
    <>
      <ScrollView
        style={styles.screen}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.payoutCard}>
          <Text style={styles.payoutEyebrow}>You&rsquo;ll receive</Text>
          <Text style={styles.payoutAmount}>{formatNaira(quote.payoutKobo)}</Text>
          <Text style={styles.payoutCaption}>
            {`${formatUsd(quote.amountUsd)} ${brand.name} at ${formatRate(quote.ratePerDollar)}`}
          </Text>
        </View>

        <View style={styles.summaryCard}>
          <SummaryRow label="Brand" value={brand.name} />
          <SummaryRow label="Card country" value={region ?? 'United States — USD'} />
          <SummaryRow label="Card value" value={formatUsd(quote.amountUsd)} />
          <SummaryRow label="Rate" value={formatRate(quote.ratePerDollar)} />
          <SummaryRow label="Card code" value={cardCode ?? 'Not provided'} />
          <SummaryRow label="Card photo" value={photoAttached ? 'Attached' : 'Not attached'} />
          <SummaryRow label="Payout" value={formatNaira(quote.payoutKobo)} />
        </View>

        <Button title="Confirm trade" showArrow onPress={() => setConfirmVisible(true)} />
      </ScrollView>

      <BottomSheet
        visible={confirmVisible}
        onClose={() => (submitting ? null : setConfirmVisible(false))}
        title="Confirm your trade"
        actions={
          <>
            <Button title="Confirm & get paid" loading={submitting} onPress={handleConfirm} />
            <Button
              title="Cancel"
              variant="ghost"
              disabled={submitting}
              onPress={() => setConfirmVisible(false)}
            />
          </>
        }
      >
        <Text style={styles.sheetCopy}>
          {`You're selling a ${formatUsd(quote.amountUsd)} ${brand.name} for ${formatNaira(
            quote.payoutKobo,
          )}. The Naira lands in your wallet immediately.`}
        </Text>
        {submitError ? <Text style={styles.sheetError}>{submitError}</Text> : null}
      </BottomSheet>
    </>
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
    gap: spacing[5],
  },
  payoutCard: {
    alignItems: 'center',
    gap: spacing[2],
    backgroundColor: colors.green[800],
    borderRadius: radius.lg,
    padding: cardPadding,
    ...cardShadow(),
  },
  payoutEyebrow: {
    ...typography.eyebrow,
    color: colors.lime[400],
  },
  payoutAmount: {
    ...typography.balance,
    color: colors.text.inverse,
  },
  payoutCaption: {
    ...typography.body,
    color: componentColors.mutedOnDark,
    textAlign: 'center',
  },
  summaryCard: {
    backgroundColor: colors.surface.card,
    borderRadius: radius.lg,
    padding: cardPadding,
    gap: spacing[4],
    ...cardShadow(),
  },
  summaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing[4],
  },
  summaryLabel: {
    ...typography.body,
    color: colors.text.muted,
  },
  summaryValue: {
    ...typography.bodyMedium,
    color: colors.text.primary,
    flexShrink: 1,
    textAlign: 'right',
  },
  sheetCopy: {
    ...typography.body,
    color: colors.text.body,
  },
  sheetError: {
    ...typography.caption,
    color: colors.status.error,
    marginTop: spacing[2],
  },
});
