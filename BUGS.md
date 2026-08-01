# Bugs connus et points d'attention

## [2026-08-01] RÉSOLU — Emails du formulaire de contact

### Ce qui bloquait (deux causes cumulées)

**1. SMTP ne peut pas fonctionner sur Cloudflare Pages.**
Le site tourne sur le runtime Workers, qui n'expose pas de sockets TCP façon
Node. `nodemailer` ne peut donc ouvrir aucune connexion SMTP en production —
ni sur 587, ni sur 465, quel que soit le fournisseur (Mailjet, Yahoo, Gmail,
Proton). Le piège : en `nuxt dev` (vrai Node) l'envoi marche, ce qui donne
l'illusion d'une configuration correcte. L'échec était de plus avalé par un
`try/catch` silencieux, d'où des heures passées à soupçonner les identifiants.

**2. Expéditeur non validé chez Mailjet.**
Mailjet refuse tout envoi depuis une adresse non validée. `noreply@cieuxouverts.bzh`
ne l'était pas — et la validation d'un *domaine* exige un accès DNS indisponible.

### Solution retenue
- **API HTTP Mailjet** (`https://api.mailjet.com/v3.1/send`) via `fetch`, nativement
  supporté par Workers. Voir `server/utils/send-email.ts`.
- **Expéditeur `v.belleton@outlook.fr`**, déjà validé (statut `Active`) dans le compte
  Mailjet. Valider une *adresse unique* se fait en cliquant un lien reçu par email :
  aucun accès DNS requis, contrairement à un domaine entier.
- Destinataires : configurables dans l'admin (⚙️ Config → « Emails de destination »),
  stockés dans Firestore `settings/config` → `contactEmails`.

Vérifié de bout en bout dans le runtime Workers réel (`wrangler pages dev`) :
écriture Firestore + envoi Mailjet confirmés.

### Variables d'environnement
`NUXT_MAILJET_API_KEY`, `NUXT_MAILJET_API_SECRET`, `NUXT_MAILJET_FROM_EMAIL`,
`NUXT_MAILJET_FROM_NAME` — à définir dans le dashboard Cloudflare Pages.

### Diagnostic
`GET /api/health` indique en une requête quelles variables sont présentes
(booléens uniquement, aucune valeur exposée).

---

## [2026-08-01] Piège : bloc `env` dans wrangler.jsonc efface les secrets

Ajouter un bloc `env.production.vars` dans `wrangler.jsonc` fait de ce fichier la
source de vérité pour l'environnement : Cloudflare **écrase alors les variables et
secrets définis dans le dashboard**. Résultat observé le 01/08/2026 — les secrets
`NUXT_FIREBASE_*` ont disparu du runtime et tous les endpoints Firestore sont
tombés en 500 (`/api/menu`, `/api/footer` : « Firestore non configuré »).

Retirer le bloc ne restaure rien : les secrets doivent être **recréés à la main**
dans le dashboard. Ne jamais déclarer de `env` ni de `vars` dans `wrangler.jsonc`
pour ce projet — tout passe par Dashboard → Settings → Variables & Secrets.

