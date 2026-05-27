import { chromium } from 'playwright'

const browser = await chromium.launch({ headless: true })
const page = await browser.newPage()
const BASE = 'http://127.0.0.1:3000'

page.on('console', msg => {
  if (msg.type() === 'error' || msg.type() === 'warning') {
    console.log(`[PAGE ${msg.type().toUpperCase()}]`, msg.text())
  }
})

async function snapshot(label) {
  const body = await page.evaluate(() => document.body?.innerText?.slice(0, 500))
  const url = page.url()
  console.log(`\n--- ${label} ---`)
  console.log('URL:', url)
  console.log('BODY preview:', body.slice(0, 200))

  // Check DOM structure specifically for /agenda page
  if (url.includes('/agenda')) {
    const dom = await page.evaluate(() => ({
      h1: document.querySelector('h1')?.textContent?.trim(),
      h2: document.querySelector('h2')?.textContent?.trim(),
      grid: !!document.querySelector('.calendar-grid'),
      eventPills: document.querySelectorAll('.event-pill').length,
      eventCards: document.querySelectorAll('.event-card').length,
      modalOpen: !!document.querySelector('.modal-overlay'),
      pageTitle: document.title,
    }))
    console.log('Agenda DOM:', JSON.stringify(dom, null, 2))

    // Check for visual issues
    const issues = await page.evaluate(() => {
      const problems = []
      const main = document.querySelector('main') || document.querySelector('.page-agenda')
      if (!main) problems.push('No main/page-agenda container')
      const h1s = document.querySelectorAll('h1.agenda-title')
      if (h1s.length > 1) problems.push('Multiple agenda titles')
      return problems
    })
    if (issues.length) console.log('ISSUES:', issues)
  }
}

// Test 1: Fresh load
await page.goto(`${BASE}/agenda`, { waitUntil: 'networkidle' })
await snapshot('Fresh /agenda')

// Test 2: Navigate to /event-list then back to /agenda
await page.getByRole('link', { name: 'Événements', exact: true }).first().click()
await page.waitForURL(`${BASE}/event-list`, { timeout: 10000 })
await snapshot('/event-list')

await page.getByRole('link', { name: 'Agenda', exact: true }).first().click()
await page.waitForURL(`${BASE}/agenda`, { timeout: 10000 })
await page.waitForTimeout(2000)
await snapshot('Back to /agenda from /event-list')

// Test 3: Navigate to / then back via link
await page.getByRole('link', { name: 'Accueil', exact: true }).first().click()
await page.waitForURL(`${BASE}/`, { timeout: 10000 })
await snapshot('/accueil')

await page.getByRole('link', { name: 'Agenda', exact: true }).first().click()
await page.waitForURL(`${BASE}/agenda`, { timeout: 10000 })
await page.waitForTimeout(2000)
await snapshot('Back to /agenda from /accueil')

// Test 4: Try browser back
await page.getByRole('link', { name: 'Messages', exact: true }).first().click()
await page.waitForURL(`${BASE}/messages`, { timeout: 10000 })
await snapshot('/messages')

await page.goBack({ waitUntil: 'networkidle' })
await page.waitForTimeout(2000)
await snapshot('Back to /agenda via browser back')

// Test 5: Switch view mode then navigate away and back
await page.getByRole('button', { name: 'Cartes' }).click()
await page.waitForTimeout(500)
await snapshot('Switched to Cartes view')

await page.getByRole('link', { name: 'Accueil', exact: true }).first().click()
await page.waitForURL(`${BASE}/`, { timeout: 10000 })

await page.getByRole('link', { name: 'Agenda', exact: true }).first().click()
await page.waitForURL(`${BASE}/agenda`, { timeout: 10000 })
await page.waitForTimeout(2000)
await snapshot('Back to /agenda - check view state')

await browser.close()
