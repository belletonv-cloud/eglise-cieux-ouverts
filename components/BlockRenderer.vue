<template>
    <component
        v-if="resolvedComponent"
        :is="resolvedComponent"
        v-bind="sprops"
        :block-id="bid"
        :visibility="bvisibility"
        :is-triggered="isTriggered"
        :data-admin="isAdmin || undefined"
    />
    <div v-else style="display: none" data-block-renderer-fallback="true">
        {{ btype }}
    </div>
</template>

<script setup>
import { computed } from "vue";

// Découvre automatiquement tous les components/blocks/Block*.vue au build
// (eager: true = import statique classique, pas de lazy-loading — même
// comportement qu'avant, juste plus besoin de lister chaque bloc à la main
// ici). Ajouter un type de bloc ne demande plus que : entrée BLOCK_TYPES
// (utils/blockTypes.js) + fichier components/blocks/Block<Type>.vue —
// avant il fallait aussi se souvenir d'ajouter une ligne d'import ET un
// v-else-if ici, un oubli rendait le bloc invisible sans erreur explicite.
const blockModules = import.meta.glob("~/components/blocks/Block*.vue", { eager: true });

// BlockTextImage.vue -> textImage (inverse de pascalCase() dans
// lib/blocks/component-registry.ts ; aucun type de BLOCK_TYPES ne contient
// de tiret, la première lettre suffit à inverser la transformation).
function typeFromFileName(path) {
    const fileName = path.split("/").pop().replace(/^Block/, "").replace(/\.vue$/, "");
    return fileName.charAt(0).toLowerCase() + fileName.slice(1);
}

const componentsByType = Object.fromEntries(
    Object.entries(blockModules).map(([path, mod]) => [typeFromFileName(path), mod.default]),
);

const props = defineProps({
    block: { type: Object, required: true },
    isTriggered: { type: Boolean, default: false },
    isAdmin: { type: Boolean, default: false },
});

const btype = computed(() => props.block?.type);
const bid = computed(() => props.block?.id);
const bvisibility = computed(() => props.block?.visibility || {});
const resolvedComponent = computed(() => componentsByType[btype.value] || null);

function clean(value, path = "") {
    if (value === null || value === undefined) return value;
    if (typeof value !== "object") return value;
    if (typeof value.then === "function") return null;
    if (Array.isArray(value))
        return value.map((v, i) => clean(v, path ? `${path}[${i}]` : `[${i}]`));
    const res = {};
    for (const [k, v] of Object.entries(value))
        res[k] = clean(v, path ? `${path}.${k}` : k);
    return res;
}

const sprops = computed(() => clean(props.block?.props || {}));
</script>
