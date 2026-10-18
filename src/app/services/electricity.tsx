import { KeyboardAvoiding } from '@/components';
import { ElectricityScreen } from '@/screens/services/ElectricityScreen';

/**
 * Electricity route — thin wrapper so the screen component and its tests can
 * live outside `src/app/` (every file under `src/app/` is treated as a route).
 * KeyboardAvoiding keeps the meter/amount fields clear of the keyboard.
 */
export default function ElectricityRoute() {
  return (
    <KeyboardAvoiding>
      <ElectricityScreen />
    </KeyboardAvoiding>
  );
}
