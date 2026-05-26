import { test } from '@playwright/test';
test('debug admin page', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', e => errors.push(e.message.slice(0, 200)));
  page.on('console', msg => { if (msg.type() === 'error') errors.push(msg.text().slice(0, 200)); });
  await page.goto('/?admin=true', { waitUntil: 'networkidle' });
  await page.waitForTimeout(2000);
  console.log('Title:', await page.title());
  console.log('Errors:', errors.slice(0, 5).join('\n'));
  console.log('Has admin-toolbar:', (await page.content()).includes('admin-toolbar'));
});
