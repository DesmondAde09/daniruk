import { fireEvent, render, screen } from '@testing-library/react-native';
import { router } from 'expo-router';
import React from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { TradeSuccessScreen } from '../TradeSuccessScreen';

let mockParams: Record<string, string> = {
  transactionId: 'txn_new',
  amountKobo: '7125000',
  brandName: 'Apple Gift Card',
};

jest.mock('expo-router', () => ({
  router: { push: jest.fn(), dismissTo: jest.fn() },
  useLocalSearchParams: () => mockParams,
}));

const mockPush = router.push as jest.Mock;
const mockDismissTo = router.dismissTo as jest.Mock;

const initialMetrics = {
  frame: { x: 0, y: 0, width: 390, height: 844 },
  insets: { top: 47, left: 0, right: 0, bottom: 34 },
};

async function renderSuccess() {
  return render(
    <SafeAreaProvider initialMetrics={initialMetrics}>
      <TradeSuccessScreen />
    </SafeAreaProvider>,
  );
}

beforeEach(() => {
  jest.clearAllMocks();
  mockParams = {
    transactionId: 'txn_new',
    amountKobo: '7125000',
    brandName: 'Apple Gift Card',
  };
});

describe('Trade success screen', () => {
  it('renders the credited amount and brand', async () => {
    await renderSuccess();

    expect(screen.getByText('Trade successful')).toBeTruthy();
    expect(screen.getByText('+₦71,250')).toBeTruthy();
    expect(screen.getByText(/Apple Gift Card payout has been added/)).toBeTruthy();
  });

  it('routes to the new transaction and back home', async () => {
    await renderSuccess();

    await fireEvent.press(screen.getByText('View transaction'));
    expect(mockPush).toHaveBeenCalledWith('/transactions/txn_new');

    await fireEvent.press(screen.getByText('Back to home'));
    expect(mockDismissTo).toHaveBeenCalledWith('/(tabs)');
  });
});
