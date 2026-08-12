import axios, { type AxiosInstance } from 'axios';

/**
 * Default API origin for local development (Spring Boot on :8080; the
 * full-stack NGINX + backend cluster from the infra repo is fronted on :80).
 * Override with `VITE_API_BASE_URL` in `.env.local` / the deployment env.
 */
const DEFAULT_API_BASE_URL = 'http://localhost:8080';

/** Read the API base URL from the environment, falling back to the local default. */
export function resolveApiBaseUrl(): string {
  const fromEnv = import.meta.env.VITE_API_BASE_URL;
  return typeof fromEnv === 'string' && fromEnv.length > 0
    ? fromEnv
    : DEFAULT_API_BASE_URL;
}

/** Error normalized by the response interceptor so callers get one consistent shape. */
export interface ApiError {
  message: string;
  /** HTTP status when the server responded; undefined for network/timeout errors. */
  status?: number;
}

export function toApiError(error: unknown): ApiError {
  if (axios.isAxiosError(error)) {
    const status = error.response?.status;
    if (status !== undefined) {
      const serverMessage = error.response?.data?.message;
      return {
        message:
          typeof serverMessage === 'string' && serverMessage.length > 0
            ? serverMessage
            : `Request failed with status ${status}`,
        status,
      };
    }
    if (error.code === 'ECONNABORTED') {
      return { message: 'Request timed out. Please try again.' };
    }
    return { message: 'Network error. Check your connection and try again.' };
  }
  return {
    message: error instanceof Error ? error.message : 'Unexpected error.',
  };
}

export interface ApiClientOptions {
  /** Override the base URL (defaults to VITE_API_BASE_URL or localhost:8080). */
  baseURL?: string;
  /** Test seam: inject a custom adapter (see axios `adapter` option). */
  adapter?: AxiosInstance['defaults']['adapter'];
}

/**
 * Shared axios instance for all REST calls. Reads the base URL from
 * `VITE_API_BASE_URL` (see `resolveApiBaseUrl`) and normalizes failures
 * through `ApiError` so services/components handle one error shape.
 */
export function createApiClient(options: ApiClientOptions = {}): AxiosInstance {
  const client = axios.create({
    baseURL: options.baseURL ?? resolveApiBaseUrl(),
    timeout: 10_000,
    headers: { 'Content-Type': 'application/json' },
    ...(options.adapter !== undefined ? { adapter: options.adapter } : {}),
  });

  client.interceptors.response.use(
    (response) => response,
    (error: unknown) => Promise.reject(toApiError(error)),
  );

  return client;
}

/** The app-wide axios instance. Import this in services (`src/services/`). */
export const api = createApiClient();
