import { fireEvent, render, screen, waitFor } from '@testing-library/react-native';
import { router } from 'expo-router';
import React from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { addBankAccount, getBanks, resolveBankAccountName } from '@/data/wallet';

import { AddBankAccountScreen } from '../AddBankAccountScreen';

jest.mock('expo-router', () => ({
  router: { back: jest.fn() },
}));

jest.mock('@/data/wallet', () => ({
  getBanks: jest.fn(),
  resolveBankAccountName: jest.fn(),
  addBankAccount: jest.fn(),
}));

const mockGetBanks = getBanks as jest.Mock;
const mockResolve = resolveBankAccountName as jest.Mock;
const mockAddBankAccount = addBankAccount as jest.Mock;
const mockBack = router.back as jest.Mock;

const initialMetrics = {
  frame: { x: 0, y: 0, width: 390, height: 844 },
  insets: { top: 47, left: 0, right: 0, bottom: 34 },
};

async function renderAddAccount() {
  return render(
    <SafeAreaProvider initialMetrics={initialMetrics}>
      <AddBankAccountScreen />
    </SafeAreaProvider>,
  );
}

beforeEach(() => {
  jest.clearAllMocks();
  const actual = jest.requireActual('@/data/wallet');
  mockGetBanks.mockImplementation(actual.getBanks);
  mockResolve.mockImplementation(actual.resolveBankAccountName);
  mockAddBankAccount.mockImplementation(actual.addBankAccount);
});

describe('Add bank account screen', () => {
  it('resolves the account name and saves the account', async () => {
    await renderAddAccount();

    expect(await screen.findByText('Zenith Bank')).toBeTruthy();

    await fireEvent.press(screen.getByTestId('bank-option-Zenith Bank'));
    await fireEvent.changeText(screen.getByTestId('textfield-input'), '2233445566');
    await fireEvent.press(screen.getByText('Continue'));

    await waitFor(() =>
      expect(mockResolve).toHaveBeenCalledWith('Zenith Bank', '2233445566'),
    );
    expect(await screen.findByText('Adebayo Okafor')).toBeTruthy();
    expect(screen.getByText('Zenith Bank · 2233445566')).toBeTruthy();

    await fireEvent.press(screen.getByText('Save account'));

    await waitFor(() =>
      expect(mockAddBankAccount).toHaveBeenCalledWith({
        bankName: 'Zenith Bank',
        accountNumber: '2233445566',
      }),
    );
    expect(mockBack).toHaveBeenCalled();
  });

  it('rejects account numbers that are not 10 digits', async () => {
    await renderAddAccount();
    await screen.findByText('Zenith Bank');

    await fireEvent.press(screen.getByTestId('bank-option-Zenith Bank'));
    await fireEvent.changeText(screen.getByTestId('textfield-input'), '123');

    expect(screen.getByText('Account number must be 10 digits')).toBeTruthy();

    await fireEvent.press(screen.getByText('Continue'));
    expect(mockResolve).not.toHaveBeenCalled();
  });

  it('lets the user go back and change details before saving', async () => {
    await renderAddAccount();
    await screen.findByText('Zenith Bank');

    await fireEvent.press(screen.getByTestId('bank-option-GTBank'));
    await fireEvent.changeText(screen.getByTestId('textfield-input'), '0123456789');
    await fireEvent.press(screen.getByText('Continue'));
    await screen.findByText('Adebayo Okafor');

    await fireEvent.press(screen.getByText('Change details'));

    expect(screen.getByText('Select bank')).toBeTruthy();
    expect(mockAddBankAccount).not.toHaveBeenCalled();
  });
});
