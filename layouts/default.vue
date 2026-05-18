<template>
  <div id="app-root" :class="{ 'admin-mode': isAdminMode }">
    <div class="admin-preview-frame" :class="`preview-${previewDevice}`">
      <SiteHeader />
      <slot />
      <SiteFooter />
    </div>
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
</script>

<style>
#app-root {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background: transparent;
  color: var(--text-dark);
}
#app-root.admin-mode {
  background: #f5f5f5;
}
#app-root.admin-mode .site-header {
  top: 48px;
}
.admin-preview-frame {
  margin: 0 auto;
  width: 100%;
  transition: max-width 0.3s ease;
}
.admin-preview-frame.preview-tablet {
  max-width: 768px;
  border-left: 1px solid #ddd;
  border-right: 1px solid #ddd;
  background: white;
}
.admin-preview-frame.preview-mobile {
  max-width: 375px;
  border-left: 1px solid #ddd;
  border-right: 1px solid #ddd;
  background: white;
}
</style>
