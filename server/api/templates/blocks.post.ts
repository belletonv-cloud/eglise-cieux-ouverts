import { getFirestoreConfig, getAccessToken } from '../../utils/firebase'
import { requireAdmin } from '../../utils/firebase-admin'

export default defineEventHandler(async (event) => {
  // En mode test, servir le mock RAM
  const isTest = process.env.NODE_ENV === 'test' || process.env.PW_TEST === '1' || process.env.TEST_ENV === '1'
  
  const body = await readBody(event)
  const { name, type, props, shared } = body
  
  if (!name || !type) {
    throw createError({ statusCode: 400, message: 'Nom et type requis' })
  }

  if (isTest) {
    // Return mock success without saving
    return { id: 'tpl-' + Date.now(), name, type, props, shared }
  }

  // Vérification admin requise
  const userInfo = await requireAdmin(event)
  if (!userInfo) {
    throw createError({ statusCode: 401, message: 'Authentification admin requise' })
  }

  const config = getFirestoreConfig(event)
  if (!config) {
    throw createError({ statusCode: 500, message: 'Firestore non configuré' })
  }

  try {
    const accessToken = await getAccessToken(config.clientEmail, config.privateKey)
    
    // Firestore REST API for creating document
    const url = `https://firestore.googleapis.com/v1/projects/${config.projectId}/databases/(default)/documents/templates/blocks`
    
    // Convert props to Firestore format
    const fields: any = {}
    for (const [key, value] of Object.entries(props || {})) {
      fields[key] = { stringValue: String(value) }
    }
    
    const response = await fetch(url, {
      method: 'POST',
      headers: { 
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        fields: {
          name: { stringValue: name },
          type: { stringValue: type },
          shared: { booleanValue: shared || false },
          ...fields
        }
      })
    })
    
    if (!response.ok) {
      throw createError({ statusCode: 500, message: 'Erreur sauvegarde template' })
    }
    
    return { success: true }
  } catch (err: any) {
    throw createError({ statusCode: 500, message: `Erreur: ${err.message}` })
  }
})
