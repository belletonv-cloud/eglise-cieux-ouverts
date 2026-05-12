# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: tests/playwright/aspirations.spec.ts >> Aspirations animation >> items activate one by one on scroll
- Location: tests/playwright/aspirations.spec.ts:4:7

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator:  locator('.block-aspirations')
Expected: visible
Received: hidden
Timeout:  10000ms

Call log:
  - Expect "toBeVisible" with timeout 10000ms
  - waiting for locator('.block-aspirations')
    14 × locator resolved to <section data-v-01cae5c8="" class="block-aspirations js-mounted">…</section>
       - unexpected value "hidden"

```

# Page snapshot

```yaml
- generic [ref=e3]:
  - banner [ref=e4]:
    - generic [ref=e5]:
      - link "Cieux Ouverts" [ref=e6] [cursor=pointer]:
        - /url: /
        - img "Cieux Ouverts" [ref=e7]
      - navigation [ref=e8]:
        - link "Accueil" [ref=e9] [cursor=pointer]:
          - /url: /
        - link "Messages" [ref=e10] [cursor=pointer]:
          - /url: /messages
        - link "Agenda" [ref=e11] [cursor=pointer]:
          - /url: /agenda
        - link "Contact" [ref=e12] [cursor=pointer]:
          - /url: /contact
  - generic [ref=e15]:
    - generic [ref=e17]:
      - img "Sky background" [ref=e18]
      - generic [ref=e19]:
        - img "Cieux Ouverts" [ref=e20]
        - img "Logo" [ref=e21]
    - generic [ref=e23]:
      - img "Foule Croix" [ref=e24]
      - generic [ref=e25]:
        - generic "BIENVENUE" [ref=e26]:
          - generic [ref=e27]: B I E
          - generic [ref=e28]: N V E
          - generic [ref=e29]: N U E
        - paragraph [ref=e30]: à l'Église Cieux Ouverts à Morlaix
        - generic:
          - link "Instagram Cieux Ouverts":
            - /url: https://www.instagram.com/eglise_cieux_ouverts/
            - img
          - link "Facebook Cieux Ouverts":
            - /url: https://www.facebook.com/eglisecieuxouverts
            - img
    - generic [ref=e33]:
      - generic [ref=e34]:
        - paragraph [ref=e35]: Rejoins-nous
        - paragraph [ref=e36]: Chaque dimanche
        - paragraph [ref=e37]: à Morlaix
      - generic [ref=e38]:
        - generic [ref=e39]:
          - generic [ref=e40]: 9h30
          - generic [ref=e41]: Accueil café
        - generic [ref=e42]:
          - generic [ref=e43]: 10h00
          - generic [ref=e44]: Célébration
    - generic [ref=e49]:
      - paragraph [ref=e50]: Ce qui nous anime
      - paragraph [ref=e51]:
        - text: Voir la
        - strong [ref=e52]: gloire
        - text: ", le"
        - strong [ref=e53]: royaume
        - text: et la
        - strong [ref=e54]: volonté
        - text: de Dieu\nse manifester sur la terre comme aux Cieux
    - link "Nous rejoindre" [ref=e57] [cursor=pointer]:
      - /url: /contact
    - generic [ref=e60]:
      - heading "Tu veux nous contacter ?" [level=2] [ref=e61]
      - generic [ref=e62]:
        - generic [ref=e64]:
          - link "Instagram Cieux Ouverts" [ref=e65] [cursor=pointer]:
            - /url: https://instagram.com/eglise_cieux_ouverts
            - img [ref=e66]
          - link "Facebook Cieux Ouverts" [ref=e68] [cursor=pointer]:
            - /url: https://facebook.com/eglisecieuxouverts
            - img [ref=e69]
        - generic [ref=e71]:
          - generic [ref=e72]:
            - paragraph [ref=e73]: Tu as une question ?
            - paragraph [ref=e74]: Tu désires parler à un pasteur ?
            - paragraph [ref=e75]: Tu souhaites recevoir notre newsletter ?
          - generic [ref=e76]:
            - generic [ref=e77]:
              - textbox "Prénom *" [ref=e78]
              - textbox "Nom de famille *" [ref=e79]
            - textbox "Ville" [ref=e80]
            - textbox "Email *" [ref=e81]
            - textbox "Ton Message *" [ref=e82]
            - textbox
            - generic [ref=e83] [cursor=pointer]:
              - checkbox "Oui, je souhaite m'abonner à la Newsletter." [ref=e84]
              - text: Oui, je souhaite m'abonner à la Newsletter.
            - button "C'est parti !" [ref=e85] [cursor=pointer]
  - contentinfo [ref=e86]:
    - generic [ref=e87]:
      - heading "I l y a u n e p l a c e p o u r t o i !" [level=2] [ref=e89]:
        - generic: I
        - generic: l
        - generic: "y"
        - generic: a
        - generic: u
        - generic: "n"
        - generic: e
        - generic: p
        - generic: l
        - generic: a
        - generic: c
        - generic: e
        - generic: p
        - generic: o
        - generic: u
        - generic: r
        - generic: t
        - generic: o
        - generic: i
        - generic: "!"
      - generic [ref=e91]:
        - link "contact@cieuxouverts.bzh" [ref=e92] [cursor=pointer]:
          - /url: mailto:contact@cieuxouverts.bzh
        - paragraph [ref=e93]:
          - text: Rdv chaque dimanche |
          - strong [ref=e94]: 10H
        - paragraph [ref=e95]:
          - text: 2 rue Jean Monnet |
          - strong [ref=e96]: 29600 Morlaix, Bretagne
```

# Test source

```ts
  1  | import { test, expect } from '@playwright/test'
  2  | 
  3  | test.describe('Aspirations animation', () => {
  4  |   test('items activate one by one on scroll', async ({ page }) => {
  5  |     await page.goto('http://localhost:3000/')
  6  | 
  7  |     // Wait for the aspirations section to be present
  8  |     const aspirations = page.locator('.block-aspirations')
> 9  |     await expect(aspirations).toBeVisible({ timeout: 10000 })
     |                               ^ Error: expect(locator).toBeVisible() failed
  10 | 
  11 |     // Find circles and lines
  12 |     const circles = page.locator('.aspiration-circle')
  13 |     const lines = page.locator('.aspiration-line')
  14 | 
  15 |     const count = await circles.count()
  16 |     expect(count).toBeGreaterThan(0)
  17 | 
  18 |     // Scroll slowly down the section and observe that items gain the .is-active class sequentially
  19 |     // Instead of individually scrolling to each element (which can cause
  20 |     // reflow and detachment), perform controlled wheel scrolls over the
  21 |     // aspirations section and observe items activating in sequence.
  22 |     const box = await aspirations.boundingBox()
  23 |     if (!box) throw new Error('aspirations bounding box not found')
  24 | 
  25 |     // Start near the top of the section and perform incremental wheel scrolls
  26 |     // to simulate a user scrolling down. After each small scroll, check for
  27 |     // the next item's activation.
  28 |     const startY = Math.floor(box.y + 10)
  29 |     await page.mouse.move(Math.floor(box.x + box.width / 2), startY)
  30 | 
  31 |     for (let i = 0; i < count; i++) {
  32 |       // Compute the scroll position that corresponds to the component's
  33 |       // internal scrollProgress formula so we reliably trigger is-active.
  34 |       await page.evaluate(({ idx, cnt }) => {
  35 |         const el = document.querySelector('.block-aspirations')
  36 |         if (!el) return
  37 |         const vh = window.innerHeight
  38 |         const start = vh * 3
  39 |         const end = 0
  40 |         const lineTotal = 1 / cnt
  41 |         const startP = idx * lineTotal
  42 | 
  43 |         // we want rect.top such that scrollProgress >= startP
  44 |         // scrollProgress = 1 - ((rect.top - end) / (start - end))
  45 |         // => rect.top = start * (1 - startP)
  46 |         // nudge a bit further to ensure progress passes the threshold
  47 |         const desiredRectTop = start * (1 - startP) - 20
  48 | 
  49 |         const elTopDocument = el.getBoundingClientRect().top + window.scrollY
  50 |         const targetScrollY = Math.max(0, Math.floor(elTopDocument - desiredRectTop))
  51 |         window.scrollTo({ top: targetScrollY, behavior: 'auto' })
  52 |       }, { idx: i, cnt: count })
  53 | 
  54 |       // allow the scroll handler and CSS transitions to take effect
  55 |       await page.waitForTimeout(150)
  56 | 
  57 |       const circle = circles.nth(i)
  58 |       const line = lines.nth(i)
  59 | 
  60 |       await expect(circle).toHaveClass(/is-active/, { timeout: 3000 })
  61 |       await expect(line).toHaveClass(/is-active/, { timeout: 3000 })
  62 |     }
  63 |   })
  64 | })
  65 | 
```