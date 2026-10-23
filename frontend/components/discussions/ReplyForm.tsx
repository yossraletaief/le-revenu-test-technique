'use client';

import { useActionState, useState } from 'react';
import type { ReplyFormState } from '@/app/discussions/[slug]/actions';
import { Avatar } from '@/components/ui/Avatar';

interface Props {
  action: (prev: ReplyFormState, formData: FormData) => Promise<ReplyFormState>;
  username: string;
}

/**
 * Controlled textarea: React 19 resets uncontrolled fields after every form action,
 * which would wipe the text on a validation error. Here it's cleared only on success.
 */
export function ReplyForm({ action, username }: Props) {
  const [content, setContent] = useState('');
  const [state, formAction, pending] = useActionState<ReplyFormState, FormData>(async (prev, formData) => {
    const next = await action(prev, formData);
    if (next.status === 'success') setContent('');
    return next;
  }, { status: 'idle' });

  return (
    <form action={formAction} className="flex flex-col gap-2.5 rounded-card border border-hairline bg-surface p-4 shadow-card md:px-5">
      <div className="flex items-center gap-2.5 text-[12.5px] text-ink-3">
        <Avatar username={username} />
        <span>Répondre en tant que <b className="text-ink">{username}</b></span>
      </div>
      <label htmlFor="reply-content" className="sr-only">Votre réponse</label>
      <textarea
        id="reply-content" name="content" value={content} onChange={(e) => setContent(e.target.value)}
        rows={5} maxLength={5000} placeholder="Partagez votre expérience…"
        aria-invalid={Boolean(state.fieldError)} aria-describedby={state.fieldError ? 'reply-error' : undefined}
        className={`min-h-[110px] w-full resize-y rounded-tile border bg-surface px-3.5 py-3 leading-normal focus:border-brand focus:outline-none focus:ring-3 focus:ring-brand/25 ${state.fieldError ? 'border-alert' : 'border-line'}`}
      />
      {state.fieldError && <p id="reply-error" className="text-[13px] text-alert">{state.fieldError}</p>}
      {state.status === 'error' && state.message && <p role="alert" className="text-[13px] text-alert">{state.message}</p>}
      {state.status === 'success' && <p role="status" className="text-[13px] font-semibold text-ok">{state.message}</p>}
      <div className="flex justify-end">
        <button type="submit" disabled={pending} className="inline-flex min-h-11 items-center rounded-[10px] bg-brand px-4 font-semibold text-brand-ink hover:brightness-95 disabled:opacity-60">
          {pending ? 'Publication…' : 'Publier ma réponse'}
        </button>
      </div>
    </form>
  );
}
