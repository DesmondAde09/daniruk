import React, { useRef, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import {
  AmountInput,
  BottomSheet,
  Button,
  ErrorState,
  Icon,
  Loading,
  TextField,
} from '@/components';
import type { Transaction, TransferRecipient, Wallet } from '@/data/types';
import {
  getBanks,
  getRecentRecipients,
  getWallet,
  MIN_NGN_TRANSFER_KOBO,
  resolveRecipientAccount,
  transferNgn,
} from '@/data/wallet';
import { useAsync } from '@/hooks/useAsync';
import { formatNaira } from '@/lib/currency';
import { validateAccountNumber } from '@/lib/validators';
import {
  PaymentSuccess,
  RadioRow,
  ServiceScreenHeader,
  serviceScreenStyles,
  SheetSummary,
  SummaryRow,
} from '@/screens/services/serviceShared';
import { colors, radius, screenPadding, spacing, typography } from '@/theme/tokens';

/**
 * Transfer money (ticket 13): NGN to any Nigerian bank account in the Nigerian
 * idiom — searchable bank picker, 10-digit NUBAN with automatic name enquiry,
 * amount validated against minimum and balance plus an optional remark, a
 * review sheet, and an inline success state. Routed via the thin wrapper at
 * `src/app/wallet/transfer.tsx`.
 */
export function TransferScreen() {
  const request = useAsync(() => Promise.all([getBanks(), getWallet(), getRecentRecipients()]));

  return (
    <SafeAreaView style={serviceScreenStyles.screen} edges={['top']}>
      <ServiceScreenHeader title="Transfer money" />

      {request.loading && !request.data ? (
        <Loading label="Loading transfer…" />
      ) : request.error || !request.data ? (
        <View style={serviceScreenStyles.stateContent}>
          <ErrorState
            title="Couldn't load transfer"
            caption="We couldn't load banks and your balance. Please try again."
            onRetry={request.reload}
          />
        </View>
      ) : (
        <TransferForm
          banks={request.data[0]}
          wallet={request.data[1]}
          recipients={request.data[2]}
        />
      )}
    </SafeAreaView>
  );
}

function TransferForm({
  banks,
  wallet,
  recipients,
}: {
  banks: string[];
  wallet: Wallet;
  recipients: TransferRecipient[];
}) {
  const [bankQuery, setBankQuery] = useState('');
  const [bank, setBank] = useState<string | null>(null);
  const [accountNumber, setAccountNumber] = useState('');
  const [verifying, setVerifying] = useState(false);
  const [verifiedName, setVerifiedName] = useState<string | null>(null);
  const [verifyError, setVerifyError] = useState<string | null>(null);
  const [amountKobo, setAmountKobo] = useState<number | null>(null);
  const [remark, setRemark] = useState('');
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [completed, setCompleted] = useState<Transaction | null>(null);

  const balance = wallet.ngn.balanceKobo;
  const filteredBanks = banks.filter((name) =>
    name.toLowerCase().includes(bankQuery.trim().toLowerCase()),
  );

  // Automatic name enquiry, like the Nigerian apps: as soon as a bank and a
  // 10-digit NUBAN are both present, resolve the recipient — no button. The
  // sequence ref guards against stale resolutions landing after the input
  // changed again.
  const verifySeq = useRef(0);
  const runVerification = (bankName: string, number: string) => {
    const seq = ++verifySeq.current;
    setVerifying(true);
    setVerifiedName(null);
    setVerifyError(null);
    resolveRecipientAccount(bankName, number)
      .then((name) => {
        if (seq === verifySeq.current) {
          setVerifiedName(name);
        }
      })
      .catch((err: unknown) => {
        if (seq === verifySeq.current) {
          setVerifyError(err instanceof Error ? err.message : 'Something went wrong');
        }
      })
      .finally(() => {
        if (seq === verifySeq.current) {
          setVerifying(false);
        }
      });
  };
  const clearVerification = () => {
    verifySeq.current += 1;
    setVerifying(false);
    setVerifiedName(null);
    setVerifyError(null);
  };

  const handleBankSelect = (name: string) => {
    setBank(name);
    if (validateAccountNumber(accountNumber) === null) {
      runVerification(name, accountNumber);
    } else {
      clearVerification();
    }
  };

  const handleAccountNumberChange = (text: string) => {
    const cleaned = text.replace(/\D/g, '').slice(0, 10);
    setAccountNumber(cleaned);
    if (bank != null && validateAccountNumber(cleaned) === null) {
      runVerification(bank, cleaned);
    } else {
      clearVerification();
    }
  };

  const canContinue =
    bank != null &&
    verifiedName != null &&
    !verifying &&
    amountKobo != null &&
    amountKobo >= MIN_NGN_TRANSFER_KOBO &&
    amountKobo <= balance;

  const pickRecipient = (recipient: TransferRecipient) => {
    verifySeq.current += 1;
    setVerifying(false);
    setBank(recipient.bankName);
    setAccountNumber(recipient.accountNumber);
    setVerifiedName(recipient.accountName);
    setVerifyError(null);
  };

  const handleConfirm = async () => {
    if (bank == null || verifiedName == null || amountKobo == null) return;
    setSubmitting(true);
    setSubmitError(null);
    try {
      const transaction = await transferNgn({
        bankName: bank,
        accountNumber,
        accountName: verifiedName,
        amountKobo,
        remark: remark.trim() || undefined,
      });
      setConfirmOpen(false);
      setSubmitting(false);
      setCompleted(transaction);
    } catch (err) {
      setSubmitting(false);
      setSubmitError(err instanceof Error ? err.message : 'Something went wrong');
    }
  };

  if (completed) {
    return (
      <PaymentSuccess
        title="Transfer successful"
        caption={`Money sent to ${completed.meta?.accountName ?? 'the recipient'}`}
        transaction={completed}
      />
    );
  }

  return (
    <ScrollView
      style={serviceScreenStyles.screen}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
    >
      {recipients.length > 0 ? (
        <View style={serviceScreenStyles.fieldGroup}>
          <Text style={serviceScreenStyles.fieldLabel}>Recent recipients</Text>
          <View style={styles.recipientList}>
            {recipients.map((recipient) => (
              <Pressable
                key={`${recipient.bankName}|${recipient.accountNumber}`}
                testID={`recipient-option-${recipient.accountNumber}`}
                onPress={() => pickRecipient(recipient)}
                accessibilityRole="button"
                style={({ pressed }) => [styles.recipientRow, pressed && styles.pressed]}
              >
                <View style={styles.recipientIconTile}>
                  <Icon name="landmark" size={20} color={colors.gold[700]} />
                </View>
                <View style={styles.recipientText}>
                  <Text style={styles.recipientName}>{recipient.accountName}</Text>
                  <Text style={styles.recipientCaption}>
                    {`${recipient.bankName} · ${recipient.accountNumber}`}
                  </Text>
                </View>
              </Pressable>
            ))}
          </View>
        </View>
      ) : null}

      <View style={serviceScreenStyles.fieldGroup}>
        <TextField
          label="Search banks"
          placeholder="Bank name"
          value={bankQuery}
          onChangeText={setBankQuery}
        />
        <View style={styles.bankList}>
          {filteredBanks.length === 0 ? (
            <Text style={serviceScreenStyles.balanceHint}>No banks match your search.</Text>
          ) : (
            filteredBanks.map((name) => (
              <RadioRow
                key={name}
                testID={`transfer-bank-option-${name}`}
                title={name}
                selected={bank === name}
                onPress={() => handleBankSelect(name)}
              />
            ))
          )}
        </View>
      </View>

      <View style={serviceScreenStyles.fieldGroup}>
        <TextField
          label="Account number"
          placeholder="0123456789"
          value={accountNumber}
          onChangeText={handleAccountNumberChange}
          keyboardType="number-pad"
          maxLength={10}
        />
        {verifying ? (
          <View style={styles.verifyingRow}>
            <ActivityIndicator color={colors.gold[700]} />
            <Text style={styles.verifyingText}>Verifying account…</Text>
          </View>
        ) : verifyError ? (
          <Text style={styles.verifyError}>{verifyError}</Text>
        ) : verifiedName ? (
          <View style={styles.verifiedCard}>
            <View style={styles.verifiedIcon}>
              <Icon name="check" size={20} color={colors.gold[700]} />
            </View>
            <View style={styles.verifiedText}>
              <Text style={styles.verifiedName}>{verifiedName}</Text>
              <Text style={styles.verifiedCaption}>{`${bank} · ${accountNumber}`}</Text>
            </View>
          </View>
        ) : null}
      </View>

      <View style={serviceScreenStyles.fieldGroup}>
        <AmountInput
          label="Amount"
          valueKobo={amountKobo}
          onChangeKobo={setAmountKobo}
          minKobo={MIN_NGN_TRANSFER_KOBO}
          maxKobo={balance}
        />
        <Text style={serviceScreenStyles.balanceHint}>
          {`Wallet balance: ${formatNaira(balance)}`}
        </Text>
      </View>

      <TextField
        label="Remark (optional)"
        placeholder="What's this for?"
        value={remark}
        onChangeText={setRemark}
      />

      <Button
        title="Continue"
        showArrow
        disabled={!canContinue}
        onPress={() => setConfirmOpen(true)}
      />

      <BottomSheet
        visible={confirmOpen}
        onClose={() => (submitting ? null : setConfirmOpen(false))}
        title="Confirm transfer"
        actions={
          <>
            <Button title="Confirm & send" loading={submitting} onPress={handleConfirm} />
            <Button
              title="Cancel"
              variant="ghost"
              disabled={submitting}
              onPress={() => setConfirmOpen(false)}
            />
          </>
        }
      >
        {bank != null && verifiedName != null && amountKobo != null ? (
          <SheetSummary>
            <SummaryRow label="Recipient" value={verifiedName} />
            <SummaryRow label="Bank" value={bank} />
            <SummaryRow label="Account number" value={accountNumber} />
            <SummaryRow label="Amount" value={formatNaira(amountKobo)} />
            <SummaryRow label="Fee" value="FREE" />
            {remark.trim() ? <SummaryRow label="Remark" value={remark.trim()} /> : null}
          </SheetSummary>
        ) : null}
        {submitError ? <Text style={styles.sheetError}>{submitError}</Text> : null}
      </BottomSheet>
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
  recipientList: {
    gap: spacing[2],
  },
  recipientRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[3],
    backgroundColor: colors.surface.card,
    borderRadius: radius.lg,
    padding: spacing[4],
    alignSelf: 'stretch',
  },
  recipientIconTile: {
    width: 44,
    height: 44,
    borderRadius: radius.md,
    backgroundColor: colors.gold[50],
    alignItems: 'center',
    justifyContent: 'center',
  },
  recipientText: {
    flex: 1,
    gap: spacing[1],
  },
  recipientName: {
    ...typography.bodyMedium,
    color: colors.text.primary,
  },
  recipientCaption: {
    ...typography.caption,
    color: colors.text.muted,
  },
  bankList: {
    gap: spacing[2],
  },
  verifyingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
  },
  verifyingText: {
    ...typography.caption,
    color: colors.text.muted,
  },
  verifyError: {
    ...typography.caption,
    color: colors.status.error,
  },
  verifiedCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[3],
    backgroundColor: colors.gold[50],
    borderRadius: radius.lg,
    padding: spacing[4],
    alignSelf: 'stretch',
  },
  verifiedIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.gold[100],
    alignItems: 'center',
    justifyContent: 'center',
  },
  verifiedText: {
    flex: 1,
    gap: spacing[1],
  },
  verifiedName: {
    ...typography.bodyMedium,
    color: colors.text.primary,
  },
  verifiedCaption: {
    ...typography.caption,
    color: colors.text.muted,
  },
  sheetError: {
    ...typography.caption,
    color: colors.status.error,
    marginTop: spacing[2],
  },
  pressed: {
    opacity: 0.85,
  },
});
