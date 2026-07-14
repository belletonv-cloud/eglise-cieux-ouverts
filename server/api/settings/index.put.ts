import { getFirestoreConfig, getAccessToken, setFirestoreDoc } from '../../utils/firebase'
import { requireAdmin } from '../../utils/firebase-admin'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const isTest = process.env.NODE_ENV === 'test' || process.env.PW_TEST === '1' || process.env.TEST_ENV === '1'

  if (isTest) {
    const { setSettings } = await import('../../utils/firestore-mock.js')
    setSettings({ contactEmail: body?.contactEmail || '', hideEventsPageIfEmpty: body?.hideEventsPageIfEmpty === true })
    return { ok: true }
  }

  const config = getFirestoreConfig(event)
  if (!config) {
    throw createError({ statusCode: 500, message: 'Firestore non configuré' })
  }

  await requireAdmin(event)

  if (!body?.contactEmail) {
    throw createError({ statusCode: 400, message: 'contactEmail requis' })
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(body.contactEmail)) {
    throw createError({ statusCode: 400, message: 'Email invalide' })
  }

  const hideEventsPageIfEmpty = body.hideEventsPageIfEmpty === true // par défaut false (toujours visible)

  try {
    const accessToken = await getAccessToken(config.clientEmail, config.privateKey)
    await setFirestoreDoc(config.projectId, accessToken, 'settings', 'config', {
      contactEmail: body.contactEmail,
      hideEventsPageIfEmpty: hideEventsPageIfEmpty,
      updatedAt: new Date().toISOString(),
    })
    return { ok: true }
  } catch (err: any) {
    console.error('Settings update error:', err)
    throw createError({ statusCode: 500, message: `Erreur: ${err.message || err}` })
  }
})
