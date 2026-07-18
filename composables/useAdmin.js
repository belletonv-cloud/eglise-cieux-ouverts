import { ref, computed, nextTick } from "vue";
import { BLOCK_TYPES, VISIBILITY_DEFAULTS } from "~/utils/blockTypes.js";
import {
  DESIGN_DEFAULTS,
  DESIGN_FIELDS,
  mergeDesignDefaults,
} from "~/utils/designDefaults.js";

const isAdminMode = ref(false);
const editingBlockId = ref(null);
const localBlocks = ref([]);
const localBlocksPage = ref("");
const previewDevice = ref("desktop");
const hasUnsavedChanges = ref(false);
const undoStack = ref([]);
const redoStack = ref([]);
// Élément sélectionné dans une zone canvas (props.extraElements) — partagé
// entre le panneau sidebar (FieldElements) et le rendu sur la page
// (BlockExtraElementsCanvas) pour que la sélection reste synchronisée.
const selectedElementId = ref(null);
// Élément additionnel actuellement en mode positionnement (drag/resize actif
// sur le canvas, sidebar cachée) — distinct de selectedElementId : une
// simple sélection n'active plus le drag/resize, il faut explicitement
// entrer en mode positionnement via le bouton ⤢ de FieldElements.
const positioningElementId = ref(null);
// Clé du champ fixe (schema) identifié par le dernier clic dans un bloc —
// permet à AutoEditor.vue de surligner/scroller vers ce champ précis dans
// la sidebar, plutôt que de simplement ouvrir le bloc sans indication.
const activeFieldKey = ref(null);
// Compteur incrémenté à chaque clic qui identifie un champ/élément — watch()
// sur activeFieldKey/selectedId seul ne se déclenche pas si la valeur ne
// CHANGE pas (ex: re-cliquer le même champ déjà actif, ou une chaîne
// identique réassignée), Vue ne détecte alors aucune mutation sur un ref
// primitif. Ce compteur, lui, change à CHAQUE clic sans exception, donc le
// scroll-vers-l'élément dans la sidebar (AutoEditor.vue/FieldElements.vue)
// se déclenche de façon fiable à chaque interaction.
const identifySeq = ref(0);
let nextPromotedId = 0;

// Footer block (managed separately from page blocks)
// Initialized with defaults so it renders immediately (SSR/public).
// loadFooterBlock() overwrites from Firestore on mount.
function _defaultFooterBlock() {
  return mergeDesignDefaults({
    id: "block-footer",
    type: "footer",
    props: { ...BLOCK_TYPES.footer?.defaults }, // use || {} to handle missing BLOCK_TYPES at init
  });
}
const footerBlock = ref(_defaultFooterBlock());
const editingFooter = ref(false);
let _footerLoaded = false;

function _blockLabel(type) {
  return BLOCK_TYPES[type]?.label || type || "inconnu";
}

function pushHistory(label = "Modification") {
  undoStack.value.push({
    label,
    blocks: JSON.parse(JSON.stringify(localBlocks.value)),
  });
  if (undoStack.value.length > 50) {
    undoStack.value.shift();
  }
  redoStack.value = [];
  hasUnsavedChanges.value = true;
}

export function useAdmin() {
  const activeBlock = computed(
    () => localBlocks.value.find((b) => b.id === editingBlockId.value) || null,
  );

  // The block being edited in the sidebar (page block or footer block).
  // When editing a non-desktop device, merge the device overrides on top of
  // the base props so the editor reflects the value for the active device.
  const sidebarBlock = computed(() => {
    const base = editingFooter.value ? footerBlock.value : activeBlock.value;
    if (!base) return base;
    const device = previewDevice.value;
    if (device && device !== "desktop" && base.responsive?.[device]) {
      return { ...base, props: { ...base.props, ...base.responsive[device] } };
    }
    return base;
  });

  // Schema used by the sidebar AutoEditor
  const sidebarSchema = computed(() => {
    const block = sidebarBlock.value;
    if (!block?.type) return [];
    return BLOCK_TYPES[block.type]?.schema || [];
  });

  function clearBlocks() {
    localBlocks.value = [];
    localBlocksPage.value = "";
  }

  function enterAdmin(blocks, pageSlug) {
    isAdminMode.value = true;
    if (Array.isArray(blocks)) {
      localBlocks.value = JSON.parse(JSON.stringify(blocks));
      localBlocksPage.value = pageSlug || "";
      undoStack.value = [];
      redoStack.value = [];
    }
  }

  function exitAdmin() {
    isAdminMode.value = false;
    editingBlockId.value = null;
    editingFooter.value = false;
    positioningElementId.value = null;
    activeFieldKey.value = null;
    footerBlock.value = _defaultFooterBlock();
    localBlocks.value = [];
    localBlocksPage.value = "";
    undoStack.value = [];
    redoStack.value = [];
    if (process.client) {
      try {
        const route = useRoute();
        const router = useRouter();
        const query = { ...route.query };
        delete query.admin;
        router.replace({ query }).catch(() => {});
      } catch (e) {
        console.warn("useAdmin: exitAdmin router.replace failed", e);
      }
    }
  }

  function selectBlock(id) {
    editingFooter.value = false;
    if (editingBlockId.value !== id) selectedElementId.value = null;
    editingBlockId.value = id;
    positioningElementId.value = null;
    activeFieldKey.value = null;
  }

  function updateBlock(id, props) {
    const idx = localBlocks.value.findIndex((b) => b.id === id);
    if (idx < 0) return;
    const current = localBlocks.value[idx];
    const label = _blockLabel(current?.type);
    const device = previewDevice.value;
    // When editing a non-desktop device, write the change as a per-device
    // override (responsive[device]) instead of mutating the base props.
    if (device && device !== "desktop") {
      pushHistory(`Modification (${device}) du bloc « ${label} »`);
      const responsive = { ...(current.responsive || {}) };
      responsive[device] = { ...(responsive[device] || {}), ...props };
      localBlocks.value[idx] = { ...current, responsive };
      return;
    }
    pushHistory(`Modification du bloc « ${label} »`);
    localBlocks.value[idx] = {
      ...current,
      props: { ...current.props, ...props },
    };
  }

  // « Rendre déplaçable »/« Déplacer » (AutoEditor.vue) : convertit un champ
  // fixe du bloc en élément libre du canvas, en conservant sa position/
  // taille RÉELLE (mesurée sur la page) pour que rien ne change visuellement
  // au moment du clic, PUIS lance le mode positionnement une fois cette
  // taille garantie stable. Vit ici (pas dans AutoEditor.vue) car le
  // composant se démonte dès que le mode positionnement cache la sidebar —
  // un timer lancé depuis un composant qui vient de se démonter est
  // fragile, alors que ce composable est un singleton qui survit au
  // démontage. extraElementSeed = props de l'ExtraElement hors position
  // (kind, text/imageUrl/imageAlt, color, fontSize, etc.).
  //
  // Important : vue-draggable-resizable (la lib derrière le mode
  // positionnement) n'observe PAS ses props x/y/w/h après le montage —
  // aucun watch() dans son code source. Corriger le %/pixels APRÈS avoir
  // déjà lancé le positionnement ne sert donc à rien, l'élément déjà monté
  // ignore la mise à jour. Il faut que la taille soit déjà correcte AVANT
  // le premier montage, d'où l'attente de stabilisation avant startPositioning.
  function promoteFieldToElement(blockId, fieldKey, extraElementSeed) {
    const idx = localBlocks.value.findIndex((b) => b.id === blockId);
    if (idx < 0) return null;
    const block = localBlocks.value[idx];
    const existingCount = block.props?.extraElements?.length || 0;
    const offset = (existingCount % 4) * 3;

    let pixelRect = null;
    let initialRect = null;
    if (process.client) {
      const wrapper = document.querySelector(`.block-wrapper[data-block-id="${blockId}"]`);
      const fieldEl = wrapper?.querySelector(`[data-field-key="${fieldKey}"]`);
      if (wrapper && fieldEl) {
        const wrapperBox = wrapper.getBoundingClientRect();
        const fieldBox = fieldEl.getBoundingClientRect();
        if (wrapperBox.width && wrapperBox.height && fieldBox.width && fieldBox.height) {
          pixelRect = {
            xPx: fieldBox.left - wrapperBox.left,
            yPx: fieldBox.top - wrapperBox.top,
            wPx: fieldBox.width,
            hPx: fieldBox.height,
          };
          initialRect = {
            xPct: (pixelRect.xPx / wrapperBox.width) * 100,
            yPct: (pixelRect.yPx / wrapperBox.height) * 100,
            wPct: (pixelRect.wPx / wrapperBox.width) * 100,
            hPct: (pixelRect.hPx / wrapperBox.height) * 100,
          };
        }
      }
    }
    const rect = initialRect ?? { xPct: 5 + offset, yPct: 5 + offset, wPct: 90 - offset, hPct: 90 - offset };

    const newId = `el-promoted-${Date.now()}-${nextPromotedId++}`;
    const newElement = { id: newId, z: existingCount, promotedFrom: fieldKey, ...rect, ...extraElementSeed };
    const label = _blockLabel(block?.type);
    pushHistory(`Rendre déplaçable « ${label} »`);
    const extraElements = [...(block.props?.extraElements || []), newElement];
    const promotedFields = [...new Set([...(block.props?.promotedFields || []), fieldKey])];
    localBlocks.value[idx] = {
      ...block,
      props: { ...block.props, [fieldKey]: "", extraElements, promotedFields },
    };
    selectedElementId.value = newId;
    activeFieldKey.value = null;

    if (!pixelRect || !process.client) {
      // Rien à mesurer (champ non rendu) : positionnement immédiat, repli
      // générique déjà appliqué ci-dessus.
      startPositioning(newId);
      return newId;
    }

    // Retirer le champ de son emplacement fixe peut changer la hauteur
    // (voire la largeur) du bloc lui-même si sa mise en page en dépendait
    // (ex: grille dont la ligne est dimensionnée par le plus grand des deux
    // côtés) — le % ci-dessus, calculé sur l'ANCIENNE taille du bloc, ne
    // correspondrait alors plus aux mêmes pixels une fois le bloc réduit.
    // Un seul nextTick ne suffit pas : le bloc peut traverser plusieurs
    // vagues de reflow après la promotion (ex: animation d'entrée) avant
    // de se stabiliser — on ré-échantillonne la hauteur jusqu'à deux
    // lectures identiques consécutives, PUIS seulement on corrige et on
    // lance le positionnement (voir note vue-draggable-resizable ci-dessus).
    let lastHeight = null;
    let attempts = 0;
    const finish = (box) => {
      const i2 = localBlocks.value.findIndex((b) => b.id === blockId);
      if (i2 >= 0) {
        const b2 = localBlocks.value[i2];
        const corrected = {
          xPct: (pixelRect.xPx / box.width) * 100,
          yPct: (pixelRect.yPx / box.height) * 100,
          wPct: (pixelRect.wPx / box.width) * 100,
          hPct: (pixelRect.hPx / box.height) * 100,
        };
        const els2 = (b2.props?.extraElements || []).map((el) =>
          el.id === newId ? { ...el, ...corrected } : el,
        );
        localBlocks.value[i2] = { ...b2, props: { ...b2.props, extraElements: els2 } };
      }
      startPositioning(newId);
    };
    const poll = () => {
      attempts++;
      const wrapper = document.querySelector(`.block-wrapper[data-block-id="${blockId}"]`);
      const box = wrapper?.getBoundingClientRect();
      if (!box || !box.width || !box.height) {
        startPositioning(newId); // repli : bloc introuvable, tant pis pour la précision
        return;
      }
      if ((lastHeight !== null && Math.abs(box.height - lastHeight) < 0.5) || attempts >= 15) {
        finish(box);
        return;
      }
      lastHeight = box.height;
      setTimeout(poll, 70);
    };
    nextTick(poll);

    return newId;
  }

  // Toggle / set per-device visibility for a block.
  function updateVisibility(id, patch) {
    const idx = localBlocks.value.findIndex((b) => b.id === id);
    if (idx < 0) return;
    const current = localBlocks.value[idx];
    const label = _blockLabel(current?.type);
    pushHistory(`Visibilité du bloc « ${label} »`);
    localBlocks.value[idx] = {
      ...current,
      visibility: {
        ...VISIBILITY_DEFAULTS,
        ...(current.visibility || {}),
        ...patch,
      },
    };
  }

  // Reset all per-device overrides for the current device (or all) on a block.
  function resetResponsive(id, device) {
    const idx = localBlocks.value.findIndex((b) => b.id === id);
    if (idx < 0) return;
    const current = localBlocks.value[idx];
    if (!current.responsive) return;
    const label = _blockLabel(current?.type);
    pushHistory(`Réinitialisation responsive « ${label} »`);
    const responsive = { ...current.responsive };
    if (device) {
      delete responsive[device];
    } else {
      for (const k of Object.keys(responsive)) delete responsive[k];
    }
    localBlocks.value[idx] = { ...current, responsive };
  }

  function moveBlock(id, direction) {
    const idx = localBlocks.value.findIndex((b) => b.id === id);
    if (idx < 0) return;
    const newIdx = idx + direction;
    if (newIdx < 0 || newIdx >= localBlocks.value.length) return;
    const label = _blockLabel(localBlocks.value[idx]?.type);
    pushHistory(`Déplacement du bloc « ${label} »`);
    const [block] = localBlocks.value.splice(idx, 1);
    localBlocks.value.splice(newIdx, 0, block);
  }

  function removeBlock(id) {
    const idx = localBlocks.value.findIndex((b) => b.id === id);
    const label =
      idx >= 0 ? _blockLabel(localBlocks.value[idx]?.type) : "inconnu";
    pushHistory(`Suppression du bloc « ${label} »`);
    localBlocks.value = localBlocks.value.filter((b) => b.id !== id);
    if (editingBlockId.value === id) editingBlockId.value = null;
  }

  async function addBlock(type, afterId, overrideProps) {
    const { createBlock } = await import("~/utils/blockTypes.js");
    const newBlock = createBlock(type, overrideProps || {});
    if (!newBlock) return null;
    const label = _blockLabel(type);
    pushHistory(`Ajout du bloc « ${label} »`);
    if (afterId) {
      const idx = localBlocks.value.findIndex((b) => b.id === afterId);
      localBlocks.value.splice(idx + 1, 0, newBlock);
    } else {
      localBlocks.value.push(newBlock);
    }
    return newBlock;
  }

  /**
   * Duplicate an existing block with all its props
   * Used by Story 1.1 - Duplicate a block
   */
  async function duplicateBlock(blockId) {
    const idx = localBlocks.value.findIndex((b) => b.id === blockId);
    if (idx < 0) return null;
    const original = localBlocks.value[idx];
    const { createBlock } = await import("~/utils/blockTypes.js");
    const { mergeDesignDefaults } = await import("~/utils/designDefaults.js");
    // Clone props, visibility, and responsive overrides with design defaults
    const duplicated = mergeDesignDefaults(createBlock(original.type, {
      ...original.props,
      ...(original.visibility || VISIBILITY_DEFAULTS),
      ...(original.responsive || {}),
    }));
    if (!duplicated) return null;
    const label = _blockLabel(original.type);
    pushHistory(`Duplication du bloc « ${label} »`);
    // Insert after original block position
    localBlocks.value.splice(idx + 1, 0, duplicated);
    return duplicated;
  }

  /**
   * Save current block as a template
   * Used by Story 2.1 - Save block template
   */
  async function saveTemplateBlock(name, shared = false) {
    const block = sidebarBlock.value;
    if (!block) return null;
    
    try {
      const token = await _getFirebaseToken();
      if (!token) throw new Error('Non authentifié');
      
      const res = await fetch('/api/templates/blocks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name,
          type: block.type,
          props: block.props,
          shared,
        }),
      });
      
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || `HTTP ${res.status}`);
      }
      
      const result = await res.json();
      pushHistory(`Sauvegarde du template « ${name} »`);
      return result;
    } catch (error) {
      console.error('saveTemplateBlock error:', error);
      throw error;
    }
  }

  function reorderBlocks(blocks) {
    if (!Array.isArray(blocks)) return;
    if (
      blocks.length === localBlocks.value.length &&
      blocks.every((b, i) => b?.id === localBlocks.value[i]?.id)
    ) {
      return;
    }
    pushHistory("Réordonnancement");
    localBlocks.value = blocks;
  }

  function undo() {
    if (undoStack.value.length === 0) return;
    const snapshot = JSON.parse(JSON.stringify(localBlocks.value));
    redoStack.value.push({
      label: undoStack.value.at(-1).label,
      blocks: snapshot,
    });
    localBlocks.value = undoStack.value.pop().blocks;
  }

  function redo() {
    if (redoStack.value.length === 0) return;
    const snapshot = JSON.parse(JSON.stringify(localBlocks.value));
    undoStack.value.push({
      label: redoStack.value.at(-1).label,
      blocks: snapshot,
    });
    localBlocks.value = redoStack.value.pop().blocks;
  }

  function canUndo() {
    return undoStack.value.length > 0;
  }

  function canRedo() {
    return redoStack.value.length > 0;
  }

  function getBlocks() {
    return localBlocks.value;
  }

  function setBlocks(blocks) {
    if (!Array.isArray(blocks)) return;
    if (
      blocks.length === localBlocks.value.length &&
      blocks.every((b, i) => b?.id === localBlocks.value[i]?.id)
    ) {
      return;
    }
    pushHistory("Réinitialisation");
    localBlocks.value = blocks;
  }

  function nextUndoLabel() {
    if (undoStack.value.length === 0) return "";
    return undoStack.value.at(-1).label;
  }

  function nextRedoLabel() {
    if (redoStack.value.length === 0) return "";
    return redoStack.value.at(-1).label;
  }

  function markSaved() {
    hasUnsavedChanges.value = false;
  }

  // ─── Footer block management ─────────────────────────────────

  async function _getFirebaseToken() {
    if (import.meta.server) return null;
    const { $auth } = useNuxtApp();
    const user = await new Promise((resolve) => {
      if ($auth?.currentUser) { resolve($auth.currentUser); return; }
      const unsub = $auth?.onAuthStateChanged((u) => { resolve(u); if (typeof unsub === 'function') unsub(); });
    });
    if (!user) return null;
    try { return await user.getIdToken(); } catch { return null; }
  }

  async function loadFooterBlock() {
    if (_footerLoaded) return;
    try {
      const res = await fetch('/api/footer');
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      if (data.props) {
        footerBlock.value = mergeDesignDefaults({
          id: "block-footer",
          type: "footer",
          props: { ...data.props },
        });
      }
    } catch (e) {
      console.warn("useAdmin: could not load footer block", e);
    } finally {
      _footerLoaded = true;
    }
  }

  async function saveFooterBlock() {
    if (!footerBlock.value) return;
    const token = await _getFirebaseToken();
    if (!token) throw new Error('Non authentifié');
    const res = await fetch('/api/footer', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ props: { ...footerBlock.value.props } }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || `HTTP ${res.status}`);
    }
  }

  function selectFooter() {
    editingBlockId.value = null;
    editingFooter.value = true;
    positioningElementId.value = null;
    activeFieldKey.value = null;
  }

  function startPositioning(id) {
    positioningElementId.value = id;
  }

  function stopPositioning() {
    // Si l'élément positionné venait d'un champ promu, on ré-identifie ce
    // champ (comme un clic dessus) pour que la sidebar, en se rouvrant,
    // scrolle et surligne automatiquement son bouton « Déplacer » — sans
    // ça il fallait chercher le champ à la main dans un schema parfois long.
    const id = positioningElementId.value;
    if (id) {
      for (const block of localBlocks.value) {
        const el = block.props?.extraElements?.find((e) => e.id === id);
        if (el?.promotedFrom) {
          activeFieldKey.value = el.promotedFrom;
          identifySeq.value++;
          break;
        }
      }
    }
    positioningElementId.value = null;
  }

  function closeFooterEditor() {
    editingFooter.value = false;
  }

  function updateFooterBlock(props) {
    if (!footerBlock.value) return;
    footerBlock.value = {
      ...footerBlock.value,
      props: { ...footerBlock.value.props, ...props },
    };
    hasUnsavedChanges.value = true;
  }

  return {
    isAdminMode,
    editingBlockId,
    activeBlock,
    footerBlock,
    editingFooter,
    sidebarBlock,
    sidebarSchema,
    localBlocks,
    localBlocksPage,
    previewDevice,
    hasUnsavedChanges,
    selectedElementId,
    positioningElementId,
    activeFieldKey,
    identifySeq,
    startPositioning,
    stopPositioning,
    enterAdmin,
    exitAdmin,
    clearBlocks,
    selectBlock,
    updateBlock,
    promoteFieldToElement,
    updateVisibility,
    resetResponsive,
    moveBlock,
    removeBlock,
    addBlock,
    duplicateBlock,
    saveTemplateBlock,
    reorderBlocks,
    undo,
    redo,
    canUndo,
    canRedo,
    nextUndoLabel,
    nextRedoLabel,
    markSaved,
    getBlocks,
    setBlocks,
    loadFooterBlock,
    saveFooterBlock,
    selectFooter,
    closeFooterEditor,
    updateFooterBlock,
  };
}
