<template>
    <div
        id="app-root"
        :class="{
            'admin-mode': isAdminMode && isMounted,
            'is-preview': isPreviewMode,
            'is-inner-preview': isInnerPreview,
        }"
        :style="{ '--admin-offset': isAdminMode && isMounted && !isInnerPreview ? '48px' : '0px' }"
    >
        <div class="admin-preview-frame" :class="`preview-${previewDevice}`">
            <ClientOnly>
                <AdminToolbar
                    v-if="isMounted && isAdminMode && !isPreviewMode && !isInnerPreview"
                    :page-slug="currentPageSlug"
                    @navigate-preview="onNavigatePreview"
                />
            </ClientOnly>

            <!-- Desktop: inline rendering (blocks editable) -->
            <div v-if="previewDevice === 'desktop' || isInnerPreview" :class="deviceClass">
                <SiteHeader />
                <slot />
                <div
                    class="footer-editable-wrap"
                    :class="{ 'admin-selected': editingFooter }"
                    @click.capture="onFooterClick"
                >
                    <BlockFooter
                        v-bind="footerBlock.props"
                        :block-id="footerBlock.id"
                        :data-admin="(isAdminMode && isMounted) || undefined"
                    />
                </div>
            </div>

            <!-- Mobile/tablet: iframe for faithful rendering -->
            <iframe
                v-else-if="isMounted"
                :src="previewIframeSrc"
                :width="deviceWidth"
                class="preview-iframe"
                :class="`preview-${previewDevice}`"
                title="Aperçu mobile/tablet"
            />
        </div>
        <MenuEditor v-if="isMounted && isAdminMode && !isInnerPreview" />
    </div>
</template>

<script setup>
import { provide, ref, onMounted, onUnmounted, computed } from "vue";
import BlockFooter from "~/components/blocks/BlockFooter.vue";

useSeoMeta({
    ogSiteName: "Église Cieux Ouverts — Morlaix",
    ogLocale: "fr_FR",
    ogType: "website",
});

const {
    isAdminMode,
    enterAdmin,
    exitAdmin,
    previewDevice,
    editingBlockId,
    selectBlock,
    editingFooter,
    footerBlock,
    loadFooterBlock,
    selectFooter,
} = useAdmin();

provide("isAdmin", isAdminMode);
provide("editingBlockId", editingBlockId);
provide("selectBlock", selectBlock);
provide("previewDevice", previewDevice);
provide("isEditor", isAdminMode);
const isMounted = ref(false);
const { loadMenuFromFirestore, saveMenuToFirestore } = useMenuEditor();

const route = useRoute();
const currentPageSlug = computed(() => {
    const path = route.path.replace("/", "");
    return path === "" ? "accueil" : path;
});

const isPreviewMode = computed(() => route.query.preview === "true");
const isInnerPreview = computed(() => route.query["preview-inner"] === "1");

const deviceClass = computed(() => {
    if (!isAdminMode.value) return ''
    return `preview-${previewDevice.value}`
})

// Slug used by the iframe (can differ from current page when dropdown changes)
const previewSlug = ref(currentPageSlug.value)

const previewIframeSrc = computed(() => {
    const path = previewSlug.value === "accueil" ? "/" : `/${previewSlug.value}`
    const params = new URLSearchParams({
        admin: "true",
        "preview-inner": "1",
        device: previewDevice.value,
    })
    return path + "?" + params.toString()
})

function onNavigatePreview(slug) {
    previewSlug.value = slug
}

async function waitForAuth() {
    if (import.meta.server || !import.meta.client) return null;
    const { $auth } = useNuxtApp();
    if (!$auth?.onAuthStateChanged) return null;
    return await new Promise((resolve) => {
        const unsubscribe = $auth.onAuthStateChanged((user) => {
            resolve(user);
            if (typeof unsubscribe === "function") unsubscribe();
        });
    });
}

async function redirectToLogin() {
    if (import.meta.server) return;
    const router = useRouter();
    const fullPath = useRoute().fullPath;
    await router.replace(
        "/admin?redirect=" + encodeURIComponent(fullPath),
    );
}

watch(
    isAdminMode,
    (val) => {
        if (val && import.meta.client) {
            loadMenuFromFirestore();
        }
    },
    { immediate: true },
);

watch(
    () => route.query.admin,
    async (val) => {
        if (import.meta.server) return;
        if (val === "true" && !isAdminMode.value && !isPreviewMode.value && !isInnerPreview.value) {
            const user = await waitForAuth();
            if (user) {
                isAdminMode.value = true;
            } else {
                redirectToLogin();
            }
        } else if (val !== "true" && isAdminMode.value) {
            exitAdmin();
        }
    },
);

// In iframe (preview-inner): activate admin mode without toolbar
watch(
    () => route.query["preview-inner"],
    async (val) => {
        if (import.meta.server) return;
        if (val === "1" && !isAdminMode.value) {
            const user = await waitForAuth();
            if (user) {
                isAdminMode.value = true;
            }
        }
    },
);

watch(isAdminMode, (val) => {
    if (val && !isMounted.value) return;
    if (val && route.query.admin !== "true" && !isInnerPreview.value) {
        exitAdmin();
    }
});

watch(previewDevice, (device) => {
    if (!isMounted.value) return;
    const router = useRouter();
    const query = { ...route.query, device };
    router.replace({ query }).catch(() => {});
});

const onEscape = (e) => {
    if (e.key === "Escape" && isAdminMode.value && !isInnerPreview.value) {
        exitAdmin();
        useRouter()
            .replace({ query: {} })
            .catch((e) => console.warn("layouts/default: router.replace failed", e));
    }
};
onMounted(() => {
    isMounted.value = true;
    document.addEventListener("keydown", onEscape);

    if (route.query.admin === "true" && !isPreviewMode.value && !isInnerPreview.value) {
        waitForAuth().then((user) => {
            if (user) {
                isAdminMode.value = true;
            } else {
                redirectToLogin();
            }
        });
    }
    if (route.query["preview-inner"] === "1") {
        waitForAuth().then((user) => {
            if (user) isAdminMode.value = true;
        });
        // Force scroll to top so page content starts at viewport top
        window.scrollTo(0, 0)
        try { history.scrollRestoration = 'manual' } catch (e) {}
    }
    if (["mobile", "tablet", "desktop"].includes(route.query.device)) {
        previewDevice.value = route.query.device;
    }
    loadFooterBlock();

    // Listen for block clicks from preview iframe
    function onIframeMessage(e) {
        if (e.data?.type === "block-click" && isAdminMode.value && !isInnerPreview.value) {
            selectBlock(e.data.blockId)
        }
    }
    window.addEventListener("message", onIframeMessage)
    onUnmounted(() => {
        window.removeEventListener("message", onIframeMessage)
    })
});
onUnmounted(() => {
    document.removeEventListener("keydown", onEscape);
});

function onFooterClick(e) {
    if (!isAdminMode.value || !isMounted.value) return;
    e.stopPropagation();
    selectFooter();
}
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
#app-root.is-inner-preview {
    background: white;
}
.admin-preview-frame {
    margin: 0 auto;
    width: 100%;
    transition: max-width 0.3s ease;
}
.admin-preview-frame.preview-tablet {
    max-width: 768px;
    box-shadow: 0 0 0 1px #ddd, 0 4px 24px rgba(0,0,0,0.1);
    border-radius: 12px;
    overflow: hidden;
    margin-top: 48px;
    margin-bottom: 12px;
}
.admin-preview-frame.preview-mobile {
    max-width: 375px;
    box-shadow: 0 0 0 1px #ddd, 0 4px 24px rgba(0,0,0,0.1);
    border-radius: 12px;
    overflow: hidden;
    margin-top: 48px;
    margin-bottom: 12px;
}
.admin-preview-frame.preview-tablet,
.admin-preview-frame.preview-mobile {
    background: white;
}
/* In iframe preview (preview-inner=1) suppress all admin overlays */
#app-root.is-inner-preview .admin-sidebar-overlay,
#app-root.is-inner-preview .admin-sidebar,
#app-root.is-inner-preview .admin-toolbar {
    display: none !important;
}
.preview-iframe {
    width: 100%;
    height: calc(100vh - 48px - 12px);
    border: none;
    display: block;
    background: white;
}
.footer-editable-wrap {
    position: relative;
    outline: 2px solid transparent;
    outline-offset: -2px;
    transition: outline-color 0.2s;
}
.footer-editable-wrap.admin-selected {
    outline-color: #3b82f6;
}
#app-root.admin-mode .footer-editable-wrap {
    cursor: pointer;
}
#app-root.admin-mode .footer-editable-wrap:hover {
    outline-color: rgba(59, 130, 246, 0.4);
}
</style>
