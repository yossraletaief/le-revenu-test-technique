'use client';

import { useActionState } from 'react';
import { login, type LoginState } from '@/lib/auth/actions';

const input = 'h-11 w-full rounded-tile border bg-surface px-3 focus:border-brand focus:outline-none focus:ring-3 focus:ring-brand/25';

export function LoginForm({ next }: { next: string }) {
  const [state, action, pending] = useActionState<LoginState, FormData>(login, {});
  const err = state.fieldErrors ?? {};
  return (
    <form action={action} className="flex flex-col gap-4" noValidate>
      <input type="hidden" name="next" value={next} />
      {state.error && <p role="alert" className="rounded-tile bg-alert-soft px-3 py-2 text-sm text-alert">{state.error}</p>}

      <div className="flex flex-col gap-1.5">
        <label htmlFor="identifier" className="text-sm font-semibold">E-mail ou pseudo</label>
        <input id="identifier" name="identifier" autoComplete="username" defaultValue={state.values?.identifier}
          aria-invalid={Boolean(err.identifier)} aria-describedby={err.identifier ? 'identifier-error' : undefined}
          className={`${input} ${err.identifier ? 'border-alert' : 'border-line'}`} />
        {err.identifier && <p id="identifier-error" className="text-[13px] text-alert">{err.identifier}</p>}
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="password" className="text-sm font-semibold">Mot de passe</label>
        <input id="password" name="password" type="password" autoComplete="current-password"
          aria-invalid={Boolean(err.password)} aria-describedby={err.password ? 'password-error' : undefined}
          className={`${input} ${err.password ? 'border-alert' : 'border-line'}`} />
        {err.password && <p id="password-error" className="text-[13px] text-alert">{err.password}</p>}
      </div>

      <button type="submit" disabled={pending} className="inline-flex min-h-11 items-center justify-center rounded-[10px] bg-brand px-4 font-semibold text-brand-ink hover:brightness-95 disabled:opacity-60">
        {pending ? 'Connexion…' : 'Se connecter'}
      </button>
    </form>
  );
}
