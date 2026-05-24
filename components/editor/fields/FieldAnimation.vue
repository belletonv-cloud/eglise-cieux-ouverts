<template>
  <div class="field-animations">
    <button
      v-for="anim in ANIMATIONS"
      :key="anim.id"
      class="anim-btn"
      :class="{ active: value === anim.id }"
      :aria-pressed="value === anim.id"
      @click="$emit('change', anim.id)"
    >{{ anim.label }}</button>
  </div>
</template>

<script setup lang="ts">
import { ANIMATIONS } from '~/utils/blockTypes.js'
defineProps<{ value: any; field: any }>()
defineEmits<{ change: [value: string] }>()
</script>

<style scoped>
.field-animations {
  display: flex;
  flex-wrap: wrap;
  gap: 5px;
}
.anim-btn {
  padding: 5px 10px;
  background: #2d2d3f;
  border: 1.5px solid #3d3d55;
  border-radius: 20px;
  color: #9999bb;
  font-size: 0.75em;
  cursor: pointer;
  transition: all 0.15s;
}
.anim-btn.active {
  background: #064886;
  border-color: #064886;
  color: white;
  font-weight: 600;
}
.anim-btn:hover { border-color: #064886; color: white; }
</style>
