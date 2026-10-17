import { router, useFocusEffect } from 'expo-router';
import React, { useCallback, useRef, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import {
  AmountInput,
  BottomSheet,
  Button,
  ErrorState,
  Icon,
  IconButton,
  Loading,
  SegmentedToggle,
  TextField,
} from '@/components';
import { componentColors } from '@/components/palette';
import type { BankAccount, CryptoHolding, Transaction, Wallet } from '@/data/types';
import {
  getBankAccounts,
  getWallet,
  MIN_NGN_WITHDRAWAL_KOBO,
  withdrawCrypto,
  withdrawNgnToBank,
} from '@/data/wallet';
import { useAsync } from '@/hooks/useAsync';
import { formatCrypto, formatNaira } from '@/lib/currency';
import { parseCryptoUnits } from '@/lib/crypto';
import { validateCryptoAddress } from '@/lib/validators';
import { colors, hitTarget, radius, screenPadding, spacing, typography } from '@/theme/tokens';

type WithdrawMode = 'bank' | 'crypto';
type CryptoAsset = CryptoHolding['asset'];

const MODE_OPTIONS = [
  { value: 'bank', label: 'Bank account' },
  { value: 'crypto', label: 'Crypto' },
] as const;

const ASSET_OPTIONS = [
  { value: 'BTC', label: 'BTC' },
  { value: 'USDT', label: 'USDT' },
] as const;

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
 * Wallet withdraw (ticket 08): NGN to a saved bank account, or crypto to an
 * external address — both validated and confirmed via bottom sheet, ending in
 * an inline success state. Routed via the thin wrapper at
 * `src/app/wallet/withdraw.tsx`.
 */
export function WithdrawScreen() {
  const wallet = useAsync(getWallet);
  const accounts = useAsync(getBankAccounts);

  // This screen stays mounted while the add-bank-account flow pushes on top;
  // refetch when it regains focus so the new account shows up. The ref skips
  // the first focus, which coincides with the mount fetch.
  const reloadWallet = wallet.reload;
  const reloadAccounts = accounts.reload;
  const firstFocus = useRef(true);
  useFocusEffect(
    useCallback(() => {
      if (firstFocus.current) {
        firstFocus.current = false;
        return;
      }
      reloadWallet();
      reloadAccounts();
    }, [reloadWallet, reloadAccounts]),
  );

  const loading = (wallet.loading && !wallet.data) || (accounts.loading && !accounts.data);
  const loadError = wallet.error || accounts.error;

  return (
    <SafeAreaView style={styles.screen} edges={['top']}>
      <View style={styles.header}>
        <IconButton
          icon="chevron-left"
          variant="outline"
          onPress={() => router.back()}
          accessibilityLabel="Go back"
        />
        <Text style={styles.headerTitle}>Withdraw</Text>
        <View style={styles.headerSpacer} />
      </View>

      {loading ? (
        <Loading label="Loading your wallet…" />
      ) : loadError || !wallet.data || !accounts.data ? (
        <View style={styles.stateContent}>
          <ErrorState
            title="Couldn't load withdrawal options"
            caption="We couldn't load your wallet and bank accounts. Please try again."
            onRetry={() => {
              wallet.reload();
              accounts.reload();
            }}
          />
        </View>
      ) : (
        <WithdrawBody wallet={wallet.data} accounts={accounts.data} />
      )}
    </SafeAreaView>
  );
}

function WithdrawBody({ wallet, accounts }: { wallet: Wallet; accounts: BankAccount[] }) {
  const [mode, setMode] = useState<WithdrawMode>('bank');
  const [completed, setCompleted] = useState<Transaction | null>(null);

  if (completed) {
    return <WithdrawSuccess transaction={completed} />;
  }

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
    >
      <SegmentedToggle options={[...MODE_OPTIONS]} value={mode} onChange={setMode} />
      {mode === 'bank' ? (
        <BankForm wallet={wallet} accounts={accounts} onComplete={setCompleted} />
      ) : (
        <CryptoForm wallet={wallet} onComplete={setCompleted} />
      )}
    </ScrollView>
  );
}

function WithdrawSuccess({ transaction }: { transaction: Transaction }) {
  const isNgn = transaction.currency === 'NGN';
  const amount = isNgn
    ? formatNaira(Math.abs(transaction.amountKobo))
    : (transaction.meta?.cryptoAmount ?? '');
  return (
    <View style={styles.successScreen}>
      <View style={styles.successContent}>
        <View style={styles.checkCircle}>
          <Icon name="check" size={40} color={colors.green[700]} />
        </View>
        <Text style={styles.successTitle}>Withdrawal successful</Text>
        {amount ? <Text style={styles.successAmount}>{amount}</Text> : null}
        <Text style={styles.successCaption}>
          {isNgn
            ? 'The money is on its way to your bank account.'
            : 'Your crypto is on its way to the recipient address.'}
        </Text>
        <Text style={styles.successReference}>{`Reference: ${transaction.reference}`}</Text>
      </View>
      <View style={styles.successActions}>
        <Button title="Done" onPress={() => router.back()} />
      </View>
    </View>
  );
}

function BankForm({
  wallet,
  accounts,
  onComplete,
}: {
  wallet: Wallet;
  accounts: BankAccount[];
  onComplete: (transaction: Transaction) => void;
}) {
  const [selectedAccountId, setSelectedAccountId] = useState<string | null>(null);
  const [amountKobo, setAmountKobo] = useState<number | null>(null);
  const [confirmVisible, setConfirmVisible] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const account = accounts.find((entry) => entry.id === selectedAccountId) ?? accounts[0];
  const balance = wallet.ngn.balanceKobo;
  const amountError =
    amountKobo == null
      ? null
      : amountKobo < MIN_NGN_WITHDRAWAL_KOBO
        ? `Minimum withdrawal is ${formatNaira(MIN_NGN_WITHDRAWAL_KOBO, { decimals: false })}`
        : amountKobo > balance
          ? 'Amount exceeds your wallet balance'
          : null;
  const canContinue = account != null && amountKobo != null && amountError == null;

  const handleConfirm = async () => {
    if (!account || amountKobo == null) return;
    setSubmitting(true);
    setSubmitError(null);
    try {
      const transaction = await withdrawNgnToBank({ accountId: account.id, amountKobo });
      setConfirmVisible(false);
      setSubmitting(false);
      onComplete(transaction);
    } catch (err) {
      setSubmitting(false);
      setSubmitError(err instanceof Error ? err.message : 'Something went wrong');
    }
  };

  return (
    <>
      <View style={styles.fieldGroup}>
        <Text style={styles.fieldLabel}>Select account</Text>
        <View style={styles.accountList}>
          {accounts.map((entry) => {
            const selected = account?.id === entry.id;
            return (
              <Pressable
                key={entry.id}
                testID={`account-option-${entry.id}`}
                onPress={() => setSelectedAccountId(entry.id)}
                accessibilityRole="button"
                accessibilityState={{ selected }}
                style={({ pressed }) => [
                  styles.accountRow,
                  selected && styles.accountRowSelected,
                  pressed && styles.pressed,
                ]}
              >
                <View style={[styles.radio, selected && styles.radioSelected]}>
                  {selected ? <View style={styles.radioDot} /> : null}
                </View>
                <View style={styles.accountText}>
                  <Text style={styles.accountName}>{entry.bankName}</Text>
                  <Text style={styles.accountCaption}>
                    {`${entry.accountNumber} · ${entry.accountName}`}
                  </Text>
                </View>
              </Pressable>
            );
          })}
          <Pressable
            testID="add-bank-account-link"
            onPress={() => router.push('/wallet/add-bank-account')}
            accessibilityRole="button"
            style={({ pressed }) => [styles.addAccountRow, pressed && styles.pressed]}
          >
            <Icon name="plus" size={20} color={colors.green[700]} />
            <Text style={styles.addAccountLabel}>Add a new bank account</Text>
          </Pressable>
        </View>
      </View>

      <View style={styles.fieldGroup}>
        <AmountInput
          label="Amount"
          valueKobo={amountKobo}
          onChangeKobo={setAmountKobo}
          error={amountError}
        />
        <Text style={styles.balanceHint}>
          {`Wallet balance: ${formatNaira(balance)} · Minimum ${formatNaira(MIN_NGN_WITHDRAWAL_KOBO, { decimals: false })}`}
        </Text>
      </View>

      <Button
        title="Continue"
        showArrow
        disabled={!canContinue}
        onPress={() => setConfirmVisible(true)}
      />

      <BottomSheet
        visible={confirmVisible}
        onClose={() => (submitting ? null : setConfirmVisible(false))}
        title="Confirm withdrawal"
        actions={
          <>
            <Button
              title="Confirm & withdraw"
              loading={submitting}
              onPress={handleConfirm}
            />
            <Button
              title="Cancel"
              variant="ghost"
              disabled={submitting}
              onPress={() => setConfirmVisible(false)}
            />
          </>
        }
      >
        {account && amountKobo != null ? (
          <View style={styles.sheetSummary}>
            <SummaryRow label="Bank" value={account.bankName} />
            <SummaryRow label="Account number" value={account.accountNumber} />
            <SummaryRow label="Account name" value={account.accountName} />
            <SummaryRow label="Amount" value={formatNaira(amountKobo)} />
          </View>
        ) : null}
        {submitError ? <Text style={styles.sheetError}>{submitError}</Text> : null}
      </BottomSheet>
    </>
  );
}

function CryptoForm({
  wallet,
  onComplete,
}: {
  wallet: Wallet;
  onComplete: (transaction: Transaction) => void;
}) {
  const [asset, setAsset] = useState<CryptoAsset>('BTC');
  const [address, setAddress] = useState('');
  const [amountText, setAmountText] = useState('');
  const [confirmVisible, setConfirmVisible] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const holding = wallet.crypto.find((entry) => entry.asset === asset) ?? wallet.crypto[0];
  const addressError = address.trim().length > 0 ? validateCryptoAddress(address) : null;
  const units = parseCryptoUnits(amountText);
  const balanceUnits = parseCryptoUnits(holding.balance) ?? 0n;
  const amountError =
    amountText.trim().length === 0
      ? null
      : units == null || units <= 0n
        ? 'Enter a valid amount'
        : units > balanceUnits
          ? `Insufficient ${asset} balance`
          : null;
  const canContinue = validateCryptoAddress(address) == null && amountError == null && units != null && units > 0n;

  const handleConfirm = async () => {
    if (units == null) return;
    setSubmitting(true);
    setSubmitError(null);
    try {
      const transaction = await withdrawCrypto({
        asset,
        address: address.trim(),
        amount: amountText.trim(),
      });
      setConfirmVisible(false);
      setSubmitting(false);
      onComplete(transaction);
    } catch (err) {
      setSubmitting(false);
      setSubmitError(err instanceof Error ? err.message : 'Something went wrong');
    }
  };

  return (
    <>
      <SegmentedToggle options={[...ASSET_OPTIONS]} value={asset} onChange={setAsset} />

      <TextField
        label={`Recipient ${asset} address`}
        placeholder="Paste the wallet address"
        value={address}
        onChangeText={setAddress}
        autoCapitalize="none"
        autoCorrect={false}
        error={addressError}
      />

      <View style={styles.fieldGroup}>
        <TextField
          label={`Amount (${asset})`}
          placeholder="0.00"
          value={amountText}
          onChangeText={setAmountText}
          keyboardType="decimal-pad"
          error={amountError}
        />
        <Text style={styles.balanceHint}>
          {`Available: ${formatCrypto(holding.balance, holding.asset)}`}
        </Text>
      </View>

      <Button
        title="Continue"
        showArrow
        disabled={!canContinue}
        onPress={() => setConfirmVisible(true)}
      />

      <BottomSheet
        visible={confirmVisible}
        onClose={() => (submitting ? null : setConfirmVisible(false))}
        title="Confirm withdrawal"
        actions={
          <>
            <Button
              title="Confirm & withdraw"
              loading={submitting}
              onPress={handleConfirm}
            />
            <Button
              title="Cancel"
              variant="ghost"
              disabled={submitting}
              onPress={() => setConfirmVisible(false)}
            />
          </>
        }
      >
        <View style={styles.sheetSummary}>
          <SummaryRow label="Asset" value={asset} />
          <SummaryRow label="Address" value={address.trim()} />
          <SummaryRow label="Amount" value={formatCrypto(amountText.trim(), asset)} />
        </View>
        <Text style={styles.sheetNote}>
          {'Crypto transfers can\u2019t be reversed. Double-check the address before confirming.'}
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
    width: hitTarget,
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
  fieldGroup: {
    gap: spacing[2],
    alignSelf: 'stretch',
  },
  fieldLabel: {
    ...typography.label,
    color: colors.text.primary,
  },
  accountList: {
    gap: spacing[2],
  },
  accountRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[3],
    minHeight: hitTarget,
    backgroundColor: colors.surface.card,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: componentColors.border,
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[3],
  },
  accountRowSelected: {
    borderColor: colors.green[700],
  },
  radio: {
    width: 20,
    height: 20,
    borderRadius: radius.pill,
    borderWidth: 1.5,
    borderColor: componentColors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioSelected: {
    borderColor: colors.green[700],
  },
  radioDot: {
    width: 10,
    height: 10,
    borderRadius: radius.pill,
    backgroundColor: colors.green[700],
  },
  accountText: {
    flex: 1,
    gap: spacing[1],
  },
  accountName: {
    ...typography.bodyMedium,
    color: colors.text.primary,
  },
  accountCaption: {
    ...typography.caption,
    color: colors.text.muted,
  },
  addAccountRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
    minHeight: hitTarget,
    paddingHorizontal: spacing[2],
  },
  addAccountLabel: {
    ...typography.bodyMedium,
    color: colors.green[700],
  },
  balanceHint: {
    ...typography.caption,
    color: colors.text.muted,
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
  sheetSummary: {
    gap: spacing[4],
  },
  sheetNote: {
    ...typography.caption,
    color: colors.text.muted,
    marginTop: spacing[3],
  },
  sheetError: {
    ...typography.caption,
    color: colors.status.error,
    marginTop: spacing[2],
  },
  pressed: {
    opacity: 0.85,
  },
  successScreen: {
    flex: 1,
  },
  successContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: screenPadding,
    gap: spacing[3],
  },
  checkCircle: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: colors.green[50],
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing[2],
  },
  successTitle: {
    ...typography.h1,
    color: colors.text.primary,
    textAlign: 'center',
  },
  successAmount: {
    ...typography.balance,
    color: colors.green[700],
  },
  successCaption: {
    ...typography.body,
    color: colors.text.body,
    textAlign: 'center',
  },
  successReference: {
    ...typography.caption,
    color: colors.text.muted,
  },
  successActions: {
    paddingHorizontal: screenPadding,
    paddingBottom: spacing[10],
  },
});
