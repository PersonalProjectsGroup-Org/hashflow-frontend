import { QueryClient, type QueryClientConfig } from '@tanstack/react-query';

/**
 * How long REST cache entries stay fresh before a refetch (ms).
 * High-frequency data (telemetry, prices) flows through the realtime
 * streams (ADR-0004), so the REST cache only holds rig list/settings —
 * 30s keeps them fresh without hammering the backend.
 */
export const DEFAULT_STALE_TIME_MS = 30_000;

/** Maximum retries before a query gives up (4xx never retries, see `shouldRetry`). */
export const DEFAULT_RETRY_COUNT = 2;

/**
 * Centralized retry policy: retry transient failures (5xx, network,
 * timeout) but never client errors (4xx) — a bad request won't fix
 * itself, and retrying it only wastes a request. Errors arriving here
 * have already been normalized to `ApiError` by the axios interceptor
 * (T013): `status` present = the server responded, absent = network/timeout.
 */
export function shouldRetry(failureCount: number, error: unknown): boolean {
  if (failureCount >= DEFAULT_RETRY_COUNT) {
    return false;
  }
  if (typeof error === 'object' && error !== null && 'status' in error) {
    const status = error.status;
    if (typeof status === 'number' && status < 500) {
      return false;
    }
  }
  return true;
}

/**
 * Build a configured QueryClient. Applies the default staleTime and the
 * retry policy from `shouldRetry`; callers may override per-instance.
 */
export function createQueryClient(
  options: QueryClientConfig = {},
): QueryClient {
  return new QueryClient({
    ...options,
    defaultOptions: {
      ...options.defaultOptions,
      queries: {
        staleTime: DEFAULT_STALE_TIME_MS,
        retry: shouldRetry,
        ...options.defaultOptions?.queries,
      },
    },
  });
}

/** The app-wide React Query client. Use it in providers and services. */
export const queryClient = createQueryClient();
