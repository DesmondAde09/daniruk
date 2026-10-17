/**
 * Decimal-string crypto amount helpers. Crypto balances are decimal strings
 * (SPEC.md §Mock Data Contracts) and floats can't represent them exactly, so
 * amounts are converted to integer base units (8 decimals, satoshi-style) and
 * all math happens on BigInt.
 */

export const CRYPTO_DECIMALS = 8;

const SCALE = 10n ** BigInt(CRYPTO_DECIMALS);

/** "0.0048" -> 480000n base units; null when the string isn't a valid amount. */
export function parseCryptoUnits(value: string): bigint | null {
  const trimmed = value.trim();
  if (!/^\d+(\.\d{1,8})?$/.test(trimmed)) return null;
  const [whole, fraction = ''] = trimmed.split('.');
  return BigInt(whole) * SCALE + BigInt(fraction.padEnd(CRYPTO_DECIMALS, '0'));
}

/** 480000n -> "0.0048"; trailing zeros trimmed ("1250.00" -> "1250"). */
export function cryptoUnitsToString(units: bigint): string {
  const whole = units / SCALE;
  const fraction = (units % SCALE)
    .toString()
    .padStart(CRYPTO_DECIMALS, '0')
    .replace(/0+$/, '');
  return fraction ? `${whole}.${fraction}` : whole.toString();
}
