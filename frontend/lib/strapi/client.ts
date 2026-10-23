import 'server-only';

/** Error carrying Strapi's HTTP status, so callers can react (400 field errors, 401 session, 404…). */
export class StrapiError extends Error {
  constructor(public readonly status: number, message: string, public readonly details?: unknown) {
    super(message);
    this.name = 'StrapiError';
  }
}

interface Parser<T> { parse(data: unknown): T }

interface RequestOptions {
  searchParams?: Record<string, string | number | undefined>;
  /** Seconds before Next refetches (public GET only). */
  revalidate?: number;
  tags?: string[];
  /** Strapi JWT of the current user (read from the httpOnly cookie on the server). */
  token?: string;
}

function baseUrl(): string {
  const url = process.env.STRAPI_URL;
  if (!url) throw new Error('STRAPI_URL is not set (see frontend/.env.example)');
  return url;
}

const errorOf = (body: unknown) =>
  typeof body === 'object' && body !== null && 'error' in body
    ? (body as { error?: { message?: unknown; details?: unknown } }).error
    : undefined;

async function request<T>(method: 'GET' | 'POST', path: string, schema: Parser<T>, options: RequestOptions, body?: unknown): Promise<T> {
  const url = new URL(`/api${path}`, baseUrl());
  for (const [key, value] of Object.entries(options.searchParams ?? {})) {
    if (value !== undefined) url.searchParams.set(key, String(value));
  }

  const headers: Record<string, string> = { Accept: 'application/json' };
  if (body !== undefined) headers['Content-Type'] = 'application/json';
  if (options.token) headers.Authorization = `Bearer ${options.token}`;

  // Only anonymous GETs may use the shared Data Cache. A response for one user must never be served to another.
  const caching: RequestInit = method === 'GET' && !options.token
    ? { next: { revalidate: options.revalidate ?? 30, tags: options.tags } }
    : { cache: 'no-store' };

  const res = await fetch(url, {
    method,
    headers,
    body: body === undefined ? undefined : JSON.stringify(body),
    signal: AbortSignal.timeout(8000),
    ...caching,
  });
  const json: unknown = await res.json().catch(() => null);

  if (!res.ok) {
    const message = errorOf(json)?.message;
    throw new StrapiError(res.status, typeof message === 'string' ? message : `Strapi responded ${res.status}`, json);
  }
  return schema.parse(json);
}

export const strapiGet = <T>(path: string, schema: Parser<T>, options: RequestOptions = {}) =>
  request('GET', path, schema, options);

export const strapiPost = <T>(path: string, body: unknown, schema: Parser<T>, options: RequestOptions = {}) =>
  request('POST', path, schema, options, body);

/** Per-field messages from our controllers' 400 responses ({ error: { details: { errors } } }). */
export function fieldErrors(error: StrapiError): Record<string, string> {
  const details = errorOf(error.details)?.details as { errors?: unknown } | undefined;
  const errors = details?.errors;
  if (typeof errors !== 'object' || errors === null) return {};
  return Object.fromEntries(Object.entries(errors).filter((e): e is [string, string] => typeof e[1] === 'string'));
}
