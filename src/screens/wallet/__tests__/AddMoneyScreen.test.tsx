import { fireEvent, render, screen } from '@testing-library/react-native';
import { router } from 'expo-router';
import React from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { ToastProvider } from '@/components';
import { getWallet } from '@/data/wallet';

import { AddMoneyScreen } from '../AddMoneyScreen';

jest.mock('expo-router', () => ({
  router: { push: jest.fn(), back: jest.fn() },
}));

jest.mock('@/data/wallet', () => ({ getWallet: jest.fn() }));

const mockGetWallet = getWallet as jest.Mock;
const mockPush = router.push as jest.Mock;

const initialMetrics = {
  frame: { x: 0, y: 0, width: 390, height: 844 },
  insets: { top: 47, left: 0, right: 0, bottom: 34 },
};

async function renderAddMoney() {
  return render(
    <SafeAreaProvider initialMetrics={initialMetrics}>
      <ToastProvider>
        <AddMoneyScreen />
      </ToastProvider>
    </SafeAreaProvider>,
  );
}

beforeEach(() => {
  jest.clearAllMocks();
  mockGetWallet.mockImplementation(jest.requireActual('@/data/wallet').getWallet);
});

describe('Add money screen', () => {
  it('renders the balance card and all three funding methods', async () => {
    await renderAddMoney();

    expect(await screen.findByText('₦348,200.00')).toBeTruthy();
    expect(screen.getByText('Choose how to add money')).toBeTruthy();
    expect(screen.getByText('Bank transfer')).toBeTruthy();
    expect(screen.getByText('Recommended')).toBeTruthy();
    expect(screen.getByText('Debit card')).toBeTruthy();
    expect(screen.getByText('USSD')).toBeTruthy();
    expect(screen.getByText('Secure wallet funding')).toBeTruthy();
  });

  it('routes to the bank-transfer deposit screen', async () => {
    await renderAddMoney();
    await fireEvent.press(await screen.findByTestId('funding-method-bank-transfer'));

    expect(mockPush).toHaveBeenCalledWith('/wallet/bank-transfer');
  });

  it('shows a coming-soon toast for the placeholder methods', async () => {
    await renderAddMoney();
    await fireEvent.press(await screen.findByTestId('funding-method-debit-card'));

    expect(await screen.findByText('Debit card is coming soon')).toBeTruthy();
    expect(mockPush).not.toHaveBeenCalled();
  });

  it('shows a retryable error state when the wallet fails to load', async () => {
    mockGetWallet.mockRejectedValueOnce(new Error('boom'));
    await renderAddMoney();

    expect(await screen.findByText("Couldn't load your wallet")).toBeTruthy();

    await fireEvent.press(screen.getByText('Try again'));

    expect(await screen.findByText('₦348,200.00')).toBeTruthy();
  });
});
