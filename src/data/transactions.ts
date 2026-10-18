import { withLatency } from './latency';
import type { ID, Transaction, TransactionStatus, TransactionType } from './types';

const now = Date.now();
const hoursAgo = (hours: number): string => new Date(now - hours * 3_600_000).toISOString();
const daysAgo = (days: number): string => hoursAgo(days * 24);

/**
 * Mock persona ledger: ~20 transactions across all types and statuses.
 * Includes the trade from the designs: Apple Gift Card, +₦71,250,
 * reference DNR-284910, successful, earlier today.
 */
const transactions: Transaction[] = [
  {
    id: 'txn_001',
    type: 'trade',
    title: 'Apple Gift Card',
    amountKobo: 7125000,
    currency: 'NGN',
    status: 'successful',
    reference: 'DNR-284910',
    createdAt: hoursAgo(2),
    meta: { brand: 'Apple Gift Card', cardValue: '$50.00', rate: '₦1,425/$' },
  },
  {
    id: 'txn_002',
    type: 'airtime',
    title: 'MTN Airtime',
    amountKobo: -50000,
    currency: 'NGN',
    status: 'successful',
    reference: 'DNR-284855',
    createdAt: hoursAgo(6),
    meta: { network: 'MTN', phone: '08034561234' },
  },
  {
    id: 'txn_003',
    type: 'data',
    title: 'Airtel Data — 10GB',
    amountKobo: -350000,
    currency: 'NGN',
    status: 'successful',
    reference: 'DNR-284702',
    createdAt: daysAgo(1),
    meta: { network: 'Airtel', plan: '10GB — 30 days', phone: '08024569876' },
  },
  {
    id: 'txn_004',
    type: 'electricity',
    title: 'EKEDC Prepaid',
    amountKobo: -1000000,
    currency: 'NGN',
    status: 'successful',
    reference: 'DNR-284611',
    createdAt: daysAgo(1),
    meta: { disco: 'Eko Electric (EKEDC)', meterNumber: '04512378901', meterType: 'Prepaid' },
  },
  {
    id: 'txn_021',
    type: 'transfer',
    title: 'Transfer to Chiamaka Nwosu',
    amountKobo: -750000,
    currency: 'NGN',
    status: 'successful',
    reference: 'DNR-284590',
    createdAt: daysAgo(1.5),
    meta: { bank: 'Kuda', accountNumber: '2034567891', accountName: 'Chiamaka Nwosu' },
  },
  {
    id: 'txn_005',
    type: 'trade',
    title: 'Steam Gift Card',
    amountKobo: 2760000,
    currency: 'NGN',
    status: 'successful',
    reference: 'DNR-284530',
    createdAt: daysAgo(2),
    meta: { brand: 'Steam Gift Card', cardValue: '$20.00', rate: '₦1,380/$' },
  },
  {
    id: 'txn_006',
    type: 'withdraw',
    title: 'Withdrawal to GTBank',
    amountKobo: -5000000,
    currency: 'NGN',
    status: 'successful',
    reference: 'DNR-284402',
    createdAt: daysAgo(2),
    meta: { bank: 'GTBank', accountNumber: '0123456789' },
  },
  {
    id: 'txn_022',
    type: 'transfer',
    title: 'Transfer to Tunde Balogun',
    amountKobo: -1250000,
    currency: 'NGN',
    status: 'successful',
    reference: 'DNR-284390',
    createdAt: daysAgo(2.5),
    meta: {
      bank: 'Opay',
      accountNumber: '8123456780',
      accountName: 'Tunde Balogun',
      remark: 'Rent contribution',
    },
  },
  {
    id: 'txn_007',
    type: 'receive',
    title: 'Received BTC',
    amountKobo: 8450000,
    currency: 'BTC',
    status: 'successful',
    reference: 'DNR-284377',
    createdAt: daysAgo(3),
    meta: { cryptoAmount: '0.0012 BTC', address: 'bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh' },
  },
  {
    id: 'txn_008',
    type: 'flight',
    title: 'Flight LOS → ABV',
    amountKobo: -8520000,
    currency: 'NGN',
    status: 'successful',
    reference: 'DNR-284201',
    createdAt: daysAgo(4),
    meta: { airline: 'Air Peace', route: 'LOS → ABV', passengers: '1' },
  },
  {
    id: 'txn_009',
    type: 'trade',
    title: 'Amazon Gift Card',
    amountKobo: 14000000,
    currency: 'NGN',
    status: 'pending',
    reference: 'DNR-284188',
    createdAt: daysAgo(4),
    meta: { brand: 'Amazon Gift Card', cardValue: '$100.00', rate: '₦1,400/$' },
  },
  {
    id: 'txn_010',
    type: 'airtime',
    title: 'Glo Airtime',
    amountKobo: -20000,
    currency: 'NGN',
    status: 'failed',
    reference: 'DNR-284099',
    createdAt: daysAgo(5),
    meta: { network: 'Glo', phone: '08058765432' },
  },
  {
    id: 'txn_011',
    type: 'data',
    title: 'MTN Data — 5GB',
    amountKobo: -180000,
    currency: 'NGN',
    status: 'successful',
    reference: 'DNR-283954',
    createdAt: daysAgo(6),
    meta: { network: 'MTN', plan: '5GB — 30 days', phone: '08034561234' },
  },
  {
    id: 'txn_012',
    type: 'withdraw',
    title: 'Withdrawal to Access Bank',
    amountKobo: -2500000,
    currency: 'NGN',
    status: 'pending',
    reference: 'DNR-283871',
    createdAt: daysAgo(6),
    meta: { bank: 'Access Bank', accountNumber: '0098765432' },
  },
  {
    id: 'txn_013',
    type: 'receive',
    title: 'Received USDT',
    amountKobo: 1500000,
    currency: 'USDT',
    status: 'successful',
    reference: 'DNR-283760',
    createdAt: daysAgo(7),
    meta: { cryptoAmount: '10.00 USDT', address: 'TGehVcNhud84JUmT2gD3yc5oq9vYkYvZb1' },
  },
  {
    id: 'txn_014',
    type: 'electricity',
    title: 'IKEDC Postpaid',
    amountKobo: -750000,
    currency: 'NGN',
    status: 'failed',
    reference: 'DNR-283645',
    createdAt: daysAgo(8),
    meta: { disco: 'Ikeja Electric (IKEDC)', meterNumber: '01098765432', meterType: 'Postpaid' },
  },
  {
    id: 'txn_015',
    type: 'trade',
    title: 'Google Play Gift Card',
    amountKobo: 4050000,
    currency: 'NGN',
    status: 'successful',
    reference: 'DNR-283512',
    createdAt: daysAgo(9),
    meta: { brand: 'Google Play Gift Card', cardValue: '$30.00', rate: '₦1,350/$' },
  },
  {
    id: 'txn_016',
    type: 'flight',
    title: 'Flight ABV → LOS',
    amountKobo: -7980000,
    currency: 'NGN',
    status: 'pending',
    reference: 'DNR-283430',
    createdAt: daysAgo(10),
    meta: { airline: 'Ibom Air', route: 'ABV → LOS', passengers: '2' },
  },
  {
    id: 'txn_017',
    type: 'airtime',
    title: 'Airtel Airtime',
    amountKobo: -100000,
    currency: 'NGN',
    status: 'successful',
    reference: 'DNR-283388',
    createdAt: daysAgo(11),
    meta: { network: 'Airtel', phone: '08024569876' },
  },
  {
    id: 'txn_018',
    type: 'trade',
    title: 'iTunes Gift Card',
    amountKobo: 9975000,
    currency: 'NGN',
    status: 'failed',
    reference: 'DNR-283210',
    createdAt: daysAgo(12),
    meta: { brand: 'iTunes Gift Card', cardValue: '$70.00', rate: '₦1,425/$' },
  },
  {
    id: 'txn_019',
    type: 'withdraw',
    title: 'Crypto Withdrawal — BTC',
    amountKobo: -4225000,
    currency: 'BTC',
    status: 'successful',
    reference: 'DNR-283104',
    createdAt: daysAgo(13),
    meta: { cryptoAmount: '0.0006 BTC', address: 'bc1qar0srrr7xfkvy5l643lydnw9re59gtzzwf5mdq' },
  },
  {
    id: 'txn_020',
    type: 'data',
    title: '9mobile Data — 2GB',
    amountKobo: -95000,
    currency: 'NGN',
    status: 'successful',
    reference: 'DNR-283002',
    createdAt: daysAgo(14),
    meta: { network: '9mobile', plan: '2GB — 30 days', phone: '08091234567' },
  },
];

let transactionSeq = transactions.length;
let referenceSeq = 284910;

export function generateReference(): string {
  return `DNR-${++referenceSeq}`;
}

/**
 * Records a new ledger entry (used by the trade and services mocks).
 * Returns the stored transaction.
 */
export function addTransaction(
  input: Omit<Transaction, 'id' | 'reference' | 'createdAt'> & Partial<Pick<Transaction, 'reference'>>,
): Transaction {
  const transaction: Transaction = {
    ...input,
    id: `txn_${String(++transactionSeq).padStart(3, '0')}`,
    reference: input.reference ?? generateReference(),
    createdAt: new Date().toISOString(),
  };
  transactions.unshift(transaction);
  return transaction;
}

export interface TransactionFilter {
  type?: TransactionType;
  status?: TransactionStatus;
}

/** Newest first; optionally filtered by type and/or status. */
export function getTransactions(filter?: TransactionFilter): Promise<Transaction[]> {
  const matches = transactions.filter(
    (transaction) =>
      (filter?.type === undefined || transaction.type === filter.type) &&
      (filter?.status === undefined || transaction.status === filter.status),
  );
  return withLatency(matches.map((transaction) => ({ ...transaction })));
}

export function getTransaction(id: ID): Promise<Transaction> {
  const transaction = transactions.find((entry) => entry.id === id);
  if (!transaction) {
    return Promise.reject(new Error(`Transaction not found: ${id}`));
  }
  return withLatency({ ...transaction });
}
