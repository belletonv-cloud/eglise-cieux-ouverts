import { getFirestoreConfig, getAccessToken, setFirestoreDoc } from '../../utils/firebase'
import { requireAdmin } from '../../utils/firebase-admin'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  if (!body?.pageSlug || !body?.blockId || !body?.message?.trim()) {
    throw createError({ statusCode: 400, message: 'Données manquantes' })
  }

  const id = crypto.randomUUID()
  const doc = {
    pageSlug: body.pageSlug,
    blockId: body.blockId,
    blockType: body.blockType || '',
    blockLabel: body.blockLabel || '',
    message: body.message.trim(),
    resolved: false,
    resolvedAt: null,
    resolvedBy: null,
  }

  const isTest = process.env.NODE_ENV === 'test' || process.env.PW_TEST === '1' || process.env.TEST_ENV === '1'
  if (isTest) {
    const { setComment } = await import('../../utils/firestore-mock.js')
    const full = { id, ...doc, createdAt: new Date().toISOString(), createdBy: 'test' }
    setComment(id, full)
    return { success: true, comment: full }
  }

  const config = getFirestoreConfig(event)
  if (!config) {
    throw createError({ statusCode: 500, message: 'Firestore non configuré' })
  }

  const userInfo = await requireAdmin(event)

  try {
    const accessToken = await getAccessToken(config.clientEmail, config.privateKey)
    const full = { ...doc, createdAt: new Date().toISOString(), createdBy: userInfo.email || 'inconnu' }
    await setFirestoreDoc(config.projectId, accessToken, 'comments', id, full)
    return { success: true, comment: { id, ...full } }
  } catch (err: any) {
    console.error('Comment create error:', err)
    throw createError({ statusCode: 500, message: `Erreur lors de la création: ${err.message || err}` })
  }
})
