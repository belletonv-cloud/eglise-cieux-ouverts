import { test, expect } from '@playwright/test'
// @ts-ignore — utilitaire JS sans typage
import { sanitizeHtml } from '../../utils/sanitize.js'

/**
 * Garde-fou XSS de `sanitizeHtml`, seul rempart devant les `v-html` du site
 * (richText, corps de textImage, descriptions d'agenda, éléments libres).
 *
 * La version d'origine enchaînait des expressions régulières visant chacune un
 * vecteur nommé et laissait passer tout le reste — neuf des vecteurs ci-dessous
 * ressortaient intacts. La réécriture en liste blanche d'attributs les couvre,
 * mais le vrai risque est la régression : quiconque « simplifie » le filtrage
 * doit voir ces cas tomber.
 *
 * Le second bloc est aussi important que le premier : le contenu collé par les
 * administrateurs s'appuie sur `<style>`, les `style=` en ligne et les iframes
 * d'intégration. Un assainissement qui les emporte casse des pages réelles.
 */

// Ce qui, dans une sortie, signe un échec : gestionnaire d'événement survivant,
// URL exécutable, balise à contenu actif.
const DANGEREUX = /\son\w+\s*=|javascript|vbscript|data:text\/html|<script|srcdoc|-moz-binding|expression\s*\(/i

const VECTEURS: [string, string][] = [
  ['attribut sans espace devant', '<img src=x/onerror=alert(1)>'],
  ['handler classique', '<img src=x onerror=alert(1)>'],
  ['espace avant le schéma', '<a href=" javascript:alert(1)">x</a>'],
  ['iframe src exécutable', '<iframe src="javascript:alert(1)"></iframe>'],
  ['script non fermé', '<script>alert(1)'],
  ['script fermé', '<script>alert(1)</script>'],
  ['handler SVG animate', '<svg><animate onbegin=alert(1) attributeName=x dur=1s>'],
  ['action de formulaire', '<form action="javascript:alert(1)"><button>x</button></form>'],
  ['object data', '<object data="javascript:alert(1)"></object>'],
  ['entité hexadécimale', '<a href="jav&#x61;script:alert(1)">x</a>'],
  ['tabulation encodée', '<a href="java&#09;script:alert(1)">x</a>'],
  ['entité &colon;', '<a href="javascript&colon;alert(1)">x</a>'],
  ['url() dans style', '<div style="background:url(javascript:alert(1))">x</div>'],
  ['-moz-binding', '<div style="-moz-binding:url(http://x/x.xml)">x</div>'],
  ['commentaire en fin de tag', '<img src=x onerror=alert(1)//>'],
  ['@import dans <style>', '<style>@import "javascript:alert(1)";</style>'],
  ['autofocus + onfocus', '<input autofocus onfocus=alert(1)>'],
  ['retour ligne avant le =', '<img src="x" onerror\n=alert(1)>'],
  ['data:text/html', '<a href="data:text/html;base64,PHNjcmlwdD5hbGVydCgxKTwvc2NyaXB0Pg==">x</a>'],
  ['embed data:text/html', '<embed src="data:text/html;base64,PHNjcmlwdD5hbGVydCgxKTwvc2NyaXB0Pg==">'],
  ['meta refresh', '<meta http-equiv="refresh" content="0;url=javascript:alert(1)">'],
  ['base href', '<base href="javascript:alert(1)//">'],
  ['mXSS via <math>', '<math><mtext><table><mglyph><style><img src=x onerror=alert(1)>'],
  ['iframe srcdoc', '<iframe srcdoc="&lt;script&gt;alert(1)&lt;/script&gt;"></iframe>'],
  ['details ontoggle', '<details ontoggle=alert(1) open>x</details>'],
  ['body onload', '<body onload=alert(1)>'],
  ['commentaire conditionnel IE', '<!--[if IE]><script>alert(1)</script><![endif]-->'],
  ['vbscript:', '<a href="vbscript:msgbox(1)">x</a>'],
  ['formaction', '<button formaction="javascript:alert(1)">x</button>'],
  ['poster de vidéo', '<video poster="javascript:alert(1)"></video>'],
  ['href non quoté', '<a href=javascript:alert(1)>x</a>'],
  ['casse mélangée', '<a HREF="JaVaScRiPt:alert(1)">x</a>'],
  ['srcset', '<img srcset="javascript:alert(1)">'],
  ['xlink:href', '<svg><a xlink:href="javascript:alert(1)"><text>x</text></a></svg>'],
  ['attribut ping', '<a href="/ok" ping="javascript:alert(1)">x</a>'],
]

test.describe('sanitizeHtml — neutralisation XSS', () => {
  for (const [nom, charge] of VECTEURS) {
    test(nom, () => {
      expect(sanitizeHtml(charge)).not.toMatch(DANGEREUX)
    })
  }

  test('chaîne vide ou absente', () => {
    expect(sanitizeHtml('')).toBe('')
    expect(sanitizeHtml(null)).toBe('')
    expect(sanitizeHtml(undefined)).toBe('')
  })
})

// Le HTML collé par les administrateurs doit ressortir à l'identique : la
// mise en forme des pages en dépend (voir la note sur `font-family` dans
// CLAUDE.md — le contenu collé porte ses propres styles).
const LEGITIMES: [string, string][] = [
  ['style en ligne', '<p style="font-family: Georgia, serif; color:#333">Bonjour <strong>tous</strong></p>'],
  ['titre + variable CSS', '<h2 style="font-family:var(--font-heading)">Titre</h2><br>'],
  ['lien externe', '<a href="https://cieuxouverts.bzh" target="_blank" rel="noopener">Site</a>'],
  ['liens relatif, ancre, mailto, tel', '<a href="/contact">Écrire</a> <a href="#ancre">ancre</a> <a href="mailto:a@b.fr">mail</a> <a href="tel:+33123">tel</a>'],
  ['image auto-fermante', '<img src="/images/logo-nav.png" alt="Logo" width="120" class="logo" />'],
  ['iframe YouTube', '<iframe src="https://www.youtube.com/embed/abc" allowfullscreen width="560" height="315"></iframe>'],
  ['feuille de style collée', '<style>.encart h3 { font-family: Georgia; }</style><div class="encart"><h3>Titre</h3></div>'],
  ['listes et tableaux', '<ul><li>un</li><li>deux</li></ul><table><tr><td>a</td></tr></table>'],
  ['image en data:image', '<img src="data:image/png;base64,iVBORw0KGgo=" alt="px">'],
  ['entités de texte', '<p>a &lt; b &amp; c &gt; d</p>'],
  ['police distante', '<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter">'],
  ['citation', '<blockquote cite="https://x.fr"><em>citation</em></blockquote>'],
]

test.describe('sanitizeHtml — contenu légitime préservé', () => {
  for (const [nom, html] of LEGITIMES) {
    test(nom, () => {
      expect(sanitizeHtml(html)).toBe(html)
    })
  }
})
