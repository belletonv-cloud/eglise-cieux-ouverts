import { test, expect } from './fixtures/global'
test('Playwright: PW_TEST visible côté server + config', async ({ request }) => {
  const res = await request.get('/api/debug-env')
  expect(res.ok()).toBeTruthy()
  const json = await res.json()
  expect(json.pw).toBeDefined()
  expect(json.pw === '1' || json.pw === true).toBeTruthy()
  expect(json.config).toBeTruthy()
})
