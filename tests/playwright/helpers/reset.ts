import { APIRequestContext } from '@playwright/test'

/**
 * Réinitialise tous les mocks et la base via l'API de reset
 * @throws Error si la requête échoue
 */
export async function resetMock(request: APIRequestContext): Promise<void> {
  const res = await request.post('/api/reset-mock')
  if (!res.ok()) throw new Error('resetMock failed: ' + res.status())
}
