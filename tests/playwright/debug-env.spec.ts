import { test, expect } from '@playwright/test'
test('Playwright: PW_TEST visible côté server', async ({ request }) => {
  const res = await request.get('/api/debug-env')
  expect(res.ok()).toBeTruthy()
  const json = await res.json()
  expect(json.pw).toBeDefined()
  // PW_TEST may be '1' (string) or true (boolean) depending on how it's set
  expect(json.pw === '1' || json.pw === true).toBeTruthy()
})
