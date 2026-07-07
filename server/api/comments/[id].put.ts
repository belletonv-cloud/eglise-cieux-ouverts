import { getFirestoreConfig, getAccessToken, setFirestoreDoc } from '../../utils/firebase'
import { requireAdmin } from '../../utils/firebase-admin'

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')
  if (!id) {
    throw createError({ statusCode: 400, message: 'Id manquant' })
  }
  const body = await readBody(event)
  const resolved = body?.resolved !== false

  const isTest = process.env.NODE_ENV === 'test' || process.env.PW_TEST === '1' || process.env.TEST_ENV === '1'
  if (isTest) {
    const { getComment, setComment } = await import('../../utils/firestore-mock.js')
    const current = getComment(id)
    if (!current) {
      throw createError({ statusCode: 404, message: 'Demande introuvable' })
    }
    const updated = {
      ...current,
      resolved,
      resolvedAt: resolved ? new Date().toISOString() : null,
      resolvedBy: resolved ? 'test' : null,
    }
    if (typeof body?.message === 'string' && body.message.trim()) {
      updated.message = body.message.trim()
    }
    setComment(id, updated)
    return { success: true, comment: updated }
  }

  const config = getFirestoreConfig(event)
  if (!config) {
    throw createError({ statusCode: 500, message: 'Firestore non configuré' })
  }

  const userInfo = await requireAdmin(event)

  try {
    const accessToken = await getAccessToken(config.clientEmail, config.privateKey)
    const update: Record<string, any> = {
      resolved,
      resolvedAt: resolved ? new Date().toISOString() : null,
      resolvedBy: resolved ? (userInfo.email || 'inconnu') : null,
    }
    const mask = ['resolved', 'resolvedAt', 'resolvedBy']
    if (typeof body?.message === 'string' && body.message.trim()) {
      update.message = body.message.trim()
      mask.push('message')
    }
    await setFirestoreDoc(config.projectId, accessToken, 'comments', id, update, mask)
    return { success: true }
  } catch (err: any) {
    console.error('Comment update error:', err)
    throw createError({ statusCode: 500, message: `Erreur lors de la mise à jour: ${err.message || err}` })
  }
})
