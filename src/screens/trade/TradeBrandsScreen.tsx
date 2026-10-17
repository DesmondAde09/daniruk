import { router } from 'expo-router';
import React, { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { EmptyState, ErrorState, Icon, RowSkeleton } from '@/components';
import { componentColors } from '@/components/palette';
import { getGiftCardBrands } from '@/data/trade';
import type { GiftCardBrand } from '@/data/types';
import { useAsync } from '@/hooks/useAsync';
import { formatRate } from '@/lib/currency';
import { colors, hitTarget, radius, screenPadding, spacing, typography } from '@/theme/tokens';

/**
 * Trade tab: searchable gift-card brand list with live rates (user stories 22–23).
 * Routed via the thin wrapper at `src/app/(tabs)/trade.tsx`; lives here so its
 * tests sit outside `src/app/` (every file under `src/app/` is treated as a route).
 *
 * The search field is composed locally rather than reusing `TextField`: the
 * shared component has no leading-icon slot, and a prefixed search icon can't
 * be overlaid without colliding with the input's padding.
 */
export function TradeBrandsScreen() {
  const brands = useAsync(getGiftCardBrands);
  const [query, setQuery] = useState('');

  const normalized = query.trim().toLowerCase();
  const filtered = (brands.data ?? []).filter(
    (brand) =>
      normalized.length === 0 ||
      brand.name.toLowerCase().includes(normalized) ||
      brand.category.toLowerCase().includes(normalized),
  );

  return (
    <SafeAreaView style={styles.screen} edges={['top']}>
      <ScrollView
        style={styles.screen}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.header}>
          <Text style={styles.title}>Trade gift cards</Text>
          <Text style={styles.subtitle}>Pick a brand to see your rate and get paid in Naira.</Text>
        </View>

        <View style={styles.searchRow}>
          <Icon name="search" size={20} color={colors.text.muted} />
          <TextInput
            testID="brand-search"
            style={styles.searchInput}
            value={query}
            onChangeText={setQuery}
            placeholder="Search brands or categories"
            placeholderTextColor={colors.text.muted}
            autoCapitalize="none"
            autoCorrect={false}
            returnKeyType="search"
          />
        </View>

        {brands.loading && !brands.data ? (
          <View style={styles.list}>
            <RowSkeleton />
            <RowSkeleton />
            <RowSkeleton />
            <RowSkeleton />
            <RowSkeleton />
          </View>
        ) : brands.error ? (
          <ErrorState title="Couldn't load brands" onRetry={brands.reload} />
        ) : filtered.length === 0 ? (
          <EmptyState
            icon="search"
            title="No matching brands"
            caption={`Nothing matches "${query.trim()}". Try another name or category.`}
          />
        ) : (
          <View style={styles.list}>
            {filtered.map((brand) => (
              <BrandRow
                key={brand.id}
                brand={brand}
                onPress={() =>
                  router.push({ pathname: '/trade/[brandId]', params: { brandId: brand.id } })
                }
              />
            ))}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

function BrandRow({ brand, onPress }: { brand: GiftCardBrand; onPress: () => void }) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      style={({ pressed }) => [styles.row, pressed && styles.rowPressed]}
    >
      <View style={styles.iconTile}>
        <Icon name="gift" size={22} color={colors.green[700]} />
      </View>
      <View style={styles.rowText}>
        <Text style={styles.rowTitle}>{brand.name}</Text>
        <Text style={styles.rowCaption}>{brand.category}</Text>
      </View>
      <Text style={styles.rowRate}>{formatRate(brand.ratePerDollar)}</Text>
      <Icon name="chevron-right" size={18} color={colors.text.muted} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.surface.base,
  },
  content: {
    paddingHorizontal: screenPadding,
    paddingTop: spacing[4],
    paddingBottom: spacing[10],
    gap: spacing[5],
  },
  header: {
    gap: spacing[1],
  },
  title: {
    ...typography.h1,
    color: colors.text.primary,
  },
  subtitle: {
    ...typography.body,
    color: colors.text.body,
  },
  searchRow: {
    height: 56,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: componentColors.border,
    backgroundColor: colors.surface.card,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing[4],
    gap: spacing[2],
  },
  searchInput: {
    flex: 1,
    height: '100%',
    ...typography.body,
    color: colors.text.primary,
    paddingVertical: 0,
  },
  list: {
    gap: spacing[3],
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[3],
    minHeight: hitTarget,
    backgroundColor: colors.surface.card,
    borderRadius: radius.lg,
    padding: spacing[4],
    alignSelf: 'stretch',
  },
  rowPressed: {
    opacity: 0.85,
  },
  iconTile: {
    width: 44,
    height: 44,
    borderRadius: radius.md,
    backgroundColor: colors.green[50],
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowText: {
    flex: 1,
    gap: spacing[1],
  },
  rowTitle: {
    ...typography.bodyMedium,
    color: colors.text.primary,
  },
  rowCaption: {
    ...typography.caption,
    color: colors.text.muted,
  },
  rowRate: {
    ...typography.bodyMedium,
    color: colors.green[700],
  },
});
