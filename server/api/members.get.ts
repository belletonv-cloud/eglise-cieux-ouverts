import { getFirebaseToken } from '~/server/utils/firebase-auth'

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig(event)
  const apiUrl = config.public.apiUrl || 'https://eglise-app.belletonv.workers.dev'

  // Récupérer le token Firebase de la requête
  const auth = getRequestHeader(event, 'Authorization') || ''
  if (!auth.startsWith('Bearer ')) {
    throw createError({ statusCode: 401, message: 'Non authentifié' })
  }

  const token = auth.slice(7)

  // Paramètres de pagination et filtrage
  const query = getQuery(event)
  const page = query.page || '1'
  const size = Math.min(parseInt(query.size as string) || 25, 100)
  const q = query.q || ''
  const teamId = query.teamId || query.team_id || ''

  try {
    // Proxy l'appel à eglise-app/api/members
    const params = new URLSearchParams({
      page: String(page),
      size: String(size),
      ...(q && { q: String(q) }),
      ...(teamId && { teamId: String(teamId) }),
    })

    const response = await fetch(`${apiUrl}/api/members?${params.toString()}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      const error = await response.text()
      throw new Error(`eglise-app error ${response.status}: ${error}`)
    }

    const data = await response.json()
    return data
  } catch (err: any) {
    console.error('Members API error:', err)
    throw createError({
      statusCode: 500,
      message: `Erreur lors du chargement des membres: ${err.message || err}`
    })
  }
})
