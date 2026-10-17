import { fireEvent, render, screen } from '@testing-library/react-native';
import React from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { getNotifications } from '@/data/notifications';
import { getTransactions } from '@/data/transactions';
import { getWallet } from '@/data/wallet';
import { greeting } from '@/lib/greeting';

import { HomeScreen } from '../HomeScreen';

const mockUseFocusEffect = jest.fn();

jest.mock('expo-router', () => ({
  router: { push: jest.fn() },
  useFocusEffect: (callback: () => void) => mockUseFocusEffect(callback),
}));

// The auth gate guarantees a signed-in session; stub the hook with the persona.
jest.mock('@/auth/SessionProvider', () => ({
  useSession: () => ({
    user: jest.requireActual('@/data/auth').mockUser,
    status: 'signedIn',
  }),
}));

jest.mock('@/data/wallet', () => ({ getWallet: jest.fn() }));
jest.mock('@/data/transactions', () => ({ getTransactions: jest.fn() }));
jest.mock('@/data/notifications', () => ({ getNotifications: jest.fn() }));

const mockGetWallet = getWallet as jest.Mock;
const mockGetTransactions = getTransactions as jest.Mock;
const mockGetNotifications = getNotifications as jest.Mock;

const initialMetrics = {
  frame: { x: 0, y: 0, width: 390, height: 844 },
  insets: { top: 47, left: 0, right: 0, bottom: 34 },
};

async function renderHome() {
  return render(
    <SafeAreaProvider initialMetrics={initialMetrics}>
      <HomeScreen />
    </SafeAreaProvider>,
  );
}

beforeEach(() => {
  jest.clearAllMocks();
  mockGetWallet.mockImplementation(jest.requireActual('@/data/wallet').getWallet);
  mockGetTransactions.mockImplementation(jest.requireActual('@/data/transactions').getTransactions);
  mockGetNotifications.mockImplementation(jest.requireActual('@/data/notifications').getNotifications);
});

describe('Home screen', () => {
  it('renders the time-of-day greeting and the wallet balance from the mocks', async () => {
    await renderHome();

    expect(await screen.findByText(`${greeting()}, Adebayo`)).toBeTruthy();
    expect(screen.getByText('What would you like to do?')).toBeTruthy();
    expect(await screen.findByText('₦348,200.00')).toBeTruthy();
  });

  it('masks the balance when the eye toggle is pressed', async () => {
    await renderHome();
    expect(await screen.findByText('₦348,200.00')).toBeTruthy();

    await fireEvent.press(screen.getByLabelText('Hide balance'));

    expect(screen.getByText('₦••••••')).toBeTruthy();
    expect(screen.queryByText('₦348,200.00')).toBeNull();

    await fireEvent.press(screen.getByLabelText('Show balance'));
    expect(screen.getByText('₦348,200.00')).toBeTruthy();
  });

  it('renders all four quick services', async () => {
    await renderHome();

    expect(screen.getByText('Flights')).toBeTruthy();
    expect(screen.getByText('Electricity')).toBeTruthy();
    expect(screen.getByText('Airtime')).toBeTruthy();
    expect(screen.getByText('Data')).toBeTruthy();

    // Flush the pending async sections so their state updates land inside act().
    await screen.findByText('Apple Gift Card');
  });

  it('shows the Apple Gift Card trade in recent transactions', async () => {
    await renderHome();

    expect(await screen.findByText('Apple Gift Card')).toBeTruthy();
    expect(screen.getByText('+₦71,250')).toBeTruthy();
    expect(screen.getAllByText('Successful').length).toBeGreaterThan(0);
  });

  it('shows a retryable error state when the wallet fails to load', async () => {
    mockGetWallet.mockRejectedValueOnce(new Error('boom'));
    await renderHome();

    const retry = await screen.findByText('Try again');
    expect(screen.getByText('Something went wrong')).toBeTruthy();

    await fireEvent.press(retry);

    expect(await screen.findByText('₦348,200.00')).toBeTruthy();
    expect(mockGetWallet).toHaveBeenCalledTimes(2);
  });
});
