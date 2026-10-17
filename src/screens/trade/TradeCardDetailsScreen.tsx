import { router, useLocalSearchParams } from 'expo-router';
import React, { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button, ErrorState, Icon, IconButton, Loading, TextField } from '@/components';
import { componentColors } from '@/components/palette';
import { getGiftCardBrand } from '@/data/trade';
import type { GiftCardBrand } from '@/data/types';
import { useAsync } from '@/hooks/useAsync';
import { formatRate } from '@/lib/currency';
import { validateAmount } from '@/lib/validators';
import { colors, hitTarget, radius, screenPadding, spacing, typography } from '@/theme/tokens';

import { UsdAmountInput } from './UsdAmountInput';

/**
 * Card issuing country. The mock quote layer is USD-only, so every option is
 * USD-denominated; the selection is carried through the flow as a display
 * label. A real backend would key rates off country + currency.
 */
const REGION_OPTIONS = [
  { id: 'us', label: 'United States — USD' },
  { id: 'ca', label: 'Canada — USD' },
  { id: 'gb', label: 'United Kingdom — USD' },
] as const;

type RegionId = (typeof REGION_OPTIONS)[number]['id'];

/**
 * Trade flow step 2 (ticket 07): card details form for the chosen brand.
 * Routed via the thin wrapper at `src/app/trade/[brandId].tsx`.
 */
export function TradeCardDetailsScreen() {
  const { brandId } = useLocalSearchParams<{ brandId: string }>();
  const brand = useAsync(() => getGiftCardBrand(brandId));

  return (
    <SafeAreaView style={styles.screen} edges={['top']}>
      <View style={styles.header}>
        <IconButton
          icon="chevron-left"
          variant="outline"
          onPress={() => router.back()}
          accessibilityLabel="Go back"
        />
        <Text style={styles.headerTitle}>Card details</Text>
        <View style={styles.headerSpacer} />
      </View>

      {brand.loading && !brand.data ? (
        <Loading label="Loading brand…" />
      ) : brand.error || !brand.data ? (
        <View style={styles.stateContent}>
          <ErrorState
            title="Couldn't load this brand"
            caption="We couldn't load the card details. Please try again."
            onRetry={brand.reload}
          />
        </View>
      ) : (
        <DetailsForm brand={brand.data} />
      )}
    </SafeAreaView>
  );
}

function DetailsForm({ brand }: { brand: GiftCardBrand }) {
  const [regionId, setRegionId] = useState<RegionId>('us');
  const [amountUsd, setAmountUsd] = useState<number | null>(null);
  const [cardCode, setCardCode] = useState('');
  const [photoAttached, setPhotoAttached] = useState(false);

  const region = REGION_OPTIONS.find((option) => option.id === regionId) ?? REGION_OPTIONS[0];
  const amountError =
    amountUsd == null ? null : validateAmount(amountUsd, brand.minUsd, brand.maxUsd, 'Card value');
  const canContinue = amountUsd != null && amountError == null;

  const handleContinue = () => {
    if (amountUsd == null) return;
    router.push({
      pathname: '/trade/review',
      params: {
        brandId: brand.id,
        amountUsd: String(amountUsd),
        region: region.label,
        ...(cardCode.trim() ? { cardCode: cardCode.trim() } : {}),
        ...(photoAttached ? { photoAttached: 'true' } : {}),
      },
    });
  };

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
    >
      <View style={styles.brandCard}>
        <View style={styles.brandIconTile}>
          <Icon name="gift" size={22} color={colors.green[700]} />
        </View>
        <View style={styles.brandText}>
          <Text style={styles.brandName}>{brand.name}</Text>
          <Text style={styles.brandCaption}>{brand.category}</Text>
        </View>
        <View style={styles.rateBlock}>
          <Text style={styles.rateValue}>{formatRate(brand.ratePerDollar)}</Text>
          <Text style={styles.rateCaption}>Rate today</Text>
        </View>
      </View>

      <View style={styles.fieldGroup}>
        <Text style={styles.fieldLabel}>Card country</Text>
        <View style={styles.regionList}>
          {REGION_OPTIONS.map((option) => {
            const selected = option.id === regionId;
            return (
              <Pressable
                key={option.id}
                testID={`region-option-${option.id}`}
                onPress={() => setRegionId(option.id)}
                accessibilityRole="button"
                accessibilityState={{ selected }}
                style={({ pressed }) => [
                  styles.regionRow,
                  selected && styles.regionRowSelected,
                  pressed && styles.pressed,
                ]}
              >
                <View style={[styles.radio, selected && styles.radioSelected]}>
                  {selected ? <View style={styles.radioDot} /> : null}
                </View>
                <Text style={styles.regionLabel}>{option.label}</Text>
              </Pressable>
            );
          })}
        </View>
      </View>

      <View style={styles.fieldGroup}>
        <UsdAmountInput
          label="Card value (USD)"
          valueUsd={amountUsd}
          onChangeUsd={setAmountUsd}
          minUsd={brand.minUsd}
          maxUsd={brand.maxUsd}
        />
        <Text style={styles.rangeHint}>
          {`This card accepts $${brand.minUsd} – $${brand.maxUsd}.`}
        </Text>
      </View>

      <TextField
        label="Card code (optional)"
        placeholder="e.g. XJ4K-92LM-QP7D"
        value={cardCode}
        onChangeText={setCardCode}
        autoCapitalize="characters"
        autoCorrect={false}
      />

      <Pressable
        testID="card-photo-picker"
        onPress={() => setPhotoAttached((attached) => !attached)}
        accessibilityRole="button"
        accessibilityState={{ selected: photoAttached }}
        style={({ pressed }) => [
          styles.photoPicker,
          photoAttached && styles.photoPickerAttached,
          pressed && styles.pressed,
        ]}
      >
        <Icon
          name={photoAttached ? 'check' : 'plus'}
          size={22}
          color={photoAttached ? colors.green[700] : colors.text.muted}
        />
        <View style={styles.photoText}>
          <Text style={[styles.photoTitle, photoAttached && styles.photoTitleAttached]}>
            {photoAttached ? 'Card photo attached' : 'Add card photo'}
          </Text>
          <Text style={styles.photoCaption}>
            {photoAttached ? 'Tap to remove' : 'Optional — helps us verify your card faster.'}
          </Text>
        </View>
      </Pressable>

      <Button
        title="Continue"
        showArrow
        disabled={!canContinue}
        onPress={handleContinue}
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
  brandCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[3],
    backgroundColor: colors.surface.card,
    borderRadius: radius.lg,
    padding: spacing[4],
  },
  brandIconTile: {
    width: 44,
    height: 44,
    borderRadius: radius.md,
    backgroundColor: colors.green[50],
    alignItems: 'center',
    justifyContent: 'center',
  },
  brandText: {
    flex: 1,
    gap: spacing[1],
  },
  brandName: {
    ...typography.bodyMedium,
    color: colors.text.primary,
  },
  brandCaption: {
    ...typography.caption,
    color: colors.text.muted,
  },
  rateBlock: {
    alignItems: 'flex-end',
    gap: spacing[1],
  },
  rateValue: {
    ...typography.bodyMedium,
    color: colors.green[700],
  },
  rateCaption: {
    ...typography.caption,
    color: colors.text.muted,
  },
  fieldGroup: {
    gap: spacing[2],
    alignSelf: 'stretch',
  },
  fieldLabel: {
    ...typography.label,
    color: colors.text.primary,
  },
  regionList: {
    gap: spacing[2],
  },
  regionRow: {
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
  regionRowSelected: {
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
  regionLabel: {
    ...typography.body,
    color: colors.text.primary,
  },
  rangeHint: {
    ...typography.caption,
    color: colors.text.muted,
  },
  photoPicker: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[3],
    minHeight: hitTarget,
    borderRadius: radius.md,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: componentColors.border,
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[4],
  },
  photoPickerAttached: {
    borderColor: colors.green[700],
    borderStyle: 'solid',
    backgroundColor: colors.green[50],
  },
  photoText: {
    flex: 1,
    gap: spacing[1],
  },
  photoTitle: {
    ...typography.bodyMedium,
    color: colors.text.body,
  },
  photoTitleAttached: {
    color: colors.green[700],
  },
  photoCaption: {
    ...typography.caption,
    color: colors.text.muted,
  },
  pressed: {
    opacity: 0.85,
  },
});
