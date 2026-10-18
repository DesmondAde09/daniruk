import { KeyboardAvoiding } from '@/components';
import { BankTransferDepositScreen } from '@/screens/wallet/BankTransferDepositScreen';

/**
 * Bank-transfer deposit route — thin wrapper so the screen component and its
 * tests can live outside `src/app/` (every file under `src/app/` is treated
 * as a route). KeyboardAvoiding keeps the amount field clear of the keyboard.
 */
export default function BankTransferRoute() {
  return (
    <KeyboardAvoiding>
      <BankTransferDepositScreen />
    </KeyboardAvoiding>
  );
}
