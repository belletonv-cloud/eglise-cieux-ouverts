<template>
    <div
        id="app-root"
        :class="{
            'admin-mode': isAdminMode && isMounted,
            'is-preview': isPreviewMode,
        }"
        :style="{ '--admin-offset': isAdminMode && isMounted ? '48px' : '0px' }"
    >
        <div class="admin-preview-frame" :class="`preview-${previewDevice}`">
            <ClientOnly>
                <AdminToolbar
                    v-if="isMounted && isAdminMode && !isPreviewMode"
                    :page-slug="currentPageSlug"
                />
            </ClientOnly>
            <div :class="deviceClass">
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
        </div>
        <MenuEditor v-if="isMounted && isAdminMode" />
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

// Provide the admin composable values to child components that use inject()
provide("isAdmin", isAdminMode);
provide("editingBlockId", editingBlockId);
provide("selectBlock", selectBlock);
provide("previewDevice", previewDevice);
// legacy flag used by some components
provide("isEditor", isAdminMode);
const isMounted = ref(false);
const { loadMenuFromFirestore, saveMenuToFirestore } = useMenuEditor();

const route = useRoute();
const currentPageSlug = computed(() => {
    const path = route.path.replace("/", "");
    return path === "" ? "accueil" : path;
});

const isPreviewMode = computed(() => route.query.preview === "true");

const deviceClass = computed(() => {
    if (!isAdminMode.value) return ''
    return `preview-${previewDevice.value}`
})

// Client-only auth check — returns user or null
// Uses $auth.onAuthStateChanged directly (works with both real Firebase
// and the mock $auth provided by auth-mock.client.ts in PW_TEST mode).
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

const deviceWidth = computed(() => {
    if (previewDevice.value === "mobile") return 375;
    if (previewDevice.value === "tablet") return 768;
    return "100%";
});

const previewUrl = computed(() => {
    if (import.meta.server) return "";
    const path = route.path;
    const params = new URLSearchParams(route.query);
    params.set("preview", "true");
    return path + "?" + params.toString();
});

// Load menu and footer from Firestore when entering admin mode
watch(
    isAdminMode,
    (val) => {
        if (val && import.meta.client) {
            loadMenuFromFirestore();
        }
    },
    { immediate: true },
);

// Activate admin mode when ?admin=true is present and user is authenticated.
// SSR activation is intentionally skipped — Firebase auth is client-only.
watch(
    () => route.query.admin,
    async (val) => {
        if (import.meta.server) return;
        if (val === "true" && !isAdminMode.value && !isPreviewMode.value) {
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

// Reactive guard: whenever isAdminMode becomes true without admin=true in URL, revert
// Only check after mount to avoid race condition with onMounted setting adminMode
watch(isAdminMode, (val) => {
    if (val && !isMounted.value) return; // Skip before mount
    if (val && route.query.admin !== "true") {
        exitAdmin();
    }
});

// Sync preview device to URL so it survives page reload / navigation
watch(previewDevice, (device) => {
    if (!isMounted.value) return;
    const router = useRouter();
    const query = { ...route.query, device };
    router.replace({ query }).catch(() => {});
});

const onEscape = (e) => {
    if (e.key === "Escape" && isAdminMode.value) {
        exitAdmin();
        useRouter()
            .replace({ query: {} })
            .catch((e) => console.warn("layouts/default: router.replace failed", e));
    }
};
onMounted(() => {
    isMounted.value = true;
    document.addEventListener("keydown", onEscape);
    // Activate admin mode after hydration is complete — auth guarded
    if (route.query.admin === "true" && !isPreviewMode.value) {
        waitForAuth().then((user) => {
            if (user) {
                isAdminMode.value = true;
            } else {
                redirectToLogin();
            }
        });
    }
    // Restore preview device from URL (persisted across navigations)
    if (["mobile", "tablet", "desktop"].includes(route.query.device)) {
        previewDevice.value = route.query.device;
    }
    // Load footer from Firestore (always, not just admin mode)
    loadFooterBlock();
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
    margin-top: 12px;
    margin-bottom: 12px;
}
.admin-preview-frame.preview-mobile {
    max-width: 375px;
    box-shadow: 0 0 0 1px #ddd, 0 4px 24px rgba(0,0,0,0.1);
    border-radius: 12px;
    overflow: hidden;
    margin-top: 12px;
    margin-bottom: 12px;
}
.admin-preview-frame.preview-tablet,
.admin-preview-frame.preview-mobile {
    background: white;
}
/* In tablet/mobile preview the header should flow inside the constrained frame */
.admin-preview-frame.preview-tablet .site-header,
.admin-preview-frame.preview-mobile .site-header {
    position: relative !important;
    top: 0 !important;
    left: auto !important;
    right: auto !important;
    width: auto !important;
}
/* Push content below fixed toolbar in preview frames */
.admin-preview-frame.preview-tablet > .preview-tablet,
.admin-preview-frame.preview-mobile > .preview-mobile {
    margin-top: 48px;
}
/* Force mobile nav display in preview modes (viewport is desktop but we want mobile) */
.admin-preview-frame.preview-tablet .site-header .nav-desktop,
.admin-preview-frame.preview-mobile .site-header .nav-desktop {
    display: none !important;
}
.admin-preview-frame.preview-tablet .site-header .burger,
.admin-preview-frame.preview-mobile .site-header .burger {
    display: flex !important;
}
/* Mobile nav positioning inside preview frame */
.admin-preview-frame.preview-tablet .nav-mobile,
.admin-preview-frame.preview-mobile .nav-mobile {
    position: fixed !important;
    top: 100% !important;
    left: 0 !important;
    right: 0 !important;
    bottom: 0 !important;
    max-height: calc(100vh - 48px - 52px);
}
/* Mobile header background on menu open in preview */
.admin-preview-frame.preview-tablet .site-header.menu-open,
.admin-preview-frame.preview-mobile .site-header.menu-open {
    background: #064886 !important;
    border-bottom: none !important;
    box-shadow: none !important;
}
.admin-preview-frame.preview-tablet .site-header.menu-open .burger span,
.admin-preview-frame.preview-mobile .site-header.menu-open .burger span {
    background: white !important;
}
.admin-preview-frame.preview-tablet .site-header.menu-open .logo,
.admin-preview-frame.preview-mobile .site-header.menu-open .logo {
    filter: brightness(0) invert(1) !important;
}
/* Spacer is unnecessary when header is in flow */
.admin-preview-frame.preview-tablet .header-spacer,
.admin-preview-frame.preview-mobile .header-spacer {
    display: none !important;
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
