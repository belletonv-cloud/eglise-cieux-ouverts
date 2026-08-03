import { defineConfig } from '@playwright/test'

export default defineConfig({
  testDir: './tests/playwright',
  // Increase default test timeout to allow Nuxt preview and slower CI machines
  timeout: 120000,
  retries: 0,
  // Exécution strictement sérielle : tous les fichiers de spec tapent le MÊME
  // serveur de test, dont l'état vit en mémoire (server/utils/firestore-mock.js).
  // En parallèle, le resetMock() d'un fichier efface l'état qu'un autre vient
  // de préparer — d'où des échecs intermittents qui se déplacent d'un run à
  // l'autre (comments, admin-element-animations, admin-extra-elements-canvas
  // en ont tous été victimes). Sans état partagé côté serveur, on ne peut pas
  // paralléliser sans isoler d'abord ce mock par worker.
  workers: 1,
  fullyParallel: false,
  use: {
    baseURL: 'http://localhost:3001',
    headless: true,
  },
  webServer: {
    command: 'PW_TEST=1 NITRO_PORT=3001 NITRO_HOST=0.0.0.0 node .output/server/index.mjs',
    url: 'http://localhost:3001',
    reuseExistingServer: true,
    timeout: 300000,
  },
})
