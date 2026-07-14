<template>
  <div class="field-number-row">
    <input
      type="number"
      class="field-number-input"
      :min="field.min ?? 0"
      :max="field.max ?? 100"
      :step="field.step ?? 1"
      :value="value"
      @input="$emit('change', Number(($event.target as HTMLInputElement).value))"
      :placeholder="`${field.min ?? 0}–${field.max ?? 100}`"
    />
  </div>
</template>

<script setup lang="ts">
defineProps<{ value: any; field: any }>()
defineEmits<{ change: [value: number] }>()
</script>

<style scoped>
.field-number-row {
  display: flex;
  align-items: center;
  gap: 10px;
}
.field-number-input {
  flex: 1;
  padding: 6px 10px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 0.9em;
  font-family: inherit;
}
.field-number-input:focus {
  outline: none;
  border-color: #064886;
  box-shadow: 0 0 0 2px rgba(6, 72, 134, 0.1);
}
</style>
