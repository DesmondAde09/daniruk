import { withLatency } from './latency';
import { addTransaction } from './transactions';
import type { FlightResult, ServicePlan, Transaction } from './types';

/** The four everyday services shown in the designs (Quick services). */
export type ServiceId = 'flights' | 'electricity' | 'airtime' | 'data';

export interface Service {
  id: ServiceId;
  name: string;
  tagline: string;
}

const services: Service[] = [
  { id: 'flights', name: 'Flights', tagline: 'Book local flights' },
  { id: 'electricity', name: 'Electricity', tagline: 'Prepaid & postpaid' },
  { id: 'airtime', name: 'Airtime', tagline: 'Instant top-up' },
  { id: 'data', name: 'Data', tagline: 'Bundles that last' },
];

const networks: ServicePlan[] = [
  { id: 'mtn', name: 'MTN' },
  { id: 'airtel', name: 'Airtel' },
  { id: 'glo', name: 'Glo' },
  { id: '9mobile', name: '9mobile' },
];

const dataPlans: Record<string, ServicePlan[]> = {
  mtn: [
    { id: 'mtn-2gb', name: '2GB — 30 days', priceKobo: 120000 },
    { id: 'mtn-5gb', name: '5GB — 30 days', priceKobo: 180000 },
    { id: 'mtn-10gb', name: '10GB — 30 days', priceKobo: 300000 },
  ],
  airtel: [
    { id: 'airtel-2gb', name: '2GB — 30 days', priceKobo: 115000 },
    { id: 'airtel-10gb', name: '10GB — 30 days', priceKobo: 350000 },
  ],
  glo: [
    { id: 'glo-3gb', name: '3GB — 30 days', priceKobo: 100000 },
    { id: 'glo-7gb', name: '7GB — 30 days', priceKobo: 190000 },
  ],
  '9mobile': [{ id: '9mobile-2gb', name: '2GB — 30 days', priceKobo: 95000 }],
};

const discos: ServicePlan[] = [
  { id: 'ekedc', name: 'Eko Electric (EKEDC)' },
  { id: 'ikedc', name: 'Ikeja Electric (IKEDC)' },
  { id: 'aedc', name: 'Abuja Electric (AEDC)' },
  { id: 'phedc', name: 'Port Harcourt Electric (PHEDC)' },
];

export function getServices(): Promise<Service[]> {
  return withLatency(services.map((service) => ({ ...service })));
}

export function getNetworks(): Promise<ServicePlan[]> {
  return withLatency(networks.map((network) => ({ ...network })));
}

export function getDataPlans(networkId: string): Promise<ServicePlan[]> {
  return withLatency((dataPlans[networkId] ?? []).map((plan) => ({ ...plan })));
}

export function getDiscos(): Promise<ServicePlan[]> {
  return withLatency(discos.map((disco) => ({ ...disco })));
}

export interface PayBillInput {
  type: 'airtime' | 'data' | 'electricity' | 'flight';
  title: string;
  amountKobo: number;
  meta?: Record<string, string>;
}

/** Mock bill payment: records a successful debit and returns the transaction. */
export function payBill(input: PayBillInput): Promise<Transaction> {
  const transaction = addTransaction({
    type: input.type,
    title: input.title,
    amountKobo: -Math.abs(input.amountKobo),
    currency: 'NGN',
    status: 'successful',
    meta: input.meta,
  });
  return withLatency({ ...transaction });
}

export interface FlightQuery {
  from: string;
  to: string;
  departDate: string; // ISO date
  passengers: number;
}

const airlines = ['Air Peace', 'Ibom Air', 'Arik Air', 'United Nigeria'];

/** Mock flight search: deterministic-ish results derived from the route. */
export function searchFlights(query: FlightQuery): Promise<FlightResult[]> {
  const depart = new Date(query.departDate);
  const results: FlightResult[] = airlines.map((airline, index) => {
    const departAt = new Date(depart);
    departAt.setHours(7 + index * 3, 15, 0, 0);
    const arriveAt = new Date(departAt.getTime() + 65 * 60_000);
    return {
      id: `flight_${query.from}_${query.to}_${index}`,
      airline,
      from: query.from,
      to: query.to,
      departAt: departAt.toISOString(),
      arriveAt: arriveAt.toISOString(),
      priceKobo: (65_000 + index * 8_500) * 100 * Math.max(1, query.passengers),
    };
  });
  return withLatency(results);
}
