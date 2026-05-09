import { chromium } from 'playwright'
import fs from 'fs'
import path from 'path'

async function run() {
  const outDir = path.resolve(process.cwd(), 'test-results', 'videos')
  fs.mkdirSync(outDir, { recursive: true })

  const browser = await chromium.launch()
  const context = await browser.newContext({
    viewport: { width: 1280, height: 900 },
    recordVideo: { dir: outDir, size: { width: 1280, height: 900 } },
  })

  const page = await context.newPage()
  await page.goto('http://localhost:3000/')

  // wait for aspirations section
  const aspirations = page.locator('.block-aspirations')
  await aspirations.waitFor({ state: 'visible', timeout: 10000 })

  await page.waitForTimeout(300)
  const lines = page.locator('.aspiration-line')
  const count = await lines.count()
  for (let i = 0; i < count; i++) {
    const line = lines.nth(i)
    // retry if element gets detached
    for (let attempt = 0; attempt < 3; attempt++) {
      try {
        await line.scrollIntoViewIfNeeded()
        break
      } catch (e) {
        await page.waitForTimeout(150)
      }
    }
    // wait a bit for activation + stagger
    await page.waitForTimeout(400 + i * 120)
  }

  // wait a moment to capture final state
  await page.waitForTimeout(800)

  await context.close()
  await browser.close()

  // Find the recorded file (Playwright names it with a UUID)
  const files = fs.readdirSync(outDir)
  const videoFile = files.find(f => f.endsWith('.webm'))
  if (videoFile) {
    const src = path.join(outDir, videoFile)
    const dest = path.resolve(process.cwd(), 'test-results', 'aspirations.webm')
    fs.renameSync(src, dest)
    console.log('Saved video to', dest)
  } else {
    console.log('No video file found in', outDir)
  }

}

run().catch(e => {
  console.error(e)
  process.exit(1)
})
