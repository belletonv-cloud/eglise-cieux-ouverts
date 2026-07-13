<template>
  <div class="field-color-row">
    <input
      type="color"
      class="field-color"
      :value="value"
      @input="$emit('change', ($event.target as HTMLInputElement).value)"
    />
    <input
      type="text"
      class="field-color-text"
      :value="value"
      @input="$emit('change', ($event.target as HTMLInputElement).value)"
    />
  </div>
</template>

<script setup lang="ts">
defineProps<{ value: any; field: any }>()
defineEmits<{ change: [value: string] }>()
</script>

<style scoped>
.field-color-row {
  display: flex;
  align-items: center;
  gap: 8px;
}
.field-color {
  width: 36px;
  height: 36px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  padding: 2px;
  background: none;
}
.field-color-text {
  flex: 1;
  background: #fff;
  border: 1px solid #ddd;
  border-radius: 6px;
  color: #1a1a2e;
  padding: 7px 10px;
  font-size: 0.82em;
  font-family: monospace;
  outline: none;
}
.field-color-text:focus { border-color: #064886; }
</style>
