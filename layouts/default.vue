<template>
  <div id="app-root">
    <SiteHeader />
    <slot />
    <SiteFooter />
    <AdminToolbar v-if="isAdminMode" :page-slug="currentPageSlug" />
  </div>
</template>

<script setup>
const { isAdminMode, enterAdmin, previewDevice } = useAdmin()

const route = useRoute()
const currentPageSlug = computed(() => {
  const path = route.path.replace('/', '')
  return path === '' ? 'accueil' : path
})

if (import.meta.client && route.query.admin === 'true' && !isAdminMode.value) {
  enterAdmin([])
}

watch(() => route.query.admin, (val) => {
  if (val === 'true' && !isAdminMode.value) {
    enterAdmin([])
  }
})

provide('previewDevice', previewDevice)
</script>
