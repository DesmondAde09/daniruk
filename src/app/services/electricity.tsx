import { ElectricityScreen } from '@/screens/services/ElectricityScreen';

/**
 * Electricity route — thin wrapper so the screen component and its tests can
 * live outside `src/app/` (every file under `src/app/` is treated as a route).
 */
export default function ElectricityRoute() {
  return <ElectricityScreen />;
}
