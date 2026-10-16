import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

import * as auth from '@/data/auth';
import type { User } from '@/data/types';

export type SessionStatus = 'loading' | 'signedOut' | 'signedIn';

export interface SessionContextValue {
  user: User | null;
  status: SessionStatus;
  signIn: (email: string, password: string) => Promise<void>;
  /** Creates the account but keeps the session signed out until `verifyOtp` succeeds. */
  signUp: (fullName: string, email: string, password: string) => Promise<void>;
  /** Returns whether the code was accepted; a successful verify signs the session in. */
  verifyOtp: (code: string) => Promise<boolean>;
  signOut: () => Promise<void>;
}

const SessionContext = createContext<SessionContextValue | null>(null);

/**
 * Reactive wrapper over the mock session held in `@/data/auth` module state.
 * The root layout reads `status` for the auth gate; screens call the actions.
 */
export function SessionProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [status, setStatus] = useState<SessionStatus>('loading');

  useEffect(() => {
    let active = true;
    auth.getSession().then((existing) => {
      if (!active) return;
      setUser(existing);
      setStatus(existing ? 'signedIn' : 'signedOut');
    });
    return () => {
      active = false;
    };
  }, []);

  const signIn = useCallback(async (email: string, password: string) => {
    const signedInUser = await auth.signIn(email, password);
    setUser(signedInUser);
    setStatus('signedIn');
  }, []);

  const signUp = useCallback(async (fullName: string, email: string, password: string) => {
    const newUser = await auth.signUp(fullName, email, password);
    setUser(newUser);
    setStatus('signedOut');
  }, []);

  const verifyOtp = useCallback(async (code: string) => {
    const accepted = await auth.verifyOtp(code);
    if (accepted) {
      setUser((prev) => prev ?? auth.mockUser);
      setStatus('signedIn');
    }
    return accepted;
  }, []);

  const signOut = useCallback(async () => {
    await auth.signOut();
    setUser(null);
    setStatus('signedOut');
  }, []);

  const value = useMemo<SessionContextValue>(
    () => ({ user, status, signIn, signUp, verifyOtp, signOut }),
    [user, status, signIn, signUp, verifyOtp, signOut],
  );

  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
}

export function useSession(): SessionContextValue {
  const context = useContext(SessionContext);
  if (!context) {
    throw new Error('useSession must be used within a SessionProvider');
  }
  return context;
}
