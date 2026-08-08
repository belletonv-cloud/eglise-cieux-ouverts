import { getFirestoreConfig, getAccessToken } from '../../utils/firebase'
import { BLOCK_TYPES } from '../../../utils/blockTypes.js'
import { fetchWithTimeout } from '../../utils/http'

export default defineEventHandler(async (event) => {
  const isTest = process.env.NODE_ENV === 'test' || process.env.PW_TEST === '1' || process.env.TEST_ENV === '1'
  if (isTest) {
    // Mock templates in test mode, derived from BLOCK_TYPES' built-in templates.
    // "blank" entries are skipped: the template picker always shows its own
    // hardcoded "Bloc vierge" card, so including them would duplicate it.
    const templates: any[] = []
    for (const [type, def] of Object.entries(BLOCK_TYPES)) {
      for (const tpl of (def as any).templates || []) {
        if (tpl.id === 'blank') continue
        templates.push({ id: `${type}-${tpl.id}`, name: tpl.label, type, props: { ...tpl.props } })
      }
    }
    return templates
  }

  const config = getFirestoreConfig(event)
  if (!config) {
    throw createError({ statusCode: 500, message: 'Firestore non configuré' })
  }

  try {
    const accessToken = await getAccessToken(config.clientEmail, config.privateKey)
    // Firestore REST API for templates collection
    const url = `https://firestore.googleapis.com/v1/projects/${config.projectId}/databases/(default)/documents/templates/blocks`
    const response = await fetchWithTimeout(`${url}?pageSize=100`, {
      headers: { Authorization: `Bearer ${accessToken}` }
    })
    
    // 404 = le document `templates/blocks` n'a jamais été créé, ce qui est
    // l'état NORMAL tant qu'aucun modèle n'a été enregistré (il naît au
    // premier POST). Le traiter en erreur serveur cassait le sélecteur de
    // modèles de l'admin tant qu'il était vide — constaté en production, où
    // GET /api/templates/blocks répondait 500. Une collection vide est une
    // liste vide, pas une panne.
    if (response.status === 404) {
      return []
    }
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
