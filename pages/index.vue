<template>
    <div>
        <PageRenderer :blocks="blocks" />
    </div>
</template>

<script setup>
import { getDefaultHomePage } from "~/utils/blockTypes.js";

useSeoMeta({
    title: "Église Cieux Ouverts — Morlaix",
    ogTitle: "Église Cieux Ouverts — Morlaix",
    description:
        "Bienvenue à l'Église Cieux Ouverts à Morlaix. Découvrez nos événements, cultes et activités.",
    ogDescription:
        "Bienvenue à l'Église Cieux Ouverts à Morlaix. Découvrez nos événements, cultes et activités.",
    ogImage:
        "https://static.wixstatic.com/media/d65230_2d9fe5fd35e84c55b202fcf057c136b5~mv2.jpg",
    ogUrl: "https://eglise-cieux-ouverts.pages.dev",
    ogType: "website",
    twitterCard: "summary_large_image",
});

const { isAdminMode, enterAdmin, localBlocks, localBlocksPage } = useAdmin();

// Fetch blocks from API, fallback to getDefaultHomePage if empty.
// The handler runs ONCE during SSR (result serialized to payload),
// so server and client always get the same data → no key mismatch.
const { data: pageBlocks } = await useAsyncData(
    "page-accueil-blocks",
    async () => {
        const data = await $fetch("/api/pages/accueil").catch(() => ({
            blocks: [],
        }));
        return data?.blocks?.length ? data.blocks : getDefaultHomePage();
    },
);

const blocks = computed(() => {
    if (
        isAdminMode.value &&
        localBlocks.value.length &&
        localBlocksPage.value === "accueil"
    ) {
        return localBlocks.value;
    }
    return pageBlocks.value?.length ? pageBlocks.value : getDefaultHomePage();
});

function initAdminBlocks() {
    if (!isAdminMode.value) return;
    if (pageBlocks.value?.length) {
        enterAdmin(pageBlocks.value, "accueil");
    } else {
        enterAdmin(getDefaultHomePage(), "accueil");
    }
}

// Watch admin mode changes (initial load + toggling)
watch(
    () => isAdminMode.value,
    () => {
        initAdminBlocks();
    },
    { immediate: true },
);

// Also watch pageBlocks to catch late-arriving data after client-side navigation
watch(pageBlocks, () => {
    if (isAdminMode.value) {
        initAdminBlocks();
    }
});
</script>
