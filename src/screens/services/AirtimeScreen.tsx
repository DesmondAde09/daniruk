import React, { useState } from 'react';
import { ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AmountInput, Button, ErrorState, Loading, TextField } from '@/components';
import { getNetworks, payBill } from '@/data/services';
import type { ServicePlan, Transaction, Wallet } from '@/data/types';
import { getWallet } from '@/data/wallet';
import { useAsync } from '@/hooks/useAsync';
import { formatNaira } from '@/lib/currency';
import { validateNigerianPhone } from '@/lib/validators';

import {
  PayConfirmSheet,
  PaymentSuccess,
  RadioRow,
  ServiceScreenHeader,
  serviceScreenStyles as styles,
  SheetSummary,
  SummaryRow,
} from './serviceShared';

/** Minimum airtime purchase (₦50) — a mock product rule. */
export const MIN_AIRTIME_KOBO = 5_000;

/**
 * Airtime top-up (ticket 09): network picker, validated phone and ₦ amount
 * (min ₦50, capped at the wallet balance), review + pay confirmation, then an
 * inline success state. Routed via the thin wrapper at
 * `src/app/services/airtime.tsx`.
 */
export function AirtimeScreen() {
  const networks = useAsync(getNetworks);
  const wallet = useAsync(getWallet);

  const loading = (networks.loading && !networks.data) || (wallet.loading && !wallet.data);
  const loadError = networks.error || wallet.error;

  return (
    <SafeAreaView style={styles.screen} edges={['top']}>
      <ServiceScreenHeader title="Buy airtime" />

      {loading ? (
        <Loading label="Loading networks…" />
      ) : loadError || !networks.data || !wallet.data ? (
        <View style={styles.stateContent}>
          <ErrorState
            title="Couldn't load airtime options"
            caption="We couldn't load the networks and your wallet. Please try again."
            onRetry={() => {
              networks.reload();
              wallet.reload();
            }}
          />
        </View>
      ) : (
        <AirtimeForm networks={networks.data} wallet={wallet.data} />
      )}
    </SafeAreaView>
  );
}

function AirtimeForm({ networks, wallet }: { networks: ServicePlan[]; wallet: Wallet }) {
  const [selectedNetworkId, setSelectedNetworkId] = useState(networks[0]?.id ?? null);
  const [phone, setPhone] = useState('');
  const [amountKobo, setAmountKobo] = useState<number | null>(null);
  const [completed, setCompleted] = useState<Transaction | null>(null);
  const [confirmVisible, setConfirmVisible] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const network = networks.find((entry) => entry.id === selectedNetworkId) ?? networks[0];
  const balance = wallet.ngn.balanceKobo;
  const phoneError = phone.length > 0 ? validateNigerianPhone(phone) : null;
  const amountError =
    amountKobo == null
      ? null
      : amountKobo < MIN_AIRTIME_KOBO
        ? `Minimum airtime purchase is ${formatNaira(MIN_AIRTIME_KOBO, { decimals: false })}`
        : amountKobo > balance
          ? 'Amount exceeds your wallet balance'
          : null;
  const canContinue =
    network != null &&
    validateNigerianPhone(phone) == null &&
    amountKobo != null &&
    amountError == null;

  const handleConfirm = async () => {
    if (!network || amountKobo == null) return;
    setSubmitting(true);
    setSubmitError(null);
    try {
      const transaction = await payBill({
        type: 'airtime',
        title: `${network.name} Airtime`,
        amountKobo,
        meta: { network: network.name, phone },
      });
      setConfirmVisible(false);
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
        title="Airtime top-up successful"
        caption={`${network?.name ?? ''} airtime is on its way to ${phone}.`}
        transaction={completed}
      />
    );
  }

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
    >
      <View style={styles.fieldGroup}>
        <Text style={styles.fieldLabel}>Select network</Text>
        {networks.map((entry) => (
          <RadioRow
            key={entry.id}
            testID={`network-option-${entry.id}`}
            title={entry.name}
            selected={network?.id === entry.id}
            onPress={() => setSelectedNetworkId(entry.id)}
          />
        ))}
      </View>

      <TextField
        label="Phone number"
        placeholder="e.g. 08034561234"
        value={phone}
        onChangeText={setPhone}
        keyboardType="phone-pad"
        error={phoneError}
      />

      <View style={styles.fieldGroup}>
        <AmountInput
          label="Amount"
          valueKobo={amountKobo}
          onChangeKobo={setAmountKobo}
          error={amountError}
        />
        <Text style={styles.balanceHint}>
          {`Wallet balance: ${formatNaira(balance)} · Minimum ${formatNaira(MIN_AIRTIME_KOBO, { decimals: false })}`}
        </Text>
      </View>

      <Button
        title="Continue"
        showArrow
        disabled={!canContinue}
        onPress={() => setConfirmVisible(true)}
      />

      <PayConfirmSheet
        visible={confirmVisible}
        title="Confirm purchase"
        submitting={submitting}
        error={submitError}
        onConfirm={handleConfirm}
        onClose={() => setConfirmVisible(false)}
      >
        {network && amountKobo != null ? (
          <SheetSummary>
            <SummaryRow label="Network" value={network.name} />
            <SummaryRow label="Phone" value={phone} />
            <SummaryRow label="Amount" value={formatNaira(amountKobo)} />
          </SheetSummary>
        ) : null}
      </PayConfirmSheet>
    </ScrollView>
  );
}
