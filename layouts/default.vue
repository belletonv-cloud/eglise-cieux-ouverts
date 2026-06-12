<template>
  <div id="app-root" :class="{ 'admin-mode': isAdminMode && isMounted, 'is-preview': isPreviewMode }" :style="{ '--admin-offset': (isAdminMode && isMounted) ? '48px' : '0px' }">
    <div class="admin-preview-frame" :class="`preview-${previewDevice}`">
      <template v-if="previewDevice === 'desktop' || !isAdminMode">
        <SiteHeader />
        <slot />
        <BlockFooter
          v-if="footerBlock"
          v-bind="footerBlock.props"
          :block-id="footerBlock.id"
          :data-admin="(isAdminMode && isMounted) || undefined"
        />
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
    <AdminToolbar v-if="isMounted && isAdminMode && !isPreviewMode" :page-slug="currentPageSlug" />
    <MenuEditor v-if="isMounted && isAdminMode" />
  </div>
</template>

<script setup>
import { provide, ref, onMounted, onUnmounted, computed } from 'vue'

useSeoMeta({
  ogSiteName: 'Église Cieux Ouverts — Morlaix',
  ogLocale: 'fr_FR',
  ogType: 'website',
})

const { isAdminMode, enterAdmin, exitAdmin, previewDevice, editingBlockId, selectBlock, footerBlock, loadFooterBlock } = useAdmin()

// Provide the admin composable values to child components that use inject()
provide('isAdmin', isAdminMode)
provide('editingBlockId', editingBlockId)
provide('selectBlock', selectBlock)
provide('previewDevice', previewDevice)
// legacy flag used by some components
provide('isEditor', isAdminMode)
const isMounted = ref(false)
const { loadMenuFromFirestore, saveMenuToFirestore } = useMenuEditor()

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

// Load menu and footer from Firestore when entering admin mode
watch(isAdminMode, (val) => {
  if (val && import.meta.client) {
    loadMenuFromFirestore()
    loadFooterBlock()
  }
}, { immediate: true })

// Enter admin mode after hydration to avoid v-if/v-else template mismatch
// during SSR hydration (causes block duplication + error page mismatches).
watch(() => route.query.admin, (val) => {
  if (val === 'true' && !isAdminMode.value && !isPreviewMode.value) {
    isAdminMode.value = true
  } else if (val !== 'true' && isAdminMode.value) {
    exitAdmin()
  }
})

// Reactive guard: whenever isAdminMode becomes true without admin=true in URL, revert
watch(isAdminMode, (val) => {
  if (val && route.query.admin !== 'true') {
    exitAdmin()
  }
})

const onEscape = (e) => {
  if (e.key === 'Escape' && isAdminMode.value) {
    exitAdmin()
    useRouter().replace({ query: {} }).catch(() => {})
  }
}
onMounted(() => {
  isMounted.value = true
  document.addEventListener('keydown', onEscape)
  // Activate admin mode after hydration is complete
  if (route.query.admin === 'true' && !isAdminMode.value && !isPreviewMode.value) {
    isAdminMode.value = true
  }
})
onUnmounted(() => {
  document.removeEventListener('keydown', onEscape)
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
  top: var(--admin-offset, 48px);
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
  /* header-spacer already accounts for the admin toolbar offset */
}
#app-root.admin-mode .block-main-hero {
  margin-top: 0 !important;
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
  padding-top: 68px; /* 48px toolbar + 20px spacing */
  overflow-x: auto;
}
.device-iframe {
  height: calc(100vh - 88px); /* 48px toolbar + 20px padding + 20px bottom */
  border: 1px solid #ddd;
  border-radius: 12px;
  background: white;
  box-shadow: 0 4px 24px rgba(0,0,0,0.1);
  transition: width 0.3s ease;
}
</style>
