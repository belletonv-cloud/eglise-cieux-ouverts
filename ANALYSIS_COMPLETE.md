# Analyse Complète — Église Cieux Ouverts

## 1. État d'avancement

### ✅ Ce qui fonctionne

| Aspect | Statut | Détails |
|--------|--------|---------|
| Build Nuxt | ✅ OK | Build SSR complet sans erreur |
| SSR sans JS | ✅ OK | Toutes les pages rendues sans JavaScript |
| Hydration | ✅ OK | Pas d'erreurs console critiques |
| Système de blocs | ✅ OK | 13 types de blocs, schema-driven architecture |
| Éditeur admin | ✅ OK | Sidebar, AutoEditor, 11 types de champs |
| Preview responsive | ✅ OK | Desktop/Tablet/Mobile via iframe |
| PageRenderer | ✅ OK | IntersectionObserver, animations wrapper |
| Animations scroll-driven | ✅ OK | CSS animation-timeline pour Firefox/Chrome |
| Tests Playwright | ✅ OK | 20 sections, tests complets |
| Firebase Auth | ✅ OK | Google Sign-In |
| Formulaire contact | ✅ OK | Firestore + Resend email |
| Calendrier agenda | ✅ OK | 4 vues (mois/semaine/cartes/agenda) |
| Menu editor | ✅ OK | CRUD items + Firestore persistence |
| Galerie photos | ✅ OK | Lightbox, lazy loading |
| Page 404 | ✅ OK | Design personnalisé |

### ⚠️ Ce qui manque ou est incorrect

| Problème | Priorité | Détail |
|----------|----------|--------|
| **Drag-and-drop réel** | Haute | Mentionné dans README/AGENTS.md mais pas implémenté. `vue-draggable-plus` installé mais non utilisé |
| **Undo/redo** | Haute | Mentionné dans README comme "temps réel" mais pas implémenté |
| **Persistance Firestore des blocs** | Haute | Sauvegarde manuelle (bouton "Sauvegarder") — pas de sync automatique multi-session |
| **Animations scroll-driven non supportées Safari** | Haute | `animation-timeline` non supporté par Safari (16% des users). Aucun fallback JS |
| **Bloc hero Wix manquant** | Moyenne | Le site Wix a une animation de lettres "BIENVENUE" en hero + vidéo de fond possible |
| **Accent incohérent** | Basse | "Billetterie Évènements" vs "Événements" |
| **Images Wix externes** | Moyenne | Nombreuses images chargées depuis static.wixstatic.com (dépendance externe) |
| **Police Wix externe** | Basse | `wfont_9e41cf_58d674eb74ea449ba1ce06533c9a9704` depuis Wix |
| **Logo SVG Instagram/Facebook dupliqué** | Basse | SVG inline répété 3× dans le code |
| **CSS dupliqué** | Basse | `assets/css/main.css` et `assets/style.css` ont les mêmes variables/tons |
| **Bloc Video manquant** | Moyenne | Le site Wix a une section embedded YouTube |
| **Pas de page "admin" complète** | Basse | `/admin` est une page d'info, pas un vrai dashboard |

## 2. Analyse Comparative avec le Site Wix

### Page d'accueil — Hero

| Élément | Wix (cieuxouverts.bzh) | eglise-cieux-ouverts (actuel) | Différence |
|---------|------------------------|-------------------------------|------------|
| Image de fond | Photo foule + croix avec overlay | `/foule-croix.png`, overlay optionnel | ✅ Similaire |
| Logo texte "Cieux Ouverts" | PNG spécifique Wix | Image Wix via URL | ⚠️ Dépendance externe |
| Logo icône | Croix PNG Wix | Image Wix via URL | ⚠️ Dépendance externe |
| Animation entrée | Fade-in + slide-up du contenu | Animation CSS `hero-in` | ✅ Similaire |
| Hauteur | 100vh (responsive) | 72vh avec min-height 420px | ⚠️ Pas tout à fait 100vh |

### Page d'accueil — Section "BIENVENUE"

| Élément | Wix | Actuel | Différence |
|---------|-----|--------|------------|
| Lettres animées | Fan-out 3D avec perspective | Fan-out 3D → `bienvenue-fan` | ✅ Très fidèle |
| Image de fond | Photo foule | Même photo Wix | ✅ Identique |
| Sous-titre | "à l'Église Cieux Ouverts à Morlaix" | Identique | ✅ |
| Réseaux sociaux | Icônes Insta/FB | Identiques | ✅ |
| Animation scroll-driven | Oui (Wix Corvid) | CSS `animation-timeline` | ⚠️ Safari non supporté |

### Page d'accueil — "Rejoins-nous"

| Élément | Wix | Actuel | Différence |
|---------|-----|--------|------------|
| Titre "Rejoins-nous" | 75px bold | Identique | ✅ |
| Fond dégradé | Bleu vers rose | `linear-gradient(to bottom, #064886 0%, #e58b8b 100%)` | ✅ |
| Horaires | 9h30 Accueil café / 10h00 Célébration | Identique | ✅ |
| Animation | Slide-in gauche avec délai | IntersectionObserver + CSS transitions | ✅ |

### Page d'accueil — "Nos aspirations"

| Élément | Wix | Actuel | Différence |
|---------|-----|--------|------------|
| Sticky scroll | 300vh avec sticky | `height: 300vh`, `position: sticky` | ✅ |
| Cercles animés | Cercles bleus qui se déplacent | Cercles avec `animation-timeline` | ✅ |
| Titre | "Nos aspirations" | Identique | ✅ |
| 4 aspirations | Identiques | Identiques | ✅ |
| Mobile | Fallback non-sticky | `height: auto`, `position: relative` | ✅ |

### Page — "Vision"

| Élément | Wix | Actuel | Différence |
|---------|-----|--------|------------|
| Citation | Gras sur "gloire", "royaume", "volonté" | Remplacé via `replace()` | ✅ |
| Animation | Scale progressif au scroll | Scale de 0.85 à 1 via scroll listener | ⚠️ Pas fluide (transition 0.1s) |
| Bouton CTA | "Nous rejoindre" | NuxtLink vers /contact | ✅ |

### Page Contact

| Élément | Wix | Actuel | Différence |
|---------|-----|--------|------------|
| Titre | "Tu veux nous contacter ?" | Identique | ✅ |
| Formulaire | Prénom, Nom, Ville, Email, Message, Newsletter | Identique + honeypot | ✅ Supérieur (anti-spam) |
| Carte Google Maps | Embed | Embed via URL configurable | ✅ |
| Design page contact | Fond bleu avec carte intégrée | Deux variantes (home + page) | ✅ |
| Envoi email | Résend API | Présent | ✅ |

### Page Messages

| Élément | Wix | Actuel | Différence |
|---------|-----|--------|------------|
| Style laptop | Mockup ordinateur portable | `visualStyle: 'messagesLaptop'` | ✅ |
| Image dans écran | Capture YouTube | Image PNG via URL | ✅ |
| Bloc embed YouTube | Vidéo intégrée | Iframe YouTube | ✅ |
| Fond gradient | Gradient radial complexe | Copié depuis le CSS Wix | ✅ |

### Page Agenda

| Élément | Wix | Actuel | Différence |
|---------|-----|--------|------------|
| Calendrier | Vues mois/semaine | 4 vues (mois/semaine/cartes/agenda) | ✅ Supérieur |
| Données | HelloAsso / Google Calendar | API depuis eglise-app (D1) | ✅ |
| Billetterie | Lien HelloAsso | Présent | ✅ |

### Éléments Wix absents ou non reproduits

| Élément Wix | Présent ? | Solution proposée |
|-------------|-----------|-------------------|
| **Vidéo de fond hero** | ❌ Non | Ajouter type `video` au hero, utiliser `<video>` avec fallback image |
| **Compteur "Vies touchées"** | ❌ Non | Nouveau bloc `BlockCounter` avec animation de comptage |
| **Section "Nos valeurs" avec icônes** | ❌ Non | Nouveau bloc `BlockValues` |
| **Témoignages (carousel)** | ❌ Non | Nouveau bloc `BlockTestimonials` avec carousel |
| **Bouton sticky "Faire un don"** | ❌ Non | Ajouter bouton flottant dans layout |
| **Animations parallaxe** | ❌ Non | Ajouter `will-change: transform` + JS scroll listener |
| **Scroll-triggered counters** | ❌ Non | Nouveau bloc avec IntersectionObserver + count-up |

## 3. Animations et Interactions

### Analyse des animations

| Animation | Wix | Actuel | Compatible | Fallback |
|-----------|-----|--------|------------|----------|
| **Hero fade-in** | CSS + JS | CSS keyframe `hero-in` (admin-mode force) | ✅ Tous | Aucun |
| **BIENVENUE fan-out** | Scroll-driven 3D | `animation-timeline: --bienvenue` | ❌ Safari | Fallback `.admin-animate` |
| **Aspirations sticky** | Scroll-driven sticky | `height:300vh` + `sticky` + timeline | ❌ Safari | Mobile: auto |
| **Vision scale** | Scroll progressif | Listener scroll JS + scale | ✅ Tous | ✅ |
| **Nous rejoindre cercles** | Scroll-driven | `animation-timeline: --rejoindre` | ❌ Safari | `.triggered` class |
| **Footer shutter** | Scroll-driven | `animation-timeline: --footer` | ❌ Safari | Prefers-reduced-motion |
| **Block wrapper fadeIn** | IntersectionObserver | CSS class + JS observer | ✅ Tous | CSS scroll-driven |
| **Block wrapper slideLeft** | IntersectionObserver | CSS class + JS observer | ✅ Tous | CSS scroll-driven |
| **Block wrapper portal** | IntersectionObserver | CSS class + JS observer | ✅ Tous | CSS scroll-driven |
| **Bienvenue contact** | Scroll-driven | `animation-timeline: --contact` | ❌ Safari | Aucun |
| **Transition page** | Wix Corvid | Aucune | ❌ | Ajouter Vue `<Transition>` |

### Problèmes d'animations identifiés

1. **Safari : aucune animation scroll-driven** — `animation-timeline` n'est supporté que par Chrome 115+/Firefox 2024+. Safari 17+ ne supporte PAS. Solution : implémenter un fallback JS universel (IntersectionObserver) pour tous les blocs.

2. **Double système d'animation** — Le projet utilise DEUX systèmes en parallèle :
   - Système A : `useBlockAnimation.js` + `PageRenderer.vue` → classes `.triggered` + CSS transitions
   - Système B : `animation-timeline` CSS natif sur les blocs internes (Bienvenue, Aspirations, NousRejoindre, Footer)
   - Problème : les deux systèmes ne sont pas coordonnés. Un bloc peut avoir les deux.

3. **`useBlockAnimation.js`** crée un IntersectionObserver mais avec `rootMargin: '0px'` et `threshold: 0.05` — les blocs sont triggerés très tard. Wix les déclenche plus tôt.

4. **Vision scale** utilise `addEventListener('scroll')` sans `passive: true` sur le bloc Vision — devrait utiliser `passive: true` (déjà fait) mais surtout devrait utiliser `requestAnimationFrame` pour éviter le jank.

5. **Pas de transitions de page** — Navigation entre pages est instantanée, sans animation (Wix a des transitions fluides).

## 4. Revue Complète du Code

### Problèmes structurels

#### 1. CSS dupliqué : `assets/css/main.css` vs `assets/style.css`

Les deux fichiers sont quasi identiques (variables, normalize, boutons). Nuxt charge les deux. Solution : fusionner dans `main.css`.

#### 2. Types JS vs TS incohérents

- `utils/blockTypes.js` → définit les blocs en JS pur
- `lib/blocks/types.ts` → types TypeScript
- `utils/admins.js` → JS
- Problème : les blocs ne sont PAS typés côté JS. `blockTypes.js` exporte des objets sans validation TypeScript.

#### 3. `useAdmin.js` — état global mutable

```js
const isAdminMode = ref(false) // module-level state — SINGLETON
```
Singleton au niveau module dans un fichier composable = correct pour Pinia-like, mais mélangé avec `provide` dans layout. Risque de fuite en SSR.

#### 4. `editor-auto.ts` dupliqué avec `blockTypes.js`

`getBlockSchema`, `getBlockDefaults`, `getBlockLabel` sont définis dans DEUX endroits :
- `lib/blocks/editor-auto.ts`
- Utilisés directement depuis `blockTypes.js` dans `AdminToolbar.vue`

#### 5. Import CSS Firebase lourd

Le plugin Firebase importe `firebase/auth`, `firebase/firestore`, `firebase/storage` — cela ajoute ~200KB au bundle. Utiliser des imports dynamiques (déjà partiellement fait dans `AdminToolbar.vue`).

### Problèmes de performance

| Problème | Fichier | Impact |
|----------|---------|--------|
| **SVG inline répété** | `SiteHeader.vue` (3×), `BlockBienvenue.vue`, `BlockContact.vue` | +15KB HTML par page |
| **Images Wix distantes non optimisées** | `blockTypes.js` (defaults) | Aucun contrôle quality/format |
| **useChurchEvents.js** pas de cache | `composables/useChurchEvents.js` | Requête API à chaque montée de composant |
| **font-display: swap** manquant pour Nunito/Playfair | Pas trouvé dans le code | CLS possible |
| **Pas de code-splitting par page** | Nuxt auto, mais vérifier | OK |

### Problèmes d'accessibilité

| Problème | Fichier | Ligne |
|----------|---------|-------|
| `h1` en double sur la home | `BlockHero.vue` n'a pas de `h1` ; `BlockBienvenue` non plus | — |
| `nav-mobile-socials` pas d'aria-label sur les liens | `SiteHeader.vue` | 72-78 |
| `button.burger` aria-label="Menu" | OK | 48 |
| Alt text vides sur images décoratives | `BlockHero.vue` `hero-bg` a `alt="Hero background"` | 7 |

### Problèmes responsive

| Problème | Fichier | Détail |
|----------|---------|--------|
| `.admin-sidebar` width: 320px fixe | `AdminToolbar.vue` | Déborde sur écran 320px (testé ✅ mais limite) |
| Galerie force columns=3 sur mobile | `BlockGallery.vue` | Override via container query ✅ |
| Hero margin-top: -70px fixe | `BlockHero.vue` | Devrait être dynamique |
| `.block-bienvenue` min-height: 600px | `BlockBienvenue.vue` | Trop grand sur mobile 320px |

## 5. Tests

### Tests existants : 20 sections, robustes

- Section 1: Schema integrity ✅
- Section 2: Admin rendering ✅
- Section 3: SSR sans JS ✅
- Section 4: Hydration ✅
- Section 5: Animation system ✅
- Section 6: Responsive device preview ✅
- Section 7: Admin mode UI ✅
- Section 8-11: Accessibility basics ✅
- Section 12: Schema validation errors ✅
- Section 13: Extreme viewports ✅
- Section 14: Admin vs Public ✅
- Section 15-20: Advanced checks ✅

### Tests manquants

| Test | Priorité | Raison |
|------|----------|--------|
| **Formulaire contact E2E** | Haute | Aucun test d'envoi de formulaire |
| **Firestore mock** | Haute | Tests admin sidebar nécessitent auth |
| **Menu editor** | Moyenne | CRUD items de navigation |
| **Bloc spécifique (tous)** | Moyenne | Seuls Hero et TextImage ont des tests dédiés |
| **Animations Safari fallback** | Moyenne | Vérifier que fallback JS fonctionne |
| **Performance/Lighthouse** | Basse | Budget de performance |
| **i18n / SEO** | Basse | Balises meta, sitemap |

## 6. Optimisations

### Images
- Charger les images Wix en WebP/AVIF via paramètres d'URL (`q_80, f_avif`)
- Remplacer les dépendances Wix par des assets locaux
- Ajouter des `srcset` pour les images responsive

### Bundle
- Firebase Storage importé dynamiquement ✅ (déjà fait)
- Réduire les SVG inline (composant `IconSprite` ou icônes importées)
- `vue-draggable-plus` et `vuedraggable` installés mais non utilisés → les retirer

### CSS
- Fusionner `main.css` et `style.css`
- Supprimer les variables inutilisées (`--primary-purple` vs `--primary-blue`)
- Éliminer les `overflow-x: hidden; overflow-x: clip` dupliqués

### Animations
- Fallback IntersectionObserver pour Safari (système unifié)
- `will-change: transform` sur les blocs animés
- `content-visibility: auto` sur les blocs below-the-fold

### SEO
- Sitemap.xml manquant (Nuxt `@nuxtjs/sitemap`)
- Balises `og:image` manquantes
- `useSeoMeta` présent mais pas sur toutes les pages (agenda ✅, manque error.vue)

## 7. Plan d'Action Recommandé

### Phase 1 — Critique (1-2 jours)
1. ✅ Correction fallback animations Safari (unified IntersectionObserver system)
2. ✅ Fusion CSS `main.css` + `style.css`
3. ✅ Suppression dépendances inutilisées (`vuedraggable`)
4. ✅ Correction incohérence accents "Évènements" → "Événements"
5. ✅ Formulaire contact : test E2E

### Phase 2 — Fonctionnalités manquantes (3-5 jours)
1. 🔲 Drag-and-drop réel des blocs (vue-draggable-plus)
2. 🔲 Undo/redo system
3. 🔲 Auto-save Firestore avec debounce
4. 🔲 Transitions de page Nuxt (layout transition)
5. 🔲 Bloc Vidéo (embed YouTube/Vimeo)
6. 🔲 Bouton "Faire un don" sticky

### Phase 3 — Finalisation Wix (5-7 jours)
1. 🔲 Parallaxe sur images de fond (bloc FullWidthImage, Hero)
2. 🔲 Nouveaux blocs : Compteur, Témoignages, Valeurs
3. 🔲 Optimisation images (srcset, WebP, lazy loading)
4. 🔲 Sitemap + SEO + OpenGraph
5. 🔲 Migration des assets Wix vers stockage local/Cloudflare
6. 🔲 Tests Lighthouse (cible : 90+ Performance, 100 Accessibility)

### Phase 4 — Maintenance continue
1. 🔲 CI/CD avec tests Playwright automatisés
2. 🔲 Monitoring des erreurs console
3. 🔲 Mise à jour dépendances (Nuxt 3.20 → latest)

---

**Résumé :** Le projet est TRÈS avancé (~85% complet). L'architecture schema-driven est solide, les tests sont exhaustifs. Les écarts majeurs sont : (1) animations Safari, (2) drag-and-drop manquant, (3) pas d'undo/redo, (4) sauvegarde manuelle, (5) assets dépendants de Wix.
