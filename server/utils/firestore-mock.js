// /server/utils/firestore-mock.js

// Memo en RAM pour simuler la persistance (reset à chaque test run)
let PAGES = {
  'event-list': {
    blocks: [
      {
        id: 'block-hero',
        type: 'hero',
        props: {
          overlayText: 'Événements à venir',
          overlay: true,
        },
      },
      {
        id: 'block-text-img',
        type: 'textImage',
        props: {
          title: 'Un texte de présentation avec un Drag & Drop possible.',
          image: '/test-img.gif',
        },
      },
      {
        id: 'block-spacer',
        type: 'spacer',
        props: { height: 25 },
      },
      {
        id: 'block-richtext',
        type: 'richText',
        props: {
          content: '<div style="max-width:820px;margin:0 auto;text-align:center;"><h1>Billetterie Événements</h1><p>Découvrez et réservez vos places.</p></div>',
          animation: 'fadeIn',
        },
      },
    ],
  },
  accueil: {
    blocks: [
      {
        id: 'bloc-hero',
        type: 'hero',
        props: {},
      },
      {
        id: 'bloc-bienvenue',
        type: 'bienvenue',
        props: {},
      },
      {
        id: 'bloc-rejoins',
        type: 'rejoins',
        props: {},
      },
      {
        id: 'bloc-aspirations',
        type: 'aspirations',
        props: {},
      },
      {
        id: 'bloc-vision',
        type: 'vision',
        props: {},
      },
      {
        id: 'bloc-activities',
        type: 'activities',
        props: {},
      },
      {
        id: 'bloc-nousRejoindre',
        type: 'nousRejoindre',
        props: {},
      },
      {
        id: 'bloc-contact',
        type: 'contact',
        props: {},
      },
    ],
  },
  // Fixture de test : un bloc de chaque type + 3 animations wrapper distinctes.
  // Sert aux tests « tous les blocs rendent » et « système d'animation ».
  'test-blocks': {
    blocks: [
      { id: 'tb-hero', type: 'hero', props: {} },
      { id: 'tb-bienvenue', type: 'bienvenue', props: {} },
      { id: 'tb-activities', type: 'activities', props: {} },
      { id: 'tb-textImage', type: 'textImage', props: { title: 'Texte + image', image: '/test-img.gif' } },
      { id: 'tb-rejoins', type: 'rejoins', props: {} },
      { id: 'tb-aspirations', type: 'aspirations', props: {} },
      { id: 'tb-contact', type: 'contact', props: {} },
      { id: 'tb-nousRejoindre', type: 'nousRejoindre', props: {} },
      { id: 'tb-richText', type: 'richText', props: { content: '<h2>Bloc richText animé</h2><p>Contenu de démonstration.</p>', animation: 'fadeIn' } },
      { id: 'tb-gallery', type: 'gallery', props: { images: [{ src: '/test-img.gif', alt: 'a' }, { src: '/test-img.gif', alt: 'b' }], animation: 'slideLeft' } },
      { id: 'tb-spacer', type: 'spacer', props: { height: 40 } },
      { id: 'tb-youtube', type: 'youtube', props: { videoId: 'wZebQj0gR98', title: 'Démo' } },
      { id: 'tb-vision', type: 'vision', props: {} },
      { id: 'tb-fullWidthImage', type: 'fullWidthImage', props: { image: '/test-img.gif', animation: 'portal' } },
      { id: 'tb-footer', type: 'footer', props: {} },
    ],
  },
}

export function getPageDoc(slug) {
  // Deep clone pour éviter mutations
  return JSON.parse(JSON.stringify(PAGES[slug] || { blocks: [] }))
}

export function resetMock() {
  const accueilBlocks = [
    { id: 'bloc-hero', type: 'hero', props: {} },
    { id: 'bloc-bienvenue', type: 'bienvenue', props: {} },
    { id: 'bloc-rejoins', type: 'rejoins', props: {} },
    { id: 'bloc-aspirations', type: 'aspirations', props: {} },
    { id: 'bloc-vision', type: 'vision', props: {} },
    { id: 'bloc-activities', type: 'activities', props: {} },
    { id: 'bloc-nousRejoindre', type: 'nousRejoindre', props: {} },
    { id: 'bloc-contact', type: 'contact', props: {} },
  ]
  PAGES = {
    'event-list': {
      blocks: [
        {
          id: 'block-hero',
          type: 'hero',
          props: {
            overlayText: 'Événements à venir',
            overlay: true,
          },
        },
        {
          id: 'block-text-img',
          type: 'textImage',
          props: {
            title: 'Un texte de présentation avec un Drag & Drop possible.',
            image: '/test-img.gif',
          },
        },
        {
          id: 'block-spacer',
          type: 'spacer',
          props: { height: 25 },
        },
      ],
    },
    accueil: { blocks: accueilBlocks },
  }
}

export function getPages() {
  return PAGES
}

// Permet d’enregistrer un nouvel état de page (écrase pour test undo/redo)
export async function setPageDoc(slug, data) {
  PAGES[slug] = JSON.parse(JSON.stringify(data))
  return { success: true }
}
