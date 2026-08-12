import { lireAdminUsers } from '../../utils/firebase-admin'

// Sert à `pages/admin.vue` pour décider s'il faut proposer la création du
// premier administrateur.
export default defineEventHandler(async (event) => {
  const { users, lectureOk } = await lireAdminUsers(event)
  // Lecture en échec : ne pas affirmer « aucun admin ». L'interface
  // proposerait le bootstrap, que `/api/admin/setup` refuse désormais (503),
  // et l'utilisateur se retrouverait devant un bouton sans issue. On répond
  // donc comme si des admins existaient — le repli sûr.
  if (!lectureOk) return { exists: true, lectureOk: false }
  return { exists: users.length > 0, lectureOk: true }
})
