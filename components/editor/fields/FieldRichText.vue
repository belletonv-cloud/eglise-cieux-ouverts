<template>
  <textarea
    class="field-richtext"
    rows="6"
    :value="value"
    @input="$emit('change', ($event.target as HTMLTextAreaElement).value)"
  ></textarea>
</template>

<script setup lang="ts">
defineProps<{ value: any; field: any }>()
defineEmits<{ change: [value: string] }>()
</script>

<style scoped>
.field-richtext {
  width: 100%;
  padding: 7px 10px;
  background: #fff;
  border: 1px solid #ddd;
  border-radius: 6px;
  color: #1a1a2e;
  font-size: 0.88em;
  outline: none;
  font-family: monospace;
  resize: vertical;
  min-height: 120px;
}
.field-richtext:focus { border-color: #064886; }
</style>
