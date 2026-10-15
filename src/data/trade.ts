import { formatRate, formatUsd } from '@/lib/currency';

import { withLatency } from './latency';
import { addTransaction } from './transactions';
import type { GiftCardBrand, ID, TradeQuote, Transaction } from './types';

const brands: GiftCardBrand[] = [
  { id: 'apple', name: 'Apple Gift Card', category: 'Shopping', ratePerDollar: 1425, minUsd: 10, maxUsd: 500 },
  { id: 'amazon', name: 'Amazon Gift Card', category: 'Shopping', ratePerDollar: 1400, minUsd: 10, maxUsd: 1000 },
  { id: 'steam', name: 'Steam Gift Card', category: 'Gaming', ratePerDollar: 1380, minUsd: 5, maxUsd: 300 },
  { id: 'google-play', name: 'Google Play Gift Card', category: 'Gaming', ratePerDollar: 1350, minUsd: 5, maxUsd: 200 },
  { id: 'netflix', name: 'Netflix Gift Card', category: 'Streaming', ratePerDollar: 1300, minUsd: 15, maxUsd: 200 },
  { id: 'spotify', name: 'Spotify Gift Card', category: 'Streaming', ratePerDollar: 1280, minUsd: 10, maxUsd: 100 },
  { id: 'xbox', name: 'Xbox Gift Card', category: 'Gaming', ratePerDollar: 1330, minUsd: 10, maxUsd: 250 },
  { id: 'playstation', name: 'PlayStation Gift Card', category: 'Gaming', ratePerDollar: 1340, minUsd: 10, maxUsd: 250 },
  { id: 'sephora', name: 'Sephora Gift Card', category: 'Shopping', ratePerDollar: 1260, minUsd: 25, maxUsd: 300 },
  { id: 'itunes', name: 'iTunes Gift Card', category: 'Streaming', ratePerDollar: 1425, minUsd: 10, maxUsd: 500 },
];

export function getGiftCardBrands(): Promise<GiftCardBrand[]> {
  return withLatency(brands.map((brand) => ({ ...brand })));
}

function findBrand(brandId: ID): GiftCardBrand {
  const brand = brands.find((entry) => entry.id === brandId);
  if (!brand) {
    throw new Error(`Unknown gift card brand: ${brandId}`);
  }
  return brand;
}

/** Payout math: amountUsd × ratePerDollar × 100, all integer kobo. */
export async function getTradeQuote(brandId: ID, amountUsd: number): Promise<TradeQuote> {
  const brand = findBrand(brandId);
  if (amountUsd < brand.minUsd || amountUsd > brand.maxUsd) {
    throw new Error(`Amount must be between $${brand.minUsd} and $${brand.maxUsd} for ${brand.name}`);
  }
  return withLatency({
    brandId: brand.id,
    amountUsd,
    ratePerDollar: brand.ratePerDollar,
    payoutKobo: amountUsd * brand.ratePerDollar * 100,
  });
}

export interface SubmitTradeInput {
  brandId: ID;
  amountUsd: number;
  /** Card code / claim value entered by the user (mock). */
  cardCode?: string;
}

/** Confirms a trade: computes the payout and records a successful transaction. */
export async function submitTrade(input: SubmitTradeInput): Promise<Transaction> {
  const brand = findBrand(input.brandId);
  const quote = await getTradeQuote(input.brandId, input.amountUsd);
  const transaction = addTransaction({
    type: 'trade',
    title: brand.name,
    amountKobo: quote.payoutKobo,
    currency: 'NGN',
    status: 'successful',
    meta: {
      brand: brand.name,
      cardValue: formatUsd(input.amountUsd),
      rate: formatRate(brand.ratePerDollar),
    },
  });
  return withLatency({ ...transaction });
}
