/**
 * `cache-control: no-cache` sur le HTML — et sur le HTML seulement.
 *
 * Le HTML de ce site est rendu par la Pages Function (SSR, preset
 * `cloudflare-pages`). Or Cloudflare n'applique PAS `public/_headers` aux
 * réponses de Functions : le `cache-control: no-cache` qui y était posé sur
 * `/*` ne protégeait donc jamais le HTML — il ne touchait que les fichiers
 * statiques, dont il cassait au passage le cache long (voir public/_headers).
 *
 * Le poser ici via `render:response` le cible exactement : uniquement les
 * rendus de page, ni les assets, ni les routes `/api/*`. Sans cela, un
 * navigateur peut servir un HTML mémorisé qui référence un bundle
 * `/_nuxt/*` supprimé par le déploiement suivant — page blanche jusqu'à un
 * hard refresh (déjà constaté, cf. CLAUDE.md).
 */
export default defineNitroPlugin((nitroApp) => {
  nitroApp.hooks.hook('render:response', (response) => {
    response.headers = response.headers || {}
    response.headers['cache-control'] = 'no-cache'
  })
})
