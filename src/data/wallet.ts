import { formatCrypto, formatNaira } from '@/lib/currency';
import { cryptoUnitsToString, parseCryptoUnits } from '@/lib/crypto';

import { mockUser } from './auth';
import { withLatency } from './latency';
import { addTransaction } from './transactions';
import type { BankAccount, CryptoHolding, ID, Transaction, Wallet } from './types';

/** Minimum NGN withdrawal (₦1,000) — a mock product rule, enforced in the data layer. */
export const MIN_NGN_WITHDRAWAL_KOBO = 100_000;

/** Mock NGN market rates per crypto unit, for the ledger's NGN-equivalent amount. */
const MOCK_NGN_PER_UNIT: Record<CryptoHolding['asset'], number> = {
  BTC: 70_000_000,
  USDT: 1_500,
};

/** Mock persona wallet: ₦348,200.00 NGN, 0.0048 BTC plus a USDT holding. */
const wallet: Wallet = {
  ngn: { balanceKobo: 34820000 },
  crypto: [
    {
      asset: 'BTC',
      balance: '0.0048',
      address: 'bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh',
    },
    {
      asset: 'USDT',
      balance: '1250.00',
      address: 'TGehVcNhud84JUmT2gD3yc5oq9vYkYvZb1',
    },
  ],
};

const bankAccounts: BankAccount[] = [
  {
    id: 'bank_001',
    bankName: 'GTBank',
    accountNumber: '0123456789',
    accountName: mockUser.fullName,
  },
  {
    id: 'bank_002',
    bankName: 'Access Bank',
    accountNumber: '0098765432',
    accountName: mockUser.fullName,
  },
];

let bankAccountSeq = bankAccounts.length;

export function getWallet(): Promise<Wallet> {
  return withLatency({
    ngn: { ...wallet.ngn },
    crypto: wallet.crypto.map((holding) => ({ ...holding })),
  });
}

/**
 * Credits the NGN balance (trade payouts land in the wallet). Mutates the
 * in-memory mock, like `addTransaction` does for the ledger, so the next
 * `getWallet()` call reflects the new balance.
 */
export function creditNgnKobo(amountKobo: number): void {
  if (!Number.isInteger(amountKobo) || amountKobo <= 0) {
    throw new Error('creditNgnKobo expects a positive integer kobo amount');
  }
  wallet.ngn.balanceKobo += amountKobo;
}

/** Debits the NGN balance (withdrawals). Throws on insufficient funds. */
export function debitNgnKobo(amountKobo: number): void {
  if (!Number.isInteger(amountKobo) || amountKobo <= 0) {
    throw new Error('debitNgnKobo expects a positive integer kobo amount');
  }
  if (amountKobo > wallet.ngn.balanceKobo) {
    throw new Error('Insufficient NGN balance');
  }
  wallet.ngn.balanceKobo -= amountKobo;
}

function findHolding(asset: CryptoHolding['asset']): CryptoHolding {
  const holding = wallet.crypto.find((entry) => entry.asset === asset);
  if (!holding) {
    throw new Error(`Unknown crypto asset: ${asset}`);
  }
  return holding;
}

/**
 * Debits a crypto holding. Amounts are decimal strings; math happens in
 * integer base units (see `@/lib/crypto`) so precision is never lost.
 * Returns the new balance string. Throws on invalid or excessive amounts.
 */
export function debitCrypto(asset: CryptoHolding['asset'], amount: string): string {
  const holding = findHolding(asset);
  const units = parseCryptoUnits(amount);
  if (units == null || units <= 0n) {
    throw new Error(`Invalid ${asset} amount`);
  }
  const balance = parseCryptoUnits(holding.balance);
  if (balance == null || units > balance) {
    throw new Error(`Insufficient ${asset} balance`);
  }
  holding.balance = cryptoUnitsToString(balance - units);
  return holding.balance;
}

export function getBankAccounts(): Promise<BankAccount[]> {
  return withLatency(bankAccounts.map((account) => ({ ...account })));
}

export interface AddBankAccountInput {
  bankName: string;
  accountNumber: string;
}

/** The mock "resolves" the account name to the signed-in user's name. */
export function addBankAccount(input: AddBankAccountInput): Promise<BankAccount> {
  const account: BankAccount = {
    id: `bank_${String(++bankAccountSeq).padStart(3, '0')}`,
    bankName: input.bankName,
    accountNumber: input.accountNumber,
    accountName: mockUser.fullName,
  };
  bankAccounts.push(account);
  return withLatency({ ...account });
}

/** Selectable banks for the add-account form (mock directory). */
const nigerianBanks = [
  'Access Bank',
  'Fidelity Bank',
  'First Bank',
  'GTBank',
  'Kuda',
  'Moniepoint',
  'Opay',
  'Palmpay',
  'UBA',
  'Union Bank',
  'Zenith Bank',
];

export function getBanks(): Promise<string[]> {
  return withLatency([...nigerianBanks]);
}

/** Mock NUBAN lookup: any valid 10-digit number resolves to the signed-in user. */
export function resolveBankAccountName(bankName: string, accountNumber: string): Promise<string> {
  if (!/^\d{10}$/.test(accountNumber)) {
    return Promise.reject(new Error('Account number must be 10 digits'));
  }
  if (!nigerianBanks.includes(bankName)) {
    return Promise.reject(new Error(`Unknown bank: ${bankName}`));
  }
  return withLatency(mockUser.fullName);
}

export interface WithdrawNgnInput {
  accountId: ID;
  amountKobo: number;
}

/**
 * NGN withdrawal to a saved bank account: debits the wallet first (throwing on
 * insufficient funds so no doomed ledger entry is recorded), then records a
 * successful 'withdraw' transaction — mirroring `submitTrade`.
 */
export async function withdrawNgnToBank(input: WithdrawNgnInput): Promise<Transaction> {
  const account = bankAccounts.find((entry) => entry.id === input.accountId);
  if (!account) {
    throw new Error(`Unknown bank account: ${input.accountId}`);
  }
  if (input.amountKobo < MIN_NGN_WITHDRAWAL_KOBO) {
    throw new Error(
      `Minimum withdrawal is ${formatNaira(MIN_NGN_WITHDRAWAL_KOBO, { decimals: false })}`,
    );
  }
  debitNgnKobo(input.amountKobo);
  const transaction = addTransaction({
    type: 'withdraw',
    title: `Withdrawal to ${account.bankName}`,
    amountKobo: -input.amountKobo,
    currency: 'NGN',
    status: 'successful',
    meta: {
      bank: account.bankName,
      accountNumber: account.accountNumber,
      accountName: account.accountName,
    },
  });
  return withLatency({ ...transaction });
}

export interface WithdrawCryptoInput {
  asset: CryptoHolding['asset'];
  address: string;
  /** Decimal string, e.g. "0.001". */
  amount: string;
}

/**
 * Crypto withdrawal to an external address: debits the holding (BigInt base
 * units, no float drift), then records a 'withdraw' transaction whose
 * `amountKobo` is the NGN equivalent at the mock rate, like the seeded
 * crypto rows in the ledger.
 */
export async function withdrawCrypto(input: WithdrawCryptoInput): Promise<Transaction> {
  const address = input.address.trim();
  if (address.length === 0) {
    throw new Error('Wallet address is required');
  }
  const newBalance = debitCrypto(input.asset, input.amount);
  void newBalance;
  const units = parseCryptoUnits(input.amount);
  // debitCrypto already validated, so units is non-null here.
  const ngnEquivalentKobo = Number(
    ((units as bigint) * BigInt(MOCK_NGN_PER_UNIT[input.asset]) * 100n + 50_000_000n) / 100_000_000n,
  );
  const transaction = addTransaction({
    type: 'withdraw',
    title: `Crypto Withdrawal — ${input.asset}`,
    amountKobo: -ngnEquivalentKobo,
    currency: input.asset,
    status: 'successful',
    meta: {
      cryptoAmount: formatCrypto(cryptoUnitsToString(units as bigint), input.asset),
      address,
    },
  });
  return withLatency({ ...transaction });
}
