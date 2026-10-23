import type { Core } from '@strapi/strapi';
import request from 'supertest';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { setupStrapi, teardownStrapi, TEST_PASSWORD } from './strapi';

let strapi: Core.Strapi;
let api: ReturnType<typeof request>;
const created: string[] = [];
const valid = { title: 'Faut-il ouvrir un PER à 45 ans ?', content: 'Je me pose la question.', type: 'question', category: 'retraite' };

async function login(identifier: string): Promise<string> {
  const res = await api.post('/api/auth/local').send({ identifier, password: TEST_PASSWORD });
  expect(res.status).toBe(200);
  return res.body.jwt as string;
}

const count = () => strapi.documents('api::discussion.discussion').count({});

beforeAll(async () => {
  strapi = await setupStrapi();
  api = request(strapi.server.httpServer);
});

afterAll(async () => {
  for (const documentId of created) await strapi.documents('api::discussion.discussion').delete({ documentId });
  await teardownStrapi();
});

describe('POST /api/discussions: validation métier côté Strapi', () => {
  it('rejects a title shorter than 10 characters with a field error', async () => {
    const jwt = await login('camille@demo.local');
    const before = await count();
    const res = await api.post('/api/discussions').set('Authorization', `Bearer ${jwt}`).send({ data: { ...valid, title: 'Trop court' .slice(0, 9) } });
    expect(res.status).toBe(400);
    expect(res.body.error.details.errors).toHaveProperty('title');
    expect(await count()).toBe(before);
  });

  it('rejects missing content, an unknown type and an unknown category', async () => {
    const jwt = await login('camille@demo.local');
    const missing = await api.post('/api/discussions').set('Authorization', `Bearer ${jwt}`)
      .send({ data: { ...valid, content: '', type: 'poll' } });
    expect(missing.status).toBe(400);
    expect(missing.body.error.details.errors).toMatchObject({ content: expect.any(String), type: expect.any(String) });

    const unknownCategory = await api.post('/api/discussions').set('Authorization', `Bearer ${jwt}`)
      .send({ data: { ...valid, category: 'nexiste-pas' } });
    expect(unknownCategory.status).toBe(400);
    expect(unknownCategory.body.error.details.errors).toHaveProperty('category');
  });
});

describe('POST /api/discussions: authentification et auteur', () => {
  it('refuses an anonymous discussion and creates nothing', async () => {
    const before = await count();
    const res = await api.post('/api/discussions').send({ data: valid });
    expect([401, 403]).toContain(res.status);
    expect(await count()).toBe(before);
  });

  it('ignores the author and slug sent by the client', async () => {
    const jwt = await login('camille@demo.local');
    const victim = await strapi.documents('plugin::users-permissions.user').findFirst({ filters: { username: 'Vincent_ETF' } });
    const res = await api.post('/api/discussions').set('Authorization', `Bearer ${jwt}`)
      .send({ data: { ...valid, author: victim!.documentId, slug: 'slug-choisi-par-le-client' } });
    expect(res.status).toBe(201);
    created.push(res.body.data.documentId);
    expect(res.body.data.slug).not.toBe('slug-choisi-par-le-client');

    const detail = await api.get(`/api/discussions/slug/${res.body.data.slug}`);
    expect(detail.status).toBe(200);
    expect(detail.body.data.author).toEqual({ username: 'Camille_B' });
    expect(detail.body.data.category.slug).toBe('retraite');
  });

  it('gives two discussions with the same title two different URLs', async () => {
    const jwt = await login('odile@demo.local');
    const title = 'Un titre identique pour deux discussions';
    const a = await api.post('/api/discussions').set('Authorization', `Bearer ${jwt}`).send({ data: { ...valid, title } });
    const b = await api.post('/api/discussions').set('Authorization', `Bearer ${jwt}`).send({ data: { ...valid, title } });
    expect([a.status, b.status]).toEqual([201, 201]);
    created.push(a.body.data.documentId, b.body.data.documentId);
    expect(a.body.data.slug).not.toBe(b.body.data.slug);
  });
});

describe('Route surface', () => {
  it('does not expose update or delete', async () => {
    const jwt = await login('camille@demo.local');
    const { body } = await api.get('/api/discussions?pageSize=1');
    const id = body.data[0].documentId;
    expect((await api.put(`/api/discussions/${id}`).set('Authorization', `Bearer ${jwt}`).send({ data: { title: 'Titre modifié par un tiers' } })).status).not.toBe(200);
    expect((await api.delete(`/api/discussions/${id}`).set('Authorization', `Bearer ${jwt}`)).status).not.toBe(200);
  });
});
