<template>
    <BlockHero
        v-if="btype === 'hero'"
        v-bind="sprops"
        :block-id="bid"
        :visibility="bvisibility"
        :is-triggered="isTriggered"
        :data-admin="isAdmin || undefined"
    />
    <BlockBienvenue
        v-else-if="btype === 'bienvenue'"
        v-bind="sprops"
        :block-id="bid"
        :visibility="bvisibility"
        :is-triggered="isTriggered"
        :data-admin="isAdmin || undefined"
    />
    <BlockRejoins
        v-else-if="btype === 'rejoins'"
        v-bind="sprops"
        :block-id="bid"
        :visibility="bvisibility"
        :is-triggered="isTriggered"
        :data-admin="isAdmin || undefined"
    />
    <BlockAspirations
        v-else-if="btype === 'aspirations'"
        v-bind="sprops"
        :block-id="bid"
        :is-triggered="isTriggered"
        :data-admin="isAdmin || undefined"
    />
    <BlockVision
        v-else-if="btype === 'vision'"
        v-bind="sprops"
        :block-id="bid"
        :is-triggered="isTriggered"
        :data-admin="isAdmin || undefined"
    />
    <BlockActivities
        v-else-if="btype === 'activities'"
        v-bind="sprops"
        :block-id="bid"
        :is-triggered="isTriggered"
        :data-admin="isAdmin || undefined"
    />
    <BlockNousRejoindre
        v-else-if="btype === 'nousRejoindre'"
        v-bind="sprops"
        :block-id="bid"
        :is-triggered="isTriggered"
        :data-admin="isAdmin || undefined"
    />
    <BlockContact
        v-else-if="btype === 'contact'"
        v-bind="sprops"
        :block-id="bid"
        :is-triggered="isTriggered"
        :data-admin="isAdmin || undefined"
    />
    <BlockRichText
        v-else-if="btype === 'richText'"
        v-bind="sprops"
        :block-id="bid"
        :is-triggered="isTriggered"
        :data-admin="isAdmin || undefined"
    />
    <BlockGallery
        v-else-if="btype === 'gallery'"
        v-bind="sprops"
        :block-id="bid"
        :is-triggered="isTriggered"
        :data-admin="isAdmin || undefined"
    />
    <BlockSpacer
        v-else-if="btype === 'spacer'"
        v-bind="sprops"
        :block-id="bid"
        :is-triggered="isTriggered"
        :data-admin="isAdmin || undefined"
    />
    <BlockFullWidthImage
        v-else-if="btype === 'fullWidthImage'"
        v-bind="sprops"
        :block-id="bid"
        :is-triggered="isTriggered"
        :data-admin="isAdmin || undefined"
    />
    <BlockTextImage
        v-else-if="btype === 'textImage'"
        v-bind="sprops"
        :block-id="bid"
        :is-triggered="isTriggered"
        :data-admin="isAdmin || undefined"
    />
    <BlockYoutube
        v-else-if="btype === 'youtube'"
        v-bind="sprops"
        :block-id="bid"
        :is-triggered="isTriggered"
        :data-admin="isAdmin || undefined"
    />
    <div v-else style="display: none" data-block-renderer-fallback="true">
        {{ btype }}
    </div>
</template>

<script setup>
import { computed } from "vue";
import BlockHero from "~/components/blocks/BlockHero.vue";
import BlockBienvenue from "~/components/blocks/BlockBienvenue.vue";
import BlockRejoins from "~/components/blocks/BlockRejoins.vue";
import BlockAspirations from "~/components/blocks/BlockAspirations.vue";
import BlockVision from "~/components/blocks/BlockVision.vue";
import BlockActivities from "~/components/blocks/BlockActivities.vue";
import BlockNousRejoindre from "~/components/blocks/BlockNousRejoindre.vue";
import BlockContact from "~/components/blocks/BlockContact.vue";
import BlockRichText from "~/components/blocks/BlockRichText.vue";
import BlockGallery from "~/components/blocks/BlockGallery.vue";
import BlockSpacer from "~/components/blocks/BlockSpacer.vue";
import BlockFullWidthImage from "~/components/blocks/BlockFullWidthImage.vue";
import BlockTextImage from "~/components/blocks/BlockTextImage.vue";
import BlockYoutube from "~/components/blocks/BlockYoutube.vue";

const props = defineProps({
    block: { type: Object, required: true },
    isTriggered: { type: Boolean, default: false },
    isAdmin: { type: Boolean, default: false },
});

const btype = computed(() => props.block?.type);
const bid = computed(() => props.block?.id);
const bvisibility = computed(() => props.block?.visibility || {});

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
