<template>
  <select
    class="field-select"
    :value="value"
    @change="$emit('change', ($event.target as HTMLSelectElement).value)"
  >
    <option v-for="opt in field.options" :key="opt" :value="opt">{{ opt }}</option>
  </select>
</template>

<script setup lang="ts">
defineProps<{ value: any; field: any }>()
defineEmits<{ change: [value: string] }>()
</script>

<style scoped>
.field-select {
  width: 100%;
  padding: 7px 10px;
  background: #2d2d3f;
  border: 1px solid #3d3d55;
  border-radius: 6px;
  color: #e2e8f0;
  font-size: 0.88em;
  outline: none;
  font-family: inherit;
}
.field-select:focus { border-color: #064886; }
</style>
