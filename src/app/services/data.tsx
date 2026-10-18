import { KeyboardAvoiding } from '@/components';
import { DataScreen } from '@/screens/services/DataScreen';

/**
 * Data route — thin wrapper so the screen component and its tests can
 * live outside `src/app/` (every file under `src/app/` is treated as a route).
 * KeyboardAvoiding keeps the phone field clear of the keyboard.
 */
export default function DataRoute() {
  return (
    <KeyboardAvoiding>
      <DataScreen />
    </KeyboardAvoiding>
  );
}
