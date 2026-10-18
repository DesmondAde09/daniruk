import React, { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button, EmptyState, ErrorState, RowSkeleton, SegmentedToggle } from '@/components';
import { componentColors } from '@/components/palette';
import { payBill, searchFlights } from '@/data/services';
import type { FlightResult, Transaction } from '@/data/types';
import { formatNaira } from '@/lib/currency';
import { colors, hitTarget, radius, spacing, typography } from '@/theme/tokens';

import {
  PayConfirmSheet,
  PaymentSuccess,
  RadioRow,
  ServiceScreenHeader,
  serviceScreenStyles,
  SheetSummary,
  SummaryRow,
} from './serviceShared';

/**
 * Flights search + mock booking (ticket 09). No date-picker dependency: the
 * departure date is a chip row of the next few days, computed without Intl so
 * it renders identically on both platforms. Routed via the thin wrapper at
 * `src/app/services/flights.tsx`.
 */

/** Nigerian airports offered by the mock search. */
const AIRPORTS = [
  { code: 'LOS', city: 'Lagos' },
  { code: 'ABV', city: 'Abuja' },
  { code: 'PHC', city: 'Port Harcourt' },
  { code: 'KAN', city: 'Kano' },
] as const;

const PASSENGER_OPTIONS = [
  { value: '1', label: '1' },
  { value: '2', label: '2' },
  { value: '3', label: '3' },
  { value: '4', label: '4' },
] as const;

/** Preset departure dates: the next three days. */
const DAY_OFFSETS = [1, 2, 3] as const;

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'] as const;
const MONTHS = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec',
] as const;

function departureDate(offset: number): Date {
  const date = new Date();
  date.setDate(date.getDate() + offset);
  return date;
}

function formatDateChip(date: Date): string {
  return `${WEEKDAYS[date.getDay()]} ${date.getDate()} ${MONTHS[date.getMonth()]}`;
}

/** "2026-10-20T07:15:00.000Z" -> "07:15" (local time). */
function formatTime(iso: string): string {
  const date = new Date(iso);
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  return `${hours}:${minutes}`;
}

/** 65 minutes -> "1h 5m". */
function formatDuration(departIso: string, arriveIso: string): string {
  const totalMinutes = Math.round(
    (new Date(arriveIso).getTime() - new Date(departIso).getTime()) / 60_000,
  );
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  return hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;
}

type SearchState =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'error'; message: string }
  | { status: 'results'; results: FlightResult[] };

export function FlightsScreen() {
  const [from, setFrom] = useState<string>('LOS');
  const [to, setTo] = useState<string>('ABV');
  const [dateIndex, setDateIndex] = useState(0);
  const [passengers, setPassengers] = useState<string>('1');
  const [search, setSearch] = useState<SearchState>({ status: 'idle' });
  const [booking, setBooking] = useState<FlightResult | null>(null);
  const [completed, setCompleted] = useState<Transaction | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const routeMismatch = from === to;
  const date = departureDate(DAY_OFFSETS[dateIndex] ?? DAY_OFFSETS[0]);

  const handleSearch = async () => {
    if (routeMismatch) return;
    setSearch({ status: 'loading' });
    try {
      const results = await searchFlights({
        from,
        to,
        departDate: date.toISOString(),
        passengers: Number(passengers),
      });
      setSearch({ status: 'results', results });
    } catch (err) {
      setSearch({
        status: 'error',
        message: err instanceof Error ? err.message : 'Something went wrong',
      });
    }
  };

  const handleConfirmBooking = async () => {
    if (!booking) return;
    setSubmitting(true);
    setSubmitError(null);
    try {
      const transaction = await payBill({
        type: 'flight',
        title: `Flight ${from} → ${to}`,
        amountKobo: booking.priceKobo,
        meta: {
          airline: booking.airline,
          route: `${from} → ${to}`,
          passengers,
          date: formatDateChip(date),
        },
      });
      setBooking(null);
      setSubmitting(false);
      setCompleted(transaction);
    } catch (err) {
      setSubmitting(false);
      setSubmitError(err instanceof Error ? err.message : 'Something went wrong');
    }
  };

  if (completed) {
    return (
      <SafeAreaView style={serviceScreenStyles.screen} edges={['top']}>
        <ServiceScreenHeader title="Flights" />
        <PaymentSuccess
          title="Flight booked"
          caption={`Your ${from} → ${to} flight is confirmed. Enjoy the trip!`}
          transaction={completed}
        />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={serviceScreenStyles.screen} edges={['top']}>
      <ServiceScreenHeader title="Flights" />

      <ScrollView
        style={serviceScreenStyles.screen}
        contentContainerStyle={serviceScreenStyles.content}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View style={serviceScreenStyles.fieldGroup}>
          <Text style={serviceScreenStyles.fieldLabel}>From</Text>
          {AIRPORTS.map((airport) => (
            <RadioRow
              key={airport.code}
              testID={`from-option-${airport.code}`}
              title={`${airport.code} — ${airport.city}`}
              selected={from === airport.code}
              onPress={() => setFrom(airport.code)}
            />
          ))}
        </View>

        <View style={serviceScreenStyles.fieldGroup}>
          <Text style={serviceScreenStyles.fieldLabel}>To</Text>
          {AIRPORTS.map((airport) => (
            <RadioRow
              key={airport.code}
              testID={`to-option-${airport.code}`}
              title={`${airport.code} — ${airport.city}`}
              selected={to === airport.code}
              onPress={() => setTo(airport.code)}
            />
          ))}
          {routeMismatch ? (
            <Text style={styles.mismatchHint}>Origin and destination must be different.</Text>
          ) : null}
        </View>

        <View style={serviceScreenStyles.fieldGroup}>
          <Text style={serviceScreenStyles.fieldLabel}>Departure date</Text>
          <View style={styles.dateRow}>
            {DAY_OFFSETS.map((offset, index) => {
              const selected = index === dateIndex;
              return (
                <Pressable
                  key={offset}
                  testID={`date-option-${index}`}
                  onPress={() => setDateIndex(index)}
                  accessibilityRole="button"
                  accessibilityState={{ selected }}
                  style={({ pressed }) => [
                    styles.dateChip,
                    selected && styles.dateChipSelected,
                    pressed && styles.pressed,
                  ]}
                >
                  <Text style={[styles.dateChipLabel, selected && styles.dateChipLabelSelected]}>
                    {formatDateChip(departureDate(offset))}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>

        <View style={serviceScreenStyles.fieldGroup}>
          <Text style={serviceScreenStyles.fieldLabel}>Passengers</Text>
          <SegmentedToggle
            options={[...PASSENGER_OPTIONS]}
            value={passengers}
            onChange={setPassengers}
          />
        </View>

        <Button
          title="Search flights"
          showArrow
          disabled={routeMismatch || search.status === 'loading'}
          onPress={handleSearch}
        />

        {search.status === 'idle' ? (
          <EmptyState
            icon="plane"
            title="Find your next flight"
            caption="Search for a flight to see results."
          />
        ) : search.status === 'loading' ? (
          <View style={styles.resultsList} testID="flights-loading">
            <RowSkeleton />
            <RowSkeleton />
            <RowSkeleton />
          </View>
        ) : search.status === 'error' ? (
          <ErrorState
            title="Couldn't search flights"
            caption={search.message}
            onRetry={handleSearch}
          />
        ) : search.results.length === 0 ? (
          <EmptyState
            icon="plane"
            title="No flights found"
            caption="Try a different route or date."
          />
        ) : (
          <View style={styles.resultsList}>
            {search.results.map((flight) => (
              <FlightCard key={flight.id} flight={flight} onBook={() => setBooking(flight)} />
            ))}
          </View>
        )}
      </ScrollView>

      <PayConfirmSheet
        visible={booking != null}
        title="Confirm booking"
        submitting={submitting}
        error={submitError}
        onConfirm={handleConfirmBooking}
        onClose={() => setBooking(null)}
      >
        {booking ? (
          <SheetSummary>
            <SummaryRow label="Airline" value={booking.airline} />
            <SummaryRow label="Route" value={`${from} → ${to}`} />
            <SummaryRow label="Date" value={formatDateChip(date)} />
            <SummaryRow label="Passengers" value={passengers} />
            <SummaryRow label="Price" value={formatNaira(booking.priceKobo)} />
          </SheetSummary>
        ) : null}
      </PayConfirmSheet>
    </SafeAreaView>
  );
}

function FlightCard({ flight, onBook }: { flight: FlightResult; onBook: () => void }) {
  return (
    <View style={styles.flightCard}>
      <View style={styles.flightHeader}>
        <Text style={styles.airline}>{flight.airline}</Text>
        <Text style={styles.price}>{formatNaira(flight.priceKobo)}</Text>
      </View>
      <View style={styles.flightRoute}>
        <Text style={styles.flightTime}>{formatTime(flight.departAt)}</Text>
        <Text style={styles.flightDuration}>
          {`${flight.from} → ${flight.to} · ${formatDuration(flight.departAt, flight.arriveAt)}`}
        </Text>
        <Text style={styles.flightTime}>{formatTime(flight.arriveAt)}</Text>
      </View>
      <Button title="Book" onPress={onBook} />
    </View>
  );
}

const styles = StyleSheet.create({
  pressed: {
    opacity: 0.85,
  },
  mismatchHint: {
    ...typography.caption,
    color: colors.status.error,
  },
  dateRow: {
    flexDirection: 'row',
    gap: spacing[2],
  },
  dateChip: {
    flex: 1,
    minHeight: hitTarget,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: componentColors.border,
    backgroundColor: colors.surface.card,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing[2],
  },
  dateChipSelected: {
    borderColor: colors.green[700],
    backgroundColor: colors.green[50],
  },
  dateChipLabel: {
    ...typography.label,
    color: colors.text.body,
  },
  dateChipLabelSelected: {
    color: colors.green[700],
  },
  resultsList: {
    gap: spacing[3],
  },
  flightCard: {
    backgroundColor: colors.surface.card,
    borderRadius: radius.lg,
    padding: spacing[4],
    gap: spacing[3],
  },
  flightHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing[3],
  },
  airline: {
    ...typography.bodyMedium,
    color: colors.text.primary,
  },
  price: {
    ...typography.bodyMedium,
    color: colors.green[700],
  },
  flightRoute: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing[3],
  },
  flightTime: {
    ...typography.bodyMedium,
    color: colors.text.primary,
  },
  flightDuration: {
    ...typography.caption,
    color: colors.text.muted,
  },
});
