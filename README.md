# Eglise Cieux Ouverts – Admin Builder

## Fonctionnalités principales

- **Builder admin moderne** façon Wix (Vue3/Nuxt3)
- Sidebar collapsible, CRUD pages/blocs, preview responsive (devices), animations
- **⚠️ Note** : le drag-and-drop réel et l'undo/redo "temps réel" ne sont pas encore implémentés (malgré la mention ci-dessous)
- **Persistance Cloud** : Firestore, par admin (multi-session) — ⚠️ actuellement cassé (bug SSR, voir AGENTS.md)

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

La persistance Firestore est gérée par les composants de l'admin toolbar.

---

## Recommandé : organisation des fichiers

- `/pages/`  ← Pages publiques
- `/components/` ← Composants Vue
- `/composables/` ← Composables réutilisables
- `/server/` ← API endpoints Nuxt
- `/plugins/` ← Plugins (Firebase, etc.)

---

Licence MIT
