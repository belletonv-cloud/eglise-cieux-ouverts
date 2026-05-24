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
  background: #2d2d3f;
  border: 1px solid #3d3d55;
  border-radius: 6px;
  color: #e2e8f0;
  font-size: 0.88em;
  outline: none;
  font-family: monospace;
  resize: vertical;
  min-height: 120px;
}
.field-richtext:focus { border-color: #064886; }
</style>
