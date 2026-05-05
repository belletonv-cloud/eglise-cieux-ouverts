/**
 * Page Builder — Définition des types de blocs
 * Chaque bloc a : type, label, icône, props par défaut, schema de propriétés éditables
 */

// ─── ANIMATIONS disponibles ───────────────────────────────────────────────────
export const ANIMATIONS = [
  { id: 'none',      label: 'Aucune',         css: '' },
  { id: 'fadeIn',    label: 'Apparition',     css: 'anim-fadeIn' },
  { id: 'slideUp',   label: 'Glisse haut',    css: 'anim-slideUp' },
  { id: 'slideLeft', label: 'Glisse gauche',  css: 'anim-slideLeft' },
  { id: 'portal',    label: 'Portail 3D',     css: 'anim-portal' },
  { id: 'zoom',      label: 'Zoom entrant',   css: 'anim-zoom' },
  { id: 'bounce',    label: 'Rebond',         css: 'anim-bounce' },
  { id: 'flip',      label: 'Flip horizontal',css: 'anim-flip' },
  { id: 'wave',      label: 'Vague',          css: 'anim-wave' },
]

// ─── TYPES DE BLOCS ────────────────────────────────────────────────────────────
export const BLOCK_TYPES = {

  hero: {
    label: 'Hero (bannière)',
    icon: '🖼️',
    defaults: {
      image: '/foule-croix.png',
      height: 500,
      overlay: false,
      overlayColor: 'rgba(0,0,0,0.3)',
      overlayText: '',
    },
    schema: [
      { key: 'image',        label: 'Image',           type: 'image' },
      { key: 'height',       label: 'Hauteur (px)',    type: 'number', min: 200, max: 900 },
      { key: 'overlay',      label: 'Overlay sombre',  type: 'boolean' },
      { key: 'overlayColor', label: 'Couleur overlay', type: 'color' },
      { key: 'overlayText',  label: 'Texte sur image', type: 'text' },
    ]
  },

  bienvenue: {
    label: 'Bienvenue (lettres)',
    icon: '✨',
    defaults: {
      title: 'BIENVENUE',
      subtitle: "à l'Église Cieux Ouverts à Morlaix",
      backgroundColor: '#ffffff',
      textColor: '#1a1a2e',
      animation: 'portal',
      fontSize: 7,
    },
    schema: [
      { key: 'title',           label: 'Titre',            type: 'text' },
      { key: 'subtitle',        label: 'Sous-titre',       type: 'text' },
      { key: 'backgroundColor', label: 'Fond',             type: 'color' },
      { key: 'textColor',       label: 'Couleur texte',    type: 'color' },
      { key: 'animation',       label: 'Animation',        type: 'animation' },
      { key: 'fontSize',        label: 'Taille police (em)',type: 'number', min: 3, max: 12 },
    ]
  },

  textImage: {
    label: 'Texte + Image',
    icon: '📝',
    defaults: {
      title: 'Titre de la section',
      content: 'Contenu de la section.',
      image: '',
      imagePosition: 'right',
      backgroundColor: '#ffffff',
      textColor: '#1a1a2e',
      animation: 'slideLeft',
    },
    schema: [
      { key: 'title',         label: 'Titre',             type: 'text' },
      { key: 'content',       label: 'Contenu',           type: 'textarea' },
      { key: 'image',         label: 'Image',             type: 'image' },
      { key: 'imagePosition', label: 'Image à droite',    type: 'select', options: ['left','right'] },
      { key: 'backgroundColor',label: 'Fond',             type: 'color' },
      { key: 'textColor',     label: 'Couleur texte',     type: 'color' },
      { key: 'animation',     label: 'Animation',         type: 'animation' },
    ]
  },

  rejoins: {
    label: 'Rejoins-nous',
    icon: '🤝',
    defaults: {
      title: 'Rejoins-nous',
      subtitle: 'chaque dimanche',
      location: 'Chaque dimanche à Morlaix',
      horaires: [
        { heure: '9h30',  label: 'Accueil café' },
        { heure: '10h00', label: 'Célébration' },
      ],
      backgroundGradient: 'linear-gradient(135deg, #3B82F6 0%, #7C3AED 50%, #EC4899 100%)',
      animation: 'slideLeft',
    },
    schema: [
      { key: 'title',              label: 'Titre',           type: 'text' },
      { key: 'subtitle',           label: 'Sous-titre',      type: 'text' },
      { key: 'location',           label: 'Lieu',            type: 'text' },
      { key: 'backgroundGradient', label: 'Fond (CSS)',      type: 'text' },
      { key: 'animation',          label: 'Animation',       type: 'animation' },
    ]
  },

  aspirations: {
    label: 'Nos aspirations',
    icon: '🌟',
    defaults: {
      title: 'Nos aspirations',
      items: [
        "Accueillir et vivre l'unité",
        "Célébrer et cultiver la présence de Dieu",
        "Accompagner et restaurer les vies",
        "Témoigner et former des disciples",
      ],
      quoteLabel: 'CE QUI NOUS ANIME',
      quote: "Voir la gloire, le royaume et la volonté de Dieu\nse manifester sur la terre comme aux Cieux",
      ctaText: 'Nous rejoindre',
      ctaLink: '/contact',
      backgroundColor: '#064886',
      textColor: '#ffffff',
      animation: 'zoom',
    },
    schema: [
      { key: 'title',           label: 'Titre',             type: 'text' },
      { key: 'quote',           label: 'Citation',          type: 'textarea' },
      { key: 'ctaText',         label: 'Bouton texte',      type: 'text' },
      { key: 'ctaLink',         label: 'Bouton lien',       type: 'text' },
      { key: 'backgroundColor', label: 'Fond',              type: 'color' },
      { key: 'animation',       label: 'Animation citation',type: 'animation' },
    ]
  },

  contact: {
    label: 'Formulaire contact',
    icon: '✉️',
    defaults: {
      title: 'Tu veux nous contacter ?',
      image: '/smartphone.jpg',
      backgroundColor: '#064886',
      backgroundGradient: 'linear-gradient(to bottom, #064886 0%, #a8c4e0 60%, #ffffff 100%)',
      showSocials: true,
      animation: 'fadeIn',
    },
    schema: [
      { key: 'title',              label: 'Titre',           type: 'text' },
      { key: 'image',              label: 'Image gauche',    type: 'image' },
      { key: 'backgroundGradient', label: 'Fond (CSS)',      type: 'text' },
      { key: 'showSocials',        label: 'Réseaux sociaux', type: 'boolean' },
      { key: 'animation',          label: 'Animation',       type: 'animation' },
    ]
  },

  richText: {
    label: 'Texte libre',
    icon: '📄',
    defaults: {
      content: 'Écrivez votre texte ici...',
      backgroundColor: '#ffffff',
      textColor: '#1a1a2e',
      textAlign: 'left',
      padding: 60,
      animation: 'fadeIn',
    },
    schema: [
      { key: 'content',         label: 'Contenu HTML',    type: 'richtext' },
      { key: 'backgroundColor', label: 'Fond',            type: 'color' },
      { key: 'textColor',       label: 'Couleur texte',   type: 'color' },
      { key: 'textAlign',       label: 'Alignement',      type: 'select', options: ['left','center','right'] },
      { key: 'padding',         label: 'Espacement (px)', type: 'number', min: 0, max: 200 },
      { key: 'animation',       label: 'Animation',       type: 'animation' },
    ]
  },

  gallery: {
    label: 'Galerie photos',
    icon: '🖼️',
    defaults: {
      images: [],
      columns: 3,
      backgroundColor: '#ffffff',
      animation: 'fadeIn',
    },
    schema: [
      { key: 'images',          label: 'Images',          type: 'images' },
      { key: 'columns',         label: 'Colonnes',        type: 'number', min: 1, max: 4 },
      { key: 'backgroundColor', label: 'Fond',            type: 'color' },
      { key: 'animation',       label: 'Animation',       type: 'animation' },
    ]
  },

  spacer: {
    label: 'Espace vide',
    icon: '↕️',
    defaults: {
      height: 60,
      backgroundColor: 'transparent',
    },
    schema: [
      { key: 'height',          label: 'Hauteur (px)',    type: 'number', min: 10, max: 400 },
      { key: 'backgroundColor', label: 'Fond',            type: 'color' },
    ]
  },

  vision: {
    label: 'Vision (citation)',
    icon: '🎯',
    defaults: {
      label: 'Ce qui nous anime',
      quote: 'Voir la gloire, le royaume et la volonté de Dieu\\nse manifester sur la terre comme aux Cieux',
      ctaText: 'Nous rejoindre',
      ctaLink: '/contact',
      backgroundGradient: 'linear-gradient(135deg, #7C3AED 0%, #EC4899 50%, #3B82F6 100%)',
      animation: 'fadeIn',
    },
    schema: [
      { key: 'label',              label: 'Label',           type: 'text' },
      { key: 'quote',              label: 'Citation',        type: 'textarea' },
      { key: 'ctaText',            label: 'Bouton texte',    type: 'text' },
      { key: 'ctaLink',            label: 'Bouton lien',     type: 'text' },
      { key: 'backgroundGradient', label: 'Fond (CSS)',      type: 'text' },
      { key: 'animation',          label: 'Animation',       type: 'animation' },
    ]
  },
}

// ─── Visibilité responsive ──────────────────────────────────────────────────
export const VISIBILITY_DEFAULTS = {
  desktop: true,
  tablet: true,
  mobile: true,
}

// ─── Créer un nouveau bloc avec ID unique ───────────────────────────────────
export function createBlock(type) {
  return {
    id: crypto.randomUUID(),
    type,
    props: { ...BLOCK_TYPES[type].defaults },
    visibility: { ...VISIBILITY_DEFAULTS },
  }
}

// ─── Structure de page initiale (accueil) ─────────────────────────────────
export function getDefaultHomePage() {
  return [
    createBlock('hero', { image: '/photos/salle.jpg' }),
    createBlock('fullWidthImage', { src: '/hero.jpg' }),
    createBlock('aspirations'),
    createBlock('fullWidthImage', { src: '/hero-foule.png' }),
    createBlock('vision'),
    createBlock('fullWidthImage', { src: '/calendar.png' }),
  ]
}
