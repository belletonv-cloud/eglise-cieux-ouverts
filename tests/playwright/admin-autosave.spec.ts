import { test, expect } from './fixtures/global'

test.describe('Admin auto-save E2E', () => {
  test.beforeEach(async ({ resetMock }) => {
    await resetMock()
  })

  test('Auto-save et feedback visuel', async ({ adminLogin, getSnapshot, editBlock, waitForAutosave }) => {
    // État initial : vérif titre d'origine
    let snapshot = await getSnapshot()
    expect(snapshot.blocks[0].props.title).toBe('Événements à venir')

    // Modifie le titre du premier bloc
    await editBlock('block-hero', { title: 'Auto-save à fond !' })

    // Attend que le feedback auto-sauvegardé apparaisse
    await waitForAutosave()

    // Attend un tout petit peu pour la synchro Firestore
    await new Promise(r => setTimeout(r, 100))

    // Vérifie effet dans le mock Firestore
    snapshot = await getSnapshot()
    expect(snapshot.blocks[0].props.title).toBe('Auto-save à fond !')
  })
})
