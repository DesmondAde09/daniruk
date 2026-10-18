import React, { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AmountInput, Button, ErrorState, Icon, Loading, useToast } from '@/components';
import { componentColors } from '@/components/palette';
import type { DepositAccount, Transaction } from '@/data/types';
import { confirmNgnDeposit, getDepositAccount, MIN_NGN_DEPOSIT_KOBO } from '@/data/wallet';
import { useAsync } from '@/hooks/useAsync';
import { copyToClipboard } from '@/lib/clipboard';
import { formatNaira } from '@/lib/currency';
import { PaymentSuccess, ServiceScreenHeader, serviceScreenStyles, SummaryRow } from '@/screens/services/serviceShared';
import { cardPadding, cardShadow, colors, radius, screenPadding, spacing, typography } from '@/theme/tokens';

/** "8129460173" -> "8129 460 173" (design grouping). */
function groupAccountNumber(accountNumber: string): string {
  return accountNumber.replace(/(\d{4})(\d{3})(\d{3})/, '$1 $2 $3');
}

/** Generous mock ceiling so the field can validate max like the other flows. */
const MAX_NGN_DEPOSIT_KOBO = 1_000_000_000; // ₦10,000,000

/**
 * Add money — bank transfer (design some_screens/1.jpg): the user's
 * personalized deposit account, an optional amount to help match the
 * transfer, and the "I've made the transfer" confirmation. Routed via
 * `src/app/wallet/bank-transfer.tsx`.
 */
export function BankTransferDepositScreen() {
  const account = useAsync(getDepositAccount);
  const [completed, setCompleted] = useState<Transaction | null>(null);

  return (
    <SafeAreaView style={serviceScreenStyles.screen} edges={['top']}>
      <ServiceScreenHeader title="Bank transfer" />

      {completed ? (
        <PaymentSuccess
          title="Top-up successful"
          caption="Your NGN wallet has been credited."
          transaction={completed}
        />
      ) : account.loading && !account.data ? (
        <Loading label="Loading account details…" />
      ) : account.error || !account.data ? (
        <View style={serviceScreenStyles.stateContent}>
          <ErrorState
            title="Couldn't load account details"
            caption="We couldn't load your deposit account. Please try again."
            onRetry={account.reload}
          />
        </View>
      ) : (
        <DepositBody account={account.data} onCompleted={setCompleted} />
      )}
    </SafeAreaView>
  );
}

function DepositBody({
  account,
  onCompleted,
}: {
  account: DepositAccount;
  onCompleted: (transaction: Transaction) => void;
}) {
  const toast = useToast();
  const [amountKobo, setAmountKobo] = useState<number | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const canConfirm = amountKobo != null && amountKobo >= MIN_NGN_DEPOSIT_KOBO;

  const handleCopy = async () => {
    await copyToClipboard(account.accountNumber);
    toast.show('Account number copied');
  };

  const handleConfirm = async () => {
    if (amountKobo == null) return;
    setSubmitting(true);
    setSubmitError(null);
    try {
      const transaction = await confirmNgnDeposit(amountKobo);
      onCompleted(transaction);
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <ScrollView
      style={serviceScreenStyles.screen}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
    >
      <View style={styles.heading}>
        <Text style={styles.eyebrow}>Your personal account</Text>
        <Text style={styles.title}>Transfer to your Daniruk account</Text>
        <Text style={styles.subtitle}>
          Use the account details below from any Nigerian bank. Your wallet will be credited
          automatically.
        </Text>
      </View>

      <View style={styles.accountCard}>
        <View style={styles.bankRow}>
          <View style={styles.bankBadge}>
            <Text style={styles.bankBadgeLetter}>{account.bankName[0]}</Text>
          </View>
          <View style={styles.bankText}>
            <Text style={styles.bankEyebrow}>Powered by</Text>
            <Text style={styles.bankName}>{account.bankName}</Text>
          </View>
          <View style={styles.activePill}>
            <View style={styles.activeDot} />
            <Text style={styles.activeLabel}>Active</Text>
          </View>
        </View>

        <View style={styles.accountNumberRow}>
          <View style={styles.accountNumberText}>
            <Text style={styles.fieldEyebrow}>Account number</Text>
            <Text style={styles.accountNumber}>{groupAccountNumber(account.accountNumber)}</Text>
          </View>
          <Pressable
            testID="copy-account-number"
            onPress={handleCopy}
            accessibilityRole="button"
            style={({ pressed }) => [styles.copyButton, pressed && styles.pressed]}
          >
            <Icon name="copy" size={16} color={colors.text.inverse} />
            <Text style={styles.copyLabel}>Copy</Text>
          </Pressable>
        </View>

        <View style={styles.accountNameBlock}>
          <Text style={styles.fieldEyebrow}>Account name</Text>
          <Text style={styles.accountName}>{account.accountName}</Text>
        </View>
      </View>

      <View style={styles.infoRow}>
        <Icon name="info" size={18} color={colors.gold[700]} />
        <Text style={styles.infoText}>
          This account is unique to you and does not expire. Transfers from third-party
          accounts may require verification.
        </Text>
      </View>

      <View style={styles.amountCard}>
        <AmountInput
          label="How much are you transferring?"
          valueKobo={amountKobo}
          onChangeKobo={setAmountKobo}
          minKobo={MIN_NGN_DEPOSIT_KOBO}
          maxKobo={MAX_NGN_DEPOSIT_KOBO}
        />
        <Text style={styles.amountHint}>This helps us identify your payment faster.</Text>
      </View>

      {amountKobo != null && amountKobo >= MIN_NGN_DEPOSIT_KOBO ? (
        <View style={styles.summaryCard}>
          <SummaryRow label="Transfer amount" value={formatNaira(amountKobo)} />
          <SummaryRow label="Daniruk fee" value="FREE" />
          <SummaryRow label="Expected wallet credit" value={formatNaira(amountKobo)} />
        </View>
      ) : null}

      <View style={styles.footer}>
        <Button
          title="I've made the transfer"
          loading={submitting}
          disabled={!canConfirm}
          onPress={handleConfirm}
        />
        {submitError ? <Text style={styles.submitError}>{submitError}</Text> : null}
        <Text style={styles.arrivalHint}>Most transfers arrive in under 2 minutes</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: screenPadding,
    paddingTop: spacing[4],
    paddingBottom: spacing[10],
    gap: spacing[5],
  },
  heading: {
    gap: spacing[1],
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
  accountCard: {
    backgroundColor: colors.gold[800],
    borderRadius: radius.lg,
    padding: cardPadding,
    gap: spacing[5],
    ...cardShadow(),
  },
  bankRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[3],
  },
  bankBadge: {
    width: 44,
    height: 44,
    borderRadius: radius.md,
    backgroundColor: colors.purple[100],
    alignItems: 'center',
    justifyContent: 'center',
  },
  bankBadgeLetter: {
    ...typography.h2,
    color: colors.purple[600],
  },
  bankText: {
    flex: 1,
    gap: spacing[1],
  },
  bankEyebrow: {
    ...typography.eyebrow,
    color: componentColors.mutedOnDark,
  },
  bankName: {
    ...typography.bodyMedium,
    color: colors.text.inverse,
  },
  activePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[1],
    backgroundColor: colors.surface.card,
    borderRadius: radius.pill,
    paddingHorizontal: spacing[3],
    paddingVertical: spacing[1],
  },
  activeDot: {
    width: 8,
    height: 8,
    borderRadius: radius.pill,
    backgroundColor: colors.gold[700],
  },
  activeLabel: {
    ...typography.caption,
    color: colors.text.primary,
  },
  accountNumberRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing[3],
  },
  accountNumberText: {
    gap: spacing[1],
    flexShrink: 1,
  },
  fieldEyebrow: {
    ...typography.eyebrow,
    color: componentColors.mutedOnDark,
  },
  accountNumber: {
    ...typography.h1,
    letterSpacing: 1,
    color: colors.accent[400],
  },
  copyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[1],
    borderWidth: 1,
    borderColor: componentColors.borderOnDark,
    borderRadius: radius.md,
    paddingHorizontal: spacing[3],
    paddingVertical: spacing[2],
  },
  copyLabel: {
    ...typography.label,
    color: colors.text.inverse,
  },
  accountNameBlock: {
    gap: spacing[1],
  },
  accountName: {
    ...typography.bodyMedium,
    color: colors.text.inverse,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing[2],
  },
  infoText: {
    flex: 1,
    ...typography.caption,
    color: colors.text.body,
  },
  amountCard: {
    backgroundColor: colors.surface.card,
    borderRadius: radius.lg,
    padding: cardPadding,
    gap: spacing[2],
    ...cardShadow(),
  },
  amountHint: {
    ...typography.caption,
    color: colors.text.muted,
  },
  summaryCard: {
    backgroundColor: colors.surface.card,
    borderRadius: radius.lg,
    padding: cardPadding,
    gap: spacing[4],
    ...cardShadow(),
  },
  footer: {
    gap: spacing[2],
  },
  submitError: {
    ...typography.caption,
    color: colors.status.error,
    textAlign: 'center',
  },
  arrivalHint: {
    ...typography.caption,
    color: colors.text.muted,
    textAlign: 'center',
  },
  pressed: {
    opacity: 0.85,
  },
});
