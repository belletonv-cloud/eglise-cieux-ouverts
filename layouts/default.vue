<template>
  <div id="app-root">
    <SiteHeader />
    <slot />
    <SiteFooter />
    <AdminToolbar v-if="isAdminMode" :page-slug="currentPageSlug" />
  </div>
</template>

<script setup>
const { isAdminMode } = useAdmin()

const route = useRoute()
const currentPageSlug = computed(() => {
  const path = route.path.replace('/', '')
  return path === '' ? 'accueil' : path
})
</script>
