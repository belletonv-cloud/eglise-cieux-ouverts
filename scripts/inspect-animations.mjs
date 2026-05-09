import { chromium } from 'playwright'
import fs from 'fs'
import path from 'path'

async function run() {
  const outDir = path.resolve(process.cwd(), 'test-results')
  fs.mkdirSync(outDir, { recursive: true })

  const browser = await chromium.launch()
  const context = await browser.newContext({ viewport: { width: 1280, height: 900 } })
  const page = await context.newPage()
  const target = process.argv[2] || process.env.TARGET_URL || 'http://localhost:3000/'
  console.log('Navigating to', target)
  await page.goto(target)

  // Wait for the aspirations section
  await page.waitForSelector('.block-aspirations', { timeout: 10000 })

  const result = await page.evaluate(async () => {
    const report = { scripts: [], matches: [], mutations: [], warnings: [] }

    // Gather scripts (src and inline snippets)
    const scripts = Array.from(document.querySelectorAll('script'))
      .map(s => ({ src: s.src || null, inline: s.src ? null : (s.textContent || '').slice(0, 200) }))
    report.scripts = scripts

    // Filter scripts that mention keywords
    const keywordRx = /reveal|animation|is-active|IntersectionObserver|stagger|wix/i
    report.matches = scripts.filter(s => (s.src && keywordRx.test(s.src)) || (s.inline && keywordRx.test(s.inline)))

    // Set up MutationObserver to capture class additions on aspiration items
    // We'll tag mutated elements with a data-inspect-id so the Node side can query them
    const mutations = []
    let __inspectCounter = 0
    const mo = new MutationObserver((mutList) => {
      for (const m of mutList) {
        if (m.type === 'attributes' && m.attributeName === 'class') {
          const target = m.target
          if (!target) continue
          const inAspirations = target.classList?.contains('aspiration-line') || target.classList?.contains('aspiration-circle') || !!target.closest('.aspirations-list')
          if (inAspirations) {
            if (!target.dataset.inspectId) target.dataset.inspectId = `inspect-${++__inspectCounter}`
            mutations.push({ id: target.dataset.inspectId, time: performance.now(), outerHTML: target.outerHTML.slice(0, 400), class: target.className })
          }
        }
      }
    })
    mo.observe(document.body, { attributes: true, subtree: true, attributeFilter: ['class'] })

    // small helper to scroll through the section to trigger animations
    const section = document.querySelector('.block-aspirations')
    if (!section) {
      report.warnings.push('aspirations section not found')
      mo.disconnect()
      return report
    }

    // Scroll the section into view and then scroll inside it gradually
    section.scrollIntoView({ behavior: 'auto', block: 'center' })
    await new Promise(r => setTimeout(r, 300))

    const lines = Array.from(section.querySelectorAll('.aspiration-line'))
    for (let i = 0; i < lines.length; i++) {
      lines[i].scrollIntoView({ behavior: 'smooth', block: 'center' })
      await new Promise(r => setTimeout(r, 400 + i * 120))
    }

    // wait for any remaining mutations
    await new Promise(r => setTimeout(r, 800))
    mo.disconnect()
    report.mutations = mutations
    // expose on window for debug if needed
    window.__animationInspect = report
    return report
  })

  // Enrich the report: for each mutation record grab computed styles and a screenshot
  const enriched = { ...result, inspected: [] }
  for (let i = 0; i < (result.mutations || []).length; i++) {
    const m = result.mutations[i]
    const sel = `[data-inspect-id="${m.id}"]`
    // Wait for the element to be present
    try {
      await page.waitForSelector(sel, { timeout: 2000 })
    } catch (e) {
      enriched.inspected.push({ id: m.id, error: 'element-not-found' })
      continue
    }

    const handle = await page.$(sel)
    // capture computed styles
    const computed = await page.evaluate(el => {
      const s = getComputedStyle(el)
      return {
        opacity: s.opacity,
        top: s.top,
        left: s.left,
        transform: s.transform,
        transitionDelay: s.transitionDelay
      }
    }, handle)

    // try to get bounding box and screenshot the element region
    let screenshotPath = null
    try {
      const box = await handle.boundingBox()
      if (box) {
        const imgName = `${String(i+1).padStart(2,'0')}-${m.id}.png`
        screenshotPath = path.join(outDir, imgName)
        await page.screenshot({ path: screenshotPath, clip: { x: Math.max(0, box.x), y: Math.max(0, box.y), width: Math.max(1, Math.min(box.width, 2000)), height: Math.max(1, Math.min(box.height, 2000)) } })
      } else {
        const imgName = `${String(i+1).padStart(2,'0')}-${m.id}-full.png`
        screenshotPath = path.join(outDir, imgName)
        await page.screenshot({ path: screenshotPath, fullPage: false })
      }
    } catch (e) {
      // ignore screenshot failures
      screenshotPath = null
    }

    enriched.inspected.push({ id: m.id, time: m.time, class: m.class, outerHTML: m.outerHTML, computedStyle: computed, screenshot: screenshotPath })
  }

  const outPath = path.join(outDir, 'animation-inspect.json')
  fs.writeFileSync(outPath, JSON.stringify(enriched, null, 2))
  console.log('Saved inspection to', outPath)

  await context.close()
  await browser.close()
}

run().catch(e => { console.error(e); process.exit(1) })
