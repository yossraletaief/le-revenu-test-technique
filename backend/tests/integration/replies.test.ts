import type { Core } from '@strapi/strapi';
import request from 'supertest';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { setupStrapi, teardownStrapi, TEST_PASSWORD } from './strapi';

let strapi: Core.Strapi;
let api: ReturnType<typeof request>;
let discussion: { documentId: string; slug: string };
const created: string[] = [];

async function login(identifier: string): Promise<string> {
  const res = await api.post('/api/auth/local').send({ identifier, password: TEST_PASSWORD });
  expect(res.status).toBe(200);
  return res.body.jwt as string;
}

const replyCount = (documentId: string) =>
  strapi.documents('api::reply.reply').count({ filters: { discussion: { documentId: { $eq: documentId } } } });

beforeAll(async () => {
  strapi = await setupStrapi();
  api = request(strapi.server.httpServer);
  const res = await api.get('/api/discussions?pageSize=1');
  discussion = res.body.data[0];
});

afterAll(async () => {
  for (const documentId of created) await strapi.documents('api::reply.reply').delete({ documentId });
  await teardownStrapi();
});

describe('POST /api/replies: refus non authentifié', () => {
  it('refuses a reply without a token and creates nothing', async () => {
    const before = await replyCount(discussion.documentId);
    const res = await api.post('/api/replies').send({ data: { content: 'Réponse anonyme', discussion: discussion.documentId } });
    expect([401, 403]).toContain(res.status);
    expect(await replyCount(discussion.documentId)).toBe(before);
  });

  it('refuses a forged token', async () => {
    const res = await api.post('/api/replies').set('Authorization', 'Bearer not-a-real-jwt')
      .send({ data: { content: 'Réponse avec faux jeton', discussion: discussion.documentId } });
    expect(res.status).toBe(401);
  });
});

describe("POST /api/replies: usurpation d'auteur", () => {
  it('ignores any author sent by the client and uses the JWT user', async () => {
    const jwt = await login('camille@demo.local');
    const victim = await strapi.documents('plugin::users-permissions.user').findFirst({ filters: { username: 'Vincent_ETF' } });
    expect(victim).toBeTruthy();

    const spoofAttempts = [victim!.documentId, victim!.id, { connect: [victim!.documentId] }];
    for (const author of spoofAttempts) {
      const res = await api.post('/api/replies').set('Authorization', `Bearer ${jwt}`)
        .send({ data: { content: 'Je publie en mon nom', discussion: discussion.documentId, author } });
      expect(res.status).toBe(201);
      expect(res.body.data.author).toEqual({ username: 'Camille_B' });
      created.push(res.body.data.documentId);

      const stored = (await strapi.documents('api::reply.reply').findOne({
        documentId: res.body.data.documentId,
        populate: { author: { fields: ['username'] } },
      })) as { author?: { username?: string } } | null;
      expect(stored?.author?.username).toBe('Camille_B');
    }
  });
});

describe('POST /api/replies: validation and errors', () => {
  it('returns 400 with a field error for an empty reply', async () => {
    const jwt = await login('camille@demo.local');
    const res = await api.post('/api/replies').set('Authorization', `Bearer ${jwt}`)
      .send({ data: { content: '   ', discussion: discussion.documentId } });
    expect(res.status).toBe(400);
    expect(res.body.error.details.errors).toHaveProperty('content');
  });

  it('returns 404 for a discussion that does not exist', async () => {
    const jwt = await login('camille@demo.local');
    const res = await api.post('/api/replies').set('Authorization', `Bearer ${jwt}`)
      .send({ data: { content: 'Bonjour à tous', discussion: 'doesnotexist000' } });
    expect(res.status).toBe(404);
  });
});

describe('Read and sign-up surface', () => {
  it('does not expose replies directly', async () => {
    expect((await api.get('/api/replies')).status).not.toBe(200);
  });

  it('does not allow an authenticated user to create a discussion yet (next branch)', async () => {
    const jwt = await login('camille@demo.local');
    const res = await api.post('/api/discussions').set('Authorization', `Bearer ${jwt}`)
      .send({ data: { title: 'Une discussion de test', content: 'x', type: 'discussion' } });
    expect(res.status).toBe(403);
  });

  it('has public registration turned off', async () => {
    const res = await api.post('/api/auth/local/register').send({ username: 'intrus', email: 'intrus@x.fr', password: 'Password123!' });
    expect(res.status).not.toBe(200);
  });
});
