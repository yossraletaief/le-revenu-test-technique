import type { Core } from '@strapi/strapi';
import { slugify } from '../utils/slugify';

type DiscussionType = 'question' | 'discussion';
interface SeedReply { author: string; content: string; hoursAfter: number }
interface SeedDiscussion {
  title: string; content: string; type: DiscussionType;
  author: string; category: string; daysAgo: number; replies: SeedReply[];
}

const USERS = [
  { username: 'Camille_B', email: 'camille@demo.local' },
  { username: 'Vincent_ETF', email: 'vincent@demo.local' },
  { username: 'Odile.Retraite', email: 'odile@demo.local' },
  { username: 'Thomas_PEA', email: 'thomas@demo.local' },
];

const CATEGORIES = [
  { name: 'Bourse & actions', slug: 'bourse', description: "Actions, ETF, PEA, compte-titres : stratégies et retours d'expérience." },
  { name: 'Épargne & placements', slug: 'epargne', description: 'Livrets, fonds euros, obligations, comptes à terme.' },
  { name: 'Assurance-vie', slug: 'assurance-vie', description: 'Choisir son contrat, arbitrer, transmettre.' },
  { name: 'Immobilier & SCPI', slug: 'immobilier', description: 'Résidence principale, locatif, SCPI, crédit immobilier.' },
  { name: 'Impôts & fiscalité', slug: 'impots', description: "Déclaration, niches fiscales, IFI : payer le juste impôt." },
  { name: 'Retraite', slug: 'retraite', description: 'PER, rachat de trimestres, cumul emploi-retraite.' },
];

const DISCUSSIONS: SeedDiscussion[] = [
  {
    title: 'Ouvrir un PEA avec 5 000 € : par où commencer ?', type: 'question', author: 'Thomas_PEA', category: 'bourse', daysAgo: 2,
    content: "Bonjour, je viens d'ouvrir un PEA en ligne et j'ai 5 000 € à y placer. Vaut-il mieux tout investir d'un coup ou étaler ? Et sur quoi : des ETF, quelques actions ?",
    replies: [
      { author: 'Vincent_ETF', hoursAfter: 3, content: "Pour débuter, un ETF éligible au PEA qui réplique un indice mondial fait très bien le travail. Investissez une partie maintenant puis programmez un versement mensuel." },
      { author: 'Thomas_PEA', hoursAfter: 5, content: "Merci beaucoup, c'est très clair ! J'ai trois mois de salaire sur un livret à côté." },
    ],
  },
  {
    title: "J'ai 25 ans et 10 000 € de côté : je fais quoi ?", type: 'question', author: 'Camille_B', category: 'epargne', daysAgo: 1,
    content: "Premier CDI depuis un an, 10 000 € sur un livret, pas de projet immobilier avant quatre ou cinq ans. Comment auriez-vous réparti à mon âge ?",
    replies: [
      { author: 'Odile.Retraite', hoursAfter: 2, content: 'Gardez déjà trois à six mois de dépenses sur un livret. Le reste peut travailler.' },
      { author: 'Vincent_ETF', hoursAfter: 4, content: "Ouvrir un PEA et une assurance-vie tôt, même avec peu, c'est surtout prendre date pour la fiscalité." },
    ],
  },
  {
    title: 'Assurance-vie après 70 ans : est-ce encore intéressant ?', type: 'question', author: 'Odile.Retraite', category: 'assurance-vie', daysAgo: 3,
    content: "J'ai 71 ans et je me demande s'il est encore utile de verser sur une assurance-vie, notamment pour la transmission à mes petits-enfants.",
    replies: [
      { author: 'Camille_B', hoursAfter: 6, content: "Pour les versements après 70 ans, l'abattement est de 30 500 € au total et porte sur les primes : les gains sont exonérés de droits de succession." },
    ],
  },
  {
    title: 'SCPI : vous avez renforcé ces derniers mois ou vous attendez ?', type: 'discussion', author: 'Vincent_ETF', category: 'immobilier', daysAgo: 4,
    content: "Après les baisses de prix de parts de certaines SCPI, je vois deux écoles : ceux qui renforcent et ceux qui ne veulent plus en entendre parler. Et vous ?",
    replies: [
      { author: 'Odile.Retraite', hoursAfter: 8, content: "J'attends. J'ai été échaudée par les délais de revente sur une de mes SCPI." },
    ],
  },
  {
    title: 'PER : vos retours d’expérience après quelques années ?', type: 'discussion', author: 'Camille_B', category: 'retraite', daysAgo: 5,
    content: "J'ai ouvert un PER il y a trois ans pour la déduction fiscale. Je m'interroge sur les frais et la sortie. Vos retours ?",
    replies: [
      { author: 'Vincent_ETF', hoursAfter: 1, content: "Le point clé, ce sont les frais : un PER en ligne avec des ETF n'a rien à voir avec un PER bancaire à 3 % de frais d'entrée." },
      { author: 'Odile.Retraite', hoursAfter: 9, content: "Pensez aussi à la fiscalité à la sortie : ce que vous déduisez aujourd'hui sera imposé plus tard." },
    ],
  },
  {
    title: 'Location meublée : micro-BIC ou régime réel ?', type: 'question', author: 'Thomas_PEA', category: 'impots', daysAgo: 0,
    content: 'Je loue un studio meublé depuis deux mois. Quel régime choisir pour ma première déclaration ?',
    replies: [], // deliberately empty: exercises the "no reply yet" state
  },
];

const hoursAgo = (h: number): Date => new Date(Date.now() - h * 3_600_000);

/** Sets realistic dates so that sorting by date is visible in the demo. */
async function backdate(strapi: Core.Strapi, uid: 'api::discussion.discussion' | 'api::reply.reply', documentId: string, date: Date) {
  await strapi.db.query(uid).update({ where: { documentId }, data: { createdAt: date, updatedAt: date } });
}

export async function seedDemoData(strapi: Core.Strapi): Promise<void> {
  if (process.env.SEED_DEMO !== 'true') return;

  if ((await strapi.documents('api::discussion.discussion').count({})) > 0) {
    strapi.log.info('[seed] skipped: discussions already exist');
    return;
  }

  const password = process.env.SEED_DEMO_PASSWORD;
  if (!password || password.length < 8) {
    throw new Error('[seed] SEED_DEMO_PASSWORD (8+ characters) is required when SEED_DEMO=true');
  }

  const role = await strapi.db.query('plugin::users-permissions.role').findOne({ where: { type: 'authenticated' } });
  if (!role) throw new Error('[seed] authenticated role not found');

  // Users: find-or-create, so a partial previous run can be resumed.
  const userIds = new Map<string, string>();
  for (const u of USERS) {
    let user = await strapi.documents('plugin::users-permissions.user').findFirst({ filters: { username: u.username } });
    if (!user) {
      // Same service as the register endpoint: it hashes the password.
      await strapi.plugin('users-permissions').service('user').add({
        ...u, password, provider: 'local', confirmed: true, blocked: false, role: role.id,
      });
      user = await strapi.documents('plugin::users-permissions.user').findFirst({ filters: { username: u.username } });
    }
    if (!user) throw new Error(`[seed] could not create user ${u.username}`);
    userIds.set(u.username, user.documentId);
  }

  const categoryIds = new Map<string, string>();
  for (const c of CATEGORIES) {
    const existing = await strapi.documents('api::category.category').findFirst({ filters: { slug: c.slug } });
    const category = existing ?? (await strapi.documents('api::category.category').create({ data: c }));
    categoryIds.set(c.slug, category.documentId);
  }

  for (const d of DISCUSSIONS) {
    const discussion = await strapi.documents('api::discussion.discussion').create({
      data: {
        title: d.title,
        slug: slugify(d.title),
        content: d.content,
        type: d.type,
        author: userIds.get(d.author),
        category: categoryIds.get(d.category),
      },
    });
    const createdHoursAgo = d.daysAgo * 24 + 2;
    await backdate(strapi, 'api::discussion.discussion', discussion.documentId, hoursAgo(createdHoursAgo));

    for (const r of d.replies) {
      const reply = await strapi.documents('api::reply.reply').create({
        data: { content: r.content, author: userIds.get(r.author), discussion: discussion.documentId },
      });
      await backdate(strapi, 'api::reply.reply', reply.documentId, hoursAgo(createdHoursAgo - r.hoursAfter));
    }
  }

  strapi.log.info(`[seed] created ${USERS.length} users, ${CATEGORIES.length} categories, ${DISCUSSIONS.length} discussions`);
}
