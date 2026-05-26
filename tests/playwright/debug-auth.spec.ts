import { test } from './fixtures/global'

test('debug auth error', async ({ page }) => {
  const msgs: string[] = []
  page.on('console', (msg) => msgs.push(`[${msg.type()}] ${msg.text()}`))
  page.on('pageerror', (err) => msgs.push(`[pageerror] ${err.message}`))

  await page.goto('/event-list?admin=true')
  await page.waitForTimeout(6000)

  // Only print PageRenderer and event-list messages
  for (const m of msgs) {
    if (m.includes('[PageRenderer]') || m.includes('[event-list]') || m.includes('error') || m.includes('pageerror')) {
      console.log(m)
    }
  }

  console.log('=== DOM ===')
  const dom = await page.evaluate(() => {
    const r = document.querySelector('.page-renderer')
    return {
      rendererHTML: r?.innerHTML?.substring(0, 500),
      wrapperCount: r?.querySelectorAll('.block-wrapper').length,
    }
  })
  console.log(JSON.stringify(dom, null, 2))
})
