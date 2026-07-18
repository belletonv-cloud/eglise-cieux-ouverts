# Prompts de correction - Incohérences identifiées

Ce fichier fournit les instructions explicites (prompts autoporteurs) pour corriger chaque incohérence identifiée dans `FEATURES.md`.

Chaque correction est basée sur des patterns éprouvés tirés de projets open source :

| Pattern | Source éprouvée |
|---------|-----------------|
| Visibility CSS classes | PayloadCMS [Blocks Visibility](https://payloadcms.com/docs/fields/blocks) |
| Computed CSS dynamic | Vue 3 [Reactivity in Depth](https://vuejs.org/guide/reactivity.html) |
| Array field editing | Directus [Interfaces](https://docs.directus.io/guides/customizing-admin-app.html) |
| Inline styles protection | Sanity [GROQ Security](https://www.sanity.io/docs/groq) (null-safety) |

---

## 1. BlockStats.vue - Visibility + Animation

**Problème** : La prop `visibility` et le champ `animation` dans le schema ne sont pas appliqués.

**Pattern éprouvé** : PayloadCMS utilise un mixin `visibilityClasses` sur chaque bloc pour gérer le responsive. Voir [PayloadCMS Blocks](https://payloadcms.com/docs/fields/blocks) - la approche est similaire : props reçues → classes CSS appliquées.

**Prompt** :
```
Corriger BlockStats.vue pour appliquer la visibilité par device et l'animation wrapper.

Modifications à faire dans /Users/vic/Projects/eglise-cieux-ouverts/components/blocks/BlockStats.vue :

1. Ajouter computed `visibilityClasses` dans le <script setup> :
```javascript
const visibilityClasses = computed(() => ({
  'hide-mobile': props.visibility?.mobile === false,
  'hide-tablet': props.visibility?.tablet === false,
  'hide-desktop': props.visibility?.desktop === false,
}))
```

2. Ajouter animation wrapper dans le <script setup> :
```javascript
const { isTriggered } = useBlockAnimation() // ou inject('isAdmin')

const animClass = computed(() => {
  const anim = props.animation || 'none'
  return anim !== 'none' ? `block-anim-${anim}` : ''
})
```

3. Modifier le template <section> pour ajouter les classes :
```html
<section
  class="block-stats"
  :style="{ background: backgroundColor, color: textColor }"
  :class="[visibilityClasses, animClass, { triggered: isTriggered }]"
>
```

Le pattern exact se trouve dans BlockRichText.vue (ligne 11) ou BlockTextImage.vue (ligne 5).
```

---

## 2. BlockQuote.vue - Visibility + Animation

**Problème** : Même problème que BlockStats.vue.

**Pattern éprouvé** : Directus applique les animations en mode "inline" ou "wrapper" selon le type de champ. Voir [Directus Interfaces](https://docs.directus.io/guides/customizing-admin-app.html) - le pattern de computed `animClass` est standard.

**Prompt** :
```
Corriger BlockQuote.vue pour appliquer la visibilité par device et l'animation wrapper.

Modifications à faire dans /Users/vic/Projects/eglise-cieux-ouverts/components/blocks/BlockQuote.vue :

1. Ajouter computed `visibilityClasses` dans le <script setup> (après les props) :
```javascript
const { visibility = {} } = props
const visibilityClasses = computed(() => ({
  'hide-mobile': visibility.mobile === false,
  'hide-tablet': visibility.tablet === false,
  'hide-desktop': visibility.desktop === false,
}))
```

2. Ajouter animation wrapper :
```javascript
const animClass = computed(() => {
  const anim = props.animation || 'none'
  return anim !== 'none' ? `block-anim-${anim}` : ''
})
```

3. Modifier le template <section> (ligne 2) :
```html
<section class="block-quote" :style="{ background: backgroundColor }" :class="[visibilityClasses, animClass, { triggered: isTriggered }]" data-field-key="quote">
```

4. Ajouter `isTriggered` dans les props (déjà présent dans props mais verify)
```



---

## 3. BlockFooter.vue - Visibility

**Problème** : La visibilité par device n'est pas appliquée.

**Pattern éprouvé** : Builder.io utilise des "responsive variants" sur chaque composant. Le pattern CSS `.hide-mobile { display: none }` est universel - voir [Builder.io Responsive](https://www.builder.io/c/docs/responsive-editing).

**Prompt** :
```
Corriger BlockFooter.vue pour appliquer la visibilité par device.

Modifications à faire dans /Users/vic/Projects/eglise-cieux-ouverts/components/blocks/BlockFooter.vue :

1. Ajouter computed `visibilityClasses` dans le <script setup> :
```javascript
import { computed } from 'vue'
// ... après les props existantes
const visibilityClasses = computed(() => ({
  'hide-mobile': props.visibility?.mobile === false,
  'hide-tablet': props.visibility?.tablet === false,
  'hide-desktop': props.visibility?.desktop === false,
}))
```

2. Modifier le template <footer> (ligne 5) pour ajouter :class
```html
<footer class="block-footer" :class="visibilityClasses" :style="footerStyle">
```

NOTE : Le footer a `animations: "internal"` donc pas besoin d'animation wrapper.
```

---

## 4. BlockSpacer.vue - fieldFonts

**Problème** : `fieldFonts` et `fieldFontSizes` sont reçus mais jamais utilisés.

**Pattern éprouvé** : Sanity protège tous les champs éditables avec des valeurs par défaut. Voir [Sanity GROQ](https://www.sanity.io/docs/groq) - le principe de "null-safety" s'applique aussi aux styles inline.

**Prompt** :
```
Appliquer fieldFonts au texte et image du Spacer.

Modifications à faire dans /Users/vic/Projects/eglise-cieux-ouverts/components/blocks/BlockSpacer.vue :

1. Ajouter import en haut du fichier :
```javascript
import { fieldFontStyle } from '~/utils/fonts.js'
```

2. Modifier le template pour appliquer le style sur .spacer-text (ligne 9) :
```html
<p class="spacer-text" :style="{ textAlign: contentAlign, ...fieldFontStyle(fieldFonts, 'text', fieldFontSizes) }">{{ text }}</p>
```

3. Modifier le template pour appliquer le style sur .spacer-img (ligne 8) :
```html
<img :src="image" :alt="text" class="spacer-img" :style="fieldFontStyle(fieldFonts, 'text', fieldFontSizes)" />
```
```

---

## 5. FieldElements.vue - Bouton richtext

**Problème** : Le type `richtext` est supporté dans le code mais pas dans l'UI.

**Pattern éprouvé** : PayloadCMS [Blocks Field](https://payloadcms) ajoute automatiquement les boutons d'ajout selon les types déclarés. Le pattern est : schema.types → UI.buttons.

**Prompt** :
```
Ajouter le bouton "+ Texte HTML" dans FieldElements.vue pour permettre l'ajout d'éléments richtext.

Modifications à faire dans /Users/vic/Projects/eglise-cieux-ouverts/components/editor/FieldElements.vue :

1. Vérifier que ExtraElementKind inclut 'richtext' (déjà fait dans le code)

2. Ajouter un bouton après les autres boutons d'ajout (autour de la ligne 115) :
```html
<button class="array-add-btn" @click="addItem('richtext')">+ Texte HTML</button>
```

3. Vérifier que la méthode addItem gère bien le type 'richtext' :
   - La méthode utilise `element.key === 'richtext'` pour le template
   - Un placeholder HTML par défaut peut être ajouté : `<p>Nouveau contenu HTML...</p>`
```

---

## 6. BlockFaq.vue - Protection undefined

**Problème** : `:style="{ fontSize: item.questionSize }"` devient `"fontSize: undefined"` si non défini.

**Pattern éprouvé** : Sanity encode toujours la "null-safety" dans ses composants. Le style inline avec valeurs optionnelles doit toujours vérifier avant application - voir [Sanity Best Practices](https://www.sanity.io/docs).

**Prompt** :
```
Protéger les styles inline dans BlockFaq.vue contre les valeurs undefined.

Modifications à faire dans /Users/vic/Projects/eglise-cieux-ouverts/components/blocks/BlockFaq.vue :

1. Remplacer ligne ~14 (question) :
```html
<!-- AVANT -->
<div class="faq-question" :style="{ fontSize: item.questionSize }">{{ item.question }}</div>

<!-- APRÈS -->
<div class="faq-question" :style="item.questionSize ? { fontSize: item.questionSize } : {}">{{ item.question }}</div>
```

2. Remplacer ligne ~17 (answer) de la même façon :
```html
<!-- AVANT -->
<div class="faq-answer" :style="{ fontSize: item.answerSize }" v-html="sanitizedHtml(item.answer)"></div>

<!-- APRÈS -->
<div class="faq-answer" :style="item.answerSize ? { fontSize: item.answerSize } : {}" v-html="sanitizedHtml(item.answer)"></div>
```
```

---

## 7. Tests manquants - Visibilité par device

**Problème** : Aucun test ne vérifie le masquage par device.

**Pattern éprouvé** : PayloadCMS utilise des tests d'intégration pour chaque bloc. Voir [PayloadCMS Testing Guide](https://payloadcms.com/docs/testing) - chaque propriété modifiable doit avoir son test E2E.

**Prompt** :
```
Ajouter des tests E2E pour vérifier le masquage par device.

Créer les tests dans /Users/vic/Projects/eglise-cieux-ouverts/tests/playwright/visibility-device.spec.ts :

1. Tester le masquage du bloc Stats :
```javascript
test('stats block visibility toggle works', async ({ page }) => {
  await page.goto('/test-blocks?admin=true')
  await page.waitForSelector('.block-stats')
  const statsBlock = page.locator('.block-stats').first()
  // ... sélectionner, cliquer sur masquer mobile, vérifier la classe
})
```

2. Tester le masquage du bloc Quote et Footer de la même façon.

Le pattern exact se trouve dans tests/playwright/admin-animations.spec.ts pour la détection des classes CSS.
```

---

## Ordre de correction recommandé

1. **BlockStats.vue** et **BlockQuote.vue** - car ils ont un bug visible utilisateur
2. **BlockFooter.vue** - même bug de visibilité
3. **BlockFaq.vue** - protection contre crash potentiel
4. **BlockSpacer.vue** - amélioration UX
5. **FieldElements.vue** - ajout feature manquante
6. **Tests E2E** - pour éviter la régression

---

## Vérification post-correction

Après chaque correction :
```bash
npm run build && npx playwright test tests/unit/fields/FieldArray.spec.ts --reporter=list
npm run typecheck  # si disponible
```