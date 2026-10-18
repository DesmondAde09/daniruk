import { getTransaction, getTransactions } from '@/data/transactions';
import {
  addBankAccount,
  confirmNgnDeposit,
  debitCrypto,
  debitNgnKobo,
  getBankAccounts,
  getBanks,
  getDepositAccount,
  getRecentRecipients,
  getWallet,
  MIN_NGN_DEPOSIT_KOBO,
  MIN_NGN_TRANSFER_KOBO,
  MIN_NGN_WITHDRAWAL_KOBO,
  resolveBankAccountName,
  resolveRecipientAccount,
  transferNgn,
  withdrawCrypto,
  withdrawNgnToBank,
} from '@/data/wallet';

describe('wallet data layer — withdrawals', () => {
  describe('debitNgnKobo', () => {
    it('debits the NGN balance', async () => {
      const before = await getWallet();

      debitNgnKobo(100_000);

      const after = await getWallet();
      expect(after.ngn.balanceKobo).toBe(before.ngn.balanceKobo - 100_000);
    });

    it('throws on insufficient balance and non-positive amounts', async () => {
      const wallet = await getWallet();

      expect(() => debitNgnKobo(wallet.ngn.balanceKobo + 1)).toThrow('Insufficient NGN balance');
      expect(() => debitNgnKobo(0)).toThrow('positive integer kobo');
      expect(() => debitNgnKobo(50.5)).toThrow('positive integer kobo');
    });
  });

  describe('debitCrypto', () => {
    it('debits decimal-string balances without float drift', async () => {
      // '0.0048' - '0.001' must be exactly '0.0038' (floats give 0.0038000000000000005).
      const newBalance = debitCrypto('BTC', '0.001');

      expect(newBalance).toBe('0.0038');
      const wallet = await getWallet();
      expect(wallet.crypto.find((holding) => holding.asset === 'BTC')?.balance).toBe('0.0038');
    });

    it('throws on excessive and invalid amounts', () => {
      expect(() => debitCrypto('BTC', '1')).toThrow('Insufficient BTC balance');
      expect(() => debitCrypto('BTC', '0')).toThrow('Invalid BTC amount');
      expect(() => debitCrypto('BTC', 'abc')).toThrow('Invalid BTC amount');
    });
  });

  describe('withdrawNgnToBank', () => {
    it('debits the wallet and records a withdraw transaction', async () => {
      const before = await getWallet();
      const [account] = await getBankAccounts();

      const transaction = await withdrawNgnToBank({ accountId: account.id, amountKobo: 500_000 });

      expect(transaction.type).toBe('withdraw');
      expect(transaction.title).toBe('Withdrawal to GTBank');
      expect(transaction.amountKobo).toBe(-500_000);
      expect(transaction.currency).toBe('NGN');
      expect(transaction.status).toBe('successful');
      expect(transaction.meta).toMatchObject({ bank: 'GTBank', accountNumber: '0123456789' });

      const ledger = await getTransactions();
      expect(ledger.some((entry) => entry.id === transaction.id)).toBe(true);

      const after = await getWallet();
      expect(after.ngn.balanceKobo).toBe(before.ngn.balanceKobo - 500_000);
    });

    it('rejects amounts below the minimum without recording a transaction', async () => {
      const [account] = await getBankAccounts();
      const ledgerBefore = await getTransactions();

      await expect(
        withdrawNgnToBank({ accountId: account.id, amountKobo: MIN_NGN_WITHDRAWAL_KOBO - 100 }),
      ).rejects.toThrow('Minimum withdrawal is ₦1,000');

      const ledgerAfter = await getTransactions();
      expect(ledgerAfter.length).toBe(ledgerBefore.length);
    });

    it('rejects unknown accounts and insufficient balance', async () => {
      await expect(withdrawNgnToBank({ accountId: 'bank_999', amountKobo: 500_000 })).rejects.toThrow(
        'Unknown bank account',
      );
      const wallet = await getWallet();
      const [account] = await getBankAccounts();
      await expect(
        withdrawNgnToBank({ accountId: account.id, amountKobo: wallet.ngn.balanceKobo + 100 }),
      ).rejects.toThrow('Insufficient NGN balance');
    });
  });

  describe('withdrawCrypto', () => {
    it('debits the holding and records a withdraw transaction with meta', async () => {
      const before = await getWallet();
      const usdtBefore = before.crypto.find((holding) => holding.asset === 'USDT');

      const transaction = await withdrawCrypto({
        asset: 'USDT',
        address: 'TGehVcNhud84JUmT2gD3yc5oq9vYkYvZb1',
        amount: '250.00',
      });

      expect(transaction.type).toBe('withdraw');
      expect(transaction.title).toBe('Crypto Withdrawal — USDT');
      expect(transaction.currency).toBe('USDT');
      expect(transaction.amountKobo).toBeLessThan(0);
      expect(transaction.meta).toMatchObject({
        cryptoAmount: '250 USDT',
        address: 'TGehVcNhud84JUmT2gD3yc5oq9vYkYvZb1',
      });

      const ledger = await getTransactions();
      expect(ledger.some((entry) => entry.id === transaction.id)).toBe(true);

      const after = await getWallet();
      expect(after.crypto.find((holding) => holding.asset === 'USDT')?.balance).toBe(
        String(Number(usdtBefore?.balance) - 250),
      );
    });

    it('rejects an empty address and insufficient balance', async () => {
      await expect(
        withdrawCrypto({ asset: 'BTC', address: '   ', amount: '0.001' }),
      ).rejects.toThrow('Wallet address is required');
      await expect(
        withdrawCrypto({ asset: 'BTC', address: 'bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh', amount: '5' }),
      ).rejects.toThrow('Insufficient BTC balance');
    });
  });

  describe('bank directory', () => {
    it('lists Nigerian banks and resolves account names', async () => {
      const banks = await getBanks();
      expect(banks.length).toBeGreaterThan(5);
      expect(banks).toContain('GTBank');

      await expect(resolveBankAccountName('GTBank', '1234567890')).resolves.toBe('Adebayo Okafor');
      await expect(resolveBankAccountName('GTBank', '123')).rejects.toThrow('10 digits');
      await expect(resolveBankAccountName('NoSuch Bank', '1234567890')).rejects.toThrow(
        'Unknown bank',
      );
    });

    it('addBankAccount stores an account that getBankAccounts returns', async () => {
      const account = await addBankAccount({ bankName: 'Zenith Bank', accountNumber: '2233445566' });

      expect(account.accountName).toBe('Adebayo Okafor');
      const accounts = await getBankAccounts();
      expect(accounts.some((entry) => entry.id === account.id)).toBe(true);
    });
  });
});

describe('wallet data layer — deposits', () => {
  describe('getDepositAccount', () => {
    it("returns the persona's personalized Wema Bank account", async () => {
      const account = await getDepositAccount();

      expect(account.bankName).toBe('Wema Bank');
      expect(account.accountNumber).toMatch(/^\d{10}$/);
      expect(account.accountName).toBe('DANIRUK / ADEBAYO OKAFOR');
    });
  });

  describe('confirmNgnDeposit', () => {
    it('credits the wallet and records a receive transaction', async () => {
      const before = await getWallet();

      const transaction = await confirmNgnDeposit(5_000_000);

      expect(transaction.type).toBe('receive');
      expect(transaction.title).toBe('Bank transfer top-up');
      expect(transaction.status).toBe('successful');
      expect(transaction.amountKobo).toBe(5_000_000);
      expect(transaction.meta?.method).toBe('Bank transfer');

      const after = await getWallet();
      expect(after.ngn.balanceKobo).toBe(before.ngn.balanceKobo + 5_000_000);

      const ledger = await getTransactions();
      expect(ledger.some((entry) => entry.id === transaction.id)).toBe(true);
    });

    it('rejects amounts below the minimum without crediting', async () => {
      const before = await getWallet();

      await expect(confirmNgnDeposit(MIN_NGN_DEPOSIT_KOBO - 100)).rejects.toThrow(
        'Minimum deposit',
      );

      const after = await getWallet();
      expect(after.ngn.balanceKobo).toBe(before.ngn.balanceKobo);
    });
  });
});

describe('wallet data layer — transfers', () => {
  describe('resolveRecipientAccount', () => {
    it('rejects invalid account numbers and unknown banks', async () => {
      await expect(resolveRecipientAccount('Kuda', '203456789')).rejects.toThrow('10 digits');
      await expect(resolveRecipientAccount('NoSuch Bank', '2034567891')).rejects.toThrow(
        'Unknown bank',
      );
    });

    it('resolves deterministically per account number', async () => {
      const first = await resolveRecipientAccount('Kuda', '2034567891');
      const second = await resolveRecipientAccount('Kuda', '2034567891');

      expect(first.length).toBeGreaterThan(0);
      expect(first).toBe(second);
    });
  });

  describe('getRecentRecipients', () => {
    it('returns the seeded recipients, unique and newest first', async () => {
      const recipients = await getRecentRecipients();

      expect(recipients).toEqual([
        { bankName: 'Kuda', accountNumber: '2034567891', accountName: 'Chiamaka Nwosu' },
        { bankName: 'Opay', accountNumber: '8123456780', accountName: 'Tunde Balogun' },
      ]);
    });
  });

  describe('transferNgn', () => {
    it('rejects amounts below the minimum and above the balance', async () => {
      await expect(
        transferNgn({
          bankName: 'Kuda',
          accountNumber: '2034567891',
          accountName: 'Chiamaka Nwosu',
          amountKobo: MIN_NGN_TRANSFER_KOBO - 100,
        }),
      ).rejects.toThrow('Minimum transfer is ₦100');

      const wallet = await getWallet();
      await expect(
        transferNgn({
          bankName: 'Kuda',
          accountNumber: '2034567891',
          accountName: 'Chiamaka Nwosu',
          amountKobo: wallet.ngn.balanceKobo + 100,
        }),
      ).rejects.toThrow('Insufficient NGN balance');
    });

    it('debits the wallet and records a transfer transaction with meta', async () => {
      const before = await getWallet();

      const transaction = await transferNgn({
        bankName: 'Kuda',
        accountNumber: '2034567891',
        accountName: 'Chiamaka Nwosu',
        amountKobo: 250_000,
        remark: ' Lunch money ',
      });

      expect(transaction.type).toBe('transfer');
      expect(transaction.title).toBe('Transfer to Chiamaka Nwosu');
      expect(transaction.amountKobo).toBe(-250_000);
      expect(transaction.currency).toBe('NGN');
      expect(transaction.status).toBe('successful');
      expect(transaction.meta).toMatchObject({
        bank: 'Kuda',
        accountNumber: '2034567891',
        accountName: 'Chiamaka Nwosu',
        remark: 'Lunch money',
      });

      const after = await getWallet();
      expect(after.ngn.balanceKobo).toBe(before.ngn.balanceKobo - 250_000);

      const stored = await getTransaction(transaction.id);
      expect(stored.reference).toBe(transaction.reference);
      expect(stored.type).toBe('transfer');
    });

    it('puts a new recipient first in getRecentRecipients', async () => {
      await transferNgn({
        bankName: 'GTBank',
        accountNumber: '1112223334',
        accountName: 'Fatima Abubakar',
        amountKobo: 100_000,
      });

      const recipients = await getRecentRecipients();
      expect(recipients[0]).toEqual({
        bankName: 'GTBank',
        accountNumber: '1112223334',
        accountName: 'Fatima Abubakar',
      });
      expect(
        recipients.some(
          (entry) => entry.bankName === 'Kuda' && entry.accountNumber === '2034567891',
        ),
      ).toBe(true);
    });
  });
});
