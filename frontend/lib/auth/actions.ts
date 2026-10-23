'use server';

import { redirect } from 'next/navigation';
import { z } from 'zod';
import { safeRedirectPath } from '@/lib/auth/redirect';
import { clearSession, setSessionToken } from '@/lib/auth/session';
import { StrapiError, strapiPost } from '@/lib/strapi/client';
import { authResponseSchema } from '@/lib/strapi/schemas';

const loginSchema = z.object({
  identifier: z.string().trim().min(1, 'Indiquez votre e-mail ou votre pseudo.').max(120),
  password: z.string().min(1, 'Indiquez votre mot de passe.').max(200),
});

export interface LoginState {
  error?: string;
  fieldErrors?: Partial<Record<'identifier' | 'password', string>>;
  values?: { identifier: string };
}

export async function login(_prev: LoginState, formData: FormData): Promise<LoginState> {
  const raw = { identifier: String(formData.get('identifier') ?? ''), password: String(formData.get('password') ?? '') };
  const values = { identifier: raw.identifier };

  const parsed = loginSchema.safeParse(raw);
  if (!parsed.success) {
    const fieldErrors: LoginState['fieldErrors'] = {};
    for (const issue of parsed.error.issues) {
      const key = issue.path[0];
      if ((key === 'identifier' || key === 'password') && !fieldErrors[key]) fieldErrors[key] = issue.message;
    }
    return { fieldErrors, values };
  }

  try {
    const { jwt } = await strapiPost('/auth/local', parsed.data, authResponseSchema);
    await setSessionToken(jwt);
  } catch (error) {
    if (error instanceof StrapiError && error.status === 400) return { error: 'Identifiant ou mot de passe incorrect.', values };
    if (error instanceof StrapiError && error.status === 429) return { error: 'Trop de tentatives. Réessayez dans quelques minutes.', values };
    console.error(error);
    return { error: 'Connexion impossible pour le moment. Réessayez.', values };
  }
  // Outside try/catch: redirect() works by throwing.
  redirect(safeRedirectPath(formData.get('next')));
}

export async function logout(): Promise<void> {
  await clearSession();
  redirect('/');
}
