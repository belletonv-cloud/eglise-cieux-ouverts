import { chromium } from 'playwright'

const browser = await chromium.launch({ headless: true })
const page = await browser.newPage()
const BASE = 'http://127.0.0.1:3000'

// Test /agenda -> / (accueil)
await page.goto(`${BASE}/agenda`, { waitUntil: 'networkidle' })
console.log('=== After /agenda ===')
console.log('URL:', page.url())

// Now navigate to /
await page.getByRole('link', { name: 'Accueil', exact: true }).first().click()
await page.waitForURL(`${BASE}/`, { timeout: 10000 })
await page.waitForTimeout(1000)
console.log('\n=== After clicking Accueil ===')
console.log('URL:', page.url())

const body = await page.evaluate(() => document.body?.innerText)
console.log('FULL BODY TEXT:\n', body)

const html = await page.evaluate(() => {
  const nuxt = document.querySelector('#__nuxt')
  return nuxt?.innerHTML?.slice(0, 3000)
})
console.log('\n=== __nuxt HTML first 3000 chars ===')
console.log(html)

// Check for calendar elements on the home page
const hasCalendar = await page.evaluate(() => {
  return {
    h1: document.querySelector('h1')?.textContent,
    calendarGrid: !!document.querySelector('.calendar-grid'),
    pageTitle: document.title,
    eventPills: document.querySelectorAll('.event-pill').length,
    agendaTitle: !!document.querySelector('.agenda-title'),
  }
})
console.log('\n=== Homepage DOM check ===')
console.log(JSON.stringify(hasCalendar, null, 2))

await browser.close()
