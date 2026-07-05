import { getFirestoreConfig, getAccessToken, getFirestoreDoc, setFirestoreDoc, parseFirestoreDoc } from '../../../../utils/firebase'
import { requireAdmin } from '../../../../utils/firebase-admin'

export default defineEventHandler(async (event) => {
  const config = getFirestoreConfig(event)
  if (!config) {
    throw createError({ statusCode: 500, message: 'Firestore non configuré' })
  }

  const userInfo = await requireAdmin(event)

  const slug = getRouterParam(event, 'slug')
  const versionId = getRouterParam(event, 'versionId')
  if (!slug || !versionId) {
    throw createError({ statusCode: 400, message: 'Paramètres manquants' })
  }

  try {
    const accessToken = await getAccessToken(config.clientEmail, config.privateKey)

    // Lire la version à restaurer
    const versionDoc = await getFirestoreDoc(config.projectId, accessToken, 'pages', `${slug}/versions/${versionId}`)
    if (!versionDoc) {
      throw createError({ statusCode: 404, message: 'Version introuvable' })
    }

    const versionParsed = parseFirestoreDoc(versionDoc)
    if (!versionParsed?.blocks) {
      throw createError({ statusCode: 400, message: 'Version invalide' })
    }

    // Lire le document actuel pour le sauvegarder comme version
    const currentDoc = await getFirestoreDoc(config.projectId, accessToken, 'pages', slug)
    const currentParsed = currentDoc ? parseFirestoreDoc(currentDoc) : null

    if (currentParsed?.blocks) {
      const newVersionId = String(Date.now())
      await setFirestoreDoc(config.projectId, accessToken, 'pages', `${slug}/versions/${newVersionId}`, {
        blocks: currentParsed.blocks,
        savedAt: new Date().toISOString(),
        savedBy: userInfo.email || 'restauration',
      })
    }

    // Écrire les blocks restaurés — updateMask pour préserver title/createdAt
    await setFirestoreDoc(config.projectId, accessToken, 'pages', slug, {
      blocks: versionParsed.blocks,
      updatedAt: new Date().toISOString(),
      updatedBy: userInfo.email || 'restauration',
    }, ['blocks', 'updatedAt', 'updatedBy'])

    return { success: true, blocks: versionParsed.blocks }
  } catch (err: any) {
    console.error('Version restore error:', err)
    throw createError({ statusCode: 500, message: `Erreur lors de la restauration: ${err.message || err}` })
  }
})
