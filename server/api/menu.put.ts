import { getFirestoreConfig, getAccessToken, setFirestoreDoc } from '../utils/firebase'
import { requireAdmin } from '../utils/firebase-admin'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  if (!body || !Array.isArray(body.menuItems)) {
    throw createError({ statusCode: 400, message: 'Données invalides' })
  }

  // En mode test, écrit dans le mock RAM — jamais dans la vraie base
  const isTest = process.env.NODE_ENV === 'test' || process.env.PW_TEST === '1' || process.env.TEST_ENV === '1'
  if (isTest) {
    const { setMenuMock } = await import('../utils/firestore-mock.js')
    await setMenuMock({
      menuItems: body.menuItems,
      menuBgImage: body.menuBgImage || '',
      updatedAt: new Date().toISOString(),
    })
    return { success: true }
  }

  const config = getFirestoreConfig(event)
  if (!config) {
    throw createError({ statusCode: 500, message: 'Firestore non configuré' })
  }

  await requireAdmin(event)

  try {
    const accessToken = await getAccessToken(config.clientEmail, config.privateKey)
    await setFirestoreDoc(config.projectId, accessToken, 'settings', 'menu', {
      menuItems: body.menuItems,
      menuBgImage: body.menuBgImage || '',
      updatedAt: new Date().toISOString(),
    })
    return { success: true }
  } catch (err: any) {
    throw createError({ statusCode: 500, message: `Erreur sauvegarde menu: ${err.message || err}` })
  }
})
