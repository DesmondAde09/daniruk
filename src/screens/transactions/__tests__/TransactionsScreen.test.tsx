import { fireEvent, render, screen } from '@testing-library/react-native';
import { router } from 'expo-router';
import React from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { getTransactions } from '@/data/transactions';

import { TransactionsScreen } from '../TransactionsScreen';

jest.mock('expo-router', () => ({
  router: { push: jest.fn() },
}));

jest.mock('@/data/transactions', () => ({ getTransactions: jest.fn() }));

const mockGetTransactions = getTransactions as jest.Mock;
const mockPush = router.push as jest.Mock;

const initialMetrics = {
  frame: { x: 0, y: 0, width: 390, height: 844 },
  insets: { top: 47, left: 0, right: 0, bottom: 34 },
};

async function renderTransactions() {
  return render(
    <SafeAreaProvider initialMetrics={initialMetrics}>
      <TransactionsScreen />
    </SafeAreaProvider>,
  );
}

beforeEach(() => {
  jest.clearAllMocks();
  mockGetTransactions.mockImplementation(jest.requireActual('@/data/transactions').getTransactions);
});

describe('Transactions screen', () => {
  it('renders the header and the mock transactions', async () => {
    await renderTransactions();

    expect(screen.getByText('Transactions')).toBeTruthy();
    expect(await screen.findByText('Apple Gift Card')).toBeTruthy();
    expect(screen.getByText('MTN Airtime')).toBeTruthy();
    expect(screen.getByText('Flight LOS → ABV')).toBeTruthy();
    expect(screen.getByText('+₦71,250')).toBeTruthy();
    expect(screen.getAllByText('Successful').length).toBeGreaterThan(0);
  });

  it('narrows the list when a filter chip is pressed', async () => {
    await renderTransactions();
    expect(await screen.findByText('Apple Gift Card')).toBeTruthy();

    await fireEvent.press(screen.getByTestId('filter-chip-trades'));

    expect(screen.getByText('Apple Gift Card')).toBeTruthy();
    expect(screen.getByText('Steam Gift Card')).toBeTruthy();
    expect(screen.getByText('Amazon Gift Card')).toBeTruthy();
    expect(screen.queryByText('MTN Airtime')).toBeNull();
    expect(screen.queryByText('Received BTC')).toBeNull();
  });

  it('filters money in and money out by amount sign', async () => {
    await renderTransactions();
    expect(await screen.findByText('Apple Gift Card')).toBeTruthy();

    await fireEvent.press(screen.getByTestId('filter-chip-in'));
    expect(screen.getByText('Received BTC')).toBeTruthy();
    expect(screen.queryByText('MTN Airtime')).toBeNull();

    await fireEvent.press(screen.getByTestId('filter-chip-out'));
    expect(screen.getByText('MTN Airtime')).toBeTruthy();
    expect(screen.queryByText('Received BTC')).toBeNull();
  });

  it('shows the filtered empty state when a filter matches nothing', async () => {
    mockGetTransactions.mockResolvedValue([]);
    await renderTransactions();

    expect(await screen.findByText('No transactions yet')).toBeTruthy();

    await fireEvent.press(screen.getByTestId('filter-chip-trades'));

    expect(screen.getByText('No trades yet')).toBeTruthy();
    expect(screen.getByText('Gift-card trades you complete will show up here.')).toBeTruthy();
  });

  it('shows a retryable error state when the ledger fails to load', async () => {
    mockGetTransactions.mockRejectedValueOnce(new Error('boom'));
    await renderTransactions();

    const retry = await screen.findByText('Try again');
    expect(screen.getByText("Couldn't load transactions")).toBeTruthy();

    await fireEvent.press(retry);

    expect(await screen.findByText('Apple Gift Card')).toBeTruthy();
    expect(mockGetTransactions).toHaveBeenCalledTimes(2);
  });

  it('opens the transaction detail when a row is pressed', async () => {
    await renderTransactions();
    await fireEvent.press(await screen.findByText('Apple Gift Card'));

    expect(mockPush).toHaveBeenCalledWith('/transactions/txn_001');
  });
});
