import { getTransactions } from '@/data/transactions';
import {
  addBankAccount,
  debitCrypto,
  debitNgnKobo,
  getBankAccounts,
  getBanks,
  getWallet,
  MIN_NGN_WITHDRAWAL_KOBO,
  resolveBankAccountName,
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
