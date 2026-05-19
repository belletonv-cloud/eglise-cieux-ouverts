<template>
  <div id="app-root" :class="{ 'admin-mode': isAdminMode, 'is-preview': isPreviewMode }">
    <div class="admin-preview-frame" :class="`preview-${previewDevice}`">
      <template v-if="previewDevice === 'desktop' || !isAdminMode">
        <SiteHeader />
        <slot />
        <SiteFooter />
      </template>
      <div v-else class="device-iframe-wrap">
        <iframe
          :src="previewUrl"
          :style="{ width: deviceWidth + 'px' }"
          class="device-iframe"
          frameborder="0"
        />
      </div>
    </div>
    <AdminToolbar v-if="isAdminMode && !isPreviewMode" :page-slug="currentPageSlug" />
  </div>
</template>

<script setup>
const { isAdminMode, enterAdmin, previewDevice } = useAdmin()

const route = useRoute()
const currentPageSlug = computed(() => {
  const path = route.path.replace('/', '')
  return path === '' ? 'accueil' : path
})

const isPreviewMode = computed(() => route.query.preview === 'true')

const deviceWidth = computed(() => {
  if (previewDevice.value === 'mobile') return 375
  if (previewDevice.value === 'tablet') return 768
  return '100%'
})

const previewUrl = computed(() => {
  const params = new URLSearchParams(window.location.search)
  params.set('preview', 'true')
  return window.location.pathname + '?' + params.toString()
})

if (import.meta.client && route.query.admin === 'true' && !isAdminMode.value && !isPreviewMode.value) {
  enterAdmin([])
}

watch(() => route.query.admin, (val) => {
  if (val === 'true' && !isAdminMode.value && !isPreviewMode.value) {
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
#app-root.is-preview {
  background: #f5f5f5;
}
#app-root.is-preview .site-header {
  top: 0;
}
.admin-preview-frame {
  margin: 0 auto;
  width: 100%;
  transition: max-width 0.3s ease;
}
#app-root.admin-mode .admin-preview-frame {
  padding-top: 48px;
}
.admin-preview-frame.preview-tablet {
  max-width: 100%;
}
.admin-preview-frame.preview-mobile {
  max-width: 100%;
}
.device-iframe-wrap {
  display: flex;
  justify-content: center;
  padding-top: 20px;
  overflow-x: auto;
}
.device-iframe {
  height: calc(100vh - 68px);
  border: 1px solid #ddd;
  border-radius: 12px;
  background: white;
  box-shadow: 0 4px 24px rgba(0,0,0,0.1);
  transition: width 0.3s ease;
}
</style>
