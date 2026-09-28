import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  createQueryClient,
  DEFAULT_RETRY_COUNT,
  DEFAULT_STALE_TIME_MS,
  queryClient,
  shouldRetry,
} from '../../src/lib/queryClient';

afterEach(() => {
  queryClient.clear();
  vi.restoreAllMocks();
});

describe('queryClient singleton', () => {
  it('exports a client with the default staleTime', () => {
    expect(queryClient.getDefaultOptions().queries?.staleTime).toBe(
      DEFAULT_STALE_TIME_MS,
    );
  });

  it('applies the shared retry policy by default', () => {
    expect(queryClient.getDefaultOptions().queries?.retry).toBe(shouldRetry);
  });

  it('lets createQueryClient override the staleTime per instance', () => {
    const client = createQueryClient({
      defaultOptions: { queries: { staleTime: 5_000 } },
    });
    expect(client.getDefaultOptions().queries?.staleTime).toBe(5_000);
    // The retry policy is still applied on top of the override.
    expect(client.getDefaultOptions().queries?.retry).toBe(shouldRetry);
  });
});

describe('shouldRetry', () => {
  it('never retries client errors (4xx)', () => {
    expect(shouldRetry(0, { message: 'Rig not found', status: 404 })).toBe(
      false,
    );
  });

  it('retries server errors (5xx)', () => {
    expect(shouldRetry(0, { message: 'Backend warming up', status: 503 })).toBe(
      true,
    );
  });

  it('retries network/timeout errors without a status', () => {
    expect(
      shouldRetry(0, { message: 'Network error. Check your connection.' }),
    ).toBe(true);
  });

  it('stops after the retry cap', () => {
    const error = { message: 'Backend warming up', status: 503 };
    expect(shouldRetry(DEFAULT_RETRY_COUNT, error)).toBe(false);
    expect(shouldRetry(DEFAULT_RETRY_COUNT + 1, error)).toBe(false);
  });

  it('retries non-ApiError failures (defensive)', () => {
    expect(shouldRetry(0, new Error('boom'))).toBe(true);
  });
});

describe('fetchQuery integration', () => {
  it('retries transient 5xx errors and resolves once the backend recovers', async () => {
    const calls = vi.fn();
    const queryFn = async () => {
      calls();
      if (calls.mock.calls.length < 3) {
        throw { message: 'Backend warming up', status: 503 };
      }
      return ['rig-1'];
    };

    await expect(
      queryClient.fetchQuery({
        queryKey: ['rigs', 'recovers'],
        queryFn,
        retryDelay: 0,
      }),
    ).resolves.toEqual(['rig-1']);
    expect(calls).toHaveBeenCalledTimes(3);
  });

  it('fails fast on 4xx without retrying', async () => {
    const calls = vi.fn();
    const queryFn = async () => {
      calls();
      throw { message: 'Rig not found', status: 404 };
    };

    await expect(
      queryClient.fetchQuery({
        queryKey: ['rigs', 'missing'],
        queryFn,
        retryDelay: 0,
      }),
    ).rejects.toEqual({ message: 'Rig not found', status: 404 });
    expect(calls).toHaveBeenCalledTimes(1);
  });

  it('gives up after the retry cap on persistent network errors', async () => {
    const calls = vi.fn();
    const queryFn = async () => {
      calls();
      throw { message: 'Network error. Check your connection.' };
    };

    await expect(
      queryClient.fetchQuery({
        queryKey: ['rigs', 'offline'],
        queryFn,
        retryDelay: 0,
      }),
    ).rejects.toEqual({ message: 'Network error. Check your connection.' });
    expect(calls).toHaveBeenCalledTimes(DEFAULT_RETRY_COUNT + 1);
  });
});
