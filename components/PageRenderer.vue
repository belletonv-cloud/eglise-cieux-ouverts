<template>
    <div class="page-renderer" :class="{ 'admin-mode': isAdmin && isMounted }">
        <div
            v-for="block in visibleBlocks"
            :key="block.id"
            class="block-wrapper"
            :class="[
                getAnimClass(block),
                { triggered: isTriggered(block.id) },
                { 'admin-selected': isAdmin && isSelected(block) },
            ]"
            :ref="(el) => setWrapperRef(el, block.id)"
            :data-block-id="block.id"
            :data-block-type="block.type"
            @click.capture="wrapperClick(block.id)"
        >
            <BlockRenderer
                :block="block"
                :is-triggered="isTriggered(block.id)"
                :is-admin="isAdmin || undefined"
            />
        </div>
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

// In iframe preview mode, forward block clicks to parent
function onBlockSelected(id) {
    selectBlock(id)
    try {
        if (typeof window !== 'undefined' && window.top !== window.self) {
            window.parent.postMessage({ type: 'block-click', blockId: id }, '*')
        }
    } catch (e) {
        console.warn("PageRenderer: postMessage failed", e)
    }
}

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
        }
    },
    { immediate: true },
);

// Call setup synchronously during component setup (safe for lifecycle hooks).
try {
    setup(props.blocks || []);
} catch (e) {
    if (typeof window !== "undefined")
        console.warn("PageRenderer: setup failed", e);
}

if (typeof window !== "undefined" && import.meta.client) {
    isMounted.value = true;
} else {
    // On server: isMounted stays false, server output is placeholder only.
}

// Admin floating replay buttons for registered animated elements
function setupElementReplayButtons() {
    if (!isAdmin || !isAdmin.value) return
    const container = document.createElement('div')
    container.id = 'anim-replay-container'
    container.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;pointer-events:none;z-index:9999'
    document.body.appendChild(container)

    function positionButtons() {
        container.innerHTML = ''
        const animEls = document.querySelectorAll('[data-anim-key]')
        animEls.forEach((el) => {
            const rect = el.getBoundingClientRect()
            if (rect.width === 0) return
            const key = el.getAttribute('data-anim-key') || ''
            const btn = document.createElement('button')
            btn.textContent = '▶'
            btn.title = 'Rejouer l\'animation'
            btn.dataset.animKey = key
            btn.style.cssText = [
                'position:fixed',
                `top:${rect.top + 4}px`,
                `left:${rect.right + 4}px`,
                'width:24px',
                'height:24px',
                'border:none',
                'border-radius:50%',
                'background:rgba(0,0,0,0.45)',
                'color:#fff',
                'font-size:11px',
                'cursor:pointer',
                'pointer-events:auto',
                'opacity:0',
                'transition:opacity 0.15s',
                'display:flex',
                'align-items:center',
                'justify-content:center',
                'line-height:1',
                'z-index:10000',
            ].join(';')

            // Show on hover over the animated element
            el.addEventListener('mouseenter', () => { btn.style.opacity = '1' }, { once: false })
            el.addEventListener('mouseleave', () => { btn.style.opacity = '0' })
            btn.addEventListener('mouseenter', () => { btn.style.opacity = '1' })
            btn.addEventListener('mouseleave', () => { btn.style.opacity = '0' })

            btn.addEventListener('click', (e) => {
                e.stopPropagation()
                const parts = key.split(':')
                if (parts.length === 2) {
                    document.dispatchEvent(new CustomEvent('replay-element-animation', { detail: { blockId: parts[0], elementId: parts[1] } }))
                }
            })
            container.appendChild(btn)
        })
    }

    positionButtons()
    const repositionTimer = setInterval(positionButtons, 500)

    // Cleanup
    const origTeardown = teardownClient
    const origOnUnmounted = onUnmounted
    // We override teardown to also clean up the container
    const cleanup = () => {
        clearInterval(repositionTimer)
        if (container.parentNode) container.parentNode.removeChild(container)
    }

    return cleanup
}

let animReplayCleanup = null
onMounted(() => {
    setupClient();
    if (isAdmin && isAdmin.value) {
        animReplayCleanup = setupElementReplayButtons()
    }
});

onUnmounted(() => {
    teardownClient();
    if (animReplayCleanup) animReplayCleanup()
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
                        onBlockSelected(bid);
                    } catch (e) {
                        console.error(
                            "PageRenderer.docClick: selectBlock failed",
                            e,
                        );
                    }
                    try {
                        if (editingBlockId) editingBlockId.value = bid;
                    } catch (e) {
                        console.warn("PageRenderer.docClick: could not set editingBlockId", e);
                    }
                    try {
                        document
                            .querySelectorAll(".block-wrapper.admin-selected")
                            .forEach((el) =>
                                el.classList.remove("admin-selected"),
                            );
                        wrapper.classList.add("admin-selected");
                    } catch (e) {
                        console.warn("PageRenderer.docClick: could not update DOM classes", e);
                    }
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
                        onBlockSelected(bid);
                    } catch (e) {
                        console.warn("PageRenderer.docPointer: selectBlock failed", e);
                    }
                    try {
                        if (editingBlockId) editingBlockId.value = bid;
                    } catch (e) {
                        console.warn("PageRenderer.docPointer: could not set editingBlockId", e);
                    }
                    try {
                        document
                            .querySelectorAll(".block-wrapper.admin-selected")
                            .forEach((el) =>
                                el.classList.remove("admin-selected"),
                            );
                        wrapper.classList.add("admin-selected");
                    } catch (e) {
                        console.warn("PageRenderer.docPointer: could not update DOM classes", e);
                    }
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

function wrapperClick(id) {
    onBlockSelected(id)
    try {
        if (editingBlockId && editingBlockId.value !== id) {
            editingBlockId.value = id;
        }
    } catch (e) {
        console.warn("PageRenderer.wrapperClick: failed to set editingBlockId directly", e);
    }
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
                        }
                    }
                }
            }, 50);
        } catch (e) {
            console.warn("PageRenderer: error in promise-text scanner", e);
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
