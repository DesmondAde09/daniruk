import {
  getDataPlans,
  getDiscos,
  getNetworks,
  getServices,
  payBill,
  searchFlights,
} from '@/data/services';
import { getTransactions } from '@/data/transactions';
import { getWallet } from '@/data/wallet';

describe('services data layer', () => {
  describe('catalogues', () => {
    it('lists the four everyday services', async () => {
      const services = await getServices();

      expect(services.map((service) => service.id)).toEqual([
        'flights',
        'electricity',
        'airtime',
        'data',
      ]);
      for (const service of services) {
        expect(service.name.length).toBeGreaterThan(0);
        expect(service.tagline.length).toBeGreaterThan(0);
      }
    });

    it('lists networks and per-network data plans with prices', async () => {
      const networks = await getNetworks();
      expect(networks.map((network) => network.name)).toEqual(['MTN', 'Airtel', 'Glo', '9mobile']);

      for (const network of networks) {
        const plans = await getDataPlans(network.id);
        expect(plans.length).toBeGreaterThan(0);
        for (const plan of plans) {
          expect(plan.priceKobo).toBeGreaterThan(0);
        }
      }

      await expect(getDataPlans('unknown-network')).resolves.toEqual([]);
    });

    it('lists electricity discos', async () => {
      const discos = await getDiscos();
      expect(discos.length).toBeGreaterThan(0);
      expect(discos.map((disco) => disco.name)).toContain('Ikeja Electric (IKEDC)');
    });

    it('searchFlights returns contract-shaped results that scale with passengers', async () => {
      const onePassenger = await searchFlights({
        from: 'LOS',
        to: 'ABV',
        departDate: '2026-10-20T00:00:00.000Z',
        passengers: 1,
      });
      expect(onePassenger.length).toBeGreaterThan(0);
      for (const flight of onePassenger) {
        expect(flight.from).toBe('LOS');
        expect(flight.to).toBe('ABV');
        expect(flight.airline.length).toBeGreaterThan(0);
        expect(flight.priceKobo).toBeGreaterThan(0);
      }

      const twoPassengers = await searchFlights({
        from: 'LOS',
        to: 'ABV',
        departDate: '2026-10-20T00:00:00.000Z',
        passengers: 2,
      });
      expect(twoPassengers[0].priceKobo).toBe(onePassenger[0].priceKobo * 2);
    });
  });

  describe('payBill', () => {
    it('debits the NGN wallet and records a successful debit transaction', async () => {
      const before = await getWallet();

      const transaction = await payBill({
        type: 'airtime',
        title: 'MTN Airtime',
        amountKobo: 20_000,
        meta: { network: 'MTN', phone: '08034561234' },
      });

      expect(transaction.type).toBe('airtime');
      expect(transaction.amountKobo).toBe(-20_000);
      expect(transaction.currency).toBe('NGN');
      expect(transaction.status).toBe('successful');
      expect(transaction.meta).toMatchObject({ network: 'MTN', phone: '08034561234' });

      const after = await getWallet();
      expect(after.ngn.balanceKobo).toBe(before.ngn.balanceKobo - 20_000);

      const ledger = await getTransactions();
      expect(ledger.some((entry) => entry.id === transaction.id)).toBe(true);
    });

    it('rejects on insufficient balance without debiting or recording a transaction', async () => {
      const wallet = await getWallet();
      const balanceBefore = wallet.ngn.balanceKobo;
      const ledgerBefore = await getTransactions();

      await expect(
        payBill({ type: 'flight', title: 'Flight LOS → ABV', amountKobo: balanceBefore + 100 }),
      ).rejects.toThrow('Insufficient NGN balance');

      const after = await getWallet();
      expect(after.ngn.balanceKobo).toBe(balanceBefore);
      const ledgerAfter = await getTransactions();
      expect(ledgerAfter.length).toBe(ledgerBefore.length);
    });
  });
});
