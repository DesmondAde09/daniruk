import { KeyboardAvoiding } from '@/components';
import { TransferScreen } from '@/screens/wallet/TransferScreen';

export default function TransferRoute() {
  return (
    <KeyboardAvoiding>
      <TransferScreen />
    </KeyboardAvoiding>
  );
}
