import { resetMock } from '../utils/firestore-mock.js';
import { defineEventHandler } from 'h3';

export default defineEventHandler(() => {
  resetMock && resetMock();
  return { ok: true };
});
