import { test, expect } from '@playwright/test'
import { loginAsAdmin } from './helpers/admin'
import { resetMock } from './helpers/reset'

/**
 * Gestion des rôles admin (admin vs editor). L'utilisateur mock par défaut
 * (ci-admin@tests.fr, voir plugins/auth-mock.client.ts) a le rôle 'admin'.
 * Le suffixe ':email' du token mock (voir server/utils/firebase-admin.ts)
 * permet de simuler un autre utilisateur pour les appels API directs.
 */

const ADMIN_TOKEN = 'mock-test-token'
const EDITOR_TOKEN = 'mock-test-token:editor@tests.fr'

test.describe('Gestion des rôles admin', () => {
  test.beforeEach(async ({ request }) => {
    await resetMock(request)
  })

  test('ajouter un admin avec le rôle éditeur puis le passer admin, via l\'UI', async ({ page }) => {
    await loginAsAdmin(page)
    await page.locator('.admin-btn-secondary', { hasText: 'Admins' }).click()

    await page.locator('.admin-mgr-input').fill('nouvel.editeur@example.com')
    await page.getByRole('button', { name: 'Ajouter' }).click()

    const row = page.locator('.admin-mgr-row', { hasText: 'nouvel.editeur@example.com' })
    await expect(row).toBeVisible({ timeout: 3000 })
    await expect(row.locator('.admin-mgr-role-select')).toHaveValue('editor')

    await row.locator('.admin-mgr-role-select').selectOption('admin')
    await expect(row.locator('.admin-mgr-role-select')).toHaveValue('admin', { timeout: 3000 })
  })

  test('retirer un admin de la liste', async ({ page, request }) => {
    await request.post('/api/admin/users', {
      headers: { Authorization: `Bearer ${ADMIN_TOKEN}` },
      data: { email: 'a.retirer@example.com', role: 'editor' },
    })

    await loginAsAdmin(page)
    await page.locator('.admin-btn-secondary', { hasText: 'Admins' }).click()
    const row = page.locator('.admin-mgr-row', { hasText: 'a.retirer@example.com' })
    await expect(row).toBeVisible({ timeout: 3000 })
    await row.locator('.admin-mgr-del-btn').click()
    await expect(row).not.toBeVisible({ timeout: 3000 })
  })

  test('un compte avec le rôle admin ne peut pas se retirer lui-même ni changer son propre rôle', async ({ page }) => {
    await loginAsAdmin(page)
    await page.locator('.admin-btn-secondary', { hasText: 'Admins' }).click()

    const ownRow = page.locator('.admin-mgr-row', { hasText: 'ci-admin@tests.fr' })
    await expect(ownRow).toBeVisible({ timeout: 3000 })
    // Pas de select ni de bouton de suppression sur sa propre ligne — juste un badge
    await expect(ownRow.locator('.admin-mgr-role-select')).toHaveCount(0)
    await expect(ownRow.locator('.admin-mgr-role-badge')).toHaveText('Admin')
    await expect(ownRow.locator('.admin-mgr-del-btn')).toBeDisabled()
  })
})

test.describe('API /api/admin/users — permissions par rôle', () => {
  test.beforeEach(async ({ request }) => {
    await resetMock(request)
  })

  test('un éditeur ne peut pas ajouter un admin (403)', async ({ request }) => {
    // Enregistrer l'éditeur dans la liste mock avec le rôle 'editor'
    await request.post('/api/admin/users', {
      headers: { Authorization: `Bearer ${ADMIN_TOKEN}` },
      data: { email: 'editor@tests.fr', role: 'editor' },
    })

    const res = await request.post('/api/admin/users', {
      headers: { Authorization: `Bearer ${EDITOR_TOKEN}` },
      data: { email: 'intrus@example.com', role: 'admin' },
    })
    expect(res.status()).toBe(403)
  })

  test('un éditeur ne peut pas retirer un admin (403)', async ({ request }) => {
    await request.post('/api/admin/users', {
      headers: { Authorization: `Bearer ${ADMIN_TOKEN}` },
      data: { email: 'editor@tests.fr', role: 'editor' },
    })

    const res = await request.delete('/api/admin/users', {
      headers: { Authorization: `Bearer ${EDITOR_TOKEN}` },
      data: { email: 'ci-admin@tests.fr' },
    })
    expect(res.status()).toBe(403)
  })

  test('un éditeur ne peut pas changer un rôle (403)', async ({ request }) => {
    await request.post('/api/admin/users', {
      headers: { Authorization: `Bearer ${ADMIN_TOKEN}` },
      data: { email: 'editor@tests.fr', role: 'editor' },
    })

    const res = await request.put('/api/admin/users', {
      headers: { Authorization: `Bearer ${EDITOR_TOKEN}` },
      data: { email: 'editor@tests.fr', role: 'admin' },
    })
    expect(res.status()).toBe(403)
  })

  test('un admin peut ajouter, promouvoir puis retirer un compte', async ({ request }) => {
    const add = await request.post('/api/admin/users', {
      headers: { Authorization: `Bearer ${ADMIN_TOKEN}` },
      data: { email: 'cycle@example.com', role: 'editor' },
    })
    expect(add.ok()).toBe(true)
    const addBody = await add.json()
    expect(addBody.users.find((u: any) => u.email === 'cycle@example.com')?.role).toBe('editor')

    const promote = await request.put('/api/admin/users', {
      headers: { Authorization: `Bearer ${ADMIN_TOKEN}` },
      data: { email: 'cycle@example.com', role: 'admin' },
    })
    expect(promote.ok()).toBe(true)
    const promoteBody = await promote.json()
    expect(promoteBody.users.find((u: any) => u.email === 'cycle@example.com')?.role).toBe('admin')

    const remove = await request.delete('/api/admin/users', {
      headers: { Authorization: `Bearer ${ADMIN_TOKEN}` },
      data: { email: 'cycle@example.com' },
    })
    expect(remove.ok()).toBe(true)
    const removeBody = await remove.json()
    expect(removeBody.users.some((u: any) => u.email === 'cycle@example.com')).toBe(false)
  })

  test('GET /api/admin/check retourne le rôle courant', async ({ request }) => {
    const res = await request.get('/api/admin/check', {
      headers: { Authorization: `Bearer ${ADMIN_TOKEN}` },
    })
    expect(res.ok()).toBe(true)
    const body = await res.json()
    expect(body.isAdmin).toBe(true)
    expect(body.role).toBe('admin')
  })
})
