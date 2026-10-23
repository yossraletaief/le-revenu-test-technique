import 'server-only';

/** Error carrying Strapi's HTTP status, so pages can react (404 vs 500…). */
export class StrapiError extends Error {
  constructor(public readonly status: number, message: string, public readonly details?: unknown) {
    super(message);
    this.name = 'StrapiError';
  }
}

interface Parser<T> { parse(data: unknown): T }

interface GetOptions {
  searchParams?: Record<string, string | number | undefined>;
  /** Seconds before Next refetches (Data Cache). */
  revalidate?: number;
  /** Cache tags, invalidated with revalidateTag() after a mutation. */
  tags?: string[];
}

function baseUrl(): string {
  const url = process.env.STRAPI_URL;
  if (!url) throw new Error('STRAPI_URL is not set (see frontend/.env.example)');
  return url;
}

function errorMessage(body: unknown): string | undefined {
  if (typeof body === 'object' && body !== null && 'error' in body) {
    const err = (body as { error?: { message?: unknown } }).error;
    if (typeof err?.message === 'string') return err.message;
  }
  return undefined;
}

/** Single entry point for reading from Strapi: builds the URL, applies caching, validates the response. */
export async function strapiGet<T>(path: string, schema: Parser<T>, options: GetOptions = {}): Promise<T> {
  const url = new URL(`/api${path}`, baseUrl());
  for (const [key, value] of Object.entries(options.searchParams ?? {})) {
    if (value !== undefined) url.searchParams.set(key, String(value));
  }

  const res = await fetch(url, {
    headers: { Accept: 'application/json' },
    next: { revalidate: options.revalidate ?? 30, tags: options.tags },
    signal: AbortSignal.timeout(8000),
  });
  const body: unknown = await res.json().catch(() => null);

  if (!res.ok) throw new StrapiError(res.status, errorMessage(body) ?? `Strapi responded ${res.status}`, body);
  return schema.parse(body);
}