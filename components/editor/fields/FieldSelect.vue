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
  background: #fff;
  border: 1px solid #ddd;
  border-radius: 6px;
  color: #1a1a2e;
  font-size: 0.88em;
  outline: none;
  font-family: inherit;
}
.field-select:focus { border-color: #064886; }
</style>
