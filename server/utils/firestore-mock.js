// /server/utils/firestore-mock.js

// Memo en RAM pour simuler la persistance (reset à chaque test run)
let PAGES = {
  'event-list': {
    blocks: [
      {
        id: 'block-hero',
        type: 'hero',
        props: {
          title: 'Événements à venir',
          subtitle: 'Voici nos prochains rendez-vous !',
        },
      },
      {
        id: 'block-text-img',
        type: 'textImage',
        props: {
          text: 'Un texte de présentation avec un Drag & Drop possible.',
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
        props: { text: 'Accueil : test admin.', image: '/test.png' },
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
            title: 'Événements à venir',
            subtitle: 'Voici nos prochains rendez-vous !',
          },
        },
        {
          id: 'block-text-img',
          type: 'textImage',
          props: {
            text: 'Un texte de présentation avec un Drag & Drop possible.',
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
          props: { text: 'Accueil : test admin.', image: '/test.png' },
        },
      ],
    },
  }
}

// Permet d’enregistrer un nouvel état de page (écrase pour test undo/redo)
export async function setPageDoc(slug, data) {
  PAGES[slug] = JSON.parse(JSON.stringify(data))
  return { success: true }
}
