// Polices sélectionnables pour la police par champ de texte (voir
// components/editor/AutoEditor.vue et fieldFontStyle ci-dessous).
// Liste fermée volontairement : chaque entrée doit exister sur Google Fonts
// et est chargée dynamiquement via un <link> quand elle est utilisée.
// N'accepter que ces valeurs empêche l'injection de CSS/URL arbitraire via
// le champ police (admin-only mais vaut mieux valider à la frontière).
export const AVAILABLE_FONTS = [
  { value: "Nunito", label: "Nunito (actuel — texte)", stack: "'Nunito', -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif" },
  { value: "Playfair Display", label: "Playfair Display (actuel — titres)", stack: "'Playfair Display', serif" },
  { value: "Montserrat", label: "Montserrat", stack: "'Montserrat', sans-serif" },
  { value: "Poppins", label: "Poppins", stack: "'Poppins', sans-serif" },
  { value: "Open Sans", label: "Open Sans", stack: "'Open Sans', sans-serif" },
  { value: "Lora", label: "Lora", stack: "'Lora', serif" },
  { value: "Merriweather", label: "Merriweather", stack: "'Merriweather', serif" },
  { value: "Roboto", label: "Roboto", stack: "'Roboto', sans-serif" },
]

export function isValidFont(name) {
  return AVAILABLE_FONTS.some((f) => f.value === name)
}

export function fontStack(name) {
  return AVAILABLE_FONTS.find((f) => f.value === name)?.stack || null
}

// Injecte le <link> Google Fonts pour une police si ce n'est pas déjà fait
// (idempotent — vérifie le href avant d'ajouter). Client uniquement.
export function ensureFontLoaded(name) {
  if (!isValidFont(name) || typeof document === "undefined") return
  const href = `https://fonts.googleapis.com/css2?family=${encodeURIComponent(name).replace(/%20/g, "+")}:wght@400;600;700&display=swap`
  if (document.querySelector(`link[href="${href}"]`)) return
  const link = document.createElement("link")
  link.rel = "stylesheet"
  link.href = href
  document.head.appendChild(link)
}

// Police par champ de texte (ex: props.fieldFonts = { title: "Lora" }) —
// override plus fin que le réglage global headingFont/bodyFont. Retourne un
// objet de style prêt pour :style, vide si aucun override pour ce champ.
export function fieldFontStyle(fieldFonts, key) {
  const name = fieldFonts?.[key]
  if (!name || !isValidFont(name)) return {}
  ensureFontLoaded(name)
  return { fontFamily: fontStack(name) }
}
