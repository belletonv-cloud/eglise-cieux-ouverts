import { getFirestoreConfig, getAccessToken, getFirestoreDoc, setFirestoreDoc, parseFirestoreDoc } from '../../../../utils/firebase'

export default defineEventHandler(async (event) => {
  const config = getFirestoreConfig(event)
  if (!config) {
    throw createError({ statusCode: 500, message: 'Firestore non configuré' })
  }

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
        savedBy: 'restauration',
      })
    }

    // Écrire les blocks restaurés
    await setFirestoreDoc(config.projectId, accessToken, 'pages', slug, {
      blocks: versionParsed.blocks,
      updatedAt: new Date().toISOString(),
      updatedBy: 'restauration',
    })

    return { success: true, blocks: versionParsed.blocks }
  } catch (err: any) {
    console.error('Version restore error:', err)
    throw createError({ statusCode: 500, message: `Erreur lors de la restauration: ${err.message || err}` })
  }
})
