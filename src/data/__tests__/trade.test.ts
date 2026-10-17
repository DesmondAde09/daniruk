import { getTransactions } from '@/data/transactions';
import { getTradeQuote, submitTrade } from '@/data/trade';
import { getWallet } from '@/data/wallet';

describe('trade data layer', () => {
  describe('getTradeQuote', () => {
    it('computes payout as amountUsd × rate × 100 in integer kobo', async () => {
      const quote = await getTradeQuote('apple', 50);

      expect(quote.payoutKobo).toBe(7125000);
      expect(Number.isInteger(quote.payoutKobo)).toBe(true);
    });

    it('keeps fractional dollar amounts exact (cents × rate)', async () => {
      const quote = await getTradeQuote('apple', 50.55);

      expect(quote.payoutKobo).toBe(5055 * 1425);
      expect(Number.isInteger(quote.payoutKobo)).toBe(true);
    });

    it('rejects amounts outside the brand range', async () => {
      await expect(getTradeQuote('apple', 5)).rejects.toThrow('between $10 and $500');
      await expect(getTradeQuote('apple', 501)).rejects.toThrow('between $10 and $500');
      await expect(getTradeQuote('unknown-brand', 50)).rejects.toThrow('Unknown gift card brand');
    });
  });

  describe('submitTrade', () => {
    it('records a successful trade transaction and credits the NGN wallet', async () => {
      const before = await getWallet();

      const transaction = await submitTrade({ brandId: 'steam', amountUsd: 100, cardCode: 'XJ4K' });

      expect(transaction.type).toBe('trade');
      expect(transaction.title).toBe('Steam Gift Card');
      expect(transaction.status).toBe('successful');
      expect(transaction.amountKobo).toBe(100 * 1380 * 100);

      const ledger = await getTransactions();
      expect(ledger.some((entry) => entry.id === transaction.id)).toBe(true);

      const after = await getWallet();
      expect(after.ngn.balanceKobo).toBe(before.ngn.balanceKobo + transaction.amountKobo);
    });
  });
});
