/**
 * Simulated network latency for the mock data layer (SPEC.md: 300–800ms).
 * Resolves immediately under Jest (NODE_ENV === 'test') so tests stay fast.
 */
export function withLatency<T>(value: T, minMs = 300, maxMs = 800): Promise<T> {
  const isTest = typeof process !== 'undefined' && process.env?.NODE_ENV === 'test';
  const ms = isTest ? 0 : minMs + Math.random() * Math.max(0, maxMs - minMs);
  return new Promise((resolve) => {
    setTimeout(() => resolve(value), ms);
  });
}
