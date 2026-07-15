import { getFirestoreConfig, getAccessToken } from '../../utils/firebase'

export default defineEventHandler(async (event) => {
  const isTest = process.env.NODE_ENV === 'test' || process.env.PW_TEST === '1' || process.env.TEST_ENV === '1'
  if (isTest) {
    return [
      { id: 'tpl-page-1', name: 'Page événement', slug: 'event-list', blocks: [] },
      { id: 'tpl-page-2', name: 'Page contact', slug: 'contact', blocks: [] }
    ]
  }

  const config = getFirestoreConfig(event)
  if (!config) {
    throw createError({ statusCode: 500, message: 'Firestore non configuré' })
  }

  try {
    const accessToken = await getAccessToken(config.clientEmail, config.privateKey)
    const url = `https://firestore.googleapis.com/v1/projects/${config.projectId}/databases/(default)/documents/templates/pages`
    const response = await fetch(`${url}?pageSize=100`, {
      headers: { Authorization: `Bearer ${accessToken}` }
    })
    
    if (!response.ok) {
      throw createError({ statusCode: 500, message: 'Erreur templates pages' })
    }
    
    const data = await response.json()
    const templates = (data.documents || []).map((doc: any) => ({
      id: doc.name.split('/').pop(),
      ...doc.fields
    }))
    return templates
  } catch (err: any) {
    throw createError({ statusCode: 500, message: `Erreur templates pages: ${err.message}` })
  }
})
