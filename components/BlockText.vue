<template>
  <div class="block-text">
    <input v-if="editable" v-model="modelValue" @blur="emitSave" />
    <p v-else>{{ modelValue }}</p>
  </div>
</template>

<script setup>
import { ref, watch, defineProps, defineEmits } from 'vue'
const { modelValue, isTriggered, editable } = defineProps({
  modelValue: { type: String, default: '' },
  isTriggered: Boolean,
  editable: Boolean
})
const emits = defineEmits(['update:modelValue', 'blur'])
const internalValue = ref(modelValue)

watch(() => modelValue, (v) => { internalValue.value = v })

function emitSave() {
  emits('update:modelValue', internalValue.value)
  emits('blur')
}
</script>

<style scoped>
.block-text {
  padding: 1rem;
  font-size: 1.25rem;
  border: 1px solid #ddd;
  background: #fffbe8;
  margin-bottom: 1rem;
}
.block-text input {
  font-size: 1.25rem;
  width: 100%;
}
</style>
