export const DESIGN_FIELDS = [
  { key: 'fontFamily', label: 'Police', type: 'select', options: [
    { value: 'inherit', label: 'Par défaut' },
    { value: 'Nunito, sans-serif', label: 'Nunito' },
    { value: "'Playfair Display', serif", label: 'Playfair Display' },
    { value: 'Georgia, serif', label: 'Georgia' },
  ]},
  { key: 'fontSize', label: 'Taille police', type: 'number', min: 8, max: 72 },
  { key: 'fontWeight', label: 'Épaisseur', type: 'number', min: 100, max: 900, step: 100 },
  { key: 'textAlign', label: 'Alignement', type: 'select', options: [
    { value: 'inherit', label: 'Par défaut' },
    { value: 'left', label: 'Gauche' },
    { value: 'center', label: 'Centre' },
    { value: 'right', label: 'Droite' },
  ]},
  { key: 'textColor', label: 'Couleur texte', type: 'color' },
  { key: 'bgColor', label: 'Couleur fond', type: 'color' },
  { key: 'padding', label: 'Padding', type: 'text' },
  // ─── Position / emplacement (appliqué sur le wrapper du bloc) ───
  { key: 'blockAlign', label: 'Alignement du bloc', type: 'select', options: [
    { value: 'full', label: 'Pleine largeur' },
    { value: 'left', label: 'Gauche' },
    { value: 'center', label: 'Centre' },
    { value: 'right', label: 'Droite' },
  ]},
  { key: 'maxWidth', label: 'Largeur max (ex: 800px)', type: 'text' },
  { key: 'marginTop', label: 'Marge haut (ex: 24px)', type: 'text' },
  { key: 'marginBottom', label: 'Marge bas (ex: 24px)', type: 'text' },
]

export const DESIGN_DEFAULTS = {
  fontFamily: 'inherit',
  fontSize: 16,
  fontWeight: 400,
  textAlign: 'inherit',
  textColor: '',
  bgColor: '',
  padding: '',
  blockAlign: 'full',
  maxWidth: '',
  marginTop: '',
  marginBottom: '',
}

export function mergeDesignDefaults(block) {
  if (!block) return block
  if (!block.props) block.props = {}
  const merged = { ...DESIGN_DEFAULTS }
  for (const key of Object.keys(DESIGN_DEFAULTS)) {
    if (block.props[key] !== undefined && block.props[key] !== '' && block.props[key] !== null) {
      merged[key] = block.props[key]
    }
  }
  return { ...block, props: { ...merged, ...block.props } }
}
