import { fireEvent, render, screen, waitFor } from '@testing-library/react-native';
import { router } from 'expo-router';
import React from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { getDataPlans, getNetworks, payBill } from '@/data/services';

import { DataScreen } from '../DataScreen';

jest.mock('expo-router', () => ({
  router: { push: jest.fn(), back: jest.fn() },
}));

jest.mock('@/data/services', () => {
  const actual = jest.requireActual('@/data/services');
  return { ...actual, getNetworks: jest.fn(), getDataPlans: jest.fn(), payBill: jest.fn() };
});

const mockGetNetworks = getNetworks as jest.Mock;
const mockGetDataPlans = getDataPlans as jest.Mock;
const mockPayBill = payBill as jest.Mock;
const mockBack = router.back as jest.Mock;

const initialMetrics = {
  frame: { x: 0, y: 0, width: 390, height: 844 },
  insets: { top: 47, left: 0, right: 0, bottom: 34 },
};

const mockTransaction = {
  id: 'txn_new',
  type: 'data',
  title: 'MTN Data — 2GB',
  amountKobo: -120_000,
  currency: 'NGN',
  status: 'successful',
  reference: 'DNR-999992',
  createdAt: new Date().toISOString(),
  meta: { network: 'MTN', plan: '2GB — 30 days', phone: '08034561234' },
};

async function renderData() {
  return render(
    <SafeAreaProvider initialMetrics={initialMetrics}>
      <DataScreen />
    </SafeAreaProvider>,
  );
}

beforeEach(() => {
  jest.clearAllMocks();
  const actual = jest.requireActual('@/data/services');
  mockGetNetworks.mockImplementation(actual.getNetworks);
  mockGetDataPlans.mockImplementation(actual.getDataPlans);
  mockPayBill.mockResolvedValue({ ...mockTransaction });
});

describe('Data screen', () => {
  it('loads the default network\u2019s plans with prices', async () => {
    await renderData();

    expect(await screen.findByText('2GB — 30 days')).toBeTruthy();
    expect(screen.getByText('₦1,200.00')).toBeTruthy();
    expect(screen.getByText('5GB — 30 days')).toBeTruthy();
    expect(screen.getByText('₦1,800.00')).toBeTruthy();
    expect(mockGetDataPlans).toHaveBeenCalledWith('mtn');
  });

  it('reloads plans when the network changes and clears the selected plan', async () => {
    await renderData();
    await screen.findByText('2GB — 30 days');

    await fireEvent.press(screen.getByTestId('plan-option-mtn-2gb'));
    await fireEvent.press(screen.getByTestId('network-option-airtel'));

    // ₦3,500.00 is unique to Airtel's 10GB plan — waiting on it (rather than
    // the shared "10GB — 30 days" name) guarantees the reload has landed.
    expect(await screen.findByText('₦3,500.00')).toBeTruthy();
    expect(screen.getByText('10GB — 30 days')).toBeTruthy();
    expect(screen.queryByText('₦1,200.00')).toBeNull();
    expect(mockGetDataPlans).toHaveBeenLastCalledWith('airtel');
  });

  it('keeps Continue disabled until a plan and a valid phone are entered', async () => {
    await renderData();
    await screen.findByText('2GB — 30 days');

    await fireEvent.changeText(screen.getByTestId('textfield-input'), '123');
    expect(screen.getByText('Enter a valid Nigerian phone number')).toBeTruthy();

    await fireEvent.press(screen.getByText('Continue'));
    expect(screen.queryByText('Confirm purchase')).toBeNull();
    expect(mockPayBill).not.toHaveBeenCalled();
  });

  it('confirms a plan purchase and shows the success state', async () => {
    await renderData();
    await screen.findByText('2GB — 30 days');

    await fireEvent.press(screen.getByTestId('plan-option-mtn-2gb'));
    await fireEvent.changeText(screen.getByTestId('textfield-input'), '08034561234');
    await fireEvent.press(screen.getByText('Continue'));

    expect(screen.getByText('Confirm purchase')).toBeTruthy();
    expect(screen.getAllByText('2GB — 30 days').length).toBeGreaterThan(1);

    await fireEvent.press(screen.getByText('Confirm & pay'));

    await waitFor(() =>
      expect(mockPayBill).toHaveBeenCalledWith({
        type: 'data',
        title: 'MTN Data — 2GB',
        amountKobo: 120_000,
        meta: { network: 'MTN', plan: '2GB — 30 days', phone: '08034561234' },
      }),
    );
    expect(await screen.findByText('Data purchase successful')).toBeTruthy();
    expect(screen.getByText('₦1,200.00')).toBeTruthy();
    expect(screen.getByText('Reference: DNR-999992')).toBeTruthy();

    await fireEvent.press(screen.getByText('Done'));
    expect(mockBack).toHaveBeenCalled();
  });

  it('surfaces a failed payment inside the sheet', async () => {
    mockPayBill.mockRejectedValueOnce(new Error('Insufficient NGN balance'));
    await renderData();
    await screen.findByText('2GB — 30 days');

    await fireEvent.press(screen.getByTestId('plan-option-mtn-2gb'));
    await fireEvent.changeText(screen.getByTestId('textfield-input'), '08034561234');
    await fireEvent.press(screen.getByText('Continue'));
    await fireEvent.press(screen.getByText('Confirm & pay'));

    expect(await screen.findByText('Insufficient NGN balance')).toBeTruthy();
    expect(screen.queryByText('Data purchase successful')).toBeNull();
  });
});
