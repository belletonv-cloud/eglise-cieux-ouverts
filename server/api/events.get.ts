// GET — liste les événements custom (billetterie)
export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig(event)
  const projectId = process.env.NUXT_FIREBASE_PROJECT_ID || config.firebaseProjectId
  const clientEmail = process.env.NUXT_FIREBASE_CLIENT_EMAIL || config.firebaseClientEmail
  const privateKey = process.env.NUXT_FIREBASE_PRIVATE_KEY || config.firebasePrivateKey

  if (!projectId || !clientEmail || !privateKey) {
    throw createError({ statusCode: 503, statusMessage: 'Configuration Firestore incomplète.' })
  }

  try {
    const { getAccessToken } = await import('../utils/firebase')
    const accessToken = await getAccessToken(clientEmail, privateKey)

    const url = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents:runQuery`
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        authorization: `Bearer ${accessToken}`,
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        structuredQuery: {
          from: [{ collectionId: 'events' }],
          orderBy: [
            { field: { fieldPath: 'date' }, direction: 'ASCENDING' },
          ],
        },
      }),
    })

    if (!response.ok) {
      const text = await response.text()
      throw new Error(`Firestore error: ${text}`)
    }

    const data = await response.json()
    const events = (data || [])
      .filter((item: any) => item.document)
      .map((item: any) => {
        const doc = item.document
        const fields = doc.fields || {}
        return {
          id: doc.name.split('/').pop(),
          titre: fields.title?.stringValue || '',
          date: fields.date?.timestampValue || null,
          heure: fields.time?.stringValue || null,
          lieu: fields.location?.stringValue || null,
          description: fields.description?.stringValue || null,
          image_url: fields.image_url?.stringValue || null,
          billetterie: fields.billetterie_url?.stringValue || null,
          emoji: fields.emoji?.stringValue || null,
        }
      })

    return { events }
  } catch (err) {
    console.error('Events list error:', err)
    throw createError({ statusCode: 500, statusMessage: 'Erreur lors du chargement des événements.' })
  }
})
