// Envoi d'emails via l'API HTTP de Mailjet.
//
// Pourquoi HTTP et pas SMTP : le site tourne sur Cloudflare Pages Functions
// (runtime Workers). Ce runtime n'expose pas de sockets TCP façon Node —
// `nodemailer` ne peut donc PAS ouvrir de connexion SMTP en production, quels
// que soient l'hôte et le port (587 comme 465). Un envoi SMTP peut sembler
// marcher en `nuxt dev` (vrai Node) puis échouer silencieusement une fois
// déployé. L'API HTTP passe par un simple `fetch`, nativement supporté.
//
// Expéditeur : Mailjet refuse tout envoi depuis une adresse non validée
// (erreur « sender address has not been validated »). Valider une adresse
// unique se fait en cliquant un lien reçu par email — aucun accès DNS requis,
// contrairement à la validation d'un domaine entier.

import { fetchWithTimeout, EMAIL_TIMEOUT_MS } from './http'

export interface SendEmailResult {
  ok: boolean
  /** Raison lisible en cas d'échec — destinée aux logs, jamais à l'utilisateur final. */
  error?: string
}

export interface SendEmailParams {
  to: string[]
  subject: string
  html: string
  /** Adresse à laquelle l'admin répondra en cliquant « Répondre ». */
  replyTo?: string
}

/**
 * Échappe une valeur avant interpolation dans le `html` d'un email.
 *
 * À utiliser pour TOUTE donnée venant d'un visiteur : le formulaire de contact
 * est public, donc nom, ville et message sont du texte arbitraire. Interpolés
 * bruts, ils laissaient un inconnu composer le corps de l'email reçu par les
 * responsables — un `<a href="…">Voir le message</a>` inséré dans le message
 * arrive avec l'apparence d'une notification légitime du site.
 */
export function escapeHtml(valeur: string): string {
  return valeur
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

/** Retire les retours à la ligne d'un sujet : ils n'y ont pas leur place. */
export function nettoyerSujet(sujet: string): string {
  return sujet.replace(/[\r\n]+/g, ' ').trim()
}

export function getMailjetConfig() {
  const apiKey = process.env.NUXT_MAILJET_API_KEY || ''
  const apiSecret = process.env.NUXT_MAILJET_API_SECRET || ''
  const fromEmail = process.env.NUXT_MAILJET_FROM_EMAIL || ''
  const fromName = process.env.NUXT_MAILJET_FROM_NAME || 'Église Cieux Ouverts'
  if (!apiKey || !apiSecret || !fromEmail) return null
  return { apiKey, apiSecret, fromEmail, fromName }
}

export async function sendEmail(params: SendEmailParams): Promise<SendEmailResult> {
  const config = getMailjetConfig()
  if (!config) return { ok: false, error: 'Mailjet non configuré (clé, secret ou expéditeur manquant)' }
  if (!params.to.length) return { ok: false, error: 'Aucun destinataire' }

  const message: Record<string, unknown> = {
    From: { Email: config.fromEmail, Name: config.fromName },
    To: params.to.map((email) => ({ Email: email })),
    Subject: params.subject,
    HTMLPart: params.html,
  }
  if (params.replyTo) message.ReplyTo = { Email: params.replyTo }

  try {
    const response = await fetchWithTimeout('https://api.mailjet.com/v3.1/send', {
      method: 'POST',
      headers: {
        authorization: `Basic ${btoa(`${config.apiKey}:${config.apiSecret}`)}`,
        'content-type': 'application/json',
      },
      body: JSON.stringify({ Messages: [message] }),
    }, EMAIL_TIMEOUT_MS)

    const body = await response.text()
    if (!response.ok) {
      return { ok: false, error: `Mailjet HTTP ${response.status} : ${body.slice(0, 500)}` }
    }

    // Mailjet répond 200 même quand un message individuel est rejeté (ex.
    // expéditeur non validé) : le vrai verdict est dans Messages[].Status.
    const parsed = JSON.parse(body)
    const failed = (parsed.Messages || []).filter((m: any) => m.Status !== 'success')
    if (failed.length) {
      return { ok: false, error: `Mailjet a rejeté l'envoi : ${JSON.stringify(failed).slice(0, 500)}` }
    }
    return { ok: true }
  } catch (err: any) {
    return { ok: false, error: err?.message || String(err) }
  }
}
