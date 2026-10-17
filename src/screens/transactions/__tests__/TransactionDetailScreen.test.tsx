import { render, screen } from '@testing-library/react-native';
import React from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { getTransaction } from '@/data/transactions';

import { TransactionDetailScreen } from '../TransactionDetailScreen';

let mockRouteId = 'txn_001';

jest.mock('expo-router', () => ({
  router: { back: jest.fn() },
  useLocalSearchParams: () => ({ id: mockRouteId }),
}));

jest.mock('@/data/transactions', () => ({ getTransaction: jest.fn() }));

const mockGetTransaction = getTransaction as jest.Mock;

const initialMetrics = {
  frame: { x: 0, y: 0, width: 390, height: 844 },
  insets: { top: 47, left: 0, right: 0, bottom: 34 },
};

async function renderDetail() {
  return render(
    <SafeAreaProvider initialMetrics={initialMetrics}>
      <TransactionDetailScreen />
    </SafeAreaProvider>,
  );
}

beforeEach(() => {
  jest.clearAllMocks();
  mockRouteId = 'txn_001';
  mockGetTransaction.mockImplementation(jest.requireActual('@/data/transactions').getTransaction);
});

describe('Transaction detail screen', () => {
  it('renders the signed amount, status, title and timestamp', async () => {
    await renderDetail();

    expect(await screen.findByText('+₦71,250')).toBeTruthy();
    expect(screen.getByText('Successful')).toBeTruthy();
    expect(screen.getByText('Apple Gift Card')).toBeTruthy();
    expect(screen.getByText(/^Today, /)).toBeTruthy();
  });

  it('renders humanized meta rows and the reference', async () => {
    await renderDetail();

    expect(await screen.findByText('Card value')).toBeTruthy();
    expect(screen.getByText('$50.00')).toBeTruthy();
    expect(screen.getByText('Rate')).toBeTruthy();
    expect(screen.getByText('₦1,425/$')).toBeTruthy();
    expect(screen.getByText('Reference')).toBeTruthy();
    expect(screen.getByText('DNR-284910')).toBeTruthy();
  });

  it('offers a contact-support button for failed transactions', async () => {
    mockRouteId = 'txn_010'; // failed Glo Airtime
    await renderDetail();

    expect(await screen.findByText('Failed')).toBeTruthy();
    expect(screen.getByText('Contact support')).toBeTruthy();
  });

  it('shows an error state for an unknown transaction id', async () => {
    mockRouteId = 'txn_999';
    await renderDetail();

    expect(await screen.findByText('Transaction not found')).toBeTruthy();
    expect(screen.getByText('Try again')).toBeTruthy();
  });
});
