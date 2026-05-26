import { getPages } from '../utils/firestore-mock.js';
import { getRouterParam } from 'h3';

export default defineEventHandler((event) => {
  const pages = getPages();
  const slug = getRouterParam(event, 'slug') || 'event-list';
  return pages[slug] || { blocks: [] };
});
