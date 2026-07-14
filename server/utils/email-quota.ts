// Limite mensuelle d'envois d'emails via Resend (configurable, sinon 100/mois
// par défaut — conservateur par rapport au quota gratuit Resend de 100/jour).
export function getEmailQuotaLimit(): number {
  const parsed = parseInt(process.env.NUXT_RESEND_MONTHLY_QUOTA || '', 10)
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 100
}
