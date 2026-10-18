import { NotificationsScreen } from '@/screens/notifications/NotificationsScreen';

/**
 * Notifications route — thin wrapper so the screen component and its tests can
 * live outside `src/app/` (every file under `src/app/` is treated as a route).
 */
export default function NotificationsRoute() {
  return <NotificationsScreen />;
}
