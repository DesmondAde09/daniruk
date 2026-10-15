import { act, renderHook, waitFor } from '@testing-library/react-native';

import { useAsync } from '@/hooks/useAsync';

describe('useAsync', () => {
  it('starts loading, then resolves data', async () => {
    let resolve: (value: number) => void = () => undefined;
    const pending = new Promise<number>((res) => {
      resolve = res;
    });
    const { result } = await renderHook(() => useAsync(() => pending));

    expect(result.current.loading).toBe(true);
    expect(result.current.data).toBeNull();
    expect(result.current.error).toBeNull();

    await act(async () => {
      resolve(42);
      await pending;
    });

    expect(result.current.loading).toBe(false);
    expect(result.current.data).toBe(42);
    expect(result.current.error).toBeNull();
  });

  it('surfaces the error message when the call rejects', async () => {
    const { result } = await renderHook(() => useAsync(() => Promise.reject(new Error('boom'))));

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.error).toBe('boom');
    expect(result.current.data).toBeNull();
  });

  it('maps non-Error rejections to a generic message', async () => {
    const { result } = await renderHook(() => useAsync(() => Promise.reject('nope')));

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.error).toBe('Something went wrong');
  });

  it('reload re-invokes the async function', async () => {
    let calls = 0;
    const { result } = await renderHook(() => useAsync(() => Promise.resolve((calls += 1))));

    await waitFor(() => expect(result.current.data).toBe(1));

    await act(async () => {
      result.current.reload();
    });

    await waitFor(() => expect(result.current.data).toBe(2));
    expect(result.current.error).toBeNull();
  });

  it('does not set state after unmount', async () => {
    let resolve: (value: number) => void = () => undefined;
    const pending = new Promise<number>((res) => {
      resolve = res;
    });
    const consoleError = jest.spyOn(console, 'error').mockImplementation(() => undefined);

    const { unmount } = await renderHook(() => useAsync(() => pending));
    unmount();
    resolve(7);
    await pending;
    await Promise.resolve();

    expect(consoleError).not.toHaveBeenCalled();
    consoleError.mockRestore();
  });
});
