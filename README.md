# Eglise Cieux Ouverts – Admin Builder

## Fonctionnalités principales

- **Builder admin moderne** façon Wix (Vue3/Nuxt3)
- Sidebar collapsible, CRUD pages/blocs, preview responsive (devices), animations
- **Drag-and-drop** : réordonnancement des blocs via `vue-draggable-plus` (admin mode)
- **Undo/Redo** : historique 50 entrées, boutons toolbar + Ctrl+Z / Ctrl+Shift+Z
- **Persistance Cloud** : Firestore, auto-save avec debounce 3s, sauvegarde manuelle

---

## Prérequis Node.js (auto-switch avec Volta)

Ce projet utilise [Volta](https://volta.sh) pour garantir que **toutes les commandes npm/yarn s'exécutent toujours dans la bonne version de Node** (ici : Node 22.x). C'est auto : aucun réglage manuel n'est requis.

**Étapes :**
1. Si tu n'as pas encore Volta :
   ```bash
   curl https://get.volta.sh | bash
   # (Relance ensuite ton terminal)
   ```
2. Reviens dans le dossier projet, et Volta sélectionne Node 22 automatiquement pour toutes les commandes :
   ```bash
   cd eglise-cieux-ouverts
   node -v   # ➔ v22.x.x
   npm run dev   # Toujours la bonne version Node utilisée !
   ```
3. (Optionnel) Mets Volta à jour avec : `volta update`

**Avantages :**
- Zéro configuration supplémentaire
- Plus d'erreur "Wrangler requires Node 22" ou bug build
- Compatible Windows, Mac, Linux

> Volta est préconfiguré via le champ `volta.node` dans `package.json` : tout le monde a la même version Node, CI/CD compris.

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

- Auto-save avec debounce 3s : toute modification des blocs est persistée dans le document Firestore `pages/{pageSlug}`
- Sauvegarde manuelle dispo via bouton "Sauvegarder" (persiste aussi le menu)
- Undo/redo local (historique 50 entrées)

La persistance Firestore est gérée par `AdminToolbar.vue`.

---

## Recommandé : organisation des fichiers

- `/pages/`  ← Pages publiques
- `/components/` ← Composants Vue
- `/composables/` ← Composables réutilisables
- `/server/` ← API endpoints Nuxt
- `/plugins/` ← Plugins (Firebase, etc.)

---

Licence MIT
