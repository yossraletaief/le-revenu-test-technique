'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { clearSession, getSessionToken } from '@/lib/auth/session';
import { fieldErrors, StrapiError, strapiPost } from '@/lib/strapi/client';
import { replyCreatedResponseSchema } from '@/lib/strapi/schemas';

/** Same rules as Strapi, for instant feedback. Strapi stays the authority. */
const replySchema = z.object({
  content: z.string().trim().min(2, 'Votre réponse est trop courte.').max(5000, 'Votre réponse dépasse 5000 caractères.'),
});

export interface ReplyFormState {
  status: 'idle' | 'error' | 'success';
  message?: string;
  fieldError?: string;
}

const SESSION_EXPIRED = 'Votre session a expiré. Reconnectez-vous pour répondre.';

/**
 * Bound to the discussion's documentId in the page. Note: we never send an author;
 * Strapi takes it from the JWT, so tampering with this form cannot impersonate anyone.
 */
export async function postReply(discussionDocumentId: string, _prev: ReplyFormState, formData: FormData): Promise<ReplyFormState> {
  const token = await getSessionToken();
  if (!token) return { status: 'error', message: SESSION_EXPIRED };

  const parsed = replySchema.safeParse({ content: String(formData.get('content') ?? '') });
  if (!parsed.success) return { status: 'error', fieldError: parsed.error.issues[0]?.message };

  let slug: string;
  try {
    const res = await strapiPost('/replies', { data: { content: parsed.data.content, discussion: discussionDocumentId } }, replyCreatedResponseSchema, { token });
    slug = res.data.discussion.slug;
  } catch (error) {
    if (error instanceof StrapiError) {
      if (error.status === 400) return { status: 'error', fieldError: fieldErrors(error).content ?? error.message };
      if (error.status === 401 || error.status === 403) {
        await clearSession();
        return { status: 'error', message: SESSION_EXPIRED };
      }
      if (error.status === 404) return { status: 'error', message: "Cette discussion n'existe plus." };
    }
    console.error(error);
    return { status: 'error', message: 'Publication impossible pour le moment. Réessayez.' };
  }

  // The new reply must appear right away on the page, and the reply count on the home feed.
  revalidatePath(`/discussions/${slug}`);
  revalidatePath('/');
  return { status: 'success', message: 'Votre réponse est publiée.' };
}
