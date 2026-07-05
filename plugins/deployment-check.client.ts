export default defineNuxtPlugin((nuxtApp) => {
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

  // Vérification après chaque navigation SPA (throttle 60 s)
  nuxtApp.hook('page:finish', () => checkForNewDeployment(60_000))
})
