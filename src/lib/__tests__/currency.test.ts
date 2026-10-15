import {
  MINUS,
  formatCrypto,
  formatNaira,
  formatRate,
  formatSignedKobo,
  formatUsd,
} from '@/lib/currency';

describe('formatNaira', () => {
  it('formats the persona balance with grouping and two decimals', () => {
    expect(formatNaira(34820000)).toBe('₦348,200.00');
  });

  it('formats zero', () => {
    expect(formatNaira(0)).toBe('₦0.00');
  });

  it('groups thousands and millions', () => {
    expect(formatNaira(123456789)).toBe('₦1,234,567.89');
  });

  it('pads a single-digit kobo remainder', () => {
    expect(formatNaira(105)).toBe('₦1.05');
  });

  it('uses the typographic minus for negatives', () => {
    expect(formatNaira(-50000)).toBe(`${MINUS}₦500.00`);
  });

  it('omits decimals when asked', () => {
    expect(formatNaira(34820000, { decimals: false })).toBe('₦348,200');
  });
});

describe('formatSignedKobo', () => {
  it('prefixes credits with + and drops decimals for whole naira', () => {
    expect(formatSignedKobo(7125000)).toBe('+₦71,250');
  });

  it('prefixes debits with the typographic minus', () => {
    expect(formatSignedKobo(-50000)).toBe(`${MINUS}₦500`);
  });

  it('keeps decimals when there is a kobo remainder', () => {
    expect(formatSignedKobo(-50050)).toBe(`${MINUS}₦500.50`);
  });

  it('honours an explicit decimals option', () => {
    expect(formatSignedKobo(7125000, { decimals: true })).toBe('+₦71,250.00');
  });

  it('renders zero unsigned', () => {
    expect(formatSignedKobo(0)).toBe('₦0.00');
  });
});

describe('formatCrypto', () => {
  it('joins the decimal string and asset ticker', () => {
    expect(formatCrypto('0.0048', 'BTC')).toBe('0.0048 BTC');
    expect(formatCrypto('1250.00', 'USDT')).toBe('1250.00 USDT');
  });
});

describe('formatUsd', () => {
  it('formats card values with two decimals', () => {
    expect(formatUsd(50)).toBe('$50.00');
    expect(formatUsd(12.5)).toBe('$12.50');
  });
});

describe('formatRate', () => {
  it('formats the gift-card rate per dollar', () => {
    expect(formatRate(1425)).toBe('₦1,425/$');
  });
});
