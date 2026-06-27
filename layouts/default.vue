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
import { provide, ref, onMounted, computed } from "vue";
import BlockFooter from "~/components/blocks/BlockFooter.vue";

useSeoMeta({
    ogSiteName: "Église Cieux Ouverts — Morlaix",
    ogLocale: "fr_FR",
    ogType: "website",
});

const {
    isAdminMode,
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
const { loadMenuFromFirestore } = useMenuEditor();

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

watch(isAdminMode, (val) => {
    if (val && !isMounted.value) return;
    if (val && route.query.admin !== "true") {
        exitAdmin();
    }
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

    if (route.query.admin === "true" && !isPreviewMode.value) {
        waitForAuth().then((user) => {
            if (user) {
                isAdminMode.value = true;
            } else {
                redirectToLogin();
            }
        });
    }
    if (["mobile", "tablet", "desktop"].includes(route.query.device)) {
        previewDevice.value = route.query.device;
    }
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
