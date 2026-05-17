import { initializeApp } from "firebase/app"
import { getFirestore } from "firebase/firestore"

// Utilise les variables d'environnement ou remplace directement si besoin
// documentation sur https://firebase.google.com/docs/web/setup
const firebaseConfig = {
  apiKey: import.meta.env.PUBLIC_FIREBASE_API_KEY || "DUMMY_KEY",
  authDomain: import.meta.env.PUBLIC_FIREBASE_AUTH_DOMAIN || "dummy.firebaseapp.com",
  projectId: import.meta.env.PUBLIC_FIREBASE_PROJECT_ID || "dummy-project-id",
}

const app = initializeApp(firebaseConfig)
export const db = getFirestore(app)
