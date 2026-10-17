import { fireEvent, render, screen, waitFor } from '@testing-library/react-native';
import { router } from 'expo-router';
import React from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { getBankAccounts, getWallet, withdrawCrypto, withdrawNgnToBank } from '@/data/wallet';

import { WithdrawScreen } from '../WithdrawScreen';

const mockUseFocusEffect = jest.fn();

jest.mock('expo-router', () => ({
  router: { push: jest.fn(), back: jest.fn() },
  useFocusEffect: (callback: () => void) => mockUseFocusEffect(callback),
}));

jest.mock('@/data/wallet', () => {
  const actual = jest.requireActual('@/data/wallet');
  return {
    ...actual,
    getWallet: jest.fn(),
    getBankAccounts: jest.fn(),
    withdrawNgnToBank: jest.fn(),
    withdrawCrypto: jest.fn(),
  };
});

const mockGetWallet = getWallet as jest.Mock;
const mockGetBankAccounts = getBankAccounts as jest.Mock;
const mockWithdrawNgnToBank = withdrawNgnToBank as jest.Mock;
const mockWithdrawCrypto = withdrawCrypto as jest.Mock;
const mockPush = router.push as jest.Mock;
const mockBack = router.back as jest.Mock;

const initialMetrics = {
  frame: { x: 0, y: 0, width: 390, height: 844 },
  insets: { top: 47, left: 0, right: 0, bottom: 34 },
};

const mockTransaction = {
  id: 'txn_new',
  type: 'withdraw',
  title: 'Withdrawal to GTBank',
  amountKobo: -500_000,
  currency: 'NGN',
  status: 'successful',
  reference: 'DNR-999999',
  createdAt: new Date().toISOString(),
  meta: { bank: 'GTBank', accountNumber: '0123456789', accountName: 'Adebayo Okafor' },
};

async function renderWithdraw() {
  return render(
    <SafeAreaProvider initialMetrics={initialMetrics}>
      <WithdrawScreen />
    </SafeAreaProvider>,
  );
}

beforeEach(() => {
  jest.clearAllMocks();
  const actual = jest.requireActual('@/data/wallet');
  mockGetWallet.mockImplementation(actual.getWallet);
  mockGetBankAccounts.mockImplementation(actual.getBankAccounts);
  mockWithdrawNgnToBank.mockResolvedValue({ ...mockTransaction });
  mockWithdrawCrypto.mockResolvedValue({
    ...mockTransaction,
    title: 'Crypto Withdrawal — BTC',
    currency: 'BTC',
    meta: { cryptoAmount: '0.001 BTC', address: 'bc1qar0srrr7xfkvy5l643lydnw9re59gtzzwf5mdq' },
  });
});

describe('Withdraw screen — bank account mode', () => {
  it('renders saved accounts and the wallet balance hint', async () => {
    await renderWithdraw();

    expect(await screen.findByText('GTBank')).toBeTruthy();
    expect(screen.getByText('Access Bank')).toBeTruthy();
    expect(screen.getByText('0123456789 · Adebayo Okafor')).toBeTruthy();
    expect(
      screen.getByText('Wallet balance: ₦348,200.00 · Minimum ₦1,000'),
    ).toBeTruthy();
  });

  it('blocks amounts below the minimum', async () => {
    await renderWithdraw();
    await screen.findByText('GTBank');

    await fireEvent.changeText(screen.getByTestId('amount-input'), '500');

    expect(screen.getByText('Minimum withdrawal is ₦1,000')).toBeTruthy();

    await fireEvent.press(screen.getByText('Continue'));
    expect(screen.queryByText('Confirm withdrawal')).toBeNull();
    expect(mockWithdrawNgnToBank).not.toHaveBeenCalled();
  });

  it('blocks amounts above the wallet balance', async () => {
    await renderWithdraw();
    await screen.findByText('GTBank');

    await fireEvent.changeText(screen.getByTestId('amount-input'), '999999');

    expect(screen.getByText('Amount exceeds your wallet balance')).toBeTruthy();

    await fireEvent.press(screen.getByText('Continue'));
    expect(screen.queryByText('Confirm withdrawal')).toBeNull();
    expect(mockWithdrawNgnToBank).not.toHaveBeenCalled();
  });

  it('confirms a withdrawal and shows the success state', async () => {
    await renderWithdraw();
    await screen.findByText('GTBank');

    await fireEvent.changeText(screen.getByTestId('amount-input'), '5000');
    await fireEvent.press(screen.getByTestId('account-option-bank_002'));
    await fireEvent.press(screen.getByText('Continue'));

    expect(screen.getByText('Confirm withdrawal')).toBeTruthy();
    expect(screen.getAllByText('Access Bank').length).toBeGreaterThan(1);

    await fireEvent.press(screen.getByText('Confirm & withdraw'));

    await waitFor(() =>
      expect(mockWithdrawNgnToBank).toHaveBeenCalledWith({
        accountId: 'bank_002',
        amountKobo: 500_000,
      }),
    );
    expect(await screen.findByText('Withdrawal successful')).toBeTruthy();
    expect(screen.getByText('₦5,000.00')).toBeTruthy();
    expect(screen.getByText('Reference: DNR-999999')).toBeTruthy();

    await fireEvent.press(screen.getByText('Done'));
    expect(mockBack).toHaveBeenCalled();
  });

  it('routes to the add-bank-account screen', async () => {
    await renderWithdraw();
    await screen.findByText('GTBank');

    await fireEvent.press(screen.getByTestId('add-bank-account-link'));

    expect(mockPush).toHaveBeenCalledWith('/wallet/add-bank-account');
  });
});

describe('Withdraw screen — crypto mode', () => {
  async function switchToCrypto() {
    await renderWithdraw();
    await screen.findByText('GTBank');
    await fireEvent.press(screen.getByTestId('segment-crypto'));
  }

  it('rejects an invalid recipient address', async () => {
    await switchToCrypto();

    const [addressInput] = screen.getAllByTestId('textfield-input');
    await fireEvent.changeText(addressInput, 'abc');

    expect(screen.getByText('Enter a valid wallet address')).toBeTruthy();
    await fireEvent.press(screen.getByText('Continue'));
    expect(mockWithdrawCrypto).not.toHaveBeenCalled();
  });

  it('blocks amounts above the asset balance', async () => {
    await switchToCrypto();

    const [addressInput, amountInput] = screen.getAllByTestId('textfield-input');
    await fireEvent.changeText(addressInput, 'bc1qar0srrr7xfkvy5l643lydnw9re59gtzzwf5mdq');
    await fireEvent.changeText(amountInput, '1');

    expect(screen.getByText('Insufficient BTC balance')).toBeTruthy();
    await fireEvent.press(screen.getByText('Continue'));
    expect(mockWithdrawCrypto).not.toHaveBeenCalled();
  });

  it('confirms a crypto withdrawal and shows the success state', async () => {
    await switchToCrypto();

    const [addressInput, amountInput] = screen.getAllByTestId('textfield-input');
    await fireEvent.changeText(addressInput, 'bc1qar0srrr7xfkvy5l643lydnw9re59gtzzwf5mdq');
    await fireEvent.changeText(amountInput, '0.001');
    await fireEvent.press(screen.getByText('Continue'));

    await fireEvent.press(screen.getByText('Confirm & withdraw'));

    await waitFor(() =>
      expect(mockWithdrawCrypto).toHaveBeenCalledWith({
        asset: 'BTC',
        address: 'bc1qar0srrr7xfkvy5l643lydnw9re59gtzzwf5mdq',
        amount: '0.001',
      }),
    );
    expect(await screen.findByText('Withdrawal successful')).toBeTruthy();
    expect(screen.getByText('0.001 BTC')).toBeTruthy();
  });
});
