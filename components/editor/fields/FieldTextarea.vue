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
  background: #fff;
  border: 1px solid #ddd;
  border-radius: 6px;
  color: #1a1a2e;
  font-size: 0.88em;
  outline: none;
  font-family: inherit;
  resize: vertical;
  min-height: 80px;
}
.field-textarea:focus { border-color: #064886; }
.field-textarea::placeholder { color: #999; }
</style>
