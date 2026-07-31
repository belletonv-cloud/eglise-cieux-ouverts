# Bugs connus et points d'attention

## [2026-07-31] Formulaire de contact - Erreur validation Mailjet expéditeur

### Symptôme
Lors de l'envoi d'un message via le formulaire de contact, l'email n'est pas envoyé et l'erreur suivante apparaît dans les logs ou l'interface d'administration :

```
Hello Victor,

We are contacting you as you (or one of your team members) tried to send an email with sender address: noreply@cieuxouverts.bzh. But this sender address has not been validated yet on your account: 86185e1186f5f8b3e7217c38e39ca4a0.

Please validate the sender within 3 days, so that we can send your email. You can manage your senders in the Senders and domains page or by using the /sender API resource.
```

### Cause
L'adresse expéditeur `noreply@cieuxouverts.bzh` est configurée dans Firestore (`settings/config` → `contactFromEmail`) mais n'a pas été validée dans le compte Mailjet.

### Solution
1. **Option A** : Valider le domaine dans Mailjet
   - Connexion à https://app.mailjet.com/
   - Aller dans **Settings → Senders and domains**
   - Ajouter/valider le domaine `cieuxouverts.bzh`

2. **Option B** : Utiliser l'adresse par défaut
   - Dans Firestore, supprimer ou modifier `contactFromEmail` dans le document `settings/config`
   - Ou utiliser `noreply@example.com` comme valeur par défaut

### Code concerné
- `server/api/contact.post.ts` lignes 134-157 : récupération de `contactFromEmail` depuis Firestore
- `server/api/contact.post.ts` lignes 165-200 : envoi email via nodemailer/Mailjet SMTP

### Variables d'environnement nécessaires
- `NUXT_MAILJET_SMTP_HOST`
- `NUXT_MAILJET_SMTP_PORT`
- `NUXT_MAILJET_SMTP_USER`
- `NUXT_MAILJET_SMTP_PASS`

### Statut
À vérifier/corriger en production