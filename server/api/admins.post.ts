// POST — ajoute ou supprime un admin
export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig(event)
  const projectId = process.env.NUXT_FIREBASE_PROJECT_ID || config.firebaseProjectId
  const clientEmail = process.env.NUXT_FIREBASE_CLIENT_EMAIL || config.firebaseClientEmail
  const privateKey = process.env.NUXT_FIREBASE_PRIVATE_KEY || config.firebasePrivateKey

  if (!projectId || !clientEmail || !privateKey) {
    throw createError({ statusCode: 503, statusMessage: 'Configuration Firestore incomplète.' })
  }

  const body = await readBody(event)
  const { action, email } = body

  if (!action || !email) {
    throw createError({ statusCode: 400, statusMessage: 'Action et email requis.' })
  }

  try {
    const { getAccessToken, getFirestoreDoc, parseFirestoreDoc } = await import('../utils/firebase')
    const accessToken = await getAccessToken(clientEmail, privateKey)

    // Get current admins
    const doc = await getFirestoreDoc(accessToken, projectId, 'config', 'admins')
    let emails: string[] = []
    if (doc && doc.fields) {
      const parsed = parseFirestoreDoc(doc)
      emails = parsed?.emails || []
    }

    if (action === 'add') {
      if (!emails.includes(email)) {
        emails.push(email)
      }
    } else if (action === 'remove') {
      emails = emails.filter((e: string) => e !== email)
    } else {
      throw createError({ statusCode: 400, statusMessage: 'Action invalide.' })
    }

    // Save back to Firestore
    const url = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/config/admins`
    const response = await fetch(url, {
      method: 'PATCH',
      headers: {
        authorization: `Bearer ${accessToken}`,
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        fields: {
          emails: {
            arrayValue: {
              values: emails.map((e: string) => ({ stringValue: e })),
            },
          },
        },
      }),
    })

    if (!response.ok) {
      const text = await response.text()
      throw new Error(`Firestore error: ${text}`)
    }

    return { success: true, emails }
  } catch (err) {
    console.error('Admin update error:', err)
    throw createError({ statusCode: 500, statusMessage: 'Erreur lors de la mise à jour des admins.' })
  }
})
