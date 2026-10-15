import { withLatency } from './latency';
import type { AppNotification, ID } from './types';

const now = Date.now();
const hoursAgo = (hours: number): string => new Date(now - hours * 3_600_000).toISOString();

const notifications: AppNotification[] = [
  {
    id: 'ntf_001',
    title: 'Trade completed',
    body: 'Your Apple Gift Card trade paid out ₦71,250 to your NGN wallet.',
    read: false,
    createdAt: hoursAgo(2),
  },
  {
    id: 'ntf_002',
    title: 'Rates moved',
    body: 'Apple Gift Card is now ₦1,425/$. Good time to trade.',
    read: false,
    createdAt: hoursAgo(9),
  },
  {
    id: 'ntf_003',
    title: 'Withdrawal on the way',
    body: 'Your ₦25,000 withdrawal to Access Bank is being processed.',
    read: true,
    createdAt: hoursAgo(30),
  },
  {
    id: 'ntf_004',
    title: 'Referral bonus earned',
    body: 'Chidi joined with your code. ₦5,000 has been added to your wallet.',
    read: true,
    createdAt: hoursAgo(52),
  },
  {
    id: 'ntf_005',
    title: 'Security check',
    body: 'New sign-in on this device. If this was not you, contact support.',
    read: true,
    createdAt: hoursAgo(80),
  },
];

export function getNotifications(): Promise<AppNotification[]> {
  return withLatency(notifications.map((notification) => ({ ...notification })));
}

export function markRead(id: ID): Promise<void> {
  const notification = notifications.find((entry) => entry.id === id);
  if (notification) {
    notification.read = true;
  }
  return withLatency(undefined);
}
