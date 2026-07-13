<template>
  <div class="field-number-row">
    <input
      type="range"
      class="field-range"
      :min="field.min ?? 0"
      :max="field.max ?? 100"
      :step="field.step ?? 1"
      :value="value"
      @input="$emit('change', Number(($event.target as HTMLInputElement).value))"
    />
    <span class="field-number-val">{{ value }}</span>
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
.field-range { flex: 1; accent-color: #064886; }
.field-number-val {
  font-size: 0.82em;
  color: #6b7280;
  min-width: 30px;
  text-align: right;
}
</style>
