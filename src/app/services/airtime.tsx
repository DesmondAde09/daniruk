import { AirtimeScreen } from '@/screens/services/AirtimeScreen';

/**
 * Airtime route — thin wrapper so the screen component and its tests can
 * live outside `src/app/` (every file under `src/app/` is treated as a route).
 */
export default function AirtimeRoute() {
  return <AirtimeScreen />;
}
