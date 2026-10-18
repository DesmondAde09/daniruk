import { KeyboardAvoiding } from '@/components';
import { TradeBrandsScreen } from '@/screens/trade/TradeBrandsScreen';

/**
 * Trade tab route — thin wrapper so the screen component and its tests can
 * live outside `src/app/` (every file under `src/app/` is treated as a route).
 * KeyboardAvoiding keeps the brand search field clear of the keyboard.
 */
export default function TradeRoute() {
  return (
    <KeyboardAvoiding>
      <TradeBrandsScreen />
    </KeyboardAvoiding>
  );
}
