/**
 * Currency formatting. Built manually (not Intl.NumberFormat) because Android's
 * Intl historically mishandles the ₦ glyph and 'en-NG' grouping — this renders
 * identically on both platforms.
 */

const NAIRA = '\u20A6'; // ₦
export const MINUS = '\u2212'; // − (typographic minus, matches the designs)

function groupThousands(intPart: string): string {
  return intPart.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

/** 34820000 -> "₦348,200.00"; with { decimals: false } -> "₦348,200". */
export function formatNaira(kobo: number, options?: { decimals?: boolean }): string {
  const decimals = options?.decimals ?? true;
  const absolute = Math.abs(kobo);
  const naira = Math.floor(absolute / 100);
  const remainder = absolute % 100;
  const sign = kobo < 0 ? MINUS : '';
  const grouped = `${NAIRA}${groupThousands(String(naira))}`;
  return decimals ? `${sign}${grouped}.${String(remainder).padStart(2, '0')}` : `${sign}${grouped}`;
}

/**
 * Signed amount for transaction rows: +7125000 -> "+₦71,250", -50000 -> "−₦500".
 * Whole-naira amounts omit decimals by default; a kobo remainder forces them
 * (-50050 -> "−₦500.50") unless `decimals` is set explicitly.
 */
export function formatSignedKobo(kobo: number, options?: { decimals?: boolean }): string {
  if (kobo === 0) {
    return formatNaira(0, options);
  }
  const hasKoboRemainder = Math.abs(kobo) % 100 !== 0;
  const formatted = formatNaira(Math.abs(kobo), { decimals: options?.decimals ?? hasKoboRemainder });
  return kobo > 0 ? `+${formatted}` : `${MINUS}${formatted}`;
}

/** ("0.0048", "BTC") -> "0.0048 BTC". */
export function formatCrypto(amount: string, asset: string): string {
  return `${amount} ${asset}`;
}

/** "$50.00"-style USD display for trade card values. */
export function formatUsd(amountUsd: number): string {
  return `$${amountUsd.toFixed(2)}`;
}

/** 1425 -> "₦1,425/$" (gift card rate display). */
export function formatRate(ratePerDollar: number): string {
  return `${NAIRA}${groupThousands(String(ratePerDollar))}/$`;
}
