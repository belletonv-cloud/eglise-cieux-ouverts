import { initializeApp } from 'firebase/app'
import { getFirestore } from 'firebase/firestore'
import { getAuth } from 'firebase/auth'

export default defineNuxtPlugin((nuxtApp) => {
  const config = useRuntimeConfig()
  const { public: { FIREBASE_API_KEY, FIREBASE_AUTH_DOMAIN, FIREBASE_PROJECT_ID, FIREBASE_STORAGE_BUCKET, FIREBASE_MESSAGING_SENDER_ID, FIREBASE_APP_ID } } = config

  // Guard: if the public API key is missing, skip initializing Firebase to avoid
  // throwing during client init (which causes hydration mismatches).
  if (!FIREBASE_API_KEY) {
    if (import.meta.env.DEV) {
      // Helpful local debug message
      // eslint-disable-next-line no-console
      console.warn('[Firebase] Missing FIREBASE_API_KEY — skipping Firebase initialization')
    }

    return {
      provide: {
        db: null,
        ...(nuxtApp.$auth ? {} : { auth: null }),
      },
    }
  }

  const firebaseConfig = {
    apiKey: FIREBASE_API_KEY,
    authDomain: FIREBASE_AUTH_DOMAIN,
    projectId: FIREBASE_PROJECT_ID,
    storageBucket: FIREBASE_STORAGE_BUCKET,
    messagingSenderId: FIREBASE_MESSAGING_SENDER_ID,
    appId: FIREBASE_APP_ID,
  }

  try {
    const app = initializeApp(firebaseConfig)
    const db = getFirestore(app)
    const auth = getAuth(app)

    return {
      provide: {
        db,
        ...(nuxtApp.$auth ? {} : { auth }),
      },
    }
  } catch (err) {
    // If Firebase fails to initialize for any reason, warn and continue so the
    // app doesn't crash on mount (prevents hydration mismatches).
    // eslint-disable-next-line no-console
    console.error('[Firebase] Initialization failed:', err)
    return {
      provide: {
        db: null,
        ...(nuxtApp.$auth ? {} : { auth: null }),
      },
    }
  }
})
