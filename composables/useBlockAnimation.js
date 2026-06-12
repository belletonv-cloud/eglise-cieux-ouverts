import { ref, nextTick } from "vue";

const SUPPORTS_SCROLL_TIMELINE =
  typeof CSS !== "undefined" &&
  CSS.supports &&
  CSS.supports("animation-timeline: view()");

const INTERNAL_TYPES = [
  "aspirations",
  "bienvenue",
  "nousRejoindre",
  "rejoins",
];

// Blocs avec scroll-driven animations CSS (animation-timeline).
// Ceux-ci ne doivent PAS être observés en Chrome (sinon .triggered tue l'animation).
// Les autres blocs internal (rejoins) n'ont pas d'animation scroll-driven native
// et ont besoin de l'observer pour que .triggered soit ajouté.
const SCROLL_DRIVEN_TYPES = [
  "aspirations",
  "nousRejoindre",
];

export function useBlockAnimation(isAdmin, isServerAdminRef) {
  const triggeredBlocks = ref([]);
  const wrapperRefs = ref({});
  const lastAnimations = ref({});
  let observer = null;
  let replayHandler = null;
  const fallbackObservers = new Map();

  let blocksCache = [];

  function shouldSkipObservation(id) {
    // In supporting browsers, scroll-driven blocks must NOT be interrupted
    // by the observer / trigger system (triggered class kills animation-timeline)
    // rejoins has opacity:0 by default and relies on triggered — don't skip it
    const block = blocksCache.find((b) => b.id === id);
    return SUPPORTS_SCROLL_TIMELINE && block && SCROLL_DRIVEN_TYPES.includes(block.type);
  }

  function isTriggered(id) {
    return triggeredBlocks.value.includes(id);
  }

  function setWrapperRef(el, id) {
    if (el) wrapperRefs.value[id] = el;
  }

  function observeElements() {
    if (!observer) return;
    for (const [id, el] of Object.entries(wrapperRefs.value)) {
      if (el) {
        el.dataset.blockId = id;
        if (shouldSkipObservation(id)) continue;
        observer.observe(el);
      }
    }
  }

  function triggerVisibleBlocks() {
    for (const [id, el] of Object.entries(wrapperRefs.value)) {
      if (el && observer && !shouldSkipObservation(id)) {
        const rect = el.getBoundingClientRect();
        if (rect.top < window.innerHeight * 0.9) {
          if (!triggeredBlocks.value.includes(id)) {
            triggeredBlocks.value = [...triggeredBlocks.value, id];
            observer.unobserve(el);
          }
        }
      }
    }
  }

  function initAdminTrigger(blocks) {
    const allIds = (blocks || []).map((b) => b.id).filter(Boolean);
    triggeredBlocks.value = [...allIds];
  }

  function setupFallbackObservers(blocks) {
    if (SUPPORTS_SCROLL_TIMELINE) return;
    for (const block of blocks || []) {
      if (INTERNAL_TYPES.includes(block.type)) {
        const el = wrapperRefs.value[block.id];
        if (el && !fallbackObservers.has(block.id)) {
          const fbObserver = new IntersectionObserver(
            ([entry]) => {
              if (entry.isIntersecting) {
                entry.target.classList.add("triggered");
                fbObserver.unobserve(entry.target);
              }
            },
            { threshold: 0.1 },
          );
          fbObserver.observe(el);
          fallbackObservers.set(block.id, fbObserver);
        }
      }
    }
  }

  function replayBlockAnimation(id) {
    const el = wrapperRefs.value[id];
    const block = blocksCache.find((b) => b.id === id);

    if (INTERNAL_TYPES.includes(block?.type)) {
      triggeredBlocks.value = triggeredBlocks.value.filter(
        (item) => item !== id,
      );

      if (el && el.classList) {
        el.classList.remove("triggered");
        void el.offsetHeight;
      }

      if (!SUPPORTS_SCROLL_TIMELINE) {
        const fbObserver = fallbackObservers.get(id);
        if (fbObserver && el) {
          fbObserver.observe(el);
        }
      }

      if (isAdmin && isAdmin.value) {
        setTimeout(() => {
          if (el && !el.classList.contains("triggered")) {
            el.classList.add("triggered");
          }
          triggeredBlocks.value = [...(triggeredBlocks.value || []), id];
        }, 50);
        return;
      }

      try {
        el?.scrollIntoView({ block: "center" });
      } catch (err) {}
      return;
    }

    // For wrapper animations, remove/add the animation class
    triggeredBlocks.value = triggeredBlocks.value.filter((item) => item !== id);

    if (el && el.classList) {
      const animClasses = Array.from(el.classList).filter((c) =>
        c.startsWith("block-anim-"),
      );
      animClasses.forEach((c) => el.classList.remove(c));
      void el.offsetHeight;
      animClasses.forEach((c) => el.classList.add(c));
    }

    if (el && observer) {
      try {
        observer.unobserve(el);
      } catch (err) {}
      try {
        observer.observe(el);
      } catch (err) {}
    }
    if (isAdmin && isAdmin.value) {
      setTimeout(() => {
        triggeredBlocks.value = [...(triggeredBlocks.value || []), id];
      }, 40);
    } else {
      try {
        el?.scrollIntoView({ behavior: "smooth", block: "center" });
      } catch (err) {}
    }
  }

  function setup(blocks) {
    blocksCache = blocks || [];
    if (isAdmin.value || isServerAdminRef?.value) {
      initAdminTrigger(blocks);
      return;
    }
  }

  function handleBlocksChange(blocks) {
    if (isAdmin.value) {
      const allIds = (blocks || []).map((b) => b.id).filter(Boolean);
      triggeredBlocks.value = [...allIds];
      return;
    }
    blocksCache = blocks || [];
    // Re-observer les wrappers après changement (blocs asynchrones)
    nextTick(() => {
      observeElements();
      setupFallbackObservers(blocks || []);
      setTimeout(() => {
        triggerVisibleBlocks();
      }, 100);
    });
  }

  function handleAnimationChange(fixedBlocks) {
    const oldMap = lastAnimations.value || {};
    const newMap = {};
    for (const b of fixedBlocks) {
      newMap[b.id] = b.props?.animation;
      const prev = oldMap[b.id];
      const now = b.props?.animation;
      if (prev !== undefined && prev !== now) {
        triggeredBlocks.value = triggeredBlocks.value.filter(
          (item) => item !== b.id,
        );
        const el = wrapperRefs.value[b.id];
        if (el && el.classList) {
          el.classList.remove(`block-anim-${prev}`, "triggered");
          void el.offsetHeight;
          el.classList.add(`block-anim-${now}`);
        }
        if (el && observer) {
          try {
            observer.observe(el);
          } catch (e) {
            console.error(e);
          }
        }
        if (isAdmin && isAdmin.value) {
          setTimeout(() => {
            triggeredBlocks.value = [...(triggeredBlocks.value || []), b.id];
          }, 40);
        }
      }
    }
    lastAnimations.value = newMap;
  }

  function setupClient() {
    const isCurrentlyAdmin = () => {
      if (typeof window === "undefined") return false;
      const urlParams = new URLSearchParams(window.location.search);
      return urlParams.get("admin") === "true";
    };

    if (isCurrentlyAdmin() || (isAdmin && isAdmin.value)) {
      let attempts = 0;
      const maxAttempts = 10;

      const applyTriggeredClasses = () => {
        const allIds = (blocksCache || []).map((b) => b.id).filter(Boolean);
        triggeredBlocks.value = [...allIds];

        for (const id of allIds) {
          document.querySelectorAll(`[data-block-id="${id}"]`).forEach((el) => {
            if (el && !el.classList.contains("triggered")) {
              el.classList.add("triggered");
            }
          });
        }
      };

      applyTriggeredClasses();
      const intervalId = setInterval(() => {
        applyTriggeredClasses();
        attempts++;
        if (attempts >= maxAttempts) {
          clearInterval(intervalId);
        }
      }, 50);

      return;
    }

    // Mode public
    if (!observer) {
      observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              const id = entry.target.dataset?.blockId;
              if (id && !shouldSkipObservation(id)) {
                triggeredBlocks.value = [...triggeredBlocks.value, id];
                observer.unobserve(entry.target);
              }
            }
          });
        },
        { threshold: 0.05, rootMargin: "0px 0px -40px 0px" },
      );
    }

    nextTick(() => {
      observeElements();
      setupFallbackObservers(blocksCache);
      setTimeout(() => {
        triggerVisibleBlocks();
      }, 100);
    });

    replayHandler = (e) => {
      const id = e?.detail?.id;
      if (!id) return;
      replayBlockAnimation(id);
    };
    document.addEventListener("replay-animation", replayHandler);
  }

  function teardownClient() {
    if (observer) observer.disconnect();
    if (replayHandler)
      document.removeEventListener("replay-animation", replayHandler);
    for (const [, obs] of fallbackObservers) obs.disconnect();
    fallbackObservers.clear();
  }

  return {
    triggeredBlocks,
    wrapperRefs,
    isTriggered,
    setWrapperRef,
    setup,
    handleBlocksChange,
    handleAnimationChange,
    initAdminTrigger,
    observeElements,
    setupClient,
    teardownClient,
  };
}
