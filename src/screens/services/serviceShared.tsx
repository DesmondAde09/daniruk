import { router } from 'expo-router';
import React, { type ReactNode } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { BottomSheet, Button, Icon, IconButton } from '@/components';
import { componentColors } from '@/components/palette';
import type { Transaction } from '@/data/types';
import { formatNaira } from '@/lib/currency';
import { colors, hitTarget, radius, screenPadding, spacing, typography } from '@/theme/tokens';

/**
 * Building blocks shared by the four service flows (ticket 09): the pushed-screen
 * header, radio-row pickers, the review-and-pay confirmation sheet, and the
 * inline payment success state — all lifted from the WithdrawScreen idiom so the
 * flows stay visually identical.
 */

export const serviceScreenStyles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.surface.base,
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
  balanceHint: {
    ...typography.caption,
    color: colors.text.muted,
  },
});

export function ServiceScreenHeader({ title }: { title: string }) {
  return (
    <View style={headerStyles.header}>
      <IconButton
        icon="chevron-left"
        variant="outline"
        onPress={() => router.back()}
        accessibilityLabel="Go back"
      />
      <Text style={headerStyles.headerTitle}>{title}</Text>
      <View style={headerStyles.headerSpacer} />
    </View>
  );
}

const headerStyles = StyleSheet.create({
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
});

export interface RadioRowProps {
  testID: string;
  title: string;
  caption?: string;
  /** Right-aligned content, e.g. a data plan's price. */
  trailing?: string;
  selected: boolean;
  onPress: () => void;
}

/** Radio-row picker option (TradeCardDetailsScreen region-list idiom). */
export function RadioRow({ testID, title, caption, trailing, selected, onPress }: RadioRowProps) {
  return (
    <Pressable
      testID={testID}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityState={{ selected }}
      style={({ pressed }) => [
        radioStyles.row,
        selected && radioStyles.rowSelected,
        pressed && radioStyles.pressed,
      ]}
    >
      <View style={[radioStyles.radio, selected && radioStyles.radioSelected]}>
        {selected ? <View style={radioStyles.radioDot} /> : null}
      </View>
      <View style={radioStyles.text}>
        <Text style={radioStyles.title}>{title}</Text>
        {caption ? <Text style={radioStyles.caption}>{caption}</Text> : null}
      </View>
      {trailing ? <Text style={radioStyles.trailing}>{trailing}</Text> : null}
    </Pressable>
  );
}

const radioStyles = StyleSheet.create({
  row: {
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
  rowSelected: {
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
  text: {
    flex: 1,
    gap: spacing[1],
  },
  title: {
    ...typography.bodyMedium,
    color: colors.text.primary,
  },
  caption: {
    ...typography.caption,
    color: colors.text.muted,
  },
  trailing: {
    ...typography.bodyMedium,
    color: colors.green[700],
  },
  pressed: {
    opacity: 0.85,
  },
});

export function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={summaryStyles.summaryRow}>
      <Text style={summaryStyles.summaryLabel}>{label}</Text>
      <Text style={summaryStyles.summaryValue} numberOfLines={2}>
        {value}
      </Text>
    </View>
  );
}

export function SheetSummary({ children }: { children: ReactNode }) {
  return <View style={summaryStyles.sheetSummary}>{children}</View>;
}

const summaryStyles = StyleSheet.create({
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
});

export interface PayConfirmSheetProps {
  visible: boolean;
  title: string;
  submitting: boolean;
  /** Payment failure message (e.g. insufficient balance), shown inside the sheet. */
  error: string | null;
  onConfirm: () => void;
  onClose: () => void;
  children: ReactNode;
}

/** Review + pay confirmation sheet (WithdrawScreen confirm idiom). */
export function PayConfirmSheet({
  visible,
  title,
  submitting,
  error,
  onConfirm,
  onClose,
  children,
}: PayConfirmSheetProps) {
  return (
    <BottomSheet
      visible={visible}
      onClose={() => (submitting ? null : onClose())}
      title={title}
      actions={
        <>
          <Button title="Confirm & pay" loading={submitting} onPress={onConfirm} />
          <Button title="Cancel" variant="ghost" disabled={submitting} onPress={onClose} />
        </>
      }
    >
      {children}
      {error ? <Text style={sheetStyles.sheetError}>{error}</Text> : null}
    </BottomSheet>
  );
}

const sheetStyles = StyleSheet.create({
  sheetError: {
    ...typography.caption,
    color: colors.status.error,
    marginTop: spacing[2],
  },
});

export interface PaymentSuccessProps {
  title: string;
  caption: string;
  transaction: Transaction;
}

/** Inline success state after a payment lands (WithdrawScreen success idiom). */
export function PaymentSuccess({ title, caption, transaction }: PaymentSuccessProps) {
  return (
    <View style={successStyles.successScreen}>
      <View style={successStyles.successContent}>
        <View style={successStyles.checkCircle}>
          <Icon name="check" size={40} color={colors.green[700]} />
        </View>
        <Text style={successStyles.successTitle}>{title}</Text>
        <Text style={successStyles.successAmount}>
          {formatNaira(Math.abs(transaction.amountKobo))}
        </Text>
        <Text style={successStyles.successCaption}>{caption}</Text>
        <Text style={successStyles.successReference}>{`Reference: ${transaction.reference}`}</Text>
      </View>
      <View style={successStyles.successActions}>
        <Button title="Done" onPress={() => router.back()} />
      </View>
    </View>
  );
}

const successStyles = StyleSheet.create({
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
