import { router } from 'expo-router';
import React, { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button, ErrorState, Icon, IconButton, Loading, TextField } from '@/components';
import { componentColors } from '@/components/palette';
import { addBankAccount, getBanks, resolveBankAccountName } from '@/data/wallet';
import { useAsync } from '@/hooks/useAsync';
import { validateAccountNumber } from '@/lib/validators';
import { cardShadow, colors, hitTarget, radius, screenPadding, spacing, typography } from '@/theme/tokens';

/**
 * Add bank account (ticket 08): bank picker + 10-digit account number, then a
 * mock "resolve account name" step before saving. Routed via the thin wrapper
 * at `src/app/wallet/add-bank-account.tsx`.
 */
export function AddBankAccountScreen() {
  const banks = useAsync(getBanks);

  return (
    <SafeAreaView style={styles.screen} edges={['top']}>
      <View style={styles.header}>
        <IconButton
          icon="chevron-left"
          variant="outline"
          onPress={() => router.back()}
          accessibilityLabel="Go back"
        />
        <Text style={styles.headerTitle}>Add bank account</Text>
        <View style={styles.headerSpacer} />
      </View>

      {banks.loading && !banks.data ? (
        <Loading label="Loading banks…" />
      ) : banks.error || !banks.data ? (
        <View style={styles.stateContent}>
          <ErrorState
            title="Couldn't load banks"
            caption="We couldn't load the bank list. Please try again."
            onRetry={banks.reload}
          />
        </View>
      ) : (
        <AddAccountForm banks={banks.data} />
      )}
    </SafeAreaView>
  );
}

function AddAccountForm({ banks }: { banks: string[] }) {
  const [bankName, setBankName] = useState<string | null>(null);
  const [accountNumber, setAccountNumber] = useState('');
  const [resolvedName, setResolvedName] = useState<string | null>(null);
  const [resolving, setResolving] = useState(false);
  const [saving, setSaving] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const numberError =
    accountNumber.length > 0 ? validateAccountNumber(accountNumber) : null;
  const canContinue = bankName != null && validateAccountNumber(accountNumber) == null;

  const handleResolve = async () => {
    if (bankName == null) return;
    setResolving(true);
    setSubmitError(null);
    try {
      const name = await resolveBankAccountName(bankName, accountNumber);
      setResolvedName(name);
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setResolving(false);
    }
  };

  const handleSave = async () => {
    if (bankName == null) return;
    setSaving(true);
    setSubmitError(null);
    try {
      await addBankAccount({ bankName, accountNumber });
      router.back();
    } catch (err) {
      setSaving(false);
      setSubmitError(err instanceof Error ? err.message : 'Something went wrong');
    }
  };

  if (resolvedName != null) {
    return (
      <View style={styles.resolvedContent}>
        <View style={styles.resolvedCard}>
          <View style={styles.resolvedIcon}>
            <Icon name="check" size={28} color={colors.gold[700]} />
          </View>
          <Text style={styles.resolvedName}>{resolvedName}</Text>
          <Text style={styles.resolvedCaption}>{`${bankName} · ${accountNumber}`}</Text>
        </View>

        {submitError ? <Text style={styles.submitError}>{submitError}</Text> : null}

        <Button title="Save account" loading={saving} onPress={handleSave} />
        <Button
          title="Change details"
          variant="ghost"
          disabled={saving}
          onPress={() => setResolvedName(null)}
        />
      </View>
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
        <Text style={styles.fieldLabel}>Select bank</Text>
        <View style={styles.bankList}>
          {banks.map((bank) => {
            const selected = bank === bankName;
            return (
              <Pressable
                key={bank}
                testID={`bank-option-${bank}`}
                onPress={() => setBankName(bank)}
                accessibilityRole="button"
                accessibilityState={{ selected }}
                style={({ pressed }) => [
                  styles.bankRow,
                  selected && styles.bankRowSelected,
                  pressed && styles.pressed,
                ]}
              >
                <View style={[styles.radio, selected && styles.radioSelected]}>
                  {selected ? <View style={styles.radioDot} /> : null}
                </View>
                <Text style={styles.bankLabel}>{bank}</Text>
              </Pressable>
            );
          })}
        </View>
      </View>

      <TextField
        label="Account number"
        placeholder="10-digit account number"
        value={accountNumber}
        onChangeText={(text) => setAccountNumber(text.replace(/\D/g, '').slice(0, 10))}
        keyboardType="number-pad"
        error={numberError}
      />

      {submitError ? <Text style={styles.submitError}>{submitError}</Text> : null}

      <Button
        title="Continue"
        showArrow
        loading={resolving}
        disabled={!canContinue}
        onPress={handleResolve}
      />
    </ScrollView>
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
  bankList: {
    gap: spacing[2],
  },
  bankRow: {
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
  bankRowSelected: {
    borderColor: colors.gold[700],
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
    borderColor: colors.gold[700],
  },
  radioDot: {
    width: 10,
    height: 10,
    borderRadius: radius.pill,
    backgroundColor: colors.gold[700],
  },
  bankLabel: {
    ...typography.body,
    color: colors.text.primary,
  },
  submitError: {
    ...typography.caption,
    color: colors.status.error,
  },
  pressed: {
    opacity: 0.85,
  },
  resolvedContent: {
    flex: 1,
    paddingHorizontal: screenPadding,
    paddingTop: spacing[6],
    paddingBottom: spacing[10],
    gap: spacing[3],
  },
  resolvedCard: {
    alignItems: 'center',
    gap: spacing[2],
    backgroundColor: colors.surface.card,
    borderRadius: radius.lg,
    padding: spacing[6],
    marginBottom: spacing[3],
    ...cardShadow(),
  },
  resolvedIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.gold[50],
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing[1],
  },
  resolvedName: {
    ...typography.h2,
    color: colors.text.primary,
    textAlign: 'center',
  },
  resolvedCaption: {
    ...typography.body,
    color: colors.text.muted,
  },
});
