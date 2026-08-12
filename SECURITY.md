# Sécurité

Ce que ce dépôt garantit, ce qu'il ne garantit pas, et quoi faire en cas de
fuite. Pour les pièges d'implémentation au quotidien, voir `CLAUDE.md`.

## Secrets

**Rien de secret ne doit jamais être écrit dans un fichier suivi par git.**
Un secret commité reste dans l'historique après suppression du fichier : le
retirer ne suffit pas, il faut le **révoquer et le régénérer**.

| Où | Quoi |
|---|---|
| `.env` local (ignoré par git) | développement |
| Cloudflare Pages → Settings → Variables & Secrets | production et recette |
| `.env.example` | noms des variables, valeurs factices uniquement |

Ce qui est **public par conception** et peut rester dans le dépôt : les
`NUXT_PUBLIC_FIREBASE_*` (clé d'API client comprise). Firebase les destine au
navigateur ; ce sont les règles de sécurité Firestore, pas leur discrétion, qui
protègent les données. Elles sont d'ailleurs présentes dans `build.sh` pour
l'environnement de recette, avec l'email du compte de service — un
identifiant, pas une clé.

Ce qui est **secret** : `NUXT_FIREBASE_PRIVATE_KEY` (clé privée du compte de
service), `NUXT_MAILJET_API_KEY` / `NUXT_MAILJET_API_SECRET`.

### Scanner

```bash
bash scripts/scan-secrets.sh
```

Deux niveaux : **BLOQUANT** (matière cryptographique réelle — clé privée PEM,
JSON de compte de service, secret Mailjet) qui fait sortir le script en 1, et
**signalé** (valeurs publiques par conception) qui n'est qu'informatif. Les
fichiers contenant légitimement un marqueur de clé privée (gabarit, fixture de
test, cette page) sont listés dans `ALLOWLIST` en tête du script.

Le script n'affiche que des numéros de ligne, jamais le contenu trouvé :
recopier un secret dans les journaux de CI le divulgue une seconde fois.

### Hook pre-commit

À faire **une fois par clone** :

```bash
git config core.hooksPath .githooks
```

`.githooks/pre-commit` lance alors le scanner sur l'index avant chaque commit
et refuse celui-ci en cas d'occurrence bloquante.

## Contrôle d'accès

Trois rôles, stockés dans Firestore `settings/admins`, vérifiés côté serveur
par `server/utils/firebase-admin.ts` :

| Rôle | Accès |
|---|---|
| `admin` | tout, y compris la gestion des comptes (`requireSuperAdmin`) |
| `editor` | édition du contenu du site (`requireAdmin`) |
| `planning` | tableau des tâches uniquement (`requireTaskAccess`) |

Points à ne pas défaire :

- **Le jeton est vérifié par Google**, pas décodé localement
  (`verifyFirebaseToken` appelle Identity Toolkit). Un simple décodage du
  payload serait falsifiable par n'importe qui. Le repli sans vérification de
  signature n'existe que sans clé d'API, c'est-à-dire en dev local.
- **Chaque endpoint mutant exige un rôle** — aucune exception hors
  `POST /api/contact`, qui est le formulaire public.
- **Le bootstrap du premier admin (`POST /api/admin/setup`) refuse d'agir sur
  une lecture ratée.** « Aucun admin » et « pas pu lire la liste » donnaient la
  même liste vide : une panne Firestore passagère rouvrait la création du
  premier administrateur, et le premier compte connecté venu obtenait le rôle
  complet en écrasant la vraie liste. D'où `lireAdminUsers`, qui renvoie
  `lectureOk` en plus des utilisateurs. Même famille que la règle « ne jamais
  sauvegarder ce qu'on n'a pas réussi à lire » de `CLAUDE.md`.
- **Les endpoints de test** (`/api/reset-mock`, `/api/reset-member-mock`,
  `/api/test/set-mock`, `/api/mock-snapshot/*`, `/api/debug-env`) répondent 404
  hors dev et hors `PW_TEST=1`. Tout nouvel endpoint touchant aux mocks doit
  porter la même garde — `/api/mock-snapshot` ne l'avait pas et servait les
  fixtures de test en production.

## Contenu et XSS

`utils/sanitize.js` est le seul rempart devant les `v-html` du site (richText,
corps de textImage, descriptions d'agenda, éléments libres). Il fonctionne par
**liste blanche d'attributs** : chaque balise est re-sérialisée à partir de ses
attributs filtrés.

Ne pas revenir à un filtrage par motifs nommés : la version précédente visait
neuf vecteurs connus et laissait passer tout le reste — `<img
src=x/onerror=…>`, `<iframe src="javascript:…">`, un `<script>` non fermé,
`href="data:text/html;base64,…"`, `style="background:url(javascript:…)"`. Les
35 vecteurs de `tests/unit/sanitize-xss.spec.ts` doivent rester neutralisés, et
les 12 exemples de contenu légitime du même fichier rester intacts au caractère
près.

Le contenu vient d'administrateurs, mais il transite par Firestore et — pour
l'agenda — par le Worker `eglise-app` : une faille de compte suffirait à
l'empoisonner pour tous les visiteurs.

## Emails

Tout ce qui vient du formulaire public est échappé (`escapeHtml`,
`server/utils/send-email.ts`) avant interpolation dans le HTML de la
notification. Sans cela, un visiteur compose lui-même le corps de l'email reçu
par les responsables — un lien inséré dans le message arrive avec l'apparence
d'une notification légitime du site.

## En-têtes HTTP

Source unique : `routeRules` dans `nuxt.config.ts` (`x-frame-options`,
`content-security-policy: frame-ancestors`, `x-content-type-options`,
`referrer-policy`, `permissions-policy`, `strict-transport-security`). Ne
jamais les redéclarer dans `public/_headers` : Cloudflare joint les valeurs par
une virgule au lieu de remplacer, ce qui produit des en-têtes invalides que les
navigateurs ignorent — la protection saute alors silencieusement. Voir le
commentaire en tête de `public/_headers`.

Pas de CSP complète : les styles en ligne du contenu collé en richText et le
SDK Firebase la rendraient inapplicable sans `unsafe-inline`, ce qui lui
retirerait l'essentiel de son intérêt.

## En cas de fuite

1. **Révoquer** la clé concernée immédiatement (console Firebase → comptes de
   service, ou tableau de bord Mailjet), puis en générer une nouvelle.
2. Mettre à jour Cloudflare Pages → Settings → Variables & Secrets, pour la
   production **et** la recette.
3. Vérifier avec `GET /api/health` : la réponse indique quelles variables sont
   présentes et si la clé privée est décodable, sans exposer aucune valeur.
4. Retirer le secret du dépôt. Ne pas réécrire l'historique sans accord
   préalable : le secret étant révoqué, sa présence dans l'historique n'est
   plus exploitable.
