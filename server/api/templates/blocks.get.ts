import { getFirestoreConfig, getAccessToken } from '../../utils/firebase'

export default defineEventHandler(async (event) => {
  const isTest = process.env.NODE_ENV === 'test' || process.env.PW_TEST === '1' || process.env.TEST_ENV === '1'
  if (isTest) {
    // Return mock templates in test mode
    return [
      { id: 'tpl-1', name: 'Témoignage simple', type: 'textImage', props: {} },
      { id: 'tpl-2', name: 'Événement', type: 'activities', props: {} }
    ]
  }

  const config = getFirestoreConfig(event)
  if (!config) {
    throw createError({ statusCode: 500, message: 'Firestore non configuré' })
  }

  try {
    const accessToken = await getAccessToken(config.clientEmail, config.privateKey)
    // Firestore REST API for templates collection
    const url = `https://firestore.googleapis.com/v1/projects/${config.projectId}/databases/(default)/documents/templates/blocks`
    const response = await fetch(`${url}?pageSize=100`, {
      headers: { Authorization: `Bearer ${accessToken}` }
    })
    
    if (!response.ok) {
      throw createError({ statusCode: 500, message: 'Erreur templates' })
    }
    
    const data = await response.json()
    const templates = (data.documents || []).map((doc: any) => ({
      id: doc.name.split('/').pop(),
      ...doc.fields
    }))
    return templates
  } catch (err: any) {
    throw createError({ statusCode: 500, message: `Erreur templates: ${err.message}` })
  }
})
