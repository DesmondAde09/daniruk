import { KeyboardAvoiding } from '@/components';
import { AddBankAccountScreen } from '@/screens/wallet/AddBankAccountScreen';

/**
 * Add bank account route — thin wrapper so the screen component and its tests
 * can live outside `src/app/` (every file under `src/app/` is treated as a
 * route). KeyboardAvoiding keeps the account-number field clear of the keyboard.
 */
export default function AddBankAccountRoute() {
  return (
    <KeyboardAvoiding>
      <AddBankAccountScreen />
    </KeyboardAvoiding>
  );
}
