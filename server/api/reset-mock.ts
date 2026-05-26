import { resetMock } from '../utils/firestore-mock.js';
import { defineEventHandler } from 'h3';

export default defineEventHandler(() => {
  resetMock && resetMock();
  // Seed minimal pour que l’admin soit toujours dispo
  return {
    pages: {
      accueil: {
        blocks: [
          {
            id: 'block-hero',
            type: 'hero',
            props: { title: 'Bienvenue sur le site !', subtitle: '', img: '' }
          }
        ]
      }
    }
  };
});
