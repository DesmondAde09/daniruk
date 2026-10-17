/**
 * Runtime smoke tests: every data module resolves contract-shaped data
 * (SPEC.md §Mock Data Contracts). These pin the seam a real backend
 * will later re-implement.
 */
import * as auth from '@/data/auth';
import * as notifications from '@/data/notifications';
import * as referrals from '@/data/referrals';
import * as services from '@/data/services';
import * as trade from '@/data/trade';
import * as transactions from '@/data/transactions';
import type { TransactionStatus, TransactionType, User } from '@/data/types';
import * as wallet from '@/data/wallet';

const VALID_TYPES: readonly TransactionType[] = [
  'trade',
  'airtime',
  'data',
  'electricity',
  'flight',
  'receive',
  'withdraw',
];
const VALID_STATUSES: readonly TransactionStatus[] = ['successful', 'pending', 'failed'];

function expectUserShape(user: User) {
  expect(typeof user.id).toBe('string');
  expect(user.fullName.length).toBeGreaterThan(0);
  expect(user.email).toContain('@');
  expect(user.avatarInitials.length).toBeGreaterThan(0);
  expect(user.referralCode.length).toBeGreaterThan(0);
}

describe('auth', () => {
  it('signs in and exposes the session', async () => {
    const user = await auth.signIn('adebayo@daniruk.app', 'password123');
    expectUserShape(user);
    expect(await auth.getSession()).toEqual(user);
  });

  it('signs up a new user with derived initials', async () => {
    const user = await auth.signUp('Chidi Eze', 'chidi@example.com', 'password123');
    expectUserShape(user);
    expect(user.fullName).toBe('Chidi Eze');
    expect(user.avatarInitials).toBe('CE');
  });

  it('accepts any 6-digit OTP and rejects other codes', async () => {
    await expect(auth.verifyOtp('000000')).resolves.toBe(true);
    await expect(auth.verifyOtp('918273')).resolves.toBe(true);
    await expect(auth.verifyOtp('12345')).resolves.toBe(false);
    await expect(auth.verifyOtp('abcdef')).resolves.toBe(false);
  });

  it('clears the session on sign out', async () => {
    await auth.signIn('adebayo@daniruk.app', 'password123');
    await auth.signOut();
    await expect(auth.getSession()).resolves.toBeNull();
  });
});

describe('wallet', () => {
  it('returns the persona wallet: integer kobo + BTC/USDT holdings', async () => {
    const result = await wallet.getWallet();
    expect(Number.isInteger(result.ngn.balanceKobo)).toBe(true);
    expect(result.ngn.balanceKobo).toBe(34820000);

    const assets = result.crypto.map((holding) => holding.asset).sort();
    expect(assets).toEqual(['BTC', 'USDT']);
    for (const holding of result.crypto) {
      expect(holding.balance).toMatch(/^\d+(\.\d+)?$/);
      expect(holding.address.length).toBeGreaterThan(0);
    }
  });

  it('returns bank accounts with 10-digit numbers', async () => {
    const accounts = await wallet.getBankAccounts();
    expect(accounts.length).toBeGreaterThan(0);
    for (const account of accounts) {
      expect(account.accountNumber).toMatch(/^\d{10}$/);
      expect(account.accountName.length).toBeGreaterThan(0);
    }
  });

  it("resolves a new bank account to the mock user's name", async () => {
    const before = await wallet.getBankAccounts();
    const added = await wallet.addBankAccount({ bankName: 'Zenith Bank', accountNumber: '2233445566' });
    expect(added.accountName).toBe('Adebayo Okafor');
    expect(added.accountNumber).toBe('2233445566');

    const after = await wallet.getBankAccounts();
    expect(after.length).toBe(before.length + 1);
    expect(after.some((account) => account.id === added.id)).toBe(true);
  });
});

describe('transactions', () => {
  it('returns ~20 contract-shaped entries, newest first', async () => {
    const list = await transactions.getTransactions();
    expect(list.length).toBeGreaterThanOrEqual(18);

    for (const tx of list) {
      expect(VALID_TYPES).toContain(tx.type);
      expect(VALID_STATUSES).toContain(tx.status);
      expect(Number.isInteger(tx.amountKobo)).toBe(true);
      expect(Number.isNaN(Date.parse(tx.createdAt))).toBe(false);
      expect(tx.reference).toMatch(/^DNR-\d+$/);
      expect(['NGN', 'BTC', 'USDT']).toContain(tx.currency);
    }

    const timestamps = list.map((tx) => Date.parse(tx.createdAt));
    const sorted = [...timestamps].sort((a, b) => b - a);
    expect(timestamps).toEqual(sorted);
  });

  it('covers every type and every status in the fixtures', async () => {
    const list = await transactions.getTransactions();
    for (const type of VALID_TYPES) {
      expect(list.some((tx) => tx.type === type)).toBe(true);
    }
    for (const status of VALID_STATUSES) {
      expect(list.some((tx) => tx.status === status)).toBe(true);
    }
  });

  it('contains the Apple Gift Card trade from the designs (DNR-284910)', async () => {
    const list = await transactions.getTransactions();
    const apple = list.find((tx) => tx.reference === 'DNR-284910');
    expect(apple).toBeDefined();
    expect(apple?.title).toBe('Apple Gift Card');
    expect(apple?.type).toBe('trade');
    expect(apple?.amountKobo).toBe(7125000);
    expect(apple?.status).toBe('successful');

    // Seeded "earlier today" relative to module load; compare recency rather
    // than calendar day so the assertion survives a midnight crossing.
    const created = new Date(apple?.createdAt ?? '');
    const ageMs = Date.now() - created.getTime();
    expect(ageMs).toBeGreaterThanOrEqual(0);
    expect(ageMs).toBeLessThan(24 * 3_600_000);
  });

  it('filters by type and status', async () => {
    const trades = await transactions.getTransactions({ type: 'trade' });
    expect(trades.length).toBeGreaterThan(0);
    expect(trades.every((tx) => tx.type === 'trade')).toBe(true);

    const pending = await transactions.getTransactions({ status: 'pending' });
    expect(pending.length).toBeGreaterThan(0);
    expect(pending.every((tx) => tx.status === 'pending')).toBe(true);

    const pendingTrades = await transactions.getTransactions({ type: 'trade', status: 'pending' });
    expect(pendingTrades.every((tx) => tx.type === 'trade' && tx.status === 'pending')).toBe(true);
  });

  it('resolves a single transaction and rejects unknown ids', async () => {
    const tx = await transactions.getTransaction('txn_001');
    expect(tx.reference).toBe('DNR-284910');
    await expect(transactions.getTransaction('txn_nope')).rejects.toThrow('Transaction not found');
  });
});

describe('trade', () => {
  it('returns brands with positive rates and sane ranges', async () => {
    const brands = await trade.getGiftCardBrands();
    expect(brands.length).toBeGreaterThan(0);
    for (const brand of brands) {
      expect(brand.ratePerDollar).toBeGreaterThan(0);
      expect(brand.minUsd).toBeLessThanOrEqual(brand.maxUsd);
      expect(brand.name.length).toBeGreaterThan(0);
    }
  });

  it('quotes payout in integer kobo (amountUsd × rate × 100)', async () => {
    const quote = await trade.getTradeQuote('apple', 50);
    expect(quote).toEqual({
      brandId: 'apple',
      amountUsd: 50,
      ratePerDollar: 1425,
      payoutKobo: 7125000,
    });
  });

  it('rejects unknown brands and out-of-range amounts', async () => {
    await expect(trade.getTradeQuote('nope', 50)).rejects.toThrow('Unknown gift card brand');
    await expect(trade.getTradeQuote('apple', 5)).rejects.toThrow('between $10 and $500');
    await expect(trade.getTradeQuote('apple', 1000)).rejects.toThrow('between $10 and $500');
  });

  it('records a submitted trade in the transaction store', async () => {
    const tx = await trade.submitTrade({ brandId: 'steam', amountUsd: 20 });
    expect(tx.type).toBe('trade');
    expect(tx.status).toBe('successful');
    expect(tx.amountKobo).toBe(20 * 1380 * 100);

    const stored = await transactions.getTransaction(tx.id);
    expect(stored.reference).toBe(tx.reference);
  });
});

describe('services', () => {
  it('lists the four services', async () => {
    const list = await services.getServices();
    expect(list.map((service) => service.id).sort()).toEqual([
      'airtime',
      'data',
      'electricity',
      'flights',
    ]);
  });

  it('returns networks, data plans with integer kobo prices, and discos', async () => {
    const networks = await services.getNetworks();
    expect(networks.map((network) => network.id)).toContain('mtn');

    const plans = await services.getDataPlans('mtn');
    expect(plans.length).toBeGreaterThan(0);
    for (const plan of plans) {
      expect(Number.isInteger(plan.priceKobo)).toBe(true);
    }

    const discos = await services.getDiscos();
    expect(discos.length).toBeGreaterThan(0);
  });

  it('records a bill payment as a successful debit', async () => {
    const tx = await services.payBill({
      type: 'airtime',
      title: 'MTN Airtime',
      amountKobo: 50000,
      meta: { network: 'MTN', phone: '08034561234' },
    });
    expect(tx.amountKobo).toBe(-50000);
    expect(tx.status).toBe('successful');
    await expect(transactions.getTransaction(tx.id)).resolves.toMatchObject({ id: tx.id });
  });

  it('returns mocked flight results for a route', async () => {
    const results = await services.searchFlights({
      from: 'LOS',
      to: 'ABV',
      departDate: '2026-11-02',
      passengers: 2,
    });
    expect(results.length).toBeGreaterThan(0);
    for (const flight of results) {
      expect(flight.from).toBe('LOS');
      expect(flight.to).toBe('ABV');
      expect(Number.isInteger(flight.priceKobo)).toBe(true);
      expect(Date.parse(flight.arriveAt)).toBeGreaterThan(Date.parse(flight.departAt));
    }
  });
});

describe('notifications', () => {
  it('returns contract-shaped notifications', async () => {
    const list = await notifications.getNotifications();
    expect(list.length).toBeGreaterThan(0);
    for (const notification of list) {
      expect(typeof notification.title).toBe('string');
      expect(typeof notification.body).toBe('string');
      expect(typeof notification.read).toBe('boolean');
      expect(Number.isNaN(Date.parse(notification.createdAt))).toBe(false);
    }
  });

  it('marks a notification as read', async () => {
    const [first] = await notifications.getNotifications();
    await notifications.markRead(first.id);
    const updated = (await notifications.getNotifications()).find(
      (entry) => entry.id === first.id,
    );
    expect(updated?.read).toBe(true);
  });
});

describe('referrals', () => {
  it("returns the persona's referral summary", async () => {
    const summary = await referrals.getReferralSummary();
    expect(summary.code).toBe(auth.mockUser.referralCode);
    expect(summary.invitedCount).toBeGreaterThanOrEqual(0);
    expect(Number.isInteger(summary.earnedKobo)).toBe(true);
  });
});
