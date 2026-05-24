<template>
  <div class="editor-field-error" v-if="error">
    <p class="error-message">⚠️ {{ error }}</p>
  </div>
  <slot v-else />
</template>

<script setup>
import { ref, onErrorCaptured } from 'vue'

const props = defineProps({
  fieldKey: { type: String, default: '' },
})

const error = ref(null)

onErrorCaptured((err) => {
  error.value = `Erreur dans le champ "${props.fieldKey}": ${err.message || err}`
  console.error(`[EditorFieldError] ${props.fieldKey}:`, err)
  return false
})
</script>

<style scoped>
.editor-field-error {
  padding: 10px;
  background: #2d1b1b;
  border: 1px solid #EF4B54;
  border-radius: 6px;
}
.error-message {
  color: #EF4B54;
  font-size: 0.82em;
  margin: 0;
}
</style>
