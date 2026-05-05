<template>
  <div
    class="block-spacer"
    :style="{ height: props.height + 'px', background: props.backgroundColor || 'transparent' }"
    :class="visibilityClasses"
  ></div>
</template>

<script setup>
const p = defineProps({
  props: { type: Object, required: true },
  visibility: { type: Object, default: () => ({}) },
})
const visibilityClasses = computed(() => ({
  'hide-mobile': p.visibility.mobile === false,
  'hide-tablet': p.visibility.tablet === false,
  'hide-desktop': p.visibility.desktop === false,
}))
</script>
