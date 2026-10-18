import { fireEvent, render, screen } from '@testing-library/react-native';
import React from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { ToastProvider } from '@/components';

import { ProfileScreen } from '../ProfileScreen';

const mockSignOut = jest.fn();

// The auth gate guarantees a signed-in session; stub the hook with the persona.
jest.mock('@/auth/SessionProvider', () => ({
  useSession: () => ({
    user: jest.requireActual('@/data/auth').mockUser,
    status: 'signedIn',
    signOut: mockSignOut,
  }),
}));

const initialMetrics = {
  frame: { x: 0, y: 0, width: 390, height: 844 },
  insets: { top: 47, left: 0, right: 0, bottom: 34 },
};

async function renderProfile() {
  return render(
    <SafeAreaProvider initialMetrics={initialMetrics}>
      <ToastProvider>
        <ProfileScreen />
      </ToastProvider>
    </SafeAreaProvider>,
  );
}

beforeEach(() => {
  jest.clearAllMocks();
  mockSignOut.mockResolvedValue(undefined);
});

describe('Profile screen', () => {
  it('renders the persona identity and menu', async () => {
    await renderProfile();

    expect(screen.getByText('Profile')).toBeTruthy();
    expect(screen.getByText('Adebayo Okafor')).toBeTruthy();
    expect(screen.getByText('adebayo@daniruk.app')).toBeTruthy();
    expect(screen.getByText('AO')).toBeTruthy();
    expect(screen.getByText('Edit profile')).toBeTruthy();
    expect(screen.getByText('Security')).toBeTruthy();
    expect(screen.getByText('Support')).toBeTruthy();
  });

  it('shows a coming-soon toast for placeholder menu rows', async () => {
    await renderProfile();

    await fireEvent.press(screen.getByText('Edit profile'));

    expect(screen.getByText('Edit profile is coming soon')).toBeTruthy();
  });

  it('confirms before signing out', async () => {
    await renderProfile();

    await fireEvent.press(screen.getByText('Log out'));
    expect(screen.getByText('Log out of Daniruk?')).toBeTruthy();
    expect(mockSignOut).not.toHaveBeenCalled();

    // The sheet's confirm button shares the row's label; take the last match.
    const matches = screen.getAllByText('Log out');
    await fireEvent.press(matches[matches.length - 1]);

    expect(mockSignOut).toHaveBeenCalledTimes(1);
  });
});
