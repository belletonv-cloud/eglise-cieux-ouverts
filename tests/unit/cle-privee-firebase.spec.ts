import { test, expect } from '@playwright/test'
import { getAccessToken, ERREUR_CLE_PRIVEE } from '../../server/utils/firebase'

/**
 * Une clé privée Firebase mal recopiée est la panne de configuration la plus
 * courante de ce projet (retours à la ligne perdus ou guillemets conservés au
 * copier-coller dans le dashboard Cloudflare). Le message natif de `atob()` —
 * « atob() called with invalid base64-encoded string » — traversait toute la
 * pile et ressortait tel quel au visiteur, sous la forme « Erreur chargement
 * menu: atob() called with invalid base64-encoded string ». Rien n'indiquait
 * qu'il s'agissait d'un secret, ni lequel, ni où regarder.
 *
 * Constaté sur l'environnement de recette, dont GET /api/menu, /api/footer et
 * /api/pages/accueil répondaient 500 avec ce message.
 */

test.describe('Clé privée Firebase illisible — message actionnable', () => {
  test('une clé non décodable en base64 donne le message explicite', async () => {
    const erreur = await getAccessToken('robot@exemple.iam.gserviceaccount.com', 'pas une clé PEM du tout §§§')
      .then(() => null)
      .catch((e) => e)

    expect(erreur).toBeTruthy()
    expect(erreur.message).toBe(ERREUR_CLE_PRIVEE)
  })

  test('une base64 valide qui n\'est pas une clé PKCS8 donne le même message', async () => {
    const faussePem = '-----BEGIN PRIVATE KEY-----\n' + btoa('ceci est bien du base64 mais pas une clé') + '\n-----END PRIVATE KEY-----'

    const erreur = await getAccessToken('robot@exemple.iam.gserviceaccount.com', faussePem)
      .then(() => null)
      .catch((e) => e)

    expect(erreur).toBeTruthy()
    expect(erreur.message).toBe(ERREUR_CLE_PRIVEE)
  })

  test('le message nomme la variable et oriente vers le diagnostic', () => {
    // Ce qu'on veut lire quand la production tombe : quoi, et où regarder.
    expect(ERREUR_CLE_PRIVEE).toContain('NUXT_FIREBASE_PRIVATE_KEY')
    expect(ERREUR_CLE_PRIVEE).toContain('/api/health')
  })
})
