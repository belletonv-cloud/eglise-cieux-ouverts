<template>
  <input
    type="text"
    class="field-input"
    :value="value"
    :placeholder="field.placeholder || ''"
    @input="$emit('change', ($event.target as HTMLInputElement).value)"
  />
</template>

<script setup lang="ts">
defineProps<{ value: any; field: any }>()
defineEmits<{ change: [value: string] }>()
</script>

<style scoped>
.field-input {
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
.field-input:focus { border-color: #064886; }
.field-input::placeholder { color: #666; }
</style>
