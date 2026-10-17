import { router } from 'expo-router';
import React, { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ErrorState, Icon, IconButton, Loading, SegmentedToggle, useToast } from '@/components';
import { componentColors } from '@/components/palette';
import { getWallet } from '@/data/wallet';
import type { CryptoHolding, Wallet } from '@/data/types';
import { useAsync } from '@/hooks/useAsync';
import { copyToClipboard } from '@/lib/clipboard';
import { formatCrypto } from '@/lib/currency';
import { cardPadding, cardShadow, colors, radius, screenPadding, spacing, typography } from '@/theme/tokens';

type CryptoAsset = CryptoHolding['asset'];

const ASSET_OPTIONS = [
  { value: 'BTC', label: 'Bitcoin (BTC)' },
  { value: 'USDT', label: 'Tether (USDT)' },
] as const;

/**
 * Deterministic pseudo-QR bitmap (5×5 finder-ish pattern) — a themed
 * placeholder only; no real QR dependency in this mock build.
 */
const QR_PATTERN = [
  '1110111',
  '1010101',
  '1110111',
  '0011100',
  '1101011',
  '0110110',
  '1011101',
];

function QrPlaceholder() {
  return (
    <View style={styles.qrFrame} testID="qr-placeholder">
      {QR_PATTERN.map((row, rowIndex) => (
        <View key={rowIndex} style={styles.qrRow}>
          {row.split('').map((cell, columnIndex) => (
            <View
              key={columnIndex}
              style={[styles.qrCell, cell === '1' && styles.qrCellFilled]}
            />
          ))}
        </View>
      ))}
    </View>
  );
}

/**
 * Wallet receive (ticket 08): per-asset address with copy feedback and a
 * QR-style placeholder. Routed via the thin wrapper at
 * `src/app/wallet/receive.tsx`.
 */
export function ReceiveScreen() {
  const wallet = useAsync(getWallet);

  return (
    <SafeAreaView style={styles.screen} edges={['top']}>
      <View style={styles.header}>
        <IconButton
          icon="chevron-left"
          variant="outline"
          onPress={() => router.back()}
          accessibilityLabel="Go back"
        />
        <Text style={styles.headerTitle}>Receive crypto</Text>
        <View style={styles.headerSpacer} />
      </View>

      {wallet.loading && !wallet.data ? (
        <Loading label="Loading your wallet…" />
      ) : wallet.error || !wallet.data ? (
        <View style={styles.stateContent}>
          <ErrorState
            title="Couldn't load your wallet"
            caption="We couldn't load your receiving addresses. Please try again."
            onRetry={wallet.reload}
          />
        </View>
      ) : (
        <ReceiveBody wallet={wallet.data} />
      )}
    </SafeAreaView>
  );
}

function ReceiveBody({ wallet }: { wallet: Wallet }) {
  const toast = useToast();
  const [asset, setAsset] = useState<CryptoAsset>('BTC');
  const holding = wallet.crypto.find((entry) => entry.asset === asset) ?? wallet.crypto[0];

  const handleCopy = async () => {
    await copyToClipboard(holding.address);
    toast.show(`${asset} address copied to clipboard`);
  };

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <SegmentedToggle
        options={[...ASSET_OPTIONS]}
        value={asset}
        onChange={setAsset}
      />

      <View style={styles.addressCard}>
        <QrPlaceholder />
        <Text style={styles.balanceLabel}>Available balance</Text>
        <Text style={styles.balanceValue}>{formatCrypto(holding.balance, holding.asset)}</Text>

        <View style={styles.addressBlock}>
          <Text style={styles.addressLabel}>{`Your ${asset} address`}</Text>
          <Text style={styles.addressValue} numberOfLines={2}>
            {holding.address}
          </Text>
        </View>

        <Pressable
          testID="copy-address-button"
          onPress={handleCopy}
          accessibilityRole="button"
          accessibilityLabel={`Copy ${asset} address`}
          style={({ pressed }) => [styles.copyButton, pressed && styles.pressed]}
        >
          <Icon name="copy" size={18} color={colors.green[700]} />
          <Text style={styles.copyLabel}>Copy address</Text>
        </Pressable>
      </View>

      <View style={styles.noteRow}>
        <Icon name="shield-check" size={20} color={colors.green[700]} />
        <Text style={styles.noteText}>
          {`Only send ${asset} to this address. Funds sent on another network can't be recovered.`}
        </Text>
      </View>
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
  addressCard: {
    alignItems: 'center',
    gap: spacing[3],
    backgroundColor: colors.surface.card,
    borderRadius: radius.lg,
    padding: cardPadding,
    ...cardShadow(),
  },
  qrFrame: {
    backgroundColor: colors.surface.card,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: componentColors.border,
    padding: spacing[3],
    gap: 4,
  },
  qrRow: {
    flexDirection: 'row',
    gap: 4,
  },
  qrCell: {
    width: 20,
    height: 20,
    borderRadius: 2,
    backgroundColor: colors.surface.base,
  },
  qrCellFilled: {
    backgroundColor: colors.green[900],
  },
  balanceLabel: {
    ...typography.caption,
    color: colors.text.muted,
  },
  balanceValue: {
    ...typography.h1,
    color: colors.text.primary,
  },
  addressBlock: {
    alignSelf: 'stretch',
    gap: spacing[1],
    backgroundColor: colors.surface.subtle,
    borderRadius: radius.md,
    padding: spacing[4],
  },
  addressLabel: {
    ...typography.label,
    color: colors.text.muted,
  },
  addressValue: {
    ...typography.bodyMedium,
    color: colors.text.primary,
  },
  copyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing[2],
    alignSelf: 'stretch',
    minHeight: 48,
    borderRadius: radius.md,
    borderWidth: 1.5,
    borderColor: colors.green[700],
  },
  copyLabel: {
    ...typography.button,
    color: colors.green[700],
  },
  pressed: {
    opacity: 0.85,
  },
  noteRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing[3],
    backgroundColor: colors.surface.subtle,
    borderRadius: radius.lg,
    padding: spacing[4],
  },
  noteText: {
    flex: 1,
    ...typography.caption,
    color: colors.text.body,
  },
});
