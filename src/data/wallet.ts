import { mockUser } from './auth';
import { withLatency } from './latency';
import type { BankAccount, Wallet } from './types';

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
