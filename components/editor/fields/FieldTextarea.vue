<template>
  <textarea
    class="field-textarea"
    rows="4"
    :value="value"
    :placeholder="field.placeholder || ''"
    @input="$emit('change', ($event.target as HTMLTextAreaElement).value)"
  ></textarea>
</template>

<script setup lang="ts">
defineProps<{ value: any; field: any }>()
defineEmits<{ change: [value: string] }>()
</script>

<style scoped>
.field-textarea {
  width: 100%;
  padding: 7px 10px;
  background: #2d2d3f;
  border: 1px solid #3d3d55;
  border-radius: 6px;
  color: #e2e8f0;
  font-size: 0.88em;
  outline: none;
  font-family: inherit;
  resize: vertical;
  min-height: 80px;
}
.field-textarea:focus { border-color: #064886; }
.field-textarea::placeholder { color: #666; }
</style>
