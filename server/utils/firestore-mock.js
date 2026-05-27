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
