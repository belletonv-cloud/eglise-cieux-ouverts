// POST /api/admin/restore-accueil - restaure la page accueil depuis le fichier backup
// Utilise les credentials Firestore serveur (pas de token client requis)
import { getFirestoreConfig, getAccessToken, setFirestoreDoc, getFirestoreDoc, parseFirestoreDoc } from '../../utils/firebase'

export default defineEventHandler(async (event) => {
  const config = getFirestoreConfig(event)
  if (!config) {
    throw createError({ statusCode: 500, message: 'Firestore non configuré' })
  }

  // Auth serveur uniquement - vérifie les credentials
  const projectId = process.env.NUXT_FIREBASE_PROJECT_ID
  if (!projectId) {
    throw createError({ statusCode: 500, message: 'Credentials serveur manquants' })
  }

  try {
    const accessToken = await getAccessToken(config.clientEmail, config.privateKey)
    
    // Récupérer le body avec les blocs (ou utiliser un backup stocké)
    const body = await readBody(event)
    const blocks = body?.blocks || body
    
    if (!blocks?.length) {
      throw createError({ statusCode: 400, message: 'Blocs manquants' })
    }

    // Lire le document actuel
    const currentDoc = await getFirestoreDoc(config.projectId, accessToken, 'pages', 'accueil')
    const currentParsed = currentDoc ? parseFirestoreDoc(currentDoc) : null

    // Sauvegarder l'état actuel comme version
    if (currentParsed && currentParsed.blocks) {
      const oldJson = JSON.stringify(currentParsed.blocks)
      const newJson = JSON.stringify(blocks)
      if (oldJson !== newJson) {
        const backupId = String(Date.now())
        await setFirestoreDoc(config.projectId, accessToken, 'pages', `accueil/versions/${backupId}`, {
          blocks: currentParsed.blocks,
          savedAt: new Date().toISOString(),
          savedBy: 'restore-script',
        })
      }
    }

    // Écrire les nouveaux blocs
    await setFirestoreDoc(config.projectId, accessToken, 'pages', 'accueil', {
      blocks: blocks,
      updatedAt: new Date().toISOString(),
      updatedBy: 'restore-script',
    })

    return { success: true }
  } catch (err: any) {
    console.error('Restore error:', err)
    throw createError({ statusCode: 500, message: `Erreur: ${err.message || err}` })
  }
})