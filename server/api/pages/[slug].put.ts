import { getFirestoreConfig, getAccessToken, getFirestoreDoc, setFirestoreDoc, parseFirestoreDoc } from '../../utils/firebase'
import { verifyFirebaseToken, isUserAdmin } from '../../utils/firebase-admin'

export default defineEventHandler(async (event) => {
  const config = getFirestoreConfig(event)
  if (!config) {
    throw createError({ statusCode: 500, message: 'Firestore non configuré' })
  }

  // Vérifier que l'utilisateur est admin
  const authHeader = getHeader(event, 'authorization')
  if (!authHeader?.startsWith('Bearer ')) {
    throw createError({ statusCode: 401, message: 'Non authentifié' })
  }
  const userInfo = await verifyFirebaseToken(authHeader.slice(7))
  if (!userInfo) {
    throw createError({ statusCode: 401, message: 'Token invalide' })
  }
  if (!await isUserAdmin(event, userInfo.uid)) {
    throw createError({ statusCode: 403, message: 'Accès refusé' })
  }

  const slug = getRouterParam(event, 'slug')
  if (!slug) {
    throw createError({ statusCode: 400, message: 'Slug manquant' })
  }

  const body = await readBody(event)
  if (!body || !body.blocks) {
    throw createError({ statusCode: 400, message: 'Données invalides' })
  }

  const userEmail = userInfo.email || 'admin@inconnu'

  try {
    const accessToken = await getAccessToken(config.clientEmail, config.privateKey)

    // 1. Lire le document actuel pour l'historique
    const currentDoc = await getFirestoreDoc(config.projectId, accessToken, 'pages', slug)
    const currentParsed = currentDoc ? parseFirestoreDoc(currentDoc) : null

    // 2. Si le document existe et que les blocks ont changé, sauvegarder la version
    if (currentParsed && currentParsed.blocks) {
      const oldJson = JSON.stringify(currentParsed.blocks)
      const newJson = JSON.stringify(body.blocks)
      if (oldJson !== newJson) {
        const versionId = String(Date.now())
        await setFirestoreDoc(config.projectId, accessToken, 'pages', `${slug}/versions/${versionId}`, {
          blocks: currentParsed.blocks,
          savedAt: new Date().toISOString(),
          savedBy: userEmail,
        })
      }
    }

    // 3. Écrire les nouveaux blocks
    await setFirestoreDoc(config.projectId, accessToken, 'pages', slug, {
      blocks: body.blocks,
      updatedAt: new Date().toISOString(),
      updatedBy: userEmail,
    })

    return { success: true }
  } catch (err: any) {
    console.error('Page save error:', err)
    throw createError({ statusCode: 500, message: `Erreur lors de la sauvegarde: ${err.message || err}` })
  }
})
