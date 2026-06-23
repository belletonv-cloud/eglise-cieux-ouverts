import { resetMock } from '../utils/firestore-mock.js';
import { defineEventHandler } from 'h3';

export default defineEventHandler(() => {
  if (import.meta.dev === false) {
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