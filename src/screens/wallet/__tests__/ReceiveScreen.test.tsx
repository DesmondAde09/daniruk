import { fireEvent, render, screen } from '@testing-library/react-native';
import React from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { ToastProvider } from '@/components';
import { getWallet } from '@/data/wallet';

import { ReceiveScreen } from '../ReceiveScreen';

const mockCopyToClipboard = jest.fn().mockResolvedValue(undefined);

jest.mock('expo-router', () => ({
  router: { back: jest.fn() },
}));

jest.mock('@/data/wallet', () => ({ getWallet: jest.fn() }));

jest.mock('@/lib/clipboard', () => ({
  copyToClipboard: (...args: unknown[]) => mockCopyToClipboard(...args),
}));

const mockGetWallet = getWallet as jest.Mock;

const initialMetrics = {
  frame: { x: 0, y: 0, width: 390, height: 844 },
  insets: { top: 47, left: 0, right: 0, bottom: 34 },
};

async function renderReceive() {
  return render(
    <SafeAreaProvider initialMetrics={initialMetrics}>
      <ToastProvider>
        <ReceiveScreen />
      </ToastProvider>
    </SafeAreaProvider>,
  );
}

beforeEach(() => {
  jest.clearAllMocks();
  mockGetWallet.mockImplementation(jest.requireActual('@/data/wallet').getWallet);
});

describe('Receive screen', () => {
  it('shows the BTC address, balance and QR placeholder by default', async () => {
    await renderReceive();

    expect(await screen.findByText('bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh')).toBeTruthy();
    expect(screen.getByText('0.0048 BTC')).toBeTruthy();
    expect(screen.getByTestId('qr-placeholder')).toBeTruthy();
  });

  it('switches to the USDT address and balance', async () => {
    await renderReceive();
    await screen.findByText('bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh');

    await fireEvent.press(screen.getByTestId('segment-USDT'));

    expect(screen.getByText('TGehVcNhud84JUmT2gD3yc5oq9vYkYvZb1')).toBeTruthy();
    expect(screen.getByText('1250.00 USDT')).toBeTruthy();
  });

  it('copies the address and shows success feedback', async () => {
    await renderReceive();
    await screen.findByText('bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh');

    await fireEvent.press(screen.getByTestId('copy-address-button'));

    expect(mockCopyToClipboard).toHaveBeenCalledWith('bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh');
    expect(await screen.findByText('BTC address copied to clipboard')).toBeTruthy();
  });
});
