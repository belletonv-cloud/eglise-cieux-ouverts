// PUT /api/pages/[slug]/versions/[versionId] - restore a version
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
  
  if (!slug) {
    throw createError({ statusCode: 400, message: 'Slug manquant' })
  }
  if (!versionId) {
    throw createError({ statusCode: 400, message: 'Version ID manquant' })
  }

  try {
    const accessToken = await getAccessToken(config.clientEmail, config.privateKey)

    // 1. Récupérer la version à restaurer
    const versionDoc = await getFirestoreDoc(config.projectId, accessToken, 'pages', `${slug}/versions/${versionId}`)
    if (!versionDoc) {
      throw createError({ statusCode: 404, message: 'Version introuvable' })
    }

    const versionData = parseFirestoreDoc(versionDoc)
    if (!versionData?.blocks) {
      throw createError({ statusCode: 400, message: 'Version vide ou corrompue' })
    }

    // 2. Lire le document actuel pour sauvegarder dans l'historique
    const currentDoc = await getFirestoreDoc(config.projectId, accessToken, 'pages', slug)
    const currentParsed = currentDoc ? parseFirestoreDoc(currentDoc) : null

    // 3. Sauvegarder l'état actuel comme nouvelle version (si différent)
    if (currentParsed && currentParsed.blocks) {
      const oldJson = JSON.stringify(currentParsed.blocks)
      const newJson = JSON.stringify(versionData.blocks)
      if (oldJson !== newJson) {
        const backupId = String(Date.now())
        await setFirestoreDoc(config.projectId, accessToken, 'pages', `${slug}/versions/${backupId}`, {
          blocks: currentParsed.blocks,
          savedAt: new Date().toISOString(),
          savedBy: userInfo?.email || 'admin@inconnu',
        })
      }
    }

    // 4. Restaurer la version
    const update = {
      blocks: versionData.blocks,
      updatedAt: new Date().toISOString(),
      updatedBy: userInfo?.email || 'admin@inconnu',
      title: versionData.title || currentParsed?.title || undefined,
    }
    const mask = ['blocks', 'updatedAt', 'updatedBy']
    if (update.title) mask.push('title')

    await setFirestoreDoc(config.projectId, accessToken, 'pages', slug, update, mask)

    // Retourner les blocs pour que le frontend puisse les mettre à jour
    return { success: true, blocks: versionData.blocks }
  } catch (err: any) {
    console.error('Restore error:', err)
    throw createError({ statusCode: 500, message: `Erreur lors de la restauration: ${err.message || err}` })
  }
})