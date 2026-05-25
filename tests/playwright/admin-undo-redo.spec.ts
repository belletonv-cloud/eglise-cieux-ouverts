import { test, expect } from './fixtures/global'

test.describe('Admin undo/redo E2E complet', () => {
  test.beforeEach(async ({ resetMock }) => {
    await resetMock()
  })

  test('Undo/Redo intégral sur mock', async ({ adminLogin, getSnapshot, expectOrder, moveBlock, editBlock, undo, redo }) => {
    const page = adminLogin

    // Vérif état initial (ordre, titre, Firestore)
    await expectOrder(['block-hero', 'block-text-img', 'block-spacer'])
    let snapshot = await getSnapshot()
    expect(snapshot.blocks.length).toBe(3)
    expect(snapshot.blocks[0].id).toBe('block-hero')

    // 1. Move: block-text-img devant block-hero
    await moveBlock(1, 0)
    await expectOrder(['block-text-img', 'block-hero', 'block-spacer'])
    snapshot = await getSnapshot()
    expect(snapshot.blocks[0].id).toBe('block-text-img')

    // 2. Modif titre du 2e bloc
    await editBlock('block-hero', { title: 'Titre modifié' })
    snapshot = await getSnapshot()
    expect(snapshot.blocks[1].props.title).toBe('Titre modifié')

    // 3. Undo (modif titre)
    await undo()
    await expectOrder(['block-text-img', 'block-hero', 'block-spacer'])
    snapshot = await getSnapshot()
    expect(snapshot.blocks[1].props.title).toBe('Événements à venir')

    // 4. Undo (move)
    await undo()
    await expectOrder(['block-hero', 'block-text-img', 'block-spacer'])
    snapshot = await getSnapshot()
    expect(snapshot.blocks[0].id).toBe('block-hero')

    // 5. Redo (move)
    await redo()
    await expectOrder(['block-text-img', 'block-hero', 'block-spacer'])
    snapshot = await getSnapshot()
    expect(snapshot.blocks[0].id).toBe('block-text-img')

    // 6. Redo (modif titre)
    await redo()
    await expectOrder(['block-text-img', 'block-hero', 'block-spacer'])
    snapshot = await getSnapshot()
    expect(snapshot.blocks[1].props.title).toBe('Titre modifié')
  })
})
