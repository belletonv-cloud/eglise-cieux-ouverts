// Plugin Firebase — côté client seulement (.client.js)
import { initializeApp } from 'firebase/app'
import { getFirestore } from 'firebase/firestore'

const firebaseConfig = {
  apiKey: "AIzaSyBkSon-_L3E0gcOhDi3DduH5lFxubXuIWU",
  authDomain: "eglise-cieux-ouverts.firebaseapp.com",
  projectId: "eglise-cieux-ouverts",
  storageBucket: "eglise-cieux-ouverts.firebasestorage.app",
  messagingSenderId: "415770520164",
  appId: "1:415770520164:web:a80df56a18a1c3994a8d71"
}

const app = initializeApp(firebaseConfig)
const db = getFirestore(app)

export default defineNuxtPlugin(() => {
  return {
    provide: {
      db
    }
  }
})
