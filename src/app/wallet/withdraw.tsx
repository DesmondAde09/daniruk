import { KeyboardAvoiding } from '@/components';
import { WithdrawScreen } from '@/screens/wallet/WithdrawScreen';

/**
 * Wallet withdraw route — thin wrapper so the screen component and its tests
 * can live outside `src/app/` (every file under `src/app/` is treated as a
 * route). KeyboardAvoiding keeps the amount/address fields clear of the keyboard.
 */
export default function WithdrawRoute() {
  return (
    <KeyboardAvoiding>
      <WithdrawScreen />
    </KeyboardAvoiding>
  );
}
