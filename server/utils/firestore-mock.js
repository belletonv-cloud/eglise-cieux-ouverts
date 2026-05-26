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
        id: 'bloc-acc-01',
        type: 'textImage',
        props: { title: 'Accueil : test admin.', image: '/test.png' },
      },
      {
        id: 'bloc-bienvenue',
        type: 'bienvenue',
        props: {
          title: 'BIENVENUE',
          subtitle: "à l'Église Cieux Ouverts à Morlaix",
          backgroundColor: '#ffffff',
          textColor: '#1a1a2e',
          fontSize: 7,
        },
      },
      {
        id: 'bloc-aspirations',
        type: 'aspirations',
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
    accueil: {
      blocks: [
        {
          id: 'bloc-acc-01',
          type: 'textImage',
          props: { title: 'Accueil : test admin.', image: '/test.png' },
        },
        {
          id: 'bloc-bienvenue',
          type: 'bienvenue',
          props: {
            title: 'BIENVENUE',
            subtitle: "à l'Église Cieux Ouverts à Morlaix",
            backgroundColor: '#ffffff',
            textColor: '#1a1a2e',
            fontSize: 7,
          },
        },
        {
          id: 'bloc-aspirations',
          type: 'aspirations',
          props: {},
        },
      ],
    },
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
