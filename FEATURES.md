# FEATURES.md — Périmètre du site

Description stable du site tel qu'il existe (pas un changelog — pour l'historique des évolutions, `git log`). Sert de référence de périmètre : toute modification doit rester cohérente avec ce qui est décrit ici, et ce fichier doit être mis à jour quand le périmètre change réellement (pas à chaque session). Objectif principal : qu'un agent qui n'a pas le contexte d'une session précédente sache ce qui existe déjà avant de le recréer, le casser ou le dupliquer.

## Ce que c'est

Site vitrine de l'Église Cieux Ouverts (Morlaix) avec un éditeur de pages intégré façon Wix (drag-and-drop, édition en direct, sans build/déploiement pour changer le contenu). Nuxt 3 + Vue 3, persistance Firestore, déployé sur Cloudflare Pages.

## Pages publiques

Chaque page est composée de blocs (voir « Système de blocs »). Le contenu réel vit en Firestore (`pages/{slug}`), **pas** dans le code — le code ne définit que la structure/les defaults. Slugs réservés (`HARDCODED_SLUGS` dans `utils/blockTypes.js`) : `accueil`, `contact`, `messages`, `event-list`, `agenda`, `photos` — protégés en création/suppression depuis l'admin (pas en écriture, qui est le chemin d'édition normal).

- **Accueil** (`/`, `pages/index.vue`) — fetch `pages/accueil`. Structure réelle actuelle : 8 blocs dans cet ordre — `hero`, `bienvenue`, `rejoins`, `aspirations`, `vision`, `activities`, `nousRejoindre`, `contact`. **Incident passé** : ce document Firestore a été écrasé accidentellement à deux reprises pendant une session (contenu perdu, restauré depuis l'historique git + recette). Voir « Pièges de sauvegarde » ci-dessous pour la cause racine corrigée.
- **Contact** (`/contact`, `pages/contact.vue`) — bloc `contact` en mode page complète (formulaire + adresse + carte Google Maps intégrée).
- **Agenda** (`/agenda`, `pages/agenda.vue`) — calendrier public des événements (voir « Événements »).
- **Billetterie/Événements** (`/event-list`, `pages/event-list.vue`) — liste des événements avec fallback SSR/SPA si vide. `/billetterie` redirige vers `/event-list` (`routeRules` dans `nuxt.config.ts`).
- **Messages** (`/messages`, `pages/messages.vue`) — messages/prédications, bloc `textImage` + `youtube`.
- **Photos** (`/photos`, `pages/photos.vue`) — galerie.
- **Admin** (`/admin`, `pages/admin.vue`) — page de connexion dédiée, redirige vers `/?admin=true` après authentification. Ce n'est pas un dashboard séparé — toute l'édition se fait en admin mode sur les pages publiques elles-mêmes.
- **Pages custom** — un admin peut créer des pages additionnelles (slug libre) via le menu ; route catch-all `pages/[slug].vue`.

## Système de blocs (schema-driven)

19 types de blocs (`utils/blockTypes.js` = source de vérité, vérifié) : `hero`, `bienvenue`, `activities`, `textImage`, `rejoins`, `aspirations`, `contact`, `nousRejoindre`, `richText`, `gallery`, `spacer`, `youtube`, `vision`, `fullWidthImage`, `equipe`, `faq`, `stats`, `quote`, `footer`.

Chaque type déclare `label`, `icon`, `category`, `animations` (stratégie), `defaults`, `schema` (champs auto-générés dans la sidebar : `text`, `textarea`, `richtext`, `number`, `color`, `boolean`, `select`, `animation`, `image`, `array`, `images`).

- **Espace vide** (`spacer`) : simple espacement OU zone de contenu (texte + image) avec alignement horizontal/vertical réglable. Pas de glisser-déposer libre du contenu à l'intérieur — décision volontaire, contrôles d'alignement seulement. Rétrocompatible : un bloc vide sans texte/image reste une div nue (0 enfant DOM).
- **Visibilité par device** : chaque bloc peut être masqué indépendamment sur desktop/tablette/mobile (`block.visibility`).
- **Templates génériques** : les blocs ont des defaults neutres (pas de contenu church-specific codé en dur) pour rester réutilisables sur d'autres sites. Certains types (`textImage`, `richText`) proposent des modèles pré-remplis (`BLOCK_TYPES[type].templates`) au moment de l'ajout.

## Éditeur admin

- Activation : `?admin=true` sur n'importe quelle page (la toolbar affiche "Se connecter" si non authentifié).
- Drag-and-drop de blocs, undo/redo (50 entrées, Ctrl+Z / Ctrl+Shift+Z).
- Auto-save Firestore (debounce 3s) + bouton sauvegarde manuelle. Garde-fou : la sauvegarde est annulée (silencieusement pour l'auto-save, avec message pour la sauvegarde manuelle) si la page affichée a changé depuis le chargement des blocs édités — évite d'écrire le contenu d'une page sur le slug d'une autre.
- Prévisualisation responsive desktop/tablette/mobile (tablette/mobile = iframe avec sa propre synchronisation de blocs).
- Historique des versions par page (bouton "🕐 Versions"), restauration possible — **mais** aucune version n'est créée tant que la page n'a jamais été sauvegardée une première fois explicitement ; ne pas supposer qu'un historique existe forcément.
- **Menu** (bouton menu/burger en admin) : modale centrée (pas un panneau latéral) — gestion des items, sous-menus, réorganisation, création/suppression de pages custom, fond du menu mobile.
- **Police par champ de texte** : sur chaque champ `text`/`textarea`/`richtext` **visuel** (titre, sous-titre, citation…) de la sidebar d'édition, un petit sélecteur de police apparaît à côté du label — inspiré de l'inspecteur Wix (sélectionner un élément → contrôle contextuel). Liste fermée de 8 polices Google Fonts (`utils/fonts.js`). Les champs non-visuels (liens, URLs, CSS de gradient, ID vidéo) sont exclus automatiquement par convention de nommage. Portée limitée aux champs de premier niveau (pas de descente dans les tableaux type activités/FAQ). **Il n'y a pas de réglage de police global** — chaque champ est indépendant, retombe sur `--font-heading`/`--font-body` (CSS, `assets/css/main.css`) si aucun override.
- **Système de demandes développeur** ("💬 Demandes") : note attachable à un bloc (visible admin uniquement, jamais publique), liste centralisée cross-page cliquable pour revenir au bloc concerné — sert à signaler une demande qui nécessite du code, sans passer par un canal externe.
- **Gestion des administrateurs** ("👥 Admins") : ajout/retrait par email, Firestore `settings/admins`.

## Auth admin

Firebase Auth (Google Sign-In), projet Firebase `eglise-cieux-ouverts`. `?admin=true` active le mode admin dans l'UI quel que soit le statut d'authentification — c'est la toolbar qui affiche "Se connecter" si besoin. `auth.onAuthStateChanged` existe nativement sur le SDK Firebase (compat v8) — ne jamais le réassigner (a causé une récursion infinie en prod, corrigé).

## Événements

**Backend séparé** : les événements viennent du Worker Cloudflare `eglise-app` (`/Users/vic/Projects/eglise-app`, base D1) exposé sur `https://eglise-app.belletonv.workers.dev/api/church-events` — **pas de Firestore ici**. `composables/useChurchEvents.js` centralise le fetch public (SiteHeader, agenda). Le Worker vérifie les tokens Firebase de son propre projet OU du projet `eglise-cieux-ouverts` (les deux sites partagent l'auth admin mais utilisent des projets Firebase distincts).

- **Gestion admin** (bouton "📅 Événements" → `components/admin/EventManager.vue`) : CRUD complet (création/édition/suppression), récurrence (hebdo, bimensuel, mensuel même date, mensuel même jour de semaine), exceptions (annulation ou déplacement d'une occurrence), upload d'images.
- **Recherche/tri/filtre** dans la modale de gestion : barre de recherche (titre, lieu, description), tri (date ↑/↓, titre A→Z), filtre par statut (tous/actifs/annulés).
- Ne jamais créer de collection/endpoint Firestore parallèle pour les événements — un système parallèle non connecté au site public a déjà été tenté et annulé.

## Menu & Footer

- **Menu** (navigation du site) : Firestore `settings/menu`, édité via la modale de gestion du menu (voir « Éditeur admin »).
- **Footer** (bandeau bas de chaque page) : Firestore `settings/footer` — si le document n'existe pas (`props: null`), le site retombe sur `BLOCK_TYPES.footer.defaults` (`utils/blockTypes.js`). **Piège** : contrairement aux pages (toujours sauvegardées explicitement dès leur création), le footer peut tourner indéfiniment sur les defaults code sans qu'aucun admin ne l'ait jamais sauvegardé — un changement de defaults dans le code se répercute alors directement sur le site réel (déjà arrivé : neutralisation accidentelle du vrai contact en prod, corrigé).

## Formulaire de contact

`server/api/contact.post.ts` — écrit dans Firestore `contacts` + notification email via Resend (si `NUXT_RESEND_API_KEY` configuré). Rate-limité (3 requêtes / 15 min / IP, en mémoire — reset à chaque cold start serverless). Retourne un 503 explicite si les credentials serveur Firestore manquent (comportement volontaire, pas une erreur silencieuse). Le composant affiche `e.data.message` (message métier explicite), pas `e.data.statusMessage` (texte HTTP générique type "Server Error").

## Animations

CSS `animation-timeline` natif (scroll-driven), fallback IntersectionObserver pour Safari/navigateurs non supportés. Deux stratégies déclarées par bloc (`animations` dans `BLOCK_TYPES`) : `wrapper` (PageRenderer gère l'animation) et `internal` (le bloc gère la sienne en interne, ex. `aspirations`, `nousRejoindre`, `rejoins`). Le travail d'animation vit entièrement dans le code des composants — jamais dans Firestore, donc jamais perdu par une corruption de données de page.

## Pièges de sauvegarde (causes racines corrigées)

Ces bugs ont causé des pertes de contenu réel en prod pendant cette session — corrigés, mais les mécanismes valent d'être compris avant de toucher au code de sauvegarde :

- **Sauvegarde croisée entre pages** : `saveToServer()` (`AdminToolbar.vue`) combinait `props.pageSlug` (piloté par la route, se met à jour immédiatement à la navigation) avec `localBlocks.value` (composable partagé, mis à jour de façon asynchrone). Une sauvegarde différée (debounce 3s) qui se déclenchait après un changement de page écrivait encore le contenu de l'ancienne page, mais sur le slug de la nouvelle. Corrigé par un garde-fou comparant `localBlocksPage` à `props.pageSlug` avant toute écriture.
- **Reload forcé en sortant du bfcache (retour d'onglet)** : un listener `pageshow` rechargeait systématiquement la page à la restauration depuis le cache navigateur, sans exception pour le mode admin — perdait silencieusement les modifications non sauvegardées en changeant d'onglet puis en revenant. Corrigé (`plugins/deployment-check.client.ts`).
- **`normalizeBlock()`** (`lib/blocks/renderer.ts`) réapplique `BLOCK_TYPES[type].defaults` à CHAQUE rendu (pas seulement à la création) pour tout prop vide/absent — changer un default de type peut donc changer l'affichage de contenu déjà existant si ce contenu n'a jamais explicitement écrasé ce champ. C'est ce mécanisme qui a causé la neutralisation accidentelle du footer réel.

## Tests

- `tests/schema-driven/` (config `playwright.unit.config.ts`) — tests génériques par schema (SSR, admin, responsive, a11y, intégrité) + specs dédiées par bloc.
- `tests/playwright/` (config `playwright.config.ts`) — E2E (parcours admin, navigation, auth, formulaire, événements, etc.).
- Mode mock (`PW_TEST=1`) : toutes les lectures/écritures Firestore passent par `server/utils/firestore-mock.js` (RAM, reset via `resetMock()`), jamais la vraie base.

## Déploiement

Push sur `main` → déploiement automatique Cloudflare Pages (`eglise-cieux-ouverts.pages.dev`). Voir CLAUDE.md pour les détails opérationnels (Node version, commandes, cache, environnements).
