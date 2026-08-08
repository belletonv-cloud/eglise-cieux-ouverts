/**
 * `fetch` borné dans le temps, à utiliser pour TOUT appel sortant du serveur.
 *
 * Pourquoi : le site tourne sur le runtime Workers (Cloudflare Pages). Un
 * `fetch` sans signal d'annulation n'abandonne jamais de lui-même — si
 * Firestore, l'API Google d'identité, Mailjet ou le Worker `eglise-app`
 * cessent de répondre (sans refuser la connexion), la requête reste suspendue
 * jusqu'à ce que la plateforme la tue. Le visiteur attend, puis reçoit une
 * 5xx. Les `catch` de dégradation déjà présents dans les endpoints (menu et
 * footer qui retombent sur les defaults, page vide plutôt que 500…) ne
 * servent alors à rien : ils n'attendent qu'une erreur, or il n'y en a pas,
 * seulement une attente sans fin.
 *
 * Un amont lent est ainsi transformé en erreur franche et rapide, que le code
 * appelant sait déjà traiter — d'où le choix de lever une `Error` ordinaire et
 * non un `createError` HTTP : aucun `catch` existant n'a besoin de changer.
 */

/** 8 s : large pour un appel Firestore normal (< 1 s), court devant l'attente d'un visiteur. */
export const DEFAULT_TIMEOUT_MS = 8000

/** Envoi d'email : hors du chemin de rendu, on tolère un amont plus lent. */
export const EMAIL_TIMEOUT_MS = 10000

export async function fetchWithTimeout(
  input: string,
  init: RequestInit = {},
  timeoutMs: number = DEFAULT_TIMEOUT_MS,
): Promise<Response> {
  try {
    return await fetch(input, { ...init, signal: AbortSignal.timeout(timeoutMs) })
  } catch (err: any) {
    if (err?.name === 'TimeoutError' || err?.name === 'AbortError') {
      // On ne remonte que l'origine et le chemin : une URL Firestore complète
      // contient les identifiants de document, inutiles ici et parfois
      // recopiés tels quels dans un message d'erreur affiché à l'utilisateur.
      let cible = input
      try {
        const u = new URL(input)
        cible = u.origin + u.pathname
      } catch {
        cible = input.split('?')[0]
      }
      throw new Error(`Délai dépassé (${timeoutMs} ms) en appelant ${cible}`)
    }
    throw err
  }
}
