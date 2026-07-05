import { getFirestoreConfig, getAccessToken, getFirestoreDoc, setFirestoreDoc, parseFirestoreDoc } from '../../utils/firebase'
import { requireAdmin } from '../../utils/firebase-admin'

export default defineEventHandler(async (event) => {
  // En mode test, écrit dans le mock RAM — jamais dans la vraie base
  const isTest = process.env.NODE_ENV === 'test' || process.env.PW_TEST === '1' || process.env.TEST_ENV === '1'
  if (isTest) {
    const { setPageDoc } = await import('../../utils/firestore-mock.js')
    const slug = getRouterParam(event, 'slug')
    const body = await readBody(event)
    if (!slug || !body?.blocks) {
      throw createError({ statusCode: 400, message: 'Données invalides' })
    }
    await setPageDoc(slug, { blocks: body.blocks })
    return { success: true }
  }

  const config = getFirestoreConfig(event)
  if (!config) {
    throw createError({ statusCode: 500, message: 'Firestore non configuré' })
  }

  const userInfo = await requireAdmin(event)

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

    // 3. Écrire les nouveaux blocks — updateMask pour ne pas effacer
    // title/createdAt (un PATCH sans mask remplace tout le document)
    const update: Record<string, any> = {
      blocks: body.blocks,
      updatedAt: new Date().toISOString(),
      updatedBy: userEmail,
    }
    const mask = ['blocks', 'updatedAt', 'updatedBy']
    if (typeof body.title === 'string' && body.title.trim()) {
      update.title = body.title.trim()
      mask.push('title')
    }
    await setFirestoreDoc(config.projectId, accessToken, 'pages', slug, update, mask)

    return { success: true }
  } catch (err: any) {
    console.error('Page save error:', err)
    throw createError({ statusCode: 500, message: `Erreur lors de la sauvegarde: ${err.message || err}` })
  }
})
