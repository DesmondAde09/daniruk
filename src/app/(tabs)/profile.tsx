import { ProfileScreen } from '@/screens/profile/ProfileScreen';

/**
 * Profile tab route — thin wrapper so the screen component and its tests can
 * live outside `src/app/` (every file under `src/app/` is treated as a route).
 */
export default function ProfileRoute() {
  return <ProfileScreen />;
}
