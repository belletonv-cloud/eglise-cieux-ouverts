# Helpers Playwright (`tests/playwright/helpers`)

## Pourquoi ?

Ce dossier regroupe toutes les fonctions utilitaires génériques Playwright
pour fiabiliser, factoriser et accélérer l’écriture de tests E2E.

## Importer les helpers

Dans vos fixtures ou vos tests :  
```ts
import { resetMock } from './helpers/reset'
import { loginAsAdmin, expectAdminBadge } from './helpers/admin'
import { openBlockEditor, dragBlock, editBlockTitle } from './helpers/blocks'
import { saveChanges, waitForModal } from './helpers/ui'
```

## Conventions de nommage

- Nom clair, verbe d'action (`resetMock`, `loginAsAdmin`, `dragBlock`...)
- TypeScript typé : types Playwright (`Page`, `APIRequestContext`, etc.)
- Un helper = une action atomique ou une routine claire (pas de sur-agrégation)

## Exemples d’utilisation

```ts
await resetMock(request)
await loginAsAdmin(page, '/event-list')
await openBlockEditor(page, 'BLOCK_ID')
await editBlockTitle(page, 'Titre modifié')
await dragBlock(page, 0, 2)
await saveChanges(page)
await waitForModal(page, '.my-modal')
```

## Bonnes pratiques

- Utilisez toujours ces helpers au lieu de dupliquer le code dans vos specs ou fixtures.
- Étendez-les pour couvrir toutes vos patterns E2E récurrentes.
- En cas de refonte UI : modifiez le helper, pas chaque test individuellement.
