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
  background: #2d2d3f;
  border: 1px solid #3d3d55;
  border-radius: 6px;
  color: #e2e8f0;
  padding: 7px 10px;
  font-size: 0.82em;
  font-family: monospace;
  outline: none;
}
.field-color-text:focus { border-color: #064886; }
</style>
