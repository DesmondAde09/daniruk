import { fireEvent, render, screen, waitFor } from '@testing-library/react-native';
import { router } from 'expo-router';
import React from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { getDiscos, payBill } from '@/data/services';
import { getWallet } from '@/data/wallet';

import { ElectricityScreen } from '../ElectricityScreen';

jest.mock('expo-router', () => ({
  router: { push: jest.fn(), back: jest.fn() },
}));

jest.mock('@/data/services', () => {
  const actual = jest.requireActual('@/data/services');
  return { ...actual, getDiscos: jest.fn(), payBill: jest.fn() };
});

jest.mock('@/data/wallet', () => {
  const actual = jest.requireActual('@/data/wallet');
  return { ...actual, getWallet: jest.fn() };
});

const mockGetDiscos = getDiscos as jest.Mock;
const mockGetWallet = getWallet as jest.Mock;
const mockPayBill = payBill as jest.Mock;
const mockBack = router.back as jest.Mock;

const initialMetrics = {
  frame: { x: 0, y: 0, width: 390, height: 844 },
  insets: { top: 47, left: 0, right: 0, bottom: 34 },
};

const mockTransaction = {
  id: 'txn_new',
  type: 'electricity',
  title: 'IKEDC Postpaid',
  amountKobo: -200_000,
  currency: 'NGN',
  status: 'successful',
  reference: 'DNR-999993',
  createdAt: new Date().toISOString(),
  meta: { disco: 'Ikeja Electric (IKEDC)', meterNumber: '04512378901', meterType: 'Postpaid' },
};

async function renderElectricity() {
  return render(
    <SafeAreaProvider initialMetrics={initialMetrics}>
      <ElectricityScreen />
    </SafeAreaProvider>,
  );
}

async function fillValidForm() {
  await fireEvent.press(screen.getByTestId('disco-option-ikedc'));
  await fireEvent.changeText(screen.getByTestId('textfield-input'), '04512378901');
  await fireEvent.changeText(screen.getByTestId('amount-input'), '2000');
}

beforeEach(() => {
  jest.clearAllMocks();
  const services = jest.requireActual('@/data/services');
  const walletData = jest.requireActual('@/data/wallet');
  mockGetDiscos.mockImplementation(services.getDiscos);
  mockGetWallet.mockImplementation(walletData.getWallet);
  mockPayBill.mockResolvedValue({ ...mockTransaction });
});

describe('Electricity screen', () => {
  it('renders the discos and the wallet balance hint', async () => {
    await renderElectricity();

    expect(await screen.findByText('Eko Electric (EKEDC)')).toBeTruthy();
    expect(screen.getByText('Ikeja Electric (IKEDC)')).toBeTruthy();
    expect(screen.getByText('Wallet balance: ₦348,200.00 · Minimum ₦500')).toBeTruthy();
  });

  it('rejects an invalid meter number and blocks payment', async () => {
    await renderElectricity();
    await screen.findByText('Eko Electric (EKEDC)');

    await fireEvent.changeText(screen.getByTestId('textfield-input'), '12');
    await fireEvent.changeText(screen.getByTestId('amount-input'), '2000');

    expect(screen.getByText('Enter a valid meter number')).toBeTruthy();

    await fireEvent.press(screen.getByText('Continue'));
    expect(screen.queryByText('Confirm payment')).toBeNull();
    expect(mockPayBill).not.toHaveBeenCalled();
  });

  it('blocks amounts below the ₦500 minimum', async () => {
    await renderElectricity();
    await screen.findByText('Eko Electric (EKEDC)');

    await fireEvent.changeText(screen.getByTestId('amount-input'), '100');

    expect(screen.getByText('Minimum electricity payment is ₦500')).toBeTruthy();

    await fireEvent.press(screen.getByText('Continue'));
    expect(screen.queryByText('Confirm payment')).toBeNull();
    expect(mockPayBill).not.toHaveBeenCalled();
  });

  it('confirms a postpaid payment and shows the success state', async () => {
    await renderElectricity();
    await screen.findByText('Eko Electric (EKEDC)');

    await fillValidForm();
    await fireEvent.press(screen.getByTestId('segment-postpaid'));
    await fireEvent.press(screen.getByText('Continue'));

    expect(screen.getByText('Confirm payment')).toBeTruthy();
    expect(screen.getByText('₦2,000.00')).toBeTruthy();

    await fireEvent.press(screen.getByText('Confirm & pay'));

    await waitFor(() =>
      expect(mockPayBill).toHaveBeenCalledWith({
        type: 'electricity',
        title: 'IKEDC Postpaid',
        amountKobo: 200_000,
        meta: {
          disco: 'Ikeja Electric (IKEDC)',
          meterNumber: '04512378901',
          meterType: 'Postpaid',
        },
      }),
    );
    expect(await screen.findByText('Electricity payment successful')).toBeTruthy();
    expect(screen.getByText('Reference: DNR-999993')).toBeTruthy();

    await fireEvent.press(screen.getByText('Done'));
    expect(mockBack).toHaveBeenCalled();
  });

  it('defaults to a prepaid payment', async () => {
    await renderElectricity();
    await screen.findByText('Eko Electric (EKEDC)');

    await fillValidForm();
    await fireEvent.press(screen.getByText('Continue'));
    await fireEvent.press(screen.getByText('Confirm & pay'));

    await waitFor(() =>
      expect(mockPayBill).toHaveBeenCalledWith(
        expect.objectContaining({
          title: 'IKEDC Prepaid',
          meta: expect.objectContaining({ meterType: 'Prepaid' }),
        }),
      ),
    );
  });

  it('surfaces a failed payment inside the sheet', async () => {
    mockPayBill.mockRejectedValueOnce(new Error('Insufficient NGN balance'));
    await renderElectricity();
    await screen.findByText('Eko Electric (EKEDC)');

    await fillValidForm();
    await fireEvent.press(screen.getByText('Continue'));
    await fireEvent.press(screen.getByText('Confirm & pay'));

    expect(await screen.findByText('Insufficient NGN balance')).toBeTruthy();
    expect(screen.queryByText('Electricity payment successful')).toBeNull();
  });
});
