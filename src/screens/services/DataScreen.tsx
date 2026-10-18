import React, { useState } from 'react';
import { ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button, ErrorState, Loading, RowSkeleton, TextField } from '@/components';
import { getDataPlans, getNetworks, payBill } from '@/data/services';
import type { ServicePlan, Transaction } from '@/data/types';
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

/**
 * Data bundle purchase (ticket 09): network picker loads that network's plans
 * (name + ₦ price), validated phone, review + pay confirmation, then an inline
 * success state. Routed via the thin wrapper at `src/app/services/data.tsx`.
 */
export function DataScreen() {
  const networks = useAsync(getNetworks);

  return (
    <SafeAreaView style={styles.screen} edges={['top']}>
      <ServiceScreenHeader title="Buy data" />

      {networks.loading && !networks.data ? (
        <Loading label="Loading networks…" />
      ) : networks.error || !networks.data ? (
        <View style={styles.stateContent}>
          <ErrorState
            title="Couldn't load data options"
            caption="We couldn't load the networks. Please try again."
            onRetry={networks.reload}
          />
        </View>
      ) : (
        <DataForm networks={networks.data} />
      )}
    </SafeAreaView>
  );
}

function DataForm({ networks }: { networks: ServicePlan[] }) {
  const [selectedNetworkId, setSelectedNetworkId] = useState(networks[0]?.id ?? null);
  const [selectedPlanId, setSelectedPlanId] = useState<string | null>(null);
  const [phone, setPhone] = useState('');
  const [completed, setCompleted] = useState<Transaction | null>(null);
  const [confirmVisible, setConfirmVisible] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // `useAsync` runs once on mount, so the per-network plan fetch is re-armed
  // through `reload` whenever the selection changes (reload re-invokes the
  // latest closure).
  const plans = useAsync(() =>
    selectedNetworkId ? getDataPlans(selectedNetworkId) : Promise.resolve([]),
  );

  const network = networks.find((entry) => entry.id === selectedNetworkId) ?? networks[0];
  const planList = plans.data ?? [];
  const plan = planList.find((entry) => entry.id === selectedPlanId) ?? null;
  const phoneError = phone.length > 0 ? validateNigerianPhone(phone) : null;
  const canContinue = network != null && plan != null && validateNigerianPhone(phone) == null;

  const handleSelectNetwork = (networkId: string) => {
    if (networkId === selectedNetworkId) return;
    setSelectedNetworkId(networkId);
    setSelectedPlanId(null);
    plans.reload();
  };

  const handleConfirm = async () => {
    if (!network || !plan || plan.priceKobo == null) return;
    setSubmitting(true);
    setSubmitError(null);
    try {
      const transaction = await payBill({
        type: 'data',
        title: `${network.name} Data — ${plan.name.split(' — ')[0]}`,
        amountKobo: plan.priceKobo,
        meta: { network: network.name, plan: plan.name, phone },
      });
      setConfirmVisible(false);
      setSubmitting(false);
      setCompleted(transaction);
    } catch (err) {
      setSubmitting(false);
      setSubmitError(err instanceof Error ? err.message : 'Something went wrong');
    }
  };

  if (completed && network && plan) {
    return (
      <PaymentSuccess
        title="Data purchase successful"
        caption={`${plan.name} is on its way to ${phone}.`}
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
            onPress={() => handleSelectNetwork(entry.id)}
          />
        ))}
      </View>

      <View style={styles.fieldGroup}>
        <Text style={styles.fieldLabel}>Select a plan</Text>
        {plans.loading && !plans.data ? (
          <View>
            <RowSkeleton />
            <RowSkeleton />
          </View>
        ) : plans.error ? (
          <ErrorState title="Couldn't load plans" onRetry={plans.reload} />
        ) : (
          planList.map((entry) => (
            <RadioRow
              key={entry.id}
              testID={`plan-option-${entry.id}`}
              title={entry.name}
              trailing={entry.priceKobo != null ? formatNaira(entry.priceKobo) : undefined}
              selected={plan?.id === entry.id}
              onPress={() => setSelectedPlanId(entry.id)}
            />
          ))
        )}
      </View>

      <TextField
        label="Phone number"
        placeholder="e.g. 08034561234"
        value={phone}
        onChangeText={setPhone}
        keyboardType="phone-pad"
        error={phoneError}
      />

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
        {network && plan ? (
          <SheetSummary>
            <SummaryRow label="Network" value={network.name} />
            <SummaryRow label="Plan" value={plan.name} />
            <SummaryRow label="Phone" value={phone} />
            <SummaryRow label="Price" value={formatNaira(plan.priceKobo ?? 0)} />
          </SheetSummary>
        ) : null}
      </PayConfirmSheet>
    </ScrollView>
  );
}
