# Eglise Cieux Ouverts – Admin Builder

## Fonctionnalités principales

- **Builder admin moderne** façon Wix (Vue3/Nuxt3)
- Sidebar collapsible, CRUD pages/blocs, drag-&-drop, undo/redo "temps réel"
- Responsive preview (devices), thème dark/light, animations, accessibilité
- **Persistance Cloud** : Firestore, par admin (multi-session)

---

## Installation

1. **Cloner le repo** et installer les dépendances
   ```bash
   git clone ...
   cd eglise-cieux-ouverts
   npm install
   ```
2. **Configurer les secrets Firebase**
   - Crée `.env` à la racine :
     ```ini
     PUBLIC_FIREBASE_API_KEY=XXX
     PUBLIC_FIREBASE_AUTH_DOMAIN=XXX
     PUBLIC_FIREBASE_PROJECT_ID=XXX
     ```
   - Les valeurs sont dispo dans [console.firebase.google.com](https://console.firebase.google.com)
3. **Démarrer**
   ```bash
   npm run dev
   ```

---

## Fonctionnement de la persistance Firestore (cloud-sync)

- Modifications structurelles (pages/blocs/ordre) => instantanément sauvegardées pour chaque admin connecté (doc : `adminBuilder/{userId}`)
- Restauration automatique à la reconnexion/session suivante
- Undo/redo local (avec historique optionnellement persistant)

```js
// pages/admin/index.vue (extrait)
import { useFirestoreSync } from '~/composables/useFirestoreSync'
const userId = 'ADMIN_UID_ICI' // à remplacer par l’uid Firebase connecté
override, pas de pseudonyme
const { load, save } = useFirestoreSync(userId)
onMounted(load)
watch(() => [...store.pages, ...store.blocks], save, { deep: true })
```

- Sécurise tes rules Firestore (accès seulement à son doc) !


---

## Recommandé : organisation des fichiers

- `/pages/admin/index.vue`  ← builder principal
- `/composables/useFirestoreSync.js` ← sync cloud
- `/lib/firebase.js`  ← config Firebase

---

Licence MIT
