<template>
    <div class="page-renderer" :class="{ 'admin-mode': isAdmin && isMounted }">
        <!-- Admin branch: render with triggered class when admin mode is active -->
        <template v-if="isAdmin || isServerAdmin">
            <!-- SSR/client: render with triggered class and animations in admin mode -->
            <div
                v-for="block in visibleBlocks"
                :key="block.id"
                class="block-wrapper triggered"
                :class="getAnimClass(block)"
                :ref="(el) => setWrapperRef(el, block.id)"
                :data-block-id="block.id"
                :data-block-type="block.type"
                @click.capture="wrapperClick(block.id)"
            >
                <BlockRenderer
                    :block="block"
                    :is-triggered="adminAnimated"
                    :is-admin="isAdmin || undefined"
                />
            </div>
        </template>
        <template v-else>
            <div
                v-for="block in visibleBlocks"
                :key="block.id"
                class="block-wrapper"
                :class="[
                    getAnimClass(block),
                    useTrigger(block)
                        ? { triggered: isTriggered(block.id) }
                        : { triggered: isTriggered(block.id) },
                    { 'admin-selected': isSelected(block) },
                ]"
                :ref="(el) => setWrapperRef(el, block.id)"
                :data-block-id="block.id"
                :data-block-type="block.type"
                @click.capture="isAdmin && wrapperClick(block.id)"
            >
                <BlockRenderer
                    :block="block"
                    :is-triggered="isTriggered(block.id)"
                    :is-admin="isAdmin || undefined"
                />
            </div>
        </template>
    </div>
</template>

<script lang="ts" setup>
import {
    ref,
    computed,
    watch,
    nextTick,
    inject,
    onMounted,
    onUnmounted,
} from "vue";
import {
    normalizeBlock,
    getAnimClass,
    filterByVisibility,
    shouldUseTrigger,
} from "~/lib/blocks/renderer";
import { useBlockAnimation } from "~/composables/useBlockAnimation";
import { useAdmin } from "~/composables/useAdmin";
import { useRoute } from "#app";

const isAdmin = inject("isAdmin", ref(false));
const isEditor = inject("isEditor", ref(false));
const editingBlockId = inject("editingBlockId", ref(null));
const selectBlock = inject("selectBlock", () => {});
const previewDevice = inject("previewDevice", ref("desktop"));

// SSR detection: return true on server when ?admin=true, false on client initially
const isServer = typeof window === "undefined" || !import.meta.client;
const route = useRoute();
const isServerAdmin = computed(() => {
    // On client, the value comes from isAdmin injection (via URL param check in plugin)
    // On server, we check the route for testing purposes
    if (isServer && route?.query?.admin === "true") return true;
    if (isServer) return false;
    return isAdmin.value;
});

const props = defineProps({
    blocks: { type: Array, default: () => [] },
});

const { reorderBlocks } = useAdmin();

const {
    triggeredBlocks,
    adminAnimated,
    isTriggered,
    setWrapperRef,
    setup,
    handleBlocksChange,
    handleAnimationChange,
    setupClient,
    teardownClient,
} = useBlockAnimation(isAdmin, isServerAdmin);

const isMounted = ref(false);
const adminModeActive = computed(() =>
    Boolean(isAdmin && (isMounted.value || isServer)),
);

const useTrigger = shouldUseTrigger;

const fixedBlocks = computed(() => {
    return (props.blocks || []).map(normalizeBlock);
});

const visibleBlocks = computed(() => {
    return filterByVisibility(
        fixedBlocks.value,
        previewDevice.value || "desktop",
    );
});

// Local reactive selected id (mirrors injected editingBlockId ref)
const selectedId = ref(null);
watch(
    editingBlockId,
    (v) => {
        if (selectedId.value !== v) {
            selectedId.value = v;
            try {
                if (import.meta.env.DEV)
                    console.debug("PageRenderer.selectedId changed", {
                        selectedId: v,
                    });
            } catch (e) {}
        }
    },
    { immediate: true },
);

// Call setup synchronously during component setup (safe for lifecycle hooks).
try {
    setup(props.blocks || []);
} catch (e) {}

if (typeof window !== "undefined" && import.meta.client) {
    isMounted.value = true;
} else {
    // On server: isMounted stays false, server output is placeholder only.
}

onMounted(() => {
    setupClient();
});

onUnmounted(() => {
    teardownClient();
});

// Ensure clicks inside complex child components still select the block.
// Some child components may stopPropagation on click; to be robust we add a
// capture-phase listener on `document` that finds the nearest `.block-wrapper`
// and calls selectBlock with its data-block-id. This is only active on the
// client and only when admin mode is enabled.
let docClickHandler, docPointerHandler;
if (typeof window !== "undefined" && import.meta.client) {
    docClickHandler = (ev) => {
        try {
            if (!isAdmin || !isAdmin.value) return;
            const target = ev.target;
            if (!target) return;
            const wrapper = target.closest && target.closest(".block-wrapper");
            if (wrapper) {
                const bid = wrapper.getAttribute("data-block-id");
                if (bid) {
                    try {
                        if (import.meta.env.DEV)
                            console.debug(
                                "PageRenderer.docClick: found wrapper",
                                { id: bid },
                            );
                    } catch (e) {}
                    try {
                        selectBlock(bid);
                    } catch (e) {
                        console.error(
                            "PageRenderer.docClick: selectBlock failed",
                            e,
                        );
                    }
                    try {
                        if (editingBlockId) editingBlockId.value = bid;
                    } catch (e) {}
                    try {
                        document
                            .querySelectorAll(".block-wrapper.admin-selected")
                            .forEach((el) =>
                                el.classList.remove("admin-selected"),
                            );
                        wrapper.classList.add("admin-selected");
                    } catch (e) {}
                }
            }
        } catch (e) {
            console.error("PageRenderer: doc click handler failed", e);
        }
    };

    docPointerHandler = (ev) => {
        try {
            if (!isAdmin || !isAdmin.value) return;
            const target = ev.target;
            if (!target) return;
            const wrapper = target.closest && target.closest(".block-wrapper");
            if (wrapper) {
                const bid = wrapper.getAttribute("data-block-id");
                if (bid) {
                    try {
                        if (import.meta.env.DEV)
                            console.debug(
                                "PageRenderer.docPointer: found wrapper",
                                { id: bid },
                            );
                    } catch (e) {}
                    try {
                        selectBlock(bid);
                    } catch (e) {}
                    try {
                        if (editingBlockId) editingBlockId.value = bid;
                    } catch (e) {}
                    try {
                        document
                            .querySelectorAll(".block-wrapper.admin-selected")
                            .forEach((el) =>
                                el.classList.remove("admin-selected"),
                            );
                        wrapper.classList.add("admin-selected");
                    } catch (e) {}
                }
            }
        } catch (e) {
            console.error("PageRenderer: doc pointer handler failed", e);
        }
    };
}

onMounted(() => {
    if (docClickHandler && docPointerHandler) {
        document.addEventListener("click", docClickHandler, true);
        document.addEventListener("pointerdown", docPointerHandler, true);
    }
});

onUnmounted(() => {
    if (docClickHandler)
        document.removeEventListener("click", docClickHandler, true);
    if (docPointerHandler)
        document.removeEventListener("pointerdown", docPointerHandler, true);
});

// Click wrapper handler that logs and forwards to selectBlock
function wrapperClick(id) {
    try {
        if (import.meta.env.DEV)
            console.debug("PageRenderer.wrapperClick: before", {
                id,
                editing: editingBlockId?.value,
            });
    } catch (e) {}
    try {
        selectBlock(id);
    } catch (e) {
        if (import.meta.env.DEV)
            console.debug("PageRenderer.wrapperClick: selectBlock threw", e);
    }
    // Fallback: ensure the injected editingBlockId ref is updated even if
    // the provided selectBlock is not wired correctly in some environments.
    try {
        if (editingBlockId && editingBlockId.value !== id) {
            editingBlockId.value = id;
        }
    } catch (e) {
        if (import.meta.env.DEV)
            console.debug(
                "PageRenderer.wrapperClick: failed to set editingBlockId directly",
                e,
            );
    }
    try {
        if (import.meta.env.DEV)
            console.debug("PageRenderer.wrapperClick: after", {
                id,
                editing: editingBlockId?.value,
            });
    } catch (e) {}
}

function isSelected(block) {
    try {
        // editingBlockId is a ref provided from the admin composable.
        const sel = Boolean(
            isAdmin &&
            isAdmin.value &&
            editingBlockId &&
            editingBlockId.value === block.id,
        );
        try {
            if (import.meta.env.DEV)
                console.debug("PageRenderer.isSelected", {
                    blockId: block.id,
                    editing: editingBlockId?.value,
                    result: sel,
                });
        } catch (e) {}
        return sel;
    } catch (e) {
        return false;
    }
}

// After mount, scan for stray "[object Promise]" text nodes and log their block context
// Only run this on the client — server environments don't have `document`.
if (typeof window !== "undefined" && import.meta.client) {
    nextTick().then(() => {
        try {
            // small delay to let hydration finish
            setTimeout(() => {
                const wrappers = Array.from(
                    document.querySelectorAll(".block-wrapper"),
                );
                for (const w of wrappers) {
                    for (const node of Array.from(w.childNodes || [])) {
                        if (
                            node.nodeType === Node.TEXT_NODE &&
                            node.nodeValue &&
                            node.nodeValue.includes("[object Promise]")
                        ) {
                            // find nearest block id via dataset or fallback
                            const bid =
                                w.getAttribute("data-block-id") ||
                                w
                                    .querySelector("[data-block-id]")
                                    ?.getAttribute("data-block-id") ||
                                "unknown";
                            if (import.meta.env.DEV)
                                console.debug(
                                    "PageRenderer: found [object Promise] text in wrapper",
                                    {
                                        blockId: bid,
                                        html: w.innerHTML.slice(0, 300),
                                    },
                                );
                        }
                    }
                }
            }, 50);
        } catch (e) {
            if (import.meta.env.DEV)
                console.debug("PageRenderer: error in promise-text scanner", e);
        }
    });
}

watch(
    () => (props.blocks || []).map((b) => b.id).join(","),
    async () => {
        try {
            await nextTick();
            handleBlocksChange(props.blocks || []);
        } catch (err) {
            console.error("PageRenderer: error in blocks watcher", err);
        }
    },
    { deep: false },
);

let suppressAnimationWatcher = false;
watch(
    () =>
        fixedBlocks.value.map((b) => ({ id: b.id, anim: b.props?.animation })),
    (newArr) => {
        if (suppressAnimationWatcher) return;
        try {
            handleAnimationChange(fixedBlocks.value);
        } catch (err) {
            console.error("PageRenderer: error in animation watcher", err);
        }
    },
    { deep: false },
);
</script>

<style scoped>
.page-renderer {
    width: 100%;
}
.admin-selected {
    outline: 2px solid #3b82f6;
    outline-offset: -2px;
}
.drag-container {
    width: 100%;
}
.drag-handle {
    position: absolute;
    top: 4px;
    left: 4px;
    z-index: 100;
    cursor: grab;
    background: rgba(59, 130, 246, 0.15);
    border: 1px solid rgba(59, 130, 246, 0.3);
    border-radius: 6px;
    padding: 2px 8px;
    font-size: 18px;
    line-height: 1;
    color: #3b82f6;
    opacity: 0;
    transition: opacity 0.15s;
    user-select: none;
}
.block-wrapper:hover .drag-handle {
    opacity: 1;
}
.drag-handle:active {
    cursor: grabbing;
}
</style>

<style>
.admin-mode .block-wrapper {
    cursor: pointer;
    position: relative;
    transition: outline 0.15s;
}
.admin-mode .block-wrapper:hover {
    outline: 2px dashed rgba(59, 130, 246, 0.5);
    outline-offset: -2px;
}
.admin-mode .block-wrapper.draggable {
    padding-top: 4px;
}
.block-ghost {
    opacity: 0.4;
    outline: 2px dashed #3b82f6;
    outline-offset: -2px;
    background: rgba(59, 130, 246, 0.05);
}
</style>
