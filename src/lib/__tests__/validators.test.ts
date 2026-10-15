import {
  validateAccountNumber,
  validateAmount,
  validateCryptoAddress,
  validateEmail,
  validateFullName,
  validateMeterNumber,
  validateNigerianPhone,
  validatePassword,
} from '@/lib/validators';

describe('validateEmail', () => {
  it('accepts a well-formed address', () => {
    expect(validateEmail('adebayo@daniruk.app')).toBeNull();
  });

  it('rejects empty input', () => {
    expect(validateEmail('')).toBe('Email address is required');
    expect(validateEmail('   ')).toBe('Email address is required');
  });

  it.each(['plainstring', 'missing@domain', 'two@@signs.com', 'spaces in@address.com'])(
    'rejects malformed address: %s',
    (email) => {
      expect(validateEmail(email)).toBe('Enter a valid email address');
    },
  );
});

describe('validatePassword', () => {
  it('accepts 8+ characters', () => {
    expect(validatePassword('s3cure-pw')).toBeNull();
  });

  it('rejects empty input', () => {
    expect(validatePassword('')).toBe('Password is required');
  });

  it('rejects fewer than 8 characters', () => {
    expect(validatePassword('short1!')).toBe('Password must be at least 8 characters');
  });
});

describe('validateFullName', () => {
  it('accepts first and last name', () => {
    expect(validateFullName('Adebayo Okafor')).toBeNull();
  });

  it('rejects empty input', () => {
    expect(validateFullName('')).toBe('Full name is required');
  });

  it('rejects a single name', () => {
    expect(validateFullName('Adebayo')).toBe('Enter your first and last name');
  });
});

describe('validateNigerianPhone', () => {
  it.each(['07031234567', '08034561234', '08123456789', '09087654321', '09123456789'])(
    'accepts valid prefix: %s',
    (phone) => {
      expect(validateNigerianPhone(phone)).toBeNull();
    },
  );

  it('rejects empty input', () => {
    expect(validateNigerianPhone('')).toBe('Phone number is required');
  });

  it.each([
    '06031234567', // unsupported prefix
    '0803456123', // too short
    '080345612345', // too long
    '+2348034561234', // international format not accepted
  ])('rejects invalid number: %s', (phone) => {
    expect(validateNigerianPhone(phone)).toBe('Enter a valid Nigerian phone number');
  });
});

describe('validateMeterNumber', () => {
  it('accepts 6–13 digit meter numbers', () => {
    expect(validateMeterNumber('123456')).toBeNull();
    expect(validateMeterNumber('0451237890123')).toBeNull();
  });

  it('rejects empty input', () => {
    expect(validateMeterNumber('')).toBe('Meter number is required');
  });

  it.each(['12345', '12345678901234'])('rejects out-of-range length: %s', (meter) => {
    expect(validateMeterNumber(meter)).toBe('Enter a valid meter number');
  });
});

describe('validateAccountNumber', () => {
  it('accepts a 10-digit NUBAN', () => {
    expect(validateAccountNumber('0123456789')).toBeNull();
  });

  it('rejects empty input', () => {
    expect(validateAccountNumber('')).toBe('Account number is required');
  });

  it.each(['012345678', '01234567890'])('rejects wrong length: %s', (account) => {
    expect(validateAccountNumber(account)).toBe('Account number must be 10 digits');
  });
});

describe('validateAmount', () => {
  it('accepts an amount inside the bounds', () => {
    expect(validateAmount(50000, 10000, 100000)).toBeNull();
  });

  it('treats bounds as inclusive', () => {
    expect(validateAmount(10000, 10000, 100000)).toBeNull();
    expect(validateAmount(100000, 10000, 100000)).toBeNull();
  });

  it('rejects zero, negative and NaN', () => {
    expect(validateAmount(0, 10000, 100000)).toBe('Amount is required');
    expect(validateAmount(-5, 10000, 100000)).toBe('Amount is required');
    expect(validateAmount(Number.NaN, 10000, 100000)).toBe('Amount is required');
  });

  it('rejects below the minimum and above the maximum', () => {
    expect(validateAmount(5000, 10000, 100000)).toBe('Amount must be at least 10000');
    expect(validateAmount(200000, 10000, 100000)).toBe('Amount must be at most 100000');
  });

  it('uses the label in error messages', () => {
    expect(validateAmount(0, 10000, 100000, 'Withdrawal amount')).toBe('Withdrawal amount is required');
  });
});

describe('validateCryptoAddress', () => {
  it('accepts a plausible address', () => {
    expect(validateCryptoAddress('bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh')).toBeNull();
  });

  it('rejects empty input', () => {
    expect(validateCryptoAddress('')).toBe('Wallet address is required');
  });

  it('rejects suspiciously short input', () => {
    expect(validateCryptoAddress('bc1qxyz')).toBe('Enter a valid wallet address');
  });
});
