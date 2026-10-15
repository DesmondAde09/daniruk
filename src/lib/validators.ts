/**
 * Form validators. Pure functions returning error messages (or null when valid),
 * so screens can render the design's error state directly.
 */

export function validateEmail(email: string): string | null {
  const trimmed = email.trim();
  if (trimmed.length === 0) return 'Email address is required';
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) return 'Enter a valid email address';
  return null;
}

export function validatePassword(password: string): string | null {
  if (password.length === 0) return 'Password is required';
  if (password.length < 8) return 'Password must be at least 8 characters';
  return null;
}

export function validateFullName(name: string): string | null {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return 'Full name is required';
  if (parts.length < 2) return 'Enter your first and last name';
  return null;
}

/** Nigerian mobile: 11 digits starting 070/080/081/090/091. */
export function validateNigerianPhone(phone: string): string | null {
  const digits = phone.replace(/\D/g, '');
  if (digits.length === 0) return 'Phone number is required';
  if (!/^0(70|80|81|90|91)\d{8}$/.test(digits)) return 'Enter a valid Nigerian phone number';
  return null;
}

/** Electricity meter: 6–13 digits. */
export function validateMeterNumber(meter: string): string | null {
  const digits = meter.replace(/\D/g, '');
  if (digits.length === 0) return 'Meter number is required';
  if (!/^\d{6,13}$/.test(digits)) return 'Enter a valid meter number';
  return null;
}

/** Nigerian bank account: exactly 10 digits (NUBAN). */
export function validateAccountNumber(account: string): string | null {
  const digits = account.replace(/\D/g, '');
  if (digits.length === 0) return 'Account number is required';
  if (!/^\d{10}$/.test(digits)) return 'Account number must be 10 digits';
  return null;
}

/** Amount within [min, max]; bounds are inclusive. */
export function validateAmount(
  amount: number,
  min: number,
  max: number,
  label = 'Amount',
): string | null {
  if (Number.isNaN(amount) || amount <= 0) return `${label} is required`;
  if (amount < min) return `${label} must be at least ${min}`;
  if (amount > max) return `${label} must be at most ${max}`;
  return null;
}

/** Crypto withdrawal address: basic non-empty sanity check (mock). */
export function validateCryptoAddress(address: string): string | null {
  const trimmed = address.trim();
  if (trimmed.length === 0) return 'Wallet address is required';
  if (trimmed.length < 20) return 'Enter a valid wallet address';
  return null;
}
