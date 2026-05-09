import { chromium } from 'playwright'
import fs from 'fs'
import path from 'path'

async function run() {
  const outDir = path.resolve(process.cwd(), 'test-results')
  fs.mkdirSync(outDir, { recursive: true })

  const target = process.argv[2] || process.env.TARGET_URL
  if (!target) {
    console.error('Usage: node scripts/inspect-wix-animation.mjs <url>')
    process.exit(1)
  }

  const browser = await chromium.launch()
  const context = await browser.newContext({ viewport: { width: 1280, height: 900 } })
  const page = await context.newPage()
  console.log('Navigating to', target)
  await page.goto(target, { waitUntil: 'domcontentloaded' })

  // give the page some time to hydrate
  await page.waitForTimeout(1500)

  // Find the node that contains the title text
  const report = await page.evaluate(async () => {
    const textToFind = 'Ce qui nous anime'
    const all = Array.from(document.querySelectorAll('h1,h2,h3,div,span'))
    let targetEl = all.find(el => el.innerText && el.innerText.trim().includes(textToFind)) || null

    const scripts = Array.from(document.querySelectorAll('script')).map(s => ({ src: s.src || null, inline: s.src ? null : (s.textContent || '').slice(0, 500) }))

    const container = targetEl ? targetEl.closest('.wixui-box, .comp-mnltd86r, [data-testid="responsive-container-content"]') || targetEl.parentElement : null

    // collect elements in container with transitions/animations
    const animated = []
    if (container) {
      const els = Array.from(container.querySelectorAll('*'))
      for (const el of els) {
        const s = getComputedStyle(el)
        const hasTransition = s.transitionDuration && s.transitionDuration !== '0s'
        const hasAnimation = s.animationName && s.animationName !== 'none'
        if (hasTransition || hasAnimation) {
          animated.push({ tag: el.tagName.toLowerCase(), classes: Array.from(el.classList).slice(0,6), transitionDuration: s.transitionDuration, animationName: s.animationName, opacity: s.opacity })
        }
      }
    }

    // set up mutation observer on container to capture class/attribute changes
    const mutations = []
    if (container) {
      const mo = new MutationObserver((mutList) => {
        for (const m of mutList) {
          if (m.type === 'attributes') {
            mutations.push({ time: performance.now(), target: m.target.outerHTML.slice(0,300), attribute: m.attributeName })
          }
        }
      })
      mo.observe(container, { attributes: true, subtree: true, attributeFilter: ['class', 'style'] })

      // scroll container into view and small scrolls to trigger effects
      container.scrollIntoView({ behavior: 'auto', block: 'center' })
      await new Promise(r => setTimeout(r, 300))
      for (let i = 0; i < 8; i++) {
        window.scrollBy({ top: 120, behavior: 'smooth' })
        await new Promise(r => setTimeout(r, 250))
      }
      await new Promise(r => setTimeout(r, 800))
      mo.disconnect()
    }

    return { foundText: !!targetEl, scripts, animated, mutations }
  })

  // fetch external scripts bodies to search for keywords
  const scriptHits = []
  for (const s of report.scripts) {
    if (s.src) {
      try {
        const res = await fetch(s.src)
        const body = await res.text()
        const keywords = ['IntersectionObserver', 'observe(', 'classList.add', 'is-active', 'reveal', 'stagger', 'animation', 'scroll']
        const matches = keywords.filter(k => body.includes(k))
        if (matches.length) scriptHits.push({ src: s.src, matches: Array.from(new Set(matches)) })
      } catch (e) {
        // ignore fetch errors
      }
    } else if (s.inline) {
      const body = s.inline
      const keywords = ['IntersectionObserver', 'observe(', 'classList.add', 'is-active', 'reveal', 'stagger', 'animation', 'scroll']
      const matches = keywords.filter(k => body.includes(k))
      if (matches.length) scriptHits.push({ src: null, matches: Array.from(new Set(matches)), snippet: body.slice(0,300) })
    }
  }

  // take before/after screenshots around the element
  const ss1 = path.join(outDir, 'wix-anim-before.png')
  await page.screenshot({ path: ss1, fullPage: true })

  // small delay and another screenshot
  await page.waitForTimeout(800)
  const ss2 = path.join(outDir, 'wix-anim-after.png')
  await page.screenshot({ path: ss2, fullPage: true })

  const out = { url: target, findings: report, scriptHits, screenshots: [ss1, ss2] }
  fs.writeFileSync(path.join(outDir, 'wix-animation-inspect.json'), JSON.stringify(out, null, 2))
  console.log('Saved wix-animation-inspect.json and screenshots')

  await context.close()
  await browser.close()
}

run().catch(e => { console.error(e); process.exit(1) })
