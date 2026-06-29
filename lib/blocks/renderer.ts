import { ANIMATIONS, BLOCK_TYPES } from "~/utils/blockTypes.js";
import { mergeDesignDefaults } from "~/utils/designDefaults.js";
import { blockRegistry } from "./registry";
import {
  getBlockComponentName,
  getBlockCssSelector,
} from "./component-registry";
import type { BlockInstance, AnimationStrategy } from "./types";

export function getAnimationStrategy(type: string): AnimationStrategy {
  const entry = blockRegistry.get(type);
  if (entry) return entry.animations;
  const def = BLOCK_TYPES[type];
  if (def?.animations) return def.animations as AnimationStrategy;
  return "wrapper";
}

export function getAnimClass(block: BlockInstance): string {
  if (!block.props?.animation || block.props.animation === "none") return "";
  const strategy = getAnimationStrategy(block.type);
  if (strategy !== "wrapper") return "";
  const anim = ANIMATIONS.find((a) => a.id === block.props.animation);
  return anim ? `block-${anim.css}` : "";
}

export function shouldUseTrigger(block: BlockInstance): boolean {
  const strategy = getAnimationStrategy(block.type);
  return strategy === "wrapper";
}

export function normalizeBlock(block: BlockInstance): BlockInstance {
  if (!block) return block;
  const copy = { ...block };
  let propsSrc = copy.props;
  if (propsSrc && propsSrc.props && typeof propsSrc.props === "object") {
    propsSrc = { ...propsSrc.props };
  }
  propsSrc = propsSrc || {};

  if (copy.type && BLOCK_TYPES[copy.type]) {
    const safe: Record<string, any> = {};
    for (const [k, v] of Object.entries(propsSrc)) {
      if (v !== "" && v !== null && v !== undefined) safe[k] = v;
    }
    copy.props = { ...BLOCK_TYPES[copy.type].defaults, ...safe };
  } else {
    copy.props = { ...propsSrc };
  }

  return mergeDesignDefaults(copy);
}

export function normalizeBlocks(blocks: BlockInstance[]): BlockInstance[] {
  return (blocks || []).map(normalizeBlock);
}

type Device = "desktop" | "tablet" | "mobile";

// Merge per-device overrides (block.responsive[device]) on top of base props.
// Desktop uses the base props unchanged. Returns a new block when overrides
// apply, otherwise the same block reference.
export function resolveResponsive(
  block: BlockInstance,
  device: Device,
): BlockInstance {
  if (!block || device === "desktop") return block;
  const overrides = (block as any).responsive?.[device];
  if (!overrides || typeof overrides !== "object") return block;
  const safe: Record<string, any> = {};
  for (const [k, v] of Object.entries(overrides)) {
    if (v !== "" && v !== null && v !== undefined) safe[k] = v;
  }
  if (Object.keys(safe).length === 0) return block;
  return { ...block, props: { ...block.props, ...safe } };
}

export function resolveBlocksForDevice(
  blocks: BlockInstance[],
  device: Device,
): BlockInstance[] {
  return (blocks || []).map((b) => resolveResponsive(b, device));
}

export function filterByVisibility(
  blocks: BlockInstance[],
  device: "desktop" | "tablet" | "mobile",
): BlockInstance[] {
  return blocks.filter((b) => {
    const v = b.visibility as Record<string, boolean | undefined> | undefined;
    if (device === "mobile" && v?.mobile === false) return false;
    if (device === "tablet" && v?.tablet === false) return false;
    if (device === "desktop" && v?.desktop === false) return false;
    return true;
  });
}

export { getBlockComponentName, getBlockCssSelector };
