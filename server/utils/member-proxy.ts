import type { H3Event } from 'h3'
import { verifyFirebaseToken } from './firebase-admin'

// Helper commun des proxies /api/member/* : en mode test, résout l'email du
// mock-token et laisse le handler appeler member-mock.js ; sinon forwarde le
// Bearer vers le Worker eglise-app (qui fait l'authentification réelle).

export function isMemberTestEnv(): boolean {
  return (
    process.env.NODE_ENV === 'test' || process.env.PW_TEST === '1' || process.env.TEST_ENV === '1'
  )
}

export function requireBearer(event: H3Event): string {
  const auth = getRequestHeader(event, 'Authorization') || ''
  if (!auth.startsWith('Bearer ')) {
    throw createError({ statusCode: 401, message: 'Non authentifié' })
  }
  return auth.slice(7)
}

export async function resolveTestEmail(event: H3Event, token: string): Promise<string> {
  const info = await verifyFirebaseToken(token, event)
  if (!info?.email) {
    throw createError({ statusCode: 401, message: 'Non authentifié' })
  }
  return info.email
}

// Renvoie la réponse mock, ou lève l'erreur HTTP qu'elle contient.
export function mockResult<T extends { error?: string; status?: number }>(res: T): T {
  if (res && res.error) {
    throw createError({ statusCode: res.status || 400, message: res.error })
  }
  return res
}

export async function forwardToWorker(
  event: H3Event,
  token: string,
  path: string,
  options: { method?: string; body?: unknown } = {},
) {
  const config = useRuntimeConfig(event)
  const apiUrl = (config.public.apiUrl as string) || 'https://eglise-app.belletonv.workers.dev'
  const res = await fetch(`${apiUrl}${path}`, {
    method: options.method || 'GET',
    headers: {
      Authorization: `Bearer ${token}`,
      ...(options.body ? { 'Content-Type': 'application/json' } : {}),
    },
    ...(options.body ? { body: JSON.stringify(options.body) } : {}),
  })
  const data = await res.json().catch(() => ({}))
  if (!res.ok) {
    throw createError({
      statusCode: res.status,
      message: (data as { error?: string }).error || `Erreur eglise-app ${res.status}`,
    })
  }
  return data
}
