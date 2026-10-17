import { fireEvent, render, screen } from '@testing-library/react-native';
import React from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import Onboarding from '@/app/index';

const mockPush = jest.fn();

jest.mock('expo-router', () => ({
  useRouter: () => ({ push: mockPush, replace: jest.fn(), back: jest.fn(), canGoBack: () => false }),
}));

// TabBar pulls in react-native-reanimated (no jest mock in v4); never rendered here.
jest.mock('@/components/TabBar', () => ({ TabBar: () => null }));

const initialMetrics = {
  frame: { x: 0, y: 0, width: 390, height: 844 },
  insets: { top: 47, left: 0, right: 0, bottom: 34 },
};

async function renderOnboarding() {
  await render(
    <SafeAreaProvider initialMetrics={initialMetrics}>
      <Onboarding />
    </SafeAreaProvider>,
  );
}

describe('Onboarding screen', () => {
  beforeEach(() => {
    mockPush.mockClear();
  });

  it('renders the headline, eyebrow and CTAs', async () => {
    await renderOnboarding();
    expect(screen.getByText('Money, made simple')).toBeTruthy();
    expect(screen.getByText(/Trade\. Pay\./)).toBeTruthy();
    expect(screen.getByText('Get started')).toBeTruthy();
    expect(screen.getByText('I already have an account')).toBeTruthy();
    expect(screen.getByText('₦ 348,200')).toBeTruthy();
  });

  it('routes "Get started" to signup', async () => {
    await renderOnboarding();
    await fireEvent.press(screen.getByRole('button', { name: 'Get started' }));
    expect(mockPush).toHaveBeenCalledWith('/(auth)/signup');
  });

  it('routes "I already have an account" to login', async () => {
    await renderOnboarding();
    await fireEvent.press(screen.getByRole('button', { name: 'I already have an account' }));
    expect(mockPush).toHaveBeenCalledWith('/(auth)/login');
  });
});
