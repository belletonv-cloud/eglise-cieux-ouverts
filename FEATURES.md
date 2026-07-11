# FEATURES.md — Périmètre du site

Description stable du site tel qu'il existe (pas un changelog — pour l'historique des évolutions, `git log`). Sert de référence de périmètre : toute modification doit rester cohérente avec ce qui est décrit ici, et ce fichier doit être mis à jour quand le périmètre change réellement (pas à chaque session).

## Ce que c'est

Site vitrine de l'Église Cieux Ouverts (Morlaix) avec un éditeur de pages intégré façon Wix (drag-and-drop, édition en direct, sans build/déploiement pour changer le contenu). Nuxt 3 + Vue 3, persistance Firestore, déployé sur Cloudflare Pages.

## Pages publiques

- **Accueil** (`/`) — page composée de blocs (hero, bienvenue, rejoins, aspirations, vision, activités, nous-rejoindre, contact)
- **Contact** (`/contact`) — formulaire + adresse + carte
- **Agenda** (`/agenda`) — calendrier des événements (voir « Événements » ci-dessous)
- **Billetterie/Événements** (`/event-list`)
- **Messages** (`/messages`) — messages/prédications
- **Photos** (`/photos`)
- **Pages custom** — un admin peut créer des pages additionnelles (slug libre) via l'admin ; route catch-all `pages/[slug].vue`

Les slugs `accueil`, `contact`, `messages`, `event-list`, `agenda`, `photos` sont réservés (`HARDCODED_SLUGS`) : impossible de les recréer ou de les supprimer depuis l'admin, pour ne pas écraser leur contenu réel.

## Système de blocs (schema-driven)

19 types de blocs (`utils/blockTypes.js` = source de vérité) : hero, bienvenue, activities, textImage, rejoins, aspirations, contact, nousRejoindre, richText, gallery, spacer, youtube, vision, fullWidthImage, equipe, faq, stats, quote, footer.

Chaque type déclare `label`, `icon`, `category`, `animations`, `defaults`, `schema` (champs auto-générés dans la sidebar : text, textarea, richtext, number, color, boolean, select, animation, image, array, images).

- **Espace vide** (`spacer`) peut être un simple espacement OU recevoir texte + image avec alignement horizontal/vertical réglable (pas de glisser-déposer libre — décision prise volontairement, contrôles d'alignement seulement)
- **Visibilité par device** : chaque bloc peut être masqué indépendamment sur desktop/tablette/mobile
- **Templates génériques** : les blocs ont des defaults neutres (pas de contenu church-specific codé en dur) pour rester réutilisables — le vrai contenu de ce site vit dans Firestore, pas dans le code (voir « Piège » plus bas)

## Éditeur admin

- Activation : `?admin=true` sur n'importe quelle page (la toolbar affiche "Se connecter" si non authentifié)
- Drag-and-drop de blocs, undo/redo (50 entrées, Ctrl+Z / Ctrl+Shift+Z)
- Auto-save Firestore (debounce 3s) + bouton sauvegarde manuelle
- Prévisualisation responsive desktop/tablette/mobile (tablette/mobile = iframe)
- Historique des versions par page, restauration possible
- **Système de demandes développeur** : note attachable à un bloc (visible admin uniquement), liste centralisée cross-page cliquable pour revenir au bloc — sert à signaler une demande qui nécessite du code, sans passer par un canal externe

## Auth admin

Firebase Auth (Google Sign-In). `?admin=true` active le mode admin dans l'UI quel que soit le statut d'authentification — c'est la toolbar qui affiche "Se connecter" si besoin. Liste des admins dans Firestore `settings/admins`.

## Événements

**Backend séparé** : les événements viennent du Worker Cloudflare `eglise-app` (`/Users/vic/Projects/eglise-app`, D1) exposé sur `https://eglise-app.belletonv.workers.dev/api/church-events` — pas de Firestore ici. `composables/useChurchEvents.js` centralise le fetch (SiteHeader, agenda public, admin `EventManager.vue`). Ne jamais créer de collection Firestore parallèle pour les événements.

## Menu & Footer

- Menu (navigation du site) : Firestore `settings/menu`, édité via MenuEditor
- Footer (bandeau bas de chaque page) : Firestore `settings/footer` — si le document n'existe pas (`props: null`), le site retombe sur `BLOCK_TYPES.footer.defaults` (`utils/blockTypes.js`). **Piège** : contrairement aux pages (toujours sauvegardées explicitement dès leur création), le footer peut tourner indéfiniment sur les defaults code sans qu'aucun admin ne l'ait jamais sauvegardé — un changement de defaults dans le code se répercute alors directement sur le site réel.

## Animations

CSS `animation-timeline` natif (scroll-driven), fallback IntersectionObserver pour Safari/navigateurs non supportés. Deux stratégies : `wrapper` (PageRenderer gère l'animation) et `internal` (le bloc gère la sienne, ex. aspirations, nousRejoindre).

## Tests

- `tests/schema-driven/` — tests génériques par schema (SSR, admin, responsive, a11y, intégrité) + specs dédiées par bloc
- `tests/playwright/` — E2E (parcours admin, navigation, auth, etc.)
- Mode mock (`PW_TEST=1`) : toutes les lectures/écritures Firestore passent par `server/utils/firestore-mock.js` (RAM, reset via `resetMock()`), jamais la vraie base

## Déploiement

Push sur `main` → déploiement automatique Cloudflare Pages (`eglise-cieux-ouverts.pages.dev`). Voir CLAUDE.md pour les détails opérationnels (Node version, commandes, cache).
