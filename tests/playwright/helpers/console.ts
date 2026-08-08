import type { Page } from '@playwright/test'

/**
 * Collecte les erreurs JS d'une page : exceptions non rattrapées et
 * `console.error`. Trois specs en avaient chacune leur copie ; les voici
 * réunies, avec la liste des exclusions au même endroit.
 *
 * Une exclusion doit désigner un message émis par le NAVIGATEUR, pas par
 * l'application — sans quoi on masque de vrais bugs.
 */
const BRUIT_NAVIGATEUR = [
  // Avertissement d'hydratation Vue, déjà ignoré par les trois helpers
  // d'origine.
  'Hydration',
  // « Permissions policy violation: compute-pressure is not allowed in this
  // document. » Chrome sonde cette API de son propre chef ; le message est
  // apparu une fois sur cinq exécutions de la suite complète, jamais en
  // exécutant la spec seule.
  //
  // Vérifié que ce n'est PAS notre en-tête `permissions-policy`
  // (camera/microphone/geolocation) qui le provoque : dans le document ET
  // dans l'iframe d'aperçu responsive, `featurePolicy.allowsFeature(
  // 'compute-pressure')` vaut true, sa liste d'autorisation contient bien
  // l'origine, et `new PressureObserver().observe('cpu')` s'exécute sans
  // erreur. L'en-tête laisse donc cette fonctionnalité à son défaut (`self`) ;
  // le message vient de l'environnement de test.
  'Permissions policy violation',
]

export function collectErrors(page: Page): string[] {
  const errors: string[] = []
  page.on('pageerror', (err) => errors.push('pageerror: ' + err.message))
  page.on('console', (msg) => {
    if (msg.type() !== 'error') return
    const texte = msg.text()
    if (BRUIT_NAVIGATEUR.some((motif) => texte.includes(motif))) return
    errors.push('console.error: ' + texte)
  })
  return errors
}
