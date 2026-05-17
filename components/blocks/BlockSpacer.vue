<template>
  <div
    class="block-spacer"
    :style="{ height: height + 'px', background: backgroundColor || 'transparent' }"
    :class="visibilityClasses"
  ></div>
</template>

<script setup>
const { visibility = {} } = defineProps({
  height: { type: Number, default: 60 },
  backgroundColor: { type: String, default: 'transparent' },
  visibility: { type: Object, default: () => ({}) },
  isTriggered: { type: Boolean, default: false },
  previewDevice: { type: String, default: 'desktop' },
})
const visibilityClasses = computed(() => ({
  'hide-mobile': visibility.mobile === false,
  'hide-tablet': visibility.tablet === false,
  'hide-desktop': visibility.desktop === false,
}))
</script>
