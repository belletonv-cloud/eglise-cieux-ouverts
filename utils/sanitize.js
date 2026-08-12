/**
 * Assainissement du HTML rendu via `v-html` (richText, corps de textImage,
 * descriptions d'événements de l'agenda, éléments libres…).
 *
 * Principe : liste blanche d'attributs, pas liste noire de motifs. La version
 * précédente enchaînait neuf expressions régulières visant chacune un vecteur
 * connu (`onload` sur `<svg>`, `ontoggle` sur `<details>`, `srcdoc`…) et
 * laissait donc passer tout ce qui n'y figurait pas nommément : `<img
 * src=x/onerror=…>` (pas d'espace avant l'attribut), `<iframe
 * src="javascript:…">` (seul `href` était filtré), `<script>` non fermé (le
 * motif exigeait la balise fermante), `href="data:text/html;base64,…"`, ou
 * encore `style="background:url(javascript:…)"`.
 *
 * Ici chaque balise est re-sérialisée à partir de ses attributs filtrés : un
 * attribut inconnu du filtre ne survit que s'il est inoffensif par nature.
 * Le contenu concerné est saisi par des administrateurs, mais il transite par
 * Firestore et — pour l'agenda — par le Worker `eglise-app` : deux surfaces
 * qu'une faille de compte suffirait à empoisonner pour tous les visiteurs.
 *
 * Ce qui reste volontairement autorisé, parce que du HTML collé s'en sert :
 * `<style>`, `<link rel=stylesheet>`, `<iframe>` (intégrations vidéo) et les
 * attributs `style` en ligne — assainis, pas supprimés.
 */

// Retirées avec leur contenu. `<math>` sert de vecteur mXSS (confusion de
// namespace : le parseur HTML y ré-interprète le balisage) et n'a aucun usage
// légitime ici.
const BALISES_AVEC_CONTENU = ['script', 'math']

// Retirées entièrement : aucune n'a d'usage éditorial et toutes savent charger
// ou exécuter quelque chose.
const BALISES_INTERDITES = new Set([
  'object', 'embed', 'applet', 'base', 'meta', 'frame', 'frameset', 'noframes',
])

// Attributs portant une URL : leur schéma est vérifié.
const ATTRS_URL = new Set([
  'href', 'src', 'srcset', 'action', 'formaction', 'data', 'poster',
  'background', 'xlink:href', 'dynsrc', 'lowsrc',
])

// Attributs supprimés sans discussion (au-delà des `on*`, traités à part).
const ATTRS_INTERDITS = new Set(['srcdoc', 'ping', 'http-equiv'])

const SCHEMA_SUR_RE = /^(https?|mailto|tel|ftp):/
// `data:` n'est toléré que pour des images matricielles : `data:image/svg+xml`
// peut embarquer un `<script>` qui s'exécute si l'URL est ouverte directement.
const DATA_IMAGE_SUR_RE = /^data:image\/(png|jpe?g|gif|webp|avif|bmp|x-icon)[;,]/

const ENTITES_NOMMEES = {
  amp: '&', lt: '<', gt: '>', quot: '"', apos: "'",
  colon: ':', tab: '\t', newline: '\n', sol: '/',
}

function decoderEntites(valeur) {
  return valeur
    .replace(/&#x([0-9a-f]{1,6});?/gi, (m, hex) => codePoint(parseInt(hex, 16), m))
    .replace(/&#(\d{1,7});?/g, (m, dec) => codePoint(parseInt(dec, 10), m))
    .replace(/&(\w+);?/g, (m, nom) => ENTITES_NOMMEES[nom.toLowerCase()] ?? m)
}

function codePoint(n, brut) {
  try {
    return String.fromCodePoint(n)
  } catch {
    return brut
  }
}

/**
 * Une URL est sûre si elle n'a pas de schéma (relative, ancre, protocole
 * relatif) ou si son schéma figure dans la liste blanche. Le décodage
 * d'entités et le retrait des caractères de contrôle sont indispensables :
 * les navigateurs les ignorent, donc `jav&#x61;script&colon;alert(1)` et
 * `java\tscript:alert(1)` sont des URL javascript pour eux.
 */
function urlEstSure(brut) {
  const v = decoderEntites(String(brut))
    .replace(/[\u0000-\u0020\u007f-\u00a0\u200b-\u200f\ufeff]/g, '')
    .toLowerCase()
  if (!/^[a-z0-9+.-]+:/.test(v)) return true
  return SCHEMA_SUR_RE.test(v) || DATA_IMAGE_SUR_RE.test(v)
}

/**
 * Neutralise ce qui, dans du CSS, sait exécuter du script ou naviguer :
 * `url(javascript:…)`, `expression()` d'IE, `-moz-binding`, `behavior:`.
 * Le reste du CSS est conservé tel quel — la mise en forme du contenu collé
 * en dépend entièrement.
 */
function assainirCss(css) {
  return css
    .replace(/javascript\s*:/gi, '')
    .replace(/vbscript\s*:/gi, '')
    .replace(/expression\s*\(/gi, '(')
    .replace(/-moz-binding\s*:/gi, '')
    .replace(/\bbehavior\s*:/gi, '')
}

// Une balise complète : les guillemets sont consommés en bloc pour qu'un `>`
// à l'intérieur d'une valeur d'attribut ne la termine pas prématurément.
const BALISE_RE = /<(\/?)([a-zA-Z][a-zA-Z0-9:_-]*)((?:"[^"]*"|'[^']*'|[^>"'])*)>/g
const ATTR_RE = /([^\s"'>/=]+)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s"'`=<>]+)))?/g

function assainirAttributs(brut) {
  const gardes = []
  ATTR_RE.lastIndex = 0
  let m
  while ((m = ATTR_RE.exec(brut)) !== null) {
    const nom = m[1].toLowerCase()
    const valeur = m[2] ?? m[3] ?? m[4] ?? null

    // Tout gestionnaire d'événement, quelle que soit la balise porteuse.
    if (nom.startsWith('on')) continue
    if (ATTRS_INTERDITS.has(nom)) continue
    if (nom.startsWith('xmlns') && nom !== 'xmlns') continue

    if (valeur === null) {
      gardes.push(nom)
      continue
    }
    if (ATTRS_URL.has(nom) && !urlEstSure(valeur)) continue

    const propre = nom === 'style' ? assainirCss(valeur) : valeur
    gardes.push(`${nom}="${propre.replace(/"/g, '&quot;')}"`)
  }
  return gardes
}

export function sanitizeHtml(html) {
  if (!html) return ''
  let s = String(html)

  // Balises à contenu exécutable : retirées avec leur contenu, y compris non
  // fermées (un `<script>alert(1)` en fin de chaîne s'exécute quand même).
  for (const balise of BALISES_AVEC_CONTENU) {
    s = s.replace(new RegExp(`<${balise}\\b[\\s\\S]*?<\\/${balise}\\s*>`, 'gi'), '')
    s = s.replace(new RegExp(`<${balise}\\b[\\s\\S]*$`, 'i'), '')
  }

  // Commentaires : sans valeur éditoriale, et les commentaires conditionnels
  // savent réintroduire du balisage.
  s = s.replace(/<!--[\s\S]*?(?:-->|$)/g, '')

  // Feuilles de style en ligne : conservées, contenu assaini.
  s = s.replace(/(<style\b[^>]*>)([\s\S]*?)(<\/style\s*>)/gi, (_, ouv, css, fer) => ouv + assainirCss(css) + fer)

  return s.replace(BALISE_RE, (tout, fermante, nom, attrs) => {
    const balise = nom.toLowerCase()
    if (BALISES_INTERDITES.has(balise)) return ''
    if (fermante) return `</${balise}>`

    const autoFermante = /\/\s*$/.test(attrs)
    const gardes = assainirAttributs(autoFermante ? attrs.replace(/\/\s*$/, '') : attrs)
    return `<${balise}${gardes.length ? ' ' + gardes.join(' ') : ''}${autoFermante ? ' /' : ''}>`
  })
}
