import React, { useState } from 'react';
import { ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AmountInput, Button, ErrorState, Loading, SegmentedToggle, TextField } from '@/components';
import { getDiscos, payBill } from '@/data/services';
import type { ServicePlan, Transaction, Wallet } from '@/data/types';
import { getWallet } from '@/data/wallet';
import { useAsync } from '@/hooks/useAsync';
import { formatNaira } from '@/lib/currency';
import { validateMeterNumber } from '@/lib/validators';

import {
  PayConfirmSheet,
  PaymentSuccess,
  RadioRow,
  ServiceScreenHeader,
  serviceScreenStyles as styles,
  SheetSummary,
  SummaryRow,
} from './serviceShared';

/** Minimum electricity payment (₦500) — a mock product rule. */
export const MIN_ELECTRICITY_KOBO = 50_000;

type MeterType = 'prepaid' | 'postpaid';

const METER_TYPE_OPTIONS = [
  { value: 'prepaid', label: 'Prepaid' },
  { value: 'postpaid', label: 'Postpaid' },
] as const;

/** "Eko Electric (EKEDC)" -> "EKEDC", for ledger titles like "EKEDC Prepaid". */
function discoCode(name: string): string {
  return name.match(/\(([^)]+)\)/)?.[1] ?? name;
}

/**
 * Electricity bill payment (ticket 09): disco picker, validated meter number,
 * Prepaid/Postpaid toggle and ₦ amount (min ₦500, capped at the wallet
 * balance), review + pay confirmation, then an inline success state. Routed
 * via the thin wrapper at `src/app/services/electricity.tsx`.
 */
export function ElectricityScreen() {
  const discos = useAsync(getDiscos);
  const wallet = useAsync(getWallet);

  const loading = (discos.loading && !discos.data) || (wallet.loading && !wallet.data);
  const loadError = discos.error || wallet.error;

  return (
    <SafeAreaView style={styles.screen} edges={['top']}>
      <ServiceScreenHeader title="Pay electricity" />

      {loading ? (
        <Loading label="Loading discos…" />
      ) : loadError || !discos.data || !wallet.data ? (
        <View style={styles.stateContent}>
          <ErrorState
            title="Couldn't load electricity options"
            caption="We couldn't load the discos and your wallet. Please try again."
            onRetry={() => {
              discos.reload();
              wallet.reload();
            }}
          />
        </View>
      ) : (
        <ElectricityForm discos={discos.data} wallet={wallet.data} />
      )}
    </SafeAreaView>
  );
}

function ElectricityForm({ discos, wallet }: { discos: ServicePlan[]; wallet: Wallet }) {
  const [selectedDiscoId, setSelectedDiscoId] = useState(discos[0]?.id ?? null);
  const [meterNumber, setMeterNumber] = useState('');
  const [meterType, setMeterType] = useState<MeterType>('prepaid');
  const [amountKobo, setAmountKobo] = useState<number | null>(null);
  const [completed, setCompleted] = useState<Transaction | null>(null);
  const [confirmVisible, setConfirmVisible] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const disco = discos.find((entry) => entry.id === selectedDiscoId) ?? discos[0];
  const meterTypeLabel = meterType === 'prepaid' ? 'Prepaid' : 'Postpaid';
  const balance = wallet.ngn.balanceKobo;
  const meterError = meterNumber.length > 0 ? validateMeterNumber(meterNumber) : null;
  const amountError =
    amountKobo == null
      ? null
      : amountKobo < MIN_ELECTRICITY_KOBO
        ? `Minimum electricity payment is ${formatNaira(MIN_ELECTRICITY_KOBO, { decimals: false })}`
        : amountKobo > balance
          ? 'Amount exceeds your wallet balance'
          : null;
  const canContinue =
    disco != null &&
    validateMeterNumber(meterNumber) == null &&
    amountKobo != null &&
    amountError == null;

  const handleConfirm = async () => {
    if (!disco || amountKobo == null) return;
    setSubmitting(true);
    setSubmitError(null);
    try {
      const transaction = await payBill({
        type: 'electricity',
        title: `${discoCode(disco.name)} ${meterTypeLabel}`,
        amountKobo,
        meta: { disco: disco.name, meterNumber, meterType: meterTypeLabel },
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
        title="Electricity payment successful"
        caption={`${disco?.name ?? ''} ${meterTypeLabel.toLowerCase()} token for meter ${meterNumber}.`}
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
        <Text style={styles.fieldLabel}>Select disco</Text>
        {discos.map((entry) => (
          <RadioRow
            key={entry.id}
            testID={`disco-option-${entry.id}`}
            title={entry.name}
            selected={disco?.id === entry.id}
            onPress={() => setSelectedDiscoId(entry.id)}
          />
        ))}
      </View>

      <TextField
        label="Meter number"
        placeholder="e.g. 04512378901"
        value={meterNumber}
        onChangeText={setMeterNumber}
        keyboardType="number-pad"
        error={meterError}
      />

      <SegmentedToggle options={[...METER_TYPE_OPTIONS]} value={meterType} onChange={setMeterType} />

      <View style={styles.fieldGroup}>
        <AmountInput
          label="Amount"
          valueKobo={amountKobo}
          onChangeKobo={setAmountKobo}
          error={amountError}
        />
        <Text style={styles.balanceHint}>
          {`Wallet balance: ${formatNaira(balance)} · Minimum ${formatNaira(MIN_ELECTRICITY_KOBO, { decimals: false })}`}
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
        title="Confirm payment"
        submitting={submitting}
        error={submitError}
        onConfirm={handleConfirm}
        onClose={() => setConfirmVisible(false)}
      >
        {disco && amountKobo != null ? (
          <SheetSummary>
            <SummaryRow label="Disco" value={disco.name} />
            <SummaryRow label="Meter number" value={meterNumber} />
            <SummaryRow label="Meter type" value={meterTypeLabel} />
            <SummaryRow label="Amount" value={formatNaira(amountKobo)} />
          </SheetSummary>
        ) : null}
      </PayConfirmSheet>
    </ScrollView>
  );
}
