import { fireEvent, render, screen, waitFor } from '@testing-library/react-native';
import { router } from 'expo-router';
import React from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { ToastProvider } from '@/components';
import { confirmNgnDeposit, getDepositAccount } from '@/data/wallet';

import { BankTransferDepositScreen } from '../BankTransferDepositScreen';

jest.mock('expo-router', () => ({
  router: { back: jest.fn() },
}));

jest.mock('@/data/wallet', () => ({
  getDepositAccount: jest.fn(),
  confirmNgnDeposit: jest.fn(),
  MIN_NGN_DEPOSIT_KOBO: 10_000,
}));

const mockGetDepositAccount = getDepositAccount as jest.Mock;
const mockConfirmNgnDeposit = confirmNgnDeposit as jest.Mock;
const mockBack = router.back as jest.Mock;

const initialMetrics = {
  frame: { x: 0, y: 0, width: 390, height: 844 },
  insets: { top: 47, left: 0, right: 0, bottom: 34 },
};

async function renderDeposit() {
  return render(
    <SafeAreaProvider initialMetrics={initialMetrics}>
      <ToastProvider>
        <BankTransferDepositScreen />
      </ToastProvider>
    </SafeAreaProvider>,
  );
}

beforeEach(() => {
  jest.clearAllMocks();
  mockGetDepositAccount.mockImplementation(jest.requireActual('@/data/wallet').getDepositAccount);
  mockConfirmNgnDeposit.mockResolvedValue({
    id: 'txn_dep',
    type: 'receive',
    title: 'Bank transfer top-up',
    amountKobo: 5_000_000,
    currency: 'NGN',
    status: 'successful',
    reference: 'DNR-500001',
    createdAt: new Date().toISOString(),
  });
});

describe('Bank transfer deposit screen', () => {
  it('renders the personalized deposit account', async () => {
    await renderDeposit();

    expect(await screen.findByText('Transfer to your Daniruk account')).toBeTruthy();
    expect(screen.getByText('Wema Bank')).toBeTruthy();
    expect(screen.getByText('Active')).toBeTruthy();
    expect(screen.getByText('8129 460 173')).toBeTruthy();
    expect(screen.getByText('DANIRUK / ADEBAYO OKAFOR')).toBeTruthy();
  });

  it('gives copy feedback for the account number', async () => {
    await renderDeposit();
    await fireEvent.press(await screen.findByTestId('copy-account-number'));

    expect(await screen.findByText('Account number copied')).toBeTruthy();
  });

  it('blocks confirmation until a valid amount is entered', async () => {
    await renderDeposit();
    await screen.findByText('Transfer to your Daniruk account');

    await fireEvent.press(screen.getByText("I've made the transfer"));
    expect(mockConfirmNgnDeposit).not.toHaveBeenCalled();

    await fireEvent.changeText(screen.getByTestId('amount-input'), '50');
    expect(await screen.findByText('Amount must be at least 100')).toBeTruthy();
    await fireEvent.press(screen.getByText("I've made the transfer"));
    expect(mockConfirmNgnDeposit).not.toHaveBeenCalled();
  });

  it('confirms the deposit and shows the success state', async () => {
    await renderDeposit();
    await screen.findByText('Transfer to your Daniruk account');

    await fireEvent.changeText(screen.getByTestId('amount-input'), '50000');

    expect(await screen.findByText('Transfer amount')).toBeTruthy();
    expect(screen.getByText('FREE')).toBeTruthy();
    expect(screen.getByText('Expected wallet credit')).toBeTruthy();

    await fireEvent.press(screen.getByText("I've made the transfer"));

    await waitFor(() => expect(mockConfirmNgnDeposit).toHaveBeenCalledWith(5_000_000));
    expect(await screen.findByText('Top-up successful')).toBeTruthy();

    await fireEvent.press(screen.getByText('Done'));
    expect(mockBack).toHaveBeenCalledTimes(1);
  });

  it('shows a retryable error state when account details fail to load', async () => {
    mockGetDepositAccount.mockRejectedValueOnce(new Error('boom'));
    await renderDeposit();

    expect(await screen.findByText("Couldn't load account details")).toBeTruthy();

    await fireEvent.press(screen.getByText('Try again'));

    expect(await screen.findByText('Transfer to your Daniruk account')).toBeTruthy();
  });
});
