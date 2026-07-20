import { resetMemberMock } from '../utils/member-mock.js';
import { defineEventHandler } from 'h3';

// Reset dédié de l'état membre mock — volontairement séparé de /api/reset-mock :
// seul le fichier de spec de l'espace membre l'appelle, ce qui évite que les
// resetMock globaux des autres specs (exécutées en parallèle) n'effacent les
// consultations/candidatures en plein test.
export default defineEventHandler(() => {
  const isTest = process.env.NODE_ENV === 'test' || process.env.PW_TEST === '1' || process.env.TEST_ENV === '1'
  if (import.meta.dev === false && !isTest) {
    throw createError({ statusCode: 404, message: 'Not found' })
  }
  resetMemberMock();
  return { success: true };
});
