import { DEFAULT_TYPOGRAPHY, isValidFont, fontStack, ensureFontLoaded } from '~/utils/fonts.js'

// Charge la typographie choisie en admin (settings/typography) et l'applique :
// - CSS custom properties --font-heading/--font-body sur :root (lues par
//   assets/css/main.css et tous les blocs, qui référencent ces variables au
//   lieu de noms de police codés en dur)
// - <link> Google Fonts pour la police choisie (jamais chargée par défaut —
//   seules les 2 polices actuelles sont utilisées si rien n'est configuré,
//   elles retombent silencieusement sur les polices système sans <link>,
//   comportement inchangé par rapport à avant)
export default defineNuxtPlugin(async () => {
  let typography = DEFAULT_TYPOGRAPHY
  try {
    const res = await $fetch('/api/typography')
    if (res?.props?.headingFont && res?.props?.bodyFont) {
      typography = res.props
    }
  } catch {
    // Pas de config sauvegardée ou erreur réseau : on garde les valeurs par défaut
  }

  const { headingFont, bodyFont } = typography
  if (!isValidFont(headingFont) || !isValidFont(bodyFont)) return

  document.documentElement.style.setProperty('--font-heading', fontStack(headingFont))
  document.documentElement.style.setProperty('--font-body', fontStack(bodyFont))

  ensureFontLoaded(headingFont)
  ensureFontLoaded(bodyFont)
})
