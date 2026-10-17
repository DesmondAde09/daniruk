import { fireEvent, render, screen, waitFor } from '@testing-library/react-native';
import React from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import * as auth from '@/data/auth';
import { SessionProvider } from '@/auth/SessionProvider';

import SignupScreen from '@/app/(auth)/signup';

const mockPush = jest.fn();
const mockReplace = jest.fn();

jest.mock('expo-router', () => ({
  useRouter: () => ({
    push: mockPush,
    replace: mockReplace,
    back: jest.fn(),
    canGoBack: () => true,
  }),
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
    signUp: jest.fn(async (fullName: string, email: string) => ({
      ...mockUser,
      fullName: fullName.trim(),
      email: email.trim().toLowerCase(),
    })),
    verifyOtp: jest.fn(),
    signOut: jest.fn(async () => undefined),
  };
});

const initialMetrics = {
  frame: { x: 0, y: 0, width: 390, height: 844 },
  insets: { top: 47, left: 0, right: 0, bottom: 34 },
};

async function renderSignup() {
  await render(
    <SafeAreaProvider initialMetrics={initialMetrics}>
      <SessionProvider>
        <SignupScreen />
      </SessionProvider>
    </SafeAreaProvider>,
  );
}

describe('Signup screen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders the signup form with the toggle on "Sign up"', async () => {
    await renderSignup();
    expect(screen.getByText('Create your account')).toBeTruthy();
    expect(screen.getByPlaceholderText('First and last name')).toBeTruthy();
    expect(screen.getByTestId('segment-signup')).toBeTruthy();
  });

  it('rejects a single-word full name', async () => {
    await renderSignup();
    await fireEvent.changeText(screen.getByPlaceholderText('First and last name'), 'Adebayo');
    await fireEvent.changeText(screen.getByPlaceholderText('you@example.com'), 'adebayo@daniruk.app');
    await fireEvent.changeText(screen.getByPlaceholderText('Minimum 8 characters'), 'password123');
    await fireEvent.press(screen.getByRole('button', { name: 'Create account' }));
    expect(screen.getByText('Enter your first and last name')).toBeTruthy();
    expect(auth.signUp).not.toHaveBeenCalled();
  });

  it('signs up and routes to the OTP screen with the email', async () => {
    await renderSignup();
    await fireEvent.changeText(screen.getByPlaceholderText('First and last name'), 'Adebayo Okafor');
    await fireEvent.changeText(screen.getByPlaceholderText('you@example.com'), 'adebayo@daniruk.app');
    await fireEvent.changeText(screen.getByPlaceholderText('Minimum 8 characters'), 'password123');
    await fireEvent.press(screen.getByRole('button', { name: 'Create account' }));
    await waitFor(() => {
      expect(auth.signUp).toHaveBeenCalledWith('Adebayo Okafor', 'adebayo@daniruk.app', 'password123');
    });
    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith({
        pathname: '/(auth)/otp',
        params: { email: 'adebayo@daniruk.app' },
      });
    });
  });

  it('syncs the segmented toggle to the login route', async () => {
    await renderSignup();
    await fireEvent.press(screen.getByTestId('segment-login'));
    expect(mockReplace).toHaveBeenCalledWith('/(auth)/login');
  });
});
