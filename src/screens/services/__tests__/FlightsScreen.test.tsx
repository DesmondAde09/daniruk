import { fireEvent, render, screen, waitFor } from '@testing-library/react-native';
import { router } from 'expo-router';
import React from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { payBill, searchFlights } from '@/data/services';

import { FlightsScreen } from '../FlightsScreen';

jest.mock('expo-router', () => ({
  router: { push: jest.fn(), back: jest.fn() },
}));

jest.mock('@/data/services', () => {
  const actual = jest.requireActual('@/data/services');
  return { ...actual, searchFlights: jest.fn(), payBill: jest.fn() };
});

const mockSearchFlights = searchFlights as jest.Mock;
const mockPayBill = payBill as jest.Mock;
const mockBack = router.back as jest.Mock;

const initialMetrics = {
  frame: { x: 0, y: 0, width: 390, height: 844 },
  insets: { top: 47, left: 0, right: 0, bottom: 34 },
};

const mockTransaction = {
  id: 'txn_new',
  type: 'flight',
  title: 'Flight LOS → ABV',
  amountKobo: -6_500_000,
  currency: 'NGN',
  status: 'successful',
  reference: 'DNR-999994',
  createdAt: new Date().toISOString(),
  meta: { airline: 'Air Peace', route: 'LOS → ABV', passengers: '1' },
};

async function renderFlights() {
  return render(
    <SafeAreaProvider initialMetrics={initialMetrics}>
      <FlightsScreen />
    </SafeAreaProvider>,
  );
}

beforeEach(() => {
  jest.clearAllMocks();
  const actual = jest.requireActual('@/data/services');
  mockSearchFlights.mockImplementation(actual.searchFlights);
  mockPayBill.mockResolvedValue({ ...mockTransaction });
});

describe('Flights screen', () => {
  it('shows an empty state before the first search', async () => {
    await renderFlights();

    expect(screen.getByText('Find your next flight')).toBeTruthy();
    expect(screen.getByText('Search for a flight to see results.')).toBeTruthy();
    expect(mockSearchFlights).not.toHaveBeenCalled();
  });

  it('blocks searching when origin and destination match', async () => {
    await renderFlights();

    await fireEvent.press(screen.getByTestId('to-option-LOS'));

    expect(screen.getByText('Origin and destination must be different.')).toBeTruthy();
    await fireEvent.press(screen.getByText('Search flights'));
    expect(mockSearchFlights).not.toHaveBeenCalled();
  });

  it('searches and renders mocked results with times, duration and prices', async () => {
    await renderFlights();

    await fireEvent.press(screen.getByText('Search flights'));

    expect(await screen.findByText('Air Peace')).toBeTruthy();
    expect(screen.getByText('Ibom Air')).toBeTruthy();
    expect(screen.getByText('₦65,000.00')).toBeTruthy();
    expect(screen.getAllByText('LOS → ABV · 1h 5m').length).toBeGreaterThan(0);
    expect(mockSearchFlights).toHaveBeenCalledWith(
      expect.objectContaining({ from: 'LOS', to: 'ABV', passengers: 1 }),
    );
  });

  it('scales results with the passenger count', async () => {
    await renderFlights();

    await fireEvent.press(screen.getByTestId('segment-2'));
    await fireEvent.press(screen.getByText('Search flights'));

    expect(await screen.findByText('₦130,000.00')).toBeTruthy();
    expect(mockSearchFlights).toHaveBeenCalledWith(
      expect.objectContaining({ passengers: 2 }),
    );
  });

  it('books a flight through the confirm sheet and shows the success state', async () => {
    await renderFlights();

    await fireEvent.press(screen.getByText('Search flights'));
    await screen.findByText('Air Peace');

    await fireEvent.press(screen.getAllByText('Book')[0]);

    expect(screen.getByText('Confirm booking')).toBeTruthy();
    // The price appears in both the result card and the sheet summary.
    expect(screen.getAllByText('₦65,000.00').length).toBeGreaterThan(1);

    await fireEvent.press(screen.getByText('Confirm & pay'));

    await waitFor(() =>
      expect(mockPayBill).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'flight',
          title: 'Flight LOS → ABV',
          amountKobo: 6_500_000,
          meta: expect.objectContaining({ airline: 'Air Peace', route: 'LOS → ABV', passengers: '1' }),
        }),
      ),
    );
    expect(await screen.findByText('Flight booked')).toBeTruthy();
    expect(screen.getByText('Reference: DNR-999994')).toBeTruthy();

    await fireEvent.press(screen.getByText('Done'));
    expect(mockBack).toHaveBeenCalled();
  });

  it('surfaces a failed booking inside the sheet', async () => {
    mockPayBill.mockRejectedValueOnce(new Error('Insufficient NGN balance'));
    await renderFlights();

    await fireEvent.press(screen.getByText('Search flights'));
    await screen.findByText('Air Peace');
    await fireEvent.press(screen.getAllByText('Book')[0]);
    await fireEvent.press(screen.getByText('Confirm & pay'));

    expect(await screen.findByText('Insufficient NGN balance')).toBeTruthy();
    expect(screen.queryByText('Flight booked')).toBeNull();
  });

  it('shows a retryable error state when the search fails', async () => {
    mockSearchFlights.mockRejectedValueOnce(new Error('boom'));
    await renderFlights();

    await fireEvent.press(screen.getByText('Search flights'));

    expect(await screen.findByText("Couldn't search flights")).toBeTruthy();

    await fireEvent.press(screen.getByText('Try again'));
    expect(await screen.findByText('Air Peace')).toBeTruthy();
  });
});
