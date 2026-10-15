import { withLatency } from './latency';
import type { User } from './types';

/** Mock persona (SPEC.md): Adebayo Okafor. */
export const mockUser: User = {
  id: 'user_001',
  fullName: 'Adebayo Okafor',
  email: 'adebayo@daniruk.app',
  avatarInitials: 'AO',
  referralCode: 'ADEBAYO2026',
};

/** Mock session, held in module state. The auth gate reads this. */
let session: User | null = null;

function deriveInitials(fullName: string): string {
  return fullName
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('');
}

/** Mock sign-in: any well-formed credentials succeed and return the persona. */
export function signIn(email: string, password: string): Promise<User> {
  void password;
  session = { ...mockUser, email: email.trim().toLowerCase() };
  return withLatency(session);
}

/** Mock sign-up: creates a user from the given details (not yet verified — see verifyOtp). */
export function signUp(fullName: string, email: string, password: string): Promise<User> {
  void password;
  session = {
    ...mockUser,
    fullName: fullName.trim(),
    email: email.trim().toLowerCase(),
    avatarInitials: deriveInitials(fullName),
  };
  return withLatency(session);
}

/** Mock OTP: accepts any 6-digit code. */
export function verifyOtp(code: string): Promise<boolean> {
  return withLatency(/^\d{6}$/.test(code.trim()));
}

export function signOut(): Promise<void> {
  session = null;
  return withLatency(undefined);
}

export function getSession(): Promise<User | null> {
  return withLatency(session);
}
