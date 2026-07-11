import { useAdmin } from '~/composables/useAdmin'

export default defineNuxtPlugin((nuxtApp) => {
  const { isAdminMode } = useAdmin()
  let knownVersion: string | null = null
  let reloading = false
  let lastCheckAt = 0

  async function fetchVersion(): Promise<string | null> {
    try {
      const res = await fetch('/version.txt', { cache: 'no-cache' })
      if (!res.ok) return null
      return (await res.text()).trim()
    } catch {
      return null
    }
  }

  async function checkForNewDeployment(throttleMs: number) {
    if (reloading) return
    // En admin, un reload forcé peut interrompre une action en cours
    // (changement de device, navigation de page, édition non sauvegardée) :
    // `page:finish` se déclenche à CHAQUE changement de route/query interne
    // de la toolbar admin, pas seulement lors d'une vraie navigation —
    // on saute la vérification tant que l'admin est actif.
    if (isAdminMode.value) return
    const now = Date.now()
    if (now - lastCheckAt < throttleMs) return
    lastCheckAt = now

    const v = await fetchVersion()
    if (!v) return
    // Premier fetch raté (offline au démarrage…) : on adopte la version vue
    if (!knownVersion) { knownVersion = v; return }
    if (v !== knownVersion) {
      reloading = true
      window.location.reload()
    }
  }

  // Restauration bfcache (retour/avant depuis l'historique navigateur) :
  // le navigateur ressuscite un instantané potentiellement périmé
  window.addEventListener('pageshow', (event) => {
    if (event.persisted) window.location.reload()
  })

  // Version initiale au démarrage de l'app
  fetchVersion().then((v) => { knownVersion = v })

  // Cas fréquent : onglet laissé ouvert, déploiement, retour sur l'onglet
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') checkForNewDeployment(30_000)
  })

  // Contenu (pas seulement code) : un onglet public laissé ouvert pendant
  // qu'un admin édite ailleurs affichait l'ancien contenu jusqu'à un hard
  // refresh. Au retour sur l'onglet, on rafraîchit les données de page
  // (refetch des useAsyncData de la page courante) — throttle 30 s, jamais
  // en mode admin (l'éditeur travaille sur localBlocks, pas sur le payload).
  let lastDataRefreshAt = 0
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState !== 'visible') return
    if (isAdminMode.value) return
    const now = Date.now()
    if (now - lastDataRefreshAt < 30_000) return
    lastDataRefreshAt = now
    refreshNuxtData().catch(() => {})
  })

  // Vérification après chaque navigation SPA (throttle 60 s)
  nuxtApp.hook('page:finish', () => checkForNewDeployment(60_000))
})
