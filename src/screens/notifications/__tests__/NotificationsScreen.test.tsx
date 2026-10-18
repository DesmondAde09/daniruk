import { fireEvent, render, screen } from '@testing-library/react-native';
import React from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { getNotifications, markAllRead, markRead } from '@/data/notifications';
import type { AppNotification } from '@/data/types';

import { NotificationsScreen } from '../NotificationsScreen';

// Local fixtures keep tests isolated — the real module holds mutable read flags.
const mockNotifications: AppNotification[] = [
  {
    id: 'ntf_001',
    title: 'Trade completed',
    body: 'Your Apple Gift Card trade paid out ₦71,250 to your NGN wallet.',
    read: false,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'ntf_002',
    title: 'Rates moved',
    body: 'Apple Gift Card is now ₦1,425/$. Good time to trade.',
    read: false,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'ntf_003',
    title: 'Withdrawal on the way',
    body: 'Your ₦25,000 withdrawal to Access Bank is being processed.',
    read: true,
    createdAt: new Date().toISOString(),
  },
];

jest.mock('expo-router', () => ({
  router: { back: jest.fn() },
}));

jest.mock('@/data/notifications', () => ({
  getNotifications: jest.fn(),
  markRead: jest.fn(),
  markAllRead: jest.fn(),
}));

const mockGetNotifications = getNotifications as jest.Mock;
const mockMarkRead = markRead as jest.Mock;
const mockMarkAllRead = markAllRead as jest.Mock;

const initialMetrics = {
  frame: { x: 0, y: 0, width: 390, height: 844 },
  insets: { top: 47, left: 0, right: 0, bottom: 34 },
};

async function renderNotifications() {
  return render(
    <SafeAreaProvider initialMetrics={initialMetrics}>
      <NotificationsScreen />
    </SafeAreaProvider>,
  );
}

beforeEach(() => {
  jest.clearAllMocks();
  mockGetNotifications.mockResolvedValue(mockNotifications.map((entry) => ({ ...entry })));
  mockMarkRead.mockResolvedValue(undefined);
  mockMarkAllRead.mockResolvedValue(undefined);
});

describe('Notifications screen', () => {
  it('renders the notifications with a mark-all-read action while unread remain', async () => {
    await renderNotifications();

    expect(await screen.findByText('Trade completed')).toBeTruthy();
    expect(screen.getByText('Rates moved')).toBeTruthy();
    expect(screen.getByText('Withdrawal on the way')).toBeTruthy();
    expect(screen.getByText('Mark all read')).toBeTruthy();
  });

  it('marks a single notification read on press', async () => {
    await renderNotifications();
    await fireEvent.press(await screen.findByText('Trade completed'));

    expect(mockMarkRead).toHaveBeenCalledWith('ntf_001');
    // One unread remains, so the action stays visible.
    expect(screen.getByText('Mark all read')).toBeTruthy();
  });

  it('marks everything read and hides the action', async () => {
    await renderNotifications();
    await fireEvent.press(await screen.findByText('Mark all read'));

    expect(mockMarkAllRead).toHaveBeenCalledTimes(1);
    expect(screen.queryByText('Mark all read')).toBeNull();
  });

  it('shows an empty state when there are no notifications', async () => {
    mockGetNotifications.mockResolvedValue([]);
    await renderNotifications();

    expect(await screen.findByText('No notifications')).toBeTruthy();
    expect(screen.queryByText('Mark all read')).toBeNull();
  });

  it('shows a retryable error state when loading fails', async () => {
    mockGetNotifications.mockRejectedValueOnce(new Error('boom'));
    await renderNotifications();

    expect(await screen.findByText("Couldn't load notifications")).toBeTruthy();

    await fireEvent.press(screen.getByText('Try again'));

    expect(await screen.findByText('Trade completed')).toBeTruthy();
  });
});
