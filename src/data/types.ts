/**
 * Mock Data Contracts (SPEC.md §Mock Data Contracts).
 * Every screen calls async functions in `data/` that return these shapes;
 * swapping in a real backend means re-implementing those functions only.
 */

export type ID = string;
export type ISODateString = string;

export interface User {
  id: ID;
  fullName: string; // "Adebayo Okafor"
  email: string;
  avatarInitials: string; // "AO"
  referralCode: string;
}

export interface Wallet {
  ngn: { balanceKobo: number }; // ₦348,200.00 -> 34820000
  crypto: CryptoHolding[];
}

export interface CryptoHolding {
  asset: 'BTC' | 'USDT';
  balance: string; // decimal string, e.g. "0.0048"
  address: string;
}

export type TransactionType =
  | 'trade'
  | 'airtime'
  | 'data'
  | 'electricity'
  | 'flight'
  | 'receive'
  | 'withdraw';

export type TransactionStatus = 'successful' | 'pending' | 'failed';

export interface Transaction {
  id: ID;
  type: TransactionType;
  title: string; // "Apple Gift Card"
  amountKobo: number; // signed: +7125000
  currency: 'NGN' | 'BTC' | 'USDT';
  status: TransactionStatus;
  reference: string; // "DNR-284910"
  createdAt: ISODateString;
  meta?: Record<string, string>; // detail screen rows (network, meter no, bank, address…)
}

export interface GiftCardBrand {
  id: ID;
  name: string; // "Apple Gift Card"
  category: string; // "Gaming" | "Shopping" | "Streaming" | …
  ratePerDollar: number; // NGN per $1, e.g. 1425
  minUsd: number;
  maxUsd: number;
}

export interface TradeQuote {
  brandId: ID;
  amountUsd: number;
  ratePerDollar: number;
  payoutKobo: number; // amountUsd * ratePerDollar * 100
}

export interface BankAccount {
  id: ID;
  bankName: string;
  accountNumber: string; // 10 digits
  accountName: string; // "resolved" by mock
}

export interface ServicePlan {
  // data bundles, electricity discos, networks
  id: ID;
  name: string;
  priceKobo?: number;
}

export interface FlightResult {
  id: ID;
  airline: string;
  from: string;
  to: string; // airport codes
  departAt: ISODateString;
  arriveAt: ISODateString;
  priceKobo: number;
}

export interface AppNotification {
  id: ID;
  title: string;
  body: string;
  read: boolean;
  createdAt: ISODateString;
}

export interface ReferralSummary {
  code: string;
  invitedCount: number;
  earnedKobo: number;
}
