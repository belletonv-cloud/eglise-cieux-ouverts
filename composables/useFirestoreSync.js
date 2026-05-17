import { setDoc, getDoc, doc } from "firebase/firestore"
import { db } from '~/lib/firebase'
import { useAdminHistoryStore } from '~/stores/adminHistory' // à adapter à ton store précis

// userId: l'UID Firebase connecté de l'admin
export function useFirestoreSync(userId) {
  const store = useAdminHistoryStore()
  const ref = doc(db, 'adminBuilder', userId)

  // Charger l'état depuis Firestore
  const load = async () => {
    const snap = await getDoc(ref)
    if (snap.exists()) {
      store.$patch(snap.data())
    }
  }

  // Sauvegarder l'état courant dans Firestore
  const save = async () => {
    await setDoc(ref, JSON.parse(JSON.stringify(store.$state)))
  }

  return { load, save }
}
