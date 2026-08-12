import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  AxiosError,
  AxiosHeaders,
  type AxiosRequestConfig,
  type AxiosResponse,
} from 'axios';
import {
  api,
  createApiClient,
  resolveApiBaseUrl,
  toApiError,
} from '../../src/lib/axios';

/** Stub adapter that resolves with a canned success response. */
function successAdapter(data: unknown) {
  return async (config: AxiosRequestConfig) => ({
    data,
    status: 200,
    statusText: 'OK',
    headers: {},
    config,
  });
}

/** Build a real AxiosError carrying an HTTP response, without type assertions. */
function httpError(
  status: number,
  statusText: string,
  data?: unknown,
): AxiosError {
  const response: AxiosResponse = {
    data,
    status,
    statusText,
    headers: {},
    config: { headers: new AxiosHeaders() },
  };
  return new AxiosError(
    'Request failed',
    'ERR_BAD_RESPONSE',
    undefined,
    undefined,
    response,
  );
}

afterEach(() => {
  vi.unstubAllEnvs();
});

describe('resolveApiBaseUrl', () => {
  it('falls back to the local default when VITE_API_BASE_URL is not set', () => {
    expect(resolveApiBaseUrl()).toBe('http://localhost:8080');
  });

  it('uses VITE_API_BASE_URL when set', () => {
    vi.stubEnv('VITE_API_BASE_URL', 'https://api.hashflow.example');
    expect(resolveApiBaseUrl()).toBe('https://api.hashflow.example');
  });

  it('ignores an empty VITE_API_BASE_URL', () => {
    vi.stubEnv('VITE_API_BASE_URL', '');
    expect(resolveApiBaseUrl()).toBe('http://localhost:8080');
  });
});

describe('toApiError', () => {
  it('maps an HTTP error to its status and server message', () => {
    expect(
      toApiError(httpError(404, 'Not Found', { message: 'Rig not found' })),
    ).toEqual({
      message: 'Rig not found',
      status: 404,
    });
  });

  it('falls back to a status-based message when the server sends no message', () => {
    expect(toApiError(httpError(500, 'Internal Server Error'))).toEqual({
      message: 'Request failed with status 500',
      status: 500,
    });
  });

  it('maps a timeout to a readable message without a status', () => {
    const error = new AxiosError(
      'timeout of 10000ms exceeded',
      AxiosError.ECONNABORTED,
    );
    expect(toApiError(error)).toEqual({
      message: 'Request timed out. Please try again.',
    });
  });

  it('maps a network failure to a readable message', () => {
    const error = new AxiosError('Network Error', AxiosError.ERR_NETWORK);
    expect(toApiError(error)).toEqual({
      message: 'Network error. Check your connection and try again.',
    });
  });

  it('maps a plain Error to its message', () => {
    expect(toApiError(new Error('boom'))).toEqual({ message: 'boom' });
  });

  it('maps unknown values to a generic message', () => {
    expect(toApiError('garbage')).toEqual({ message: 'Unexpected error.' });
  });
});

describe('api instance', () => {
  it('exports a configured instance with the resolved base URL', () => {
    expect(api.defaults.baseURL).toBe('http://localhost:8080');
  });

  it('honors the baseURL option on createApiClient', () => {
    const client = createApiClient({ baseURL: 'https://custom.example' });
    expect(client.defaults.baseURL).toBe('https://custom.example');
  });
});

describe('response interceptor', () => {
  it('passes successful responses through unchanged', async () => {
    const client = createApiClient({ adapter: successAdapter({ ok: true }) });
    const response = await client.get('/api/rigs');
    expect(response.data).toEqual({ ok: true });
  });

  it('rejects with a normalized ApiError on failure', async () => {
    const adapter = async () => {
      throw httpError(503, 'Service Unavailable', {
        message: 'Backend warming up',
      });
    };
    const client = createApiClient({ adapter });
    await expect(client.get('/api/rigs')).rejects.toEqual({
      message: 'Backend warming up',
      status: 503,
    });
  });
});
