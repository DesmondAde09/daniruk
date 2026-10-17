import { fireEvent, render, screen, waitFor } from '@testing-library/react-native';
import React from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import * as auth from '@/data/auth';
import { SessionProvider } from '@/auth/SessionProvider';

import LoginScreen from '@/app/(auth)/login';

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
    signIn: jest.fn(async (email: string) => ({ ...mockUser, email: email.trim().toLowerCase() })),
    signUp: jest.fn(),
    verifyOtp: jest.fn(),
    signOut: jest.fn(async () => undefined),
  };
});

const initialMetrics = {
  frame: { x: 0, y: 0, width: 390, height: 844 },
  insets: { top: 47, left: 0, right: 0, bottom: 34 },
};

async function renderLogin() {
  await render(
    <SafeAreaProvider initialMetrics={initialMetrics}>
      <SessionProvider>
        <LoginScreen />
      </SessionProvider>
    </SafeAreaProvider>,
  );
}

describe('Login screen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders the header, toggle, fields and lock note', async () => {
    await renderLogin();
    expect(screen.getByText('Welcome to Daniruk')).toBeTruthy();
    expect(screen.getByText('Good to see you again')).toBeTruthy();
    expect(screen.getByTestId('segment-login')).toBeTruthy();
    expect(screen.getByTestId('segment-signup')).toBeTruthy();
    expect(screen.getByPlaceholderText('you@example.com')).toBeTruthy();
    expect(
      screen.getByText('Your information is protected with bank-grade encryption.'),
    ).toBeTruthy();
  });

  it('shows validation errors on empty submit', async () => {
    await renderLogin();
    await fireEvent.press(screen.getByRole('button', { name: 'Log in securely' }));
    expect(screen.getByText('Email address is required')).toBeTruthy();
    expect(screen.getByText('Password is required')).toBeTruthy();
    expect(auth.signIn).not.toHaveBeenCalled();
  });

  it('calls the data-layer signIn with valid credentials', async () => {
    await renderLogin();
    await fireEvent.changeText(screen.getByPlaceholderText('you@example.com'), 'adebayo@daniruk.app');
    await fireEvent.changeText(screen.getByPlaceholderText('Minimum 8 characters'), 'password123');
    await fireEvent.press(screen.getByRole('button', { name: 'Log in securely' }));
    await waitFor(() => {
      expect(auth.signIn).toHaveBeenCalledWith('adebayo@daniruk.app', 'password123');
    });
  });

  it('routes "Forgot password?" to the placeholder screen', async () => {
    await renderLogin();
    await fireEvent.press(screen.getByRole('link', { name: 'Forgot password?' }));
    expect(mockPush).toHaveBeenCalledWith('/(auth)/forgot-password');
  });

  it('syncs the segmented toggle to the signup route', async () => {
    await renderLogin();
    await fireEvent.press(screen.getByTestId('segment-signup'));
    expect(mockReplace).toHaveBeenCalledWith('/(auth)/signup');
  });
});
