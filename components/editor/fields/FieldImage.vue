<template>
  <div class="field-image-wrap">
    <input
      type="text"
      class="field-input"
      :value="value"
      @input="$emit('change', ($event.target as HTMLInputElement).value)"
      placeholder="/chemin/image.jpg"
    />
    <img v-if="value" :src="value" class="field-image-preview" alt="preview" />
  </div>
</template>

<script setup lang="ts">
defineProps<{ value: any; field: any }>()
defineEmits<{ change: [value: string] }>()
</script>

<style scoped>
.field-image-wrap {
  display: flex;
  flex-direction: column;
  gap: 6px;
}
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
.field-image-preview {
  width: 100%;
  max-height: 80px;
  object-fit: cover;
  border-radius: 6px;
}
</style>
