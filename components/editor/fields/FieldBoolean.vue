<template>
  <label class="field-toggle">
    <input
      type="checkbox"
      :checked="!!value"
      @change="$emit('change', ($event.target as HTMLInputElement).checked)"
      :aria-label="'Toggle ' + field.label"
    />
    <span class="toggle-slider"></span>
  </label>
</template>

<script setup lang="ts">
defineProps<{ value: any; field: any }>()
defineEmits<{ change: [value: boolean] }>()
</script>

<style scoped>
.field-toggle {
  display: flex;
  align-items: center;
  cursor: pointer;
  position: relative;
}
.field-toggle input { display: none; }
.toggle-slider {
  width: 40px;
  height: 22px;
  background: #3d3d55;
  border-radius: 11px;
  position: relative;
  transition: background 0.2s;
  flex-shrink: 0;
}
.toggle-slider::after {
  content: '';
  position: absolute;
  width: 16px;
  height: 16px;
  background: white;
  border-radius: 50%;
  top: 3px;
  left: 3px;
  transition: transform 0.2s;
}
.field-toggle input:checked + .toggle-slider { background: #064886; }
.field-toggle input:checked + .toggle-slider::after { transform: translateX(18px); }
</style>
