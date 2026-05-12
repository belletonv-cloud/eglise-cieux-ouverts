const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

(async () => {
  const url = 'http://localhost:3000/'; // Modifie si le port ou l'URL change
  const outputDir = path.join(__dirname, 'fade_audit');
  if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir);

  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1200, height: 900 } });
  await page.goto(url, { waitUntil: 'domcontentloaded' });

  // Détermine la hauteur de scroll maximale sur .aspirations-viewport
  const steps = 20;
  const totalScroll = await page.evaluate(() => {
    const wrap = document.querySelector('.aspirations-viewport');
    return wrap ? wrap.offsetHeight - window.innerHeight : 5000;
  });

  const metricsArr = [];

  for (let i = 0; i <= steps; i++) {
    const y = Math.round((i / steps) * totalScroll);
    await page.evaluate(y => window.scrollTo(0, y), y);
    await page.waitForTimeout(150);

    const metrics = await page.evaluate(() => {
      const el = document.querySelector('.block-aspirations');
      if (!el) return null;
      const st = getComputedStyle(el);
      return {
        scrollY: window.scrollY,
        blockTop: el.getBoundingClientRect().top,
        opacity: st.opacity,
        visibility: st.visibility,
        pointerEvents: st.pointerEvents,
        timestamp: Date.now()
      };
    });

    if (metrics) {
      metricsArr.push(metrics);
      // Screenshot à chaque étape
      const shotPath = path.join(outputDir, `aspirations_step${i.toString().padStart(2, '0')}.png`);
      await page.screenshot({ path: shotPath, fullPage: false });
      console.log({ ...metrics, shotPath });
    }
  }

  // Sauvegarde les metrics dans un JSON final
  fs.writeFileSync(
    path.join(outputDir, 'fade_metrics.json'),
    JSON.stringify(metricsArr, null, 2),
    'utf8'
  );

  await browser.close();
  console.log('\n🚀 Audit fini ! Shots et metrics dans', outputDir);
})();