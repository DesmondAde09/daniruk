import { useCallback, useEffect, useRef, useState } from 'react';

export interface AsyncState<T> {
  data: T | null;
  error: string | null;
  loading: boolean;
  reload: () => void;
}

/**
 * Thin wrapper over the mock data layer's async functions.
 * Runs once on mount; `reload` re-invokes the call.
 * Effect-local cancellation guards against setting state after unmount
 * and against stale resolutions when re-running.
 */
export function useAsync<T>(fn: () => Promise<T>): AsyncState<T> {
  const [state, setState] = useState<Omit<AsyncState<T>, 'reload'>>({
    data: null,
    error: null,
    loading: true,
  });
  const [attempt, setAttempt] = useState(0);
  const fnRef = useRef(fn);

  useEffect(() => {
    fnRef.current = fn;
  }, [fn]);

  useEffect(() => {
    let active = true;
    fnRef.current()
      .then((result) => {
        if (active) {
          setState({ data: result, error: null, loading: false });
        }
      })
      .catch((err: unknown) => {
        if (active) {
          setState({
            data: null,
            error: err instanceof Error ? err.message : 'Something went wrong',
            loading: false,
          });
        }
      });
    return () => {
      active = false;
    };
  }, [attempt]);

  const reload = useCallback(() => {
    setState((prev) => ({ ...prev, loading: true, error: null }));
    setAttempt((count) => count + 1);
  }, []);

  return { ...state, reload };
}
