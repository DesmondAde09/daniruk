import { fireEvent, render, screen, waitFor } from '@testing-library/react-native';
import React from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { ToastProvider } from '@/components';
import * as auth from '@/data/auth';
import { SessionProvider } from '@/auth/SessionProvider';

import OtpScreen from '@/app/(auth)/otp';

jest.mock('expo-router', () => ({
  useRouter: () => ({ push: jest.fn(), replace: jest.fn(), back: jest.fn(), canGoBack: () => true }),
  useLocalSearchParams: () => ({ email: 'adebayo@daniruk.app' }),
}));

jest.mock('@/components/TabBar', () => ({ TabBar: () => null }));

jest.mock('@/data/auth', () => {
  const mockUser = {
    id: 'user_001',
    fullName: 'Adebayo Okafor',
    email: 'adebayo@daniruk.app',
    avatarInitials: 'AO',
    referralCode: 'ADEBAYO2026',
  };
  return {
    mockUser,
    getSession: jest.fn(async () => null),
    signIn: jest.fn(),
    signUp: jest.fn(),
    // Any 6 digits accepted, except 000000 so tests can exercise the error state.
    verifyOtp: jest.fn(async (code: string) => /^\d{6}$/.test(code) && code !== '000000'),
    signOut: jest.fn(async () => undefined),
  };
});

const initialMetrics = {
  frame: { x: 0, y: 0, width: 390, height: 844 },
  insets: { top: 47, left: 0, right: 0, bottom: 34 },
};

async function renderOtp() {
  await render(
    <SafeAreaProvider initialMetrics={initialMetrics}>
      <SessionProvider>
        <ToastProvider>
          <OtpScreen />
        </ToastProvider>
      </SessionProvider>
    </SafeAreaProvider>,
  );
}

describe('OTP screen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders the caption with the email from the route params', async () => {
    await renderOtp();
    expect(screen.getByText('Check your email')).toBeTruthy();
    expect(screen.getByText(/adebayo@daniruk\.app/)).toBeTruthy();
  });

  it('verifies automatically once 6 digits are entered', async () => {
    await renderOtp();
    await fireEvent.changeText(screen.getByTestId('otp-input'), '123456');
    await waitFor(() => {
      expect(auth.verifyOtp).toHaveBeenCalledWith('123456');
    });
  });

  it('shows an error when the code is rejected', async () => {
    await renderOtp();
    await fireEvent.changeText(screen.getByTestId('otp-input'), '000000');
    await waitFor(() => {
      expect(screen.getByText(/That code doesn't look right/)).toBeTruthy();
    });
  });

  it('keeps the verify button disabled until 6 digits are entered', async () => {
    await renderOtp();
    const button = screen.getByRole('button', { name: 'Verify code' });
    expect(button.props.accessibilityState?.disabled).toBe(true);
    await fireEvent.changeText(screen.getByTestId('otp-input'), '12345');
    expect(
      screen.getByRole('button', { name: 'Verify code' }).props.accessibilityState?.disabled,
    ).toBe(true);
  });

  it('shows a toast when resending the code', async () => {
    await renderOtp();
    await fireEvent.press(screen.getByRole('button', { name: 'Resend code' }));
    await waitFor(() => {
      expect(screen.getByText('Code resent')).toBeTruthy();
    });
  });
});
