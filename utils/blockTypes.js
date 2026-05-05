/**
 * Page Builder — Définition des types de blocs
 * Chaque bloc a : type, label, icône, props par défaut, schema de propriétés éditables
 */

import BlockActivities from '~/components/blocks/BlockActivities.vue'
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
      height: 700,
      overlay: false,
      overlayColor: 'rgba(0,0,0,0.3)',
      overlayText: '',
      textColor: '#064886',
      showButton: false,
    },
    schema: [
      { key: 'image',        label: 'Image',           type: 'image' },
      { key: 'height',       label: 'Hauteur (px)',    type: 'number', min: 200, max: 900 },
      { key: 'overlay',      label: 'Overlay sombre',  type: 'boolean' },
      { key: 'overlayColor', label: 'Couleur overlay', type: 'color' },
      { key: 'overlayText',  label: 'Texte sur image', type: 'text' },
      { key: 'textColor',    label: 'Couleur texte',   type: 'color' },
      { key: 'showButton',   label: 'Afficher bouton', type: 'boolean' },
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

  activities: {
    label: 'Grille d\'activités',
    icon: '🗂️',
    defaults: {
      items: [
        {
          title: "Célébration dimanche",
          description: "Viens célébrer avec nous chaque dimanche !\n\nRejoins-nous pour un moment chaleureux, joyeux dans l'unité et la bienveillance.\n\nAu programme :\n✨ Un accueil convivial autour d’un café offert !\n🎵 Un temps de louange (chants rythmés) et d’adoration (chants plus doux) avec des chants qui disposent le cœur.\n📖 Un message inspirant, délivré par un prédicateur ou le pasteur, pour nourrir ta foi.\n🙏 Un temps de prière, si tu souhaites recevoir un soutien ou partager ton cœur.\n\nRendez-vous chaque semaine :\n\n9h30 : Accueil-café.\n10h00 : Début de la célébration.\n\nEt pour les enfants ?\nDe 1 à 18 ans, ils sont les bienvenus dans des espaces dédiés, encadrés par des moniteurs bienveillants et qualifiés.",
          image: "https://static.wixstatic.com/media/d65230_2d9fe5fd35e84c55b202fcf057c136b5~mv2.jpg/v1/fit/w_1920,h_749,q_90,enc_avif,quality_auto/d65230_2d9fe5fd35e84c55b202fcf057c136b5~mv2.jpg"
        },
        {
          title: "Soirée Cieux Ouverts",
          description: "Viens expérimenter Sa présence !\n\n🙌 As-tu envie de louer Dieu et de Le célébrer de tout ton être ?\n🙏 Ressens-tu le besoin d’un moment intime avec Lui ?\n❤️‍🩹 Aspires-tu à une guérison, une délivrance ou un nouveau départ ?\n\nNe manque pas nos Soirées Cieux Ouverts, des instants privilégiés où le ciel touche la terre et où la gloire de Dieu transforme les vies.\nUn moment unique pour te connecter à Son cœur et vivre Sa puissance à l'œuvre.\n\n👉 Nous t'attendons avec joie – sois le/la bienvenu(e) !",
          image: "https://static.wixstatic.com/media/d65230_9b89ba75fde44af5b2a3c16ee5289376~mv2.png/v1/fit/w_1620,h_632,q_90,enc_avif,quality_auto/d65230_9b89ba75fde44af5b2a3c16ee5289376~mv2.png"
        },
        {
          title: "Groupe de prière",
          description: "Unissons nos voix chaque mercredi soir !\n\n🙏Rejoins-nous les mercredis à 20h pour un temps puissant de prières et d’intercessions. \n📣 Ensemble, nous élevons nos voix pour porter devant Dieu les sujets qui touchent nos cœurs et le monde qui nous entoure.\n\nViens participer à ce moment d’impact – ta prière compte !",
          image: "https://static.wixstatic.com/media/11062b_9fe8cf7ac275438cafa34f90833b0230~mv2.jpg/v1/fit/w_1920,h_749,q_90,enc_avif,quality_auto/11062b_9fe8cf7ac275438cafa34f90833b0230~mv2.jpg"
        },
        {
          title: "Groupe de marche",
          description: "Rejoins-nous pour une marche conviviale chaque mois !\n\nUne belle occasion de :\n🤝 Créer des liens et partager des moments authentiques ensemble.\n🌍 Explorer une nouvelle commune ou un coin pittoresque de notre magnifique région.\n🚶‍♀️ Bouger à ton rythme, avec deux parcours adaptés pour que chacun y trouve son plaisir.\n\nEt si le soleil est au rendez-vous, nous prolongeons la journée avec un pique-nique avant le départ de la randonnée ! 🌞\n\nViens marcher, découvrir et partager avec nous – c’est ouvert à tous !",
          image: "https://static.wixstatic.com/media/d65230_1abbcae1fcb64164923e47f431528317~mv2.jpeg/v1/fill/w_1600,h_624,fp_0.54_0.46,q_90,enc_avif,quality_auto/d65230_1abbcae1fcb64164923e47f431528317~mv2.jpeg"
        },
        {
          title: "Groupes de maison",
          description: "Des groupes de maison près de chez toi !\n\nRejoins l’un de nos groupes de maison dans les communes de :\n📍 Carhaix\n📍 Pleyber-Christ\n📍 Plouénan\n📍 Plouvorn\n📍 Saint-Martin-des-Champs\n📍 Saint-Pol-de-Léon\n... et d'autres à venir !\n\nCes rencontres conviviales sont l’occasion de :\n💬 Échanger et répondre à tes questions.\n🤝 Partager nos expériences et notre foi.\n✨ Grandir ensemble dans la découverte de Christ.\n\nCes groupes sont ouverts à tous, en particulier aux personnes qui explorent leur cheminement spirituel ou souhaitent en savoir plus sur Jésus.\n\nViens comme tu es, une place t’attend !",
          image: "https://static.wixstatic.com/media/d65230_c2d4e37821764562bf9a976f456fa24c~mv2.jpeg/v1/fill/w_1600,h_624,fp_0.46_0.56,q_90,enc_avif,quality_auto/d65230_c2d4e37821764562bf9a976f456fa24c~mv2.jpeg"
        },
        {
          title: "Soirée femmes",
          description: "Rejoins les SentinElles !\n\nℹ️ Un jeudi par mois, de 18h30 à 21h, le groupe des SentinElles se rassemble pour vivre des moments uniques entre femmes.\n\n💬 C'est l'occasion de plonger dans des thèmes bibliques inspirants, d'échanger librement et de partager des expériences qui nous enrichissent mutuellement. 💫\n\nViens comme tu es, avec ton histoire, ton énergie ou ta curiosité – il y a une place pour toi parmi nous ! ✨",
          image: "https://static.wixstatic.com/media/d65230_10839e8f0d4d4800ad28b2639c618f21~mv2.jpeg/v1/fit/w_1600,h_624,q_90,enc_avif,quality_auto/d65230_10839e8f0d4d4800ad28b2639c618f21~mv2.jpeg"
        },
        {
          title: "Jeunesse",
          description: "Les \"Potentiel\" : un groupe pour les 12-18 ans !\n\nUn espace dédié aux ados pour :\n❓ Partager leurs questionnements et explorer leur foi en toute liberté.\n✨ Vivre des expériences fortes, qui marquent et transforment.\n🌱 Grandir ensemble, en apprenant à s’épanouir dans leur potentiel.\n🎉 Et surtout, s’amuser et créer des souvenirs mémorables !\n\nDes moments uniques pour se connecter, se découvrir et avancer dans un cadre bienveillant.\n\nSi tu as entre 12 et 18 ans, ce groupe est fait pour toi – viens nous rejoindre !",
          image: "https://static.wixstatic.com/media/11062b_d5951c2579bf4eeca8372bc1d7baedb7~mv2.jpeg/v1/fit/w_1920,h_749,q_90,enc_avif,quality_auto/11062b_d5951c2579bf4eeca8372bc1d7baedb7~mv2.jpeg"
        },
        {
          title: "Repas partagé",
          description: "Repas partagé – chaque dernier dimanche du mois !\n\nUn moment chaleureux et convivial où :\n🍲 Chacun apporte un plat, une boisson et/ ou un dessert à partager.\n🍽️ Un grand buffet est installé pour que tout le monde puisse se servir librement.\n🤝 Nous profitons ensemble d’un temps de communion fraternelle, riche en échanges et en joie.\n\nViens vivre ce moment de partage – ouvert à tous, dans une ambiance familiale et accueillante !",
          image: "https://static.wixstatic.com/media/d65230_c7db696eb12f40748cf1d0df7c998c59~mv2.jpg/v1/fill/w_1920,h_749,fp_0.52_0.24,q_90,enc_avif,quality_auto/d65230_c7db696eb12f40748cf1d0df7c998c59~mv2.jpg"
        }
      ]
    },
    schema: [
      { key: 'items', label: 'Activités', type: 'array' }
    ]
  },

  textImage: {
    label: 'Texte + Image',
    icon: '📝',
    defaults: {
      title: 'Titre de la section',
      content: 'Contenu de la section.',
      image: '/photos/salle.jpg',
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
      subtitle: 'Chaque dimanche',
      location: 'à Morlaix',
      horaires: [
        { heure: '9h30',  label: 'Accueil café' },
        { heure: '10h00', label: 'Célébration' },
      ],
      backgroundGradient: 'linear-gradient(to bottom, #064886 0%, #e58b8b 100%)',
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
      backgroundColor: '#064886',
      textColor: '#ffffff',
      animation: 'zoom',
    },
    schema: [
      { key: 'title',           label: 'Titre',             type: 'text' },
      { key: 'backgroundColor', label: 'Fond',              type: 'color' },
      { key: 'textColor',       label: 'Couleur texte',     type: 'color' },
      { key: 'animation',       label: 'Animation citation',type: 'animation' },
    ]
  },

  contact: {
    label: 'Formulaire contact',
    icon: '✉️',
    defaults: {
      title: 'Tu veux nous contacter ?',
      image: '',
      backgroundColor: '#064886',
      backgroundGradient: '#064886',
      textColor: '#ffffff',
      showSocials: true,
      animation: 'fadeIn',
    },
    schema: [
      { key: 'title',              label: 'Titre',           type: 'text' },
      { key: 'image',              label: 'Image gauche',    type: 'image' },
      { key: 'backgroundGradient', label: 'Fond (CSS)',      type: 'text' },
      { key: 'textColor',          label: 'Texte couleur',   type: 'color' },
      { key: 'showSocials',        label: 'Réseaux sociaux', type: 'boolean' },
      { key: 'animation',          label: 'Animation',       type: 'animation' },
    ]
  },

  nousRejoindre: {
    label: 'Nous rejoindre (Cercle)',
    icon: '⚪',
    defaults: {
      title: 'Nous rejoindre',
      link: '/contact',
      backgroundGradient: 'linear-gradient(to bottom, #d97777 0%, #064886 100%)',
    },
    schema: [
      { key: 'title',              label: 'Titre',           type: 'text' },
      { key: 'link',               label: 'Lien',            type: 'text' },
      { key: 'backgroundGradient', label: 'Fond (CSS)',      type: 'text' },
    ]
  },

  richText: {
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
      ctaText: '',
      ctaLink: '',
      backgroundGradient: '#f8f9fa',
      textColor: '#064886',
      animation: 'fadeIn',
    },
    schema: [
      { key: 'label',              label: 'Label',           type: 'text' },
      { key: 'quote',              label: 'Citation',        type: 'textarea' },
      { key: 'ctaText',            label: 'Bouton texte',    type: 'text' },
      { key: 'ctaLink',            label: 'Bouton lien',     type: 'text' },
      { key: 'backgroundGradient', label: 'Fond (CSS)',      type: 'text' },
      { key: 'textColor',          label: 'Texte couleur',   type: 'color' },
      { key: 'animation',          label: 'Animation',       type: 'animation' },
    ]
  },

  fullWidthImage: {
    label: 'Image pleine largeur',
    icon: '🌆',
    defaults: {
      src: '',
      alt: 'Image pleine largeur',
      height: 400,
    },
    schema: [
      { key: 'src',    label: 'Image',         type: 'image' },
      { key: 'alt',    label: 'Texte alternatif', type: 'text' },
      { key: 'height', label: 'Hauteur (px)',  type: 'number', min: 100, max: 800 },
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
export function createBlock(type, props = {}) {
  if (!BLOCK_TYPES[type]) {
    console.warn(`createBlock: type inconnu "${type}"`)
    return null
  }
  const id = typeof crypto !== 'undefined' && crypto.randomUUID
    ? crypto.randomUUID()
    : Math.random().toString(36).slice(2)
  return {
    id,
    type,
    props: { ...BLOCK_TYPES[type].defaults, ...props },
    visibility: { ...VISIBILITY_DEFAULTS },
  }
}

// ─── Structure de page initiale (accueil) ─────────────────────────────────
export function getDefaultHomePage() {
  return [
    createBlock('hero'),
    createBlock('bienvenue'),
    createBlock('rejoins'),
    createBlock('vision'),
    createBlock('aspirations'),
    createBlock('nousRejoindre'),
    createBlock('activities'),
    createBlock('contact', { 
      image: 'https://static.wixstatic.com/media/11062b_c518f30e29fa44f0b424cabfdd0b5a6a~mv2.jpg/v1/fill/w_147,h_246,al_c,q_80,usm_0.66_1.00_0.01,blur_2,enc_avif,quality_auto/Smartphone%20en%20main.jpg', 
      backgroundGradient: 'linear-gradient(to bottom, #064886 0%, #064886 70%, #ffffff 100%)' 
    }),
  ].filter(Boolean)
}
