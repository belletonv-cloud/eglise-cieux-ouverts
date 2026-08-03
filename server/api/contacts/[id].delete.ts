import { getFirestoreConfig, getAccessToken, deleteFirestoreDoc } from '../../utils/firebase'
import { requireAdmin } from '../../utils/firebase-admin'

// Suppression définitive d'un message de contact.
//
// Remplace l'ancien archivage : celui-ci n'ajoutait qu'un troisième état
// à côté de lu/non-lu, sans rien permettre de plus, tout en conservant
// indéfiniment des données personnelles (nom, email, message) simplement
// masquées de la liste — l'inverse de ce qu'on veut côté RGPD.
export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')
  if (!id) {
    throw createError({ statusCode: 400, message: 'Id manquant' })
  }

  const isTest = process.env.NODE_ENV === 'test' || process.env.PW_TEST === '1' || process.env.TEST_ENV === '1'
  if (isTest) {
    const { getContact, deleteContact } = await import('../../utils/firestore-mock.js')
    if (!getContact(id)) {
      throw createError({ statusCode: 404, message: 'Message introuvable' })
    }
    deleteContact(id)
    return { success: true }
  }

  const config = getFirestoreConfig(event)
  if (!config) {
    throw createError({ statusCode: 500, message: 'Firestore non configuré' })
  }

  await requireAdmin(event)

  try {
    const accessToken = await getAccessToken(config.clientEmail, config.privateKey)
    await deleteFirestoreDoc(config.projectId, accessToken, 'contacts', id)
    return { success: true }
  } catch (err: any) {
    console.error('Contact delete error:', err)
    throw createError({ statusCode: 500, message: `Erreur lors de la suppression: ${err.message || err}` })
  }
})
