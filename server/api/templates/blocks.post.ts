import { getFirestoreConfig, getAccessToken } from '../../utils/firebase'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const { name, type, props, shared } = body
  
  if (!name || !type) {
    throw createError({ statusCode: 400, message: 'Nom et type requis' })
  }

  const isTest = process.env.NODE_ENV === 'test' || process.env.PW_TEST === '1' || process.env.TEST_ENV === '1'
  if (isTest) {
    return { id: 'tpl-' + Date.now(), name, type, props, shared }
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
