import 'server-only';
import { cookies } from 'next/headers';
import { cache } from 'react';
import { StrapiError, strapiGet } from '@/lib/strapi/client';
import { meSchema, type SessionUser } from '@/lib/strapi/schemas';

const COOKIE = 'lr_session';
const MAX_AGE = 60 * 60 * 24 * 7; // 7 days

/** httpOnly: unreadable by browser JS (XSS can't steal it). SameSite=Lax + Server Actions origin check: CSRF. */
export async function setSessionToken(jwt: string): Promise<void> {
  (await cookies()).set(COOKIE, jwt, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: MAX_AGE,
  });
}

export async function clearSession(): Promise<void> {
  (await cookies()).delete(COOKIE);
}

export async function getSessionToken(): Promise<string | undefined> {
  return (await cookies()).get(COOKIE)?.value;
}

/**
 * Current user, verified by Strapi on every request (the cookie alone proves nothing).
 * cache(): header and page share one /users/me call per request.
 */
export const getCurrentUser = cache(async (): Promise<SessionUser | null> => {
  const token = await getSessionToken();
  if (!token) return null;
  try {
    return await strapiGet('/users/me', meSchema, { token });
  } catch (error) {
    if (!(error instanceof StrapiError && (error.status === 401 || error.status === 403))) console.error(error);
    return null; // expired/invalid token or Strapi down: behave as logged out
  }
});
