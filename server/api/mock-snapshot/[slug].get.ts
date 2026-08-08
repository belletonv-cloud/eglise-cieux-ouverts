import { getPages } from '../../utils/firestore-mock.js';
import { getRouterParam } from 'h3';

export default defineEventHandler((event) => {
  // Même garde que /api/reset-mock, /api/reset-member-mock et
  // /api/test/set-mock : cet endpoint lit l'état du mock Firestore, il n'a
  // rien à faire en production. Il était le seul des quatre à ne pas la
  // porter et répondait donc 200 en prod, avec les fixtures de test — vérifié
  // sur le site déployé.
  const isTest = process.env.NODE_ENV === 'test' || process.env.PW_TEST === '1' || process.env.TEST_ENV === '1'
  if (import.meta.dev === false && !isTest) {
    throw createError({ statusCode: 404, message: 'Not found' })
  }
  const pages = getPages();
  const slug = getRouterParam(event, 'slug') || 'event-list';
  return pages[slug] || { blocks: [] };
});
