import { ref, nextTick } from "vue";

const SUPPORTS_SCROLL_TIMELINE =
  typeof CSS !== "undefined" &&
  CSS.supports &&
  CSS.supports("animation-timeline: view()");

const SCROLL_DRIVEN_TYPES = [
  "aspirations",
  "bienvenue",
  "nousRejoindre",
  "rejoins",
];

const INTERNAL_TYPES = [
  "aspirations",
  "bienvenue",
  "nousRejoindre",
  "rejoins",
];

function shouldSkipTrigger(type) {
  return SUPPORTS_SCROLL_TIMELINE && SCROLL_DRIVEN_TYPES.includes(type);
}

export function useBlockAnimation(isAdmin, isServerAdminRef) {
  const triggeredBlocks = ref([]); // Array au lieu de Set pour la réactivité Vue
  const wrapperRefs = ref({});
  const lastAnimations = ref({});
  let observer = null;
  let replayHandler = null;
  const fallbackObservers = new Map();

  // Cache les blocs pour les utiliser dans replayBlockAnimation
  let blocksCache = [];

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
        if (SUPPORTS_SCROLL_TIMELINE) {
          const block = (blocksCache || []).find((b) => b.id === id);
          if (block && SCROLL_DRIVEN_TYPES.includes(block.type)) continue;
        }
        el.dataset.blockId = id;
        observer.observe(el);
      }
    }
  }

  function initAdminTrigger(blocks) {
    const allIds = (blocks || [])
      .filter((b) => !shouldSkipTrigger(b.type))
      .map((b) => b.id)
      .filter(Boolean);
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
                if (!triggeredBlocks.value.includes(block.id)) {
                  triggeredBlocks.value = [
                    ...triggeredBlocks.value,
                    block.id,
                  ];
                }
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

    // For internal animations, we need special handling
    if (INTERNAL_TYPES.includes(block?.type)) {
      triggeredBlocks.value = triggeredBlocks.value.filter(
        (item) => item !== id,
      );

      if (el && el.classList) {
        el.classList.remove("triggered");
        void el.offsetHeight;
      }

      // Réactiver l'observer fallback pour ce bloc
      if (!SUPPORTS_SCROLL_TIMELINE) {
        const fbObserver = fallbackObservers.get(id);
        if (fbObserver && el) {
          fbObserver.observe(el);
        }
      }

      // En mode admin, réajouter triggered immédiatement
      if (isAdmin && isAdmin.value) {
        setTimeout(() => {
          if (el && !el.classList.contains("triggered")) {
            el.classList.add("triggered");
          }
          triggeredBlocks.value = [...(triggeredBlocks.value || []), id];
        }, 50);
        return;
      }

      // En mode public, scroll vers le bloc pour déclencher l'animation
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

    // Créer l'observer mais ne pas observer encore - ça sera fait après mount
    observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const id = entry.target.dataset.blockId;
            if (id) {
              if (SUPPORTS_SCROLL_TIMELINE) {
                const block = (blocksCache || []).find((b) => b.id === id);
                if (block && SCROLL_DRIVEN_TYPES.includes(block.type)) return;
              }
              triggeredBlocks.value = [...triggeredBlocks.value, id];
              observer.unobserve(entry.target);
            }
          }
        });
      },
      { threshold: 0.05, rootMargin: "0px 0px -40px 0px" },
    );
  }

  function handleBlocksChange(blocks) {
    if (isAdmin.value) {
      const allIds = (blocks || [])
        .filter((b) => !shouldSkipTrigger(b.type))
        .map((b) => b.id)
        .filter(Boolean);
      triggeredBlocks.value = [...allIds];
      return;
    }
    observeElements();
    setupFallbackObservers(blocks);
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
    // En mode admin, toujours déclencher les blocs (ils sont en cache dans blocksCache)
    // Vérifier l'URL directement pour palier aux problèmes de timing avec la ref injectée
    const isCurrentlyAdmin = () => {
      if (typeof window === "undefined") return false;
      const urlParams = new URLSearchParams(window.location.search);
      return urlParams.get("admin") === "true";
    };

    if (isCurrentlyAdmin() || (isAdmin && isAdmin.value)) {
      // Appliquer les classes triggered directement sur le DOM
      // Utiliser plusieurs tentatives pour couvrir tous les cas de timing
      let attempts = 0;
      const maxAttempts = 10;

      const applyTriggeredClasses = () => {
        const allIds = (blocksCache || [])
        .filter((b) => !shouldSkipTrigger(b.type))
          .map((b) => b.id)
          .filter(Boolean);
        triggeredBlocks.value = [...allIds];

        for (const id of allIds) {
          document.querySelectorAll(`[data-block-id="${id}"]`).forEach((el) => {
            if (el && !el.classList.contains("triggered")) {
              el.classList.add("triggered");
            }
          });
        }
      };

      // Essayer immédiatement et ensuite à intervalles
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

    // Mode public: configurer les observers
    if (!observer) {
      observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              const id = entry.target.dataset?.blockId;
              if (id) {
                if (SUPPORTS_SCROLL_TIMELINE) {
                  const block = (blocksCache || []).find(
                    (b) => b.id === id,
                  );
                  if (
                    block &&
                    SCROLL_DRIVEN_TYPES.includes(block.type)
                  )
                    return;
                }
                triggeredBlocks.value = [...triggeredBlocks.value, id];
                observer.unobserve(entry.target);
              }
            }
          });
        },
        { threshold: 0.05, rootMargin: "0px 0px -40px 0px" },
      );
    }
    // Attendre que les refs soient montées avant d'observer
    nextTick(() => {
      observeElements();
      setupFallbackObservers(blocksCache);
      // Déclencher immédiatement les blocs déjà visibles
      setTimeout(() => {
        for (const [id, el] of Object.entries(wrapperRefs.value)) {
          if (el && observer) {
            if (SUPPORTS_SCROLL_TIMELINE) {
              const block = (blocksCache || []).find((b) => b.id === id);
              if (block && SCROLL_DRIVEN_TYPES.includes(block.type)) continue;
            }
            const rect = el.getBoundingClientRect();
            if (rect.top < window.innerHeight * 0.9) {
              if (!triggeredBlocks.value.includes(id)) {
                triggeredBlocks.value = [...triggeredBlocks.value, id];
                observer.unobserve(el);
              }
            }
          }
        }
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
