import { fireEvent, render, screen, waitFor } from '@testing-library/react-native';
import { router } from 'expo-router';
import React from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import {
  getBanks,
  getRecentRecipients,
  getWallet,
  resolveRecipientAccount,
  transferNgn,
} from '@/data/wallet';

import { TransferScreen } from '../TransferScreen';

jest.mock('expo-router', () => ({
  router: { back: jest.fn(), push: jest.fn() },
}));

jest.mock('@/data/wallet', () => {
  const actual = jest.requireActual('@/data/wallet');
  return {
    ...actual,
    getBanks: jest.fn(),
    getWallet: jest.fn(),
    getRecentRecipients: jest.fn(),
    resolveRecipientAccount: jest.fn(),
    transferNgn: jest.fn(),
  };
});

const mockGetBanks = getBanks as jest.Mock;
const mockGetWallet = getWallet as jest.Mock;
const mockGetRecentRecipients = getRecentRecipients as jest.Mock;
const mockResolve = resolveRecipientAccount as jest.Mock;
const mockTransferNgn = transferNgn as jest.Mock;
const mockBack = router.back as jest.Mock;

const initialMetrics = {
  frame: { x: 0, y: 0, width: 390, height: 844 },
  insets: { top: 47, left: 0, right: 0, bottom: 34 },
};

const mockTransaction = {
  id: 'txn_new',
  type: 'transfer',
  title: 'Transfer to Ngozi Eze',
  amountKobo: -500_000,
  currency: 'NGN',
  status: 'successful',
  reference: 'DNR-999999',
  createdAt: new Date().toISOString(),
  meta: {
    bank: 'GTBank',
    accountNumber: '1112223334',
    accountName: 'Ngozi Eze',
  },
};

async function renderTransfer() {
  return render(
    <SafeAreaProvider initialMetrics={initialMetrics}>
      <TransferScreen />
    </SafeAreaProvider>,
  );
}

beforeEach(() => {
  jest.clearAllMocks();
  const actual = jest.requireActual('@/data/wallet');
  mockGetBanks.mockImplementation(actual.getBanks);
  mockGetWallet.mockImplementation(actual.getWallet);
  mockGetRecentRecipients.mockImplementation(actual.getRecentRecipients);
  mockResolve.mockImplementation(actual.resolveRecipientAccount);
  mockTransferNgn.mockResolvedValue({ ...mockTransaction });
});

describe('Transfer screen', () => {
  it('renders the bank list, search field, and the seeded recent recipients', async () => {
    await renderTransfer();

    expect(await screen.findByText('Zenith Bank')).toBeTruthy();
    expect(screen.getByText('Search banks')).toBeTruthy();
    expect(screen.getByText('GTBank')).toBeTruthy();
    expect(screen.getByText('Chiamaka Nwosu')).toBeTruthy();
    expect(screen.getByText('Tunde Balogun')).toBeTruthy();
    expect(screen.getByText('Kuda · 2034567891')).toBeTruthy();
    expect(screen.getByText('Wallet balance: ₦348,200.00')).toBeTruthy();
  });

  it('narrows the bank list as the user searches', async () => {
    await renderTransfer();
    await screen.findByText('Zenith Bank');

    await fireEvent.changeText(screen.getByPlaceholderText('Bank name'), 'zen');

    expect(screen.getByText('Zenith Bank')).toBeTruthy();
    expect(screen.queryByText('GTBank')).toBeNull();
    expect(screen.queryByText('Access Bank')).toBeNull();
  });

  it('shows the empty-filter caption when no bank matches', async () => {
    await renderTransfer();
    await screen.findByText('Zenith Bank');

    await fireEvent.changeText(screen.getByPlaceholderText('Bank name'), 'xyzzy');

    expect(screen.getByText('No banks match your search.')).toBeTruthy();
  });

  it('auto-verifies a 10-digit number and stays blocked on a short one', async () => {
    await renderTransfer();
    await screen.findByText('Zenith Bank');

    await fireEvent.press(screen.getByTestId('transfer-bank-option-Kuda'));
    await fireEvent.changeText(screen.getByPlaceholderText('0123456789'), '2034567891');

    await waitFor(() => expect(mockResolve).toHaveBeenCalledWith('Kuda', '2034567891'));
    // The recents row plus the verified card both show the resolved name.
    await waitFor(() => expect(screen.getAllByText('Chiamaka Nwosu').length).toBe(2));

    await fireEvent.changeText(screen.getByPlaceholderText('0123456789'), '20345');

    expect(screen.getAllByText('Chiamaka Nwosu').length).toBe(1);
    await fireEvent.press(screen.getByText('Continue'));
    expect(screen.queryByText('Confirm transfer')).toBeNull();
    expect(mockTransferNgn).not.toHaveBeenCalled();
  });

  it('fills the verified card when a recent recipient is picked', async () => {
    await renderTransfer();
    await screen.findByText('Zenith Bank');

    await fireEvent.press(screen.getByTestId('recipient-option-8123456780'));

    // Recents row + verified card both show the recipient's name and caption.
    await waitFor(() => expect(screen.getAllByText('Tunde Balogun').length).toBe(2));
    await waitFor(() => expect(screen.getAllByText('Opay · 8123456780').length).toBe(2));
  });

  it('confirms a transfer and shows the success state', async () => {
    await renderTransfer();
    await screen.findByText('Zenith Bank');

    await fireEvent.press(screen.getByTestId('transfer-bank-option-GTBank'));
    await fireEvent.changeText(screen.getByPlaceholderText('0123456789'), '1112223334');
    await screen.findByText('Ngozi Eze');

    await fireEvent.changeText(screen.getByTestId('amount-input'), '5000');
    await fireEvent.press(screen.getByText('Continue'));

    expect(screen.getByText('Confirm transfer')).toBeTruthy();
    expect(screen.getByText('FREE')).toBeTruthy();

    await fireEvent.press(screen.getByText('Confirm & send'));

    await waitFor(() =>
      expect(mockTransferNgn).toHaveBeenCalledWith({
        bankName: 'GTBank',
        accountNumber: '1112223334',
        accountName: 'Ngozi Eze',
        amountKobo: 500_000,
        remark: undefined,
      }),
    );
    expect(await screen.findByText('Transfer successful')).toBeTruthy();
    expect(screen.getByText('Money sent to Ngozi Eze')).toBeTruthy();
    expect(screen.getByText('Reference: DNR-999999')).toBeTruthy();

    await fireEvent.press(screen.getByText('Done'));
    expect(mockBack).toHaveBeenCalled();
  });
});
