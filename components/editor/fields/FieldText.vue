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
  background: #fff;
  border: 1px solid #ddd;
  border-radius: 6px;
  color: #1a1a2e;
  font-size: 0.88em;
  outline: none;
  font-family: inherit;
}
.field-input:focus { border-color: #064886; }
.field-input::placeholder { color: #999; }
</style>
