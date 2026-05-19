// POST — crée, met à jour ou supprime un événement
export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig(event)
  const projectId = process.env.NUXT_FIREBASE_PROJECT_ID || config.firebaseProjectId
  const clientEmail = process.env.NUXT_FIREBASE_CLIENT_EMAIL || config.firebaseClientEmail
  const privateKey = process.env.NUXT_FIREBASE_PRIVATE_KEY || config.firebasePrivateKey

  if (!projectId || !clientEmail || !privateKey) {
    throw createError({ statusCode: 503, statusMessage: 'Configuration Firestore incomplète.' })
  }

  const body = await readBody(event)
  const { action, id, ...data } = body

  if (!action) {
    throw createError({ statusCode: 400, statusMessage: 'Action requise.' })
  }

  try {
    const { getAccessToken } = await import('../utils/firebase')
    const accessToken = await getAccessToken(clientEmail, privateKey)
    const baseUrl = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/events`

    if (action === 'delete' && id) {
      const url = `${baseUrl}/${id}`
      const response = await fetch(url, {
        method: 'DELETE',
        headers: { authorization: `Bearer ${accessToken}` },
      })
      if (!response.ok) {
        const text = await response.text()
        throw new Error(`Firestore error: ${text}`)
      }
      return { success: true }
    }

    // Build Firestore document
    const fields: Record<string, any> = {}
    if (data.title) fields.title = { stringValue: data.title }
    if (data.date) fields.date = { timestampValue: new Date(data.date).toISOString() }
    if (data.time) fields.time = { stringValue: data.time }
    if (data.location) fields.location = { stringValue: data.location }
    if (data.description) fields.description = { stringValue: data.description }
    if (data.image_url) fields.image_url = { stringValue: data.image_url }
    if (data.billetterie_url) fields.billetterie_url = { stringValue: data.billetterie_url }
    if (data.emoji) fields.emoji = { stringValue: data.emoji }

    if (action === 'create') {
      const url = baseUrl
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          authorization: `Bearer ${accessToken}`,
          'content-type': 'application/json',
        },
        body: JSON.stringify({ fields }),
      })
      if (!response.ok) {
        const text = await response.text()
        throw new Error(`Firestore error: ${text}`)
      }
      const result = await response.json()
      return { success: true, id: result.name.split('/').pop() }
    }

    if (action === 'update' && id) {
      const url = `${baseUrl}/${id}`
      const response = await fetch(url, {
        method: 'PATCH',
        headers: {
          authorization: `Bearer ${accessToken}`,
          'content-type': 'application/json',
        },
        body: JSON.stringify({ fields }),
      })
      if (!response.ok) {
        const text = await response.text()
        throw new Error(`Firestore error: ${text}`)
      }
      return { success: true }
    }

    throw createError({ statusCode: 400, statusMessage: 'Action invalide.' })
  } catch (err) {
    console.error('Event update error:', err)
    throw createError({ statusCode: 500, statusMessage: 'Erreur lors de la mise à jour de l\'événement.' })
  }
})
