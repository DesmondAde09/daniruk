import { fireEvent, render, screen, waitFor } from '@testing-library/react-native';
import { router } from 'expo-router';
import React from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { getNetworks, payBill } from '@/data/services';
import { getWallet } from '@/data/wallet';

import { AirtimeScreen } from '../AirtimeScreen';

jest.mock('expo-router', () => ({
  router: { push: jest.fn(), back: jest.fn() },
}));

jest.mock('@/data/services', () => {
  const actual = jest.requireActual('@/data/services');
  return { ...actual, getNetworks: jest.fn(), payBill: jest.fn() };
});

jest.mock('@/data/wallet', () => {
  const actual = jest.requireActual('@/data/wallet');
  return { ...actual, getWallet: jest.fn() };
});

const mockGetNetworks = getNetworks as jest.Mock;
const mockGetWallet = getWallet as jest.Mock;
const mockPayBill = payBill as jest.Mock;
const mockBack = router.back as jest.Mock;

const initialMetrics = {
  frame: { x: 0, y: 0, width: 390, height: 844 },
  insets: { top: 47, left: 0, right: 0, bottom: 34 },
};

const mockTransaction = {
  id: 'txn_new',
  type: 'airtime',
  title: 'Airtel Airtime',
  amountKobo: -20_000,
  currency: 'NGN',
  status: 'successful',
  reference: 'DNR-999991',
  createdAt: new Date().toISOString(),
  meta: { network: 'Airtel', phone: '08034561234' },
};

async function renderAirtime() {
  return render(
    <SafeAreaProvider initialMetrics={initialMetrics}>
      <AirtimeScreen />
    </SafeAreaProvider>,
  );
}

beforeEach(() => {
  jest.clearAllMocks();
  const services = jest.requireActual('@/data/services');
  const walletData = jest.requireActual('@/data/wallet');
  mockGetNetworks.mockImplementation(services.getNetworks);
  mockGetWallet.mockImplementation(walletData.getWallet);
  mockPayBill.mockResolvedValue({ ...mockTransaction });
});

describe('Airtime screen', () => {
  it('renders the networks and the wallet balance hint', async () => {
    await renderAirtime();

    expect(await screen.findByText('MTN')).toBeTruthy();
    expect(screen.getByText('Airtel')).toBeTruthy();
    expect(screen.getByText('Glo')).toBeTruthy();
    expect(screen.getByText('9mobile')).toBeTruthy();
    expect(screen.getByText('Wallet balance: ₦348,200.00 · Minimum ₦50')).toBeTruthy();
  });

  it('rejects an invalid phone number and blocks payment', async () => {
    await renderAirtime();
    await screen.findByText('MTN');

    await fireEvent.changeText(screen.getByTestId('textfield-input'), '123');
    await fireEvent.changeText(screen.getByTestId('amount-input'), '200');

    expect(screen.getByText('Enter a valid Nigerian phone number')).toBeTruthy();

    await fireEvent.press(screen.getByText('Continue'));
    expect(screen.queryByText('Confirm purchase')).toBeNull();
    expect(mockPayBill).not.toHaveBeenCalled();
  });

  it('blocks amounts below the ₦50 minimum', async () => {
    await renderAirtime();
    await screen.findByText('MTN');

    await fireEvent.changeText(screen.getByTestId('amount-input'), '10');

    expect(screen.getByText('Minimum airtime purchase is ₦50')).toBeTruthy();

    await fireEvent.press(screen.getByText('Continue'));
    expect(screen.queryByText('Confirm purchase')).toBeNull();
    expect(mockPayBill).not.toHaveBeenCalled();
  });

  it('blocks amounts above the wallet balance', async () => {
    await renderAirtime();
    await screen.findByText('MTN');

    await fireEvent.changeText(screen.getByTestId('amount-input'), '999999');

    expect(screen.getByText('Amount exceeds your wallet balance')).toBeTruthy();

    await fireEvent.press(screen.getByText('Continue'));
    expect(screen.queryByText('Confirm purchase')).toBeNull();
    expect(mockPayBill).not.toHaveBeenCalled();
  });

  it('confirms a purchase and shows the success state', async () => {
    await renderAirtime();
    await screen.findByText('MTN');

    await fireEvent.press(screen.getByTestId('network-option-airtel'));
    await fireEvent.changeText(screen.getByTestId('textfield-input'), '08034561234');
    await fireEvent.changeText(screen.getByTestId('amount-input'), '200');
    await fireEvent.press(screen.getByText('Continue'));

    expect(screen.getByText('Confirm purchase')).toBeTruthy();
    expect(screen.getAllByText('Airtel').length).toBeGreaterThan(1);
    expect(screen.getByText('₦200.00')).toBeTruthy();

    await fireEvent.press(screen.getByText('Confirm & pay'));

    await waitFor(() =>
      expect(mockPayBill).toHaveBeenCalledWith({
        type: 'airtime',
        title: 'Airtel Airtime',
        amountKobo: 20_000,
        meta: { network: 'Airtel', phone: '08034561234' },
      }),
    );
    expect(await screen.findByText('Airtime top-up successful')).toBeTruthy();
    expect(screen.getByText('Reference: DNR-999991')).toBeTruthy();

    await fireEvent.press(screen.getByText('Done'));
    expect(mockBack).toHaveBeenCalled();
  });

  it('surfaces a failed payment inside the sheet', async () => {
    mockPayBill.mockRejectedValueOnce(new Error('Insufficient NGN balance'));
    await renderAirtime();
    await screen.findByText('MTN');

    await fireEvent.changeText(screen.getByTestId('textfield-input'), '08034561234');
    await fireEvent.changeText(screen.getByTestId('amount-input'), '200');
    await fireEvent.press(screen.getByText('Continue'));
    await fireEvent.press(screen.getByText('Confirm & pay'));

    expect(await screen.findByText('Insufficient NGN balance')).toBeTruthy();
    expect(screen.queryByText('Airtime top-up successful')).toBeNull();
  });
});
