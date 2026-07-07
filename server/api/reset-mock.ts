import { resetMock } from '../utils/firestore-mock.js';
import { defineEventHandler } from 'h3';

export default defineEventHandler(() => {
  // Autorisé en dev et en mode test (serveur buildé lancé par Playwright avec
  // PW_TEST=1) — en prod aucune de ces variables n'est définie → 404.
  const isTest = process.env.NODE_ENV === 'test' || process.env.PW_TEST === '1' || process.env.TEST_ENV === '1'
  if (import.meta.dev === false && !isTest) {
    throw createError({ statusCode: 404, message: 'Not found' })
  }
  resetMock && resetMock();
  return {
    pages: {
      accueil: {
        blocks: [
          {
            id: 'block-hero',
            type: 'hero',
            props: { title: 'Bienvenue sur le site !', subtitle: '', img: '' }
          }
        ]
      }
    }
  };
});