import { router, type Href } from 'expo-router';
import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { EmptyState, ErrorState, Icon, Loading, serviceTileVariantConfig } from '@/components';
import { getServices, type Service, type ServiceId } from '@/data/services';
import { useAsync } from '@/hooks/useAsync';
import { colors, hitTarget, radius, screenPadding, spacing, typography } from '@/theme/tokens';

/** Static route map: service ids double as the flow routes under `/services/`. */
const SERVICE_ROUTES: Record<ServiceId, Href> = {
  flights: '/services/flights',
  electricity: '/services/electricity',
  airtime: '/services/airtime',
  data: '/services/data',
};

/**
 * Services index tab (ticket 09): every bill-payment service from the mock
 * catalogue, with the same pastel icon tiles as Home's quick services.
 * Routed via the thin wrapper at `src/app/(tabs)/services.tsx`.
 */
export function ServicesIndexScreen() {
  const services = useAsync(getServices);

  return (
    <SafeAreaView style={styles.screen} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.title}>Services</Text>
        <Text style={styles.subtitle}>Pay bills and book travel from your wallet.</Text>
      </View>

      {services.loading && !services.data ? (
        <Loading label="Loading services…" />
      ) : services.error || !services.data ? (
        <View style={styles.stateContent}>
          <ErrorState
            title="Couldn't load services"
            caption="We couldn't load the services list. Please try again."
            onRetry={services.reload}
          />
        </View>
      ) : services.data.length === 0 ? (
        <View style={styles.stateContent}>
          <EmptyState icon="grid" title="No services yet" caption="Services will show up here." />
        </View>
      ) : (
        <ScrollView
          style={styles.screen}
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.list}>
            {services.data.map((service) => (
              <ServiceRow key={service.id} service={service} />
            ))}
          </View>
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

function ServiceRow({ service }: { service: Service }) {
  const config = serviceTileVariantConfig[service.id];
  return (
    <Pressable
      testID={`service-row-${service.id}`}
      onPress={() => router.push(SERVICE_ROUTES[service.id])}
      accessibilityRole="button"
      style={({ pressed }) => [styles.row, pressed && styles.pressed]}
    >
      <View style={[styles.iconTile, { backgroundColor: config.backgroundColor }]}>
        <Icon name={config.icon} size={22} color={config.color} />
      </View>
      <View style={styles.rowText}>
        <Text style={styles.rowTitle}>{service.name}</Text>
        <Text style={styles.rowCaption}>{service.tagline}</Text>
      </View>
      <Icon name="chevron-right" size={20} color={colors.text.muted} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.surface.base,
  },
  header: {
    paddingHorizontal: screenPadding,
    paddingTop: spacing[4],
    paddingBottom: spacing[2],
    gap: spacing[1],
  },
  title: {
    ...typography.h1,
    color: colors.text.primary,
  },
  subtitle: {
    ...typography.body,
    color: colors.text.muted,
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
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[3],
  },
  iconTile: {
    width: 48,
    height: 48,
    borderRadius: radius.md,
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
  pressed: {
    opacity: 0.85,
  },
});
