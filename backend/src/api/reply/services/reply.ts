import { factories } from '@strapi/strapi';
import type { ReplyInput } from '../utils/reply-input';

export interface CreatedReply {
  documentId: string;
  content: string;
  createdAt: string;
  author: { username: string };
  discussion: { documentId: string; slug: string };
}

export default factories.createCoreService('api::reply.reply', ({ strapi }) => ({
  /**
   * Creates a reply for the authenticated user. `userId` comes from the verified JWT (ctx.state.user),
   * never from the request body. Returns null when the discussion does not exist.
   */
  async createForUser(input: ReplyInput, userId: number): Promise<CreatedReply | null> {
    const discussion = await strapi.documents('api::discussion.discussion').findFirst({
      filters: { documentId: { $eq: input.discussion } },
      fields: ['slug'],
    });
    if (!discussion) return null;

    // Relations in the Document Service are set by documentId, so we resolve it from the trusted numeric id.
    const user = await strapi.documents('plugin::users-permissions.user').findFirst({
      filters: { id: { $eq: userId } },
      fields: ['username'],
    });
    if (!user) throw new Error(`Authenticated user ${userId} not found`);

    const reply = await strapi.documents('api::reply.reply').create({
      data: { content: input.content, author: user.documentId, discussion: discussion.documentId },
      fields: ['content', 'createdAt'],
    });

    return {
      documentId: reply.documentId,
      content: reply.content as string,
      createdAt: new Date(reply.createdAt as string | Date).toISOString(),
      author: { username: user.username as string },
      discussion: { documentId: discussion.documentId, slug: discussion.slug as string },
    };
  },
}));
