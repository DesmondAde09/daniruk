import { fireEvent, render, screen } from '@testing-library/react-native';
import React from 'react';
import { Share } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { ToastProvider } from '@/components';
import { getReferralSummary } from '@/data/referrals';

import { ReferralsScreen } from '../ReferralsScreen';

jest.mock('expo-router', () => ({
  router: { back: jest.fn() },
}));

jest.mock('@/data/referrals', () => ({ getReferralSummary: jest.fn() }));

const mockGetReferralSummary = getReferralSummary as jest.Mock;

const initialMetrics = {
  frame: { x: 0, y: 0, width: 390, height: 844 },
  insets: { top: 47, left: 0, right: 0, bottom: 34 },
};

async function renderReferrals() {
  return render(
    <SafeAreaProvider initialMetrics={initialMetrics}>
      <ToastProvider>
        <ReferralsScreen />
      </ToastProvider>
    </SafeAreaProvider>,
  );
}

beforeEach(() => {
  jest.clearAllMocks();
  mockGetReferralSummary.mockImplementation(
    jest.requireActual('@/data/referrals').getReferralSummary,
  );
});

describe('Referrals screen', () => {
  it('renders the invite code and earnings summary', async () => {
    await renderReferrals();

    expect(await screen.findByText('ADEBAYO2026')).toBeTruthy();
    expect(screen.getByText('Friends joined')).toBeTruthy();
    expect(screen.getByText('7')).toBeTruthy();
    expect(screen.getByText('Total earned')).toBeTruthy();
    expect(screen.getByText('₦35,000.00')).toBeTruthy();
  });

  it('gives copy feedback when the code is copied', async () => {
    await renderReferrals();
    await fireEvent.press(await screen.findByText('Copy code'));

    expect(await screen.findByText('Invite code copied')).toBeTruthy();
  });

  it('shares an invite message containing the code', async () => {
    const share = jest.spyOn(Share, 'share').mockResolvedValue({ action: 'sharedAction' });
    await renderReferrals();

    await fireEvent.press(await screen.findByText('Share invite'));

    expect(share).toHaveBeenCalledWith({
      message: expect.stringContaining('ADEBAYO2026'),
    });
    share.mockRestore();
  });

  it('shows a retryable error state when the summary fails to load', async () => {
    mockGetReferralSummary.mockRejectedValueOnce(new Error('boom'));
    await renderReferrals();

    expect(await screen.findByText("Couldn't load referrals")).toBeTruthy();

    await fireEvent.press(screen.getByText('Try again'));

    expect(await screen.findByText('ADEBAYO2026')).toBeTruthy();
  });
});
