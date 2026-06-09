import { ref, nextTick } from "vue";

const SUPPORTS_SCROLL_TIMELINE =
  typeof CSS !== "undefined" &&
  CSS.supports &&
  CSS.supports("animation-timeline: view()");

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

  // Observer les éléments quand les refs sont prêtes (appelé après chaque setWrapperRef)
  function checkAndObserveElement(id) {
    // L'observer est créé dans setupClient - si pas encore créé, on attend
    if (!observer) {
      setTimeout(() => checkAndObserveElement(id), 50);
      return;
    }
    const el = wrapperRefs.value[id];
    if (!el) return;

    // Vérifier si c'est un bloc internal qui a besoin d'un fallback
    const block = (blocksCache || []).find((b) => b.id === id);
    if (!block) return;

    const internalTypes = [
      "aspirations",
      "bienvenue",
      "nousRejoindre",
      "rejoins",
    ];

    // Pour les blocs internal, ajouter 'triggered' au wrapper si visible
    // (utiliser le fallback IntersectionObserver pour tous les navigateurs)
    if (internalTypes.includes(block.type)) {
      // Observer pour ajouter triggered au scroll (ou si déjà visible)
      if (!fallbackObservers.has(id)) {
        const fbObserver = new IntersectionObserver(
          ([entry]) => {
            if (entry.isIntersecting) {
              entry.target.classList.add("triggered");
              const eid = entry.target.dataset?.blockId;
              if (eid && !triggeredBlocks.value.includes(eid)) {
                triggeredBlocks.value = [...triggeredBlocks.value, eid];
              }
              fbObserver.unobserve(entry.target);
            }
          },
          { threshold: 0.1 },
        );
        fbObserver.observe(el);
        fallbackObservers.set(id, fbObserver);
      }
    }
  }

  function observeElements() {
    if (!observer) return;
    for (const [id, el] of Object.entries(wrapperRefs.value)) {
      if (el) {
        el.dataset.blockId = id;
        observer.observe(el);
      }
    }
  }

  function initAdminTrigger(blocks) {
    const allIds = (blocks || []).map((b) => b.id).filter(Boolean);
    triggeredBlocks.value = [...allIds]; // Array au lieu de Set
  }

  function setupFallbackObservers(blocks) {
    const internalTypes = [
      "aspirations",
      "bienvenue",
      "nousRejoindre",
      "rejoins",
    ];
    for (const block of blocks || []) {
      const el = wrapperRefs.value[block.id];
      if (!el) continue;

      // Pour les blocs internal, ajouter 'triggered' au wrapper quand visible
      if (internalTypes.includes(block.type)) {
        // Si déjà visible, ajouter triggered immédiatement
        const rect = el.getBoundingClientRect();
        if (rect.top < window.innerHeight * 0.9) {
          if (!el.classList.contains("triggered")) {
            el.classList.add("triggered");
            // Mettre aussi à jour la référence réactive
            if (!triggeredBlocks.value.includes(block.id)) {
              triggeredBlocks.value = [...triggeredBlocks.value, block.id];
            }
          }
        } else {
          // Sinon observer pour ajouter triggered au scroll
          const fbObserver = new IntersectionObserver(
            ([entry]) => {
              if (entry.isIntersecting) {
                entry.target.classList.add("triggered");
                // Mettre aussi à jour la référence réactive
                const id = entry.target.dataset?.blockId;
                if (id && !triggeredBlocks.value.includes(id)) {
                  triggeredBlocks.value = [...triggeredBlocks.value, id];
                }
                fbObserver.unobserve(entry.target);
              }
            },
            { threshold: 0.1 },
          );
          fbObserver.observe(el);
          fallbackObservers.set(block.id, fbObserver);
        }
      } else if (!SUPPORTS_SCROLL_TIMELINE) {
        // Pour les autres blocs, utiliser le fallback classique
        if (!fallbackObservers.has(block.id)) {
          const fbObserver = new IntersectionObserver(
            ([entry]) => {
              if (entry.isIntersecting) {
                entry.target.classList.add("triggered");
                // Mettre aussi à jour la référence réactive
                const id = entry.target.dataset?.blockId;
                if (id && !triggeredBlocks.value.includes(id)) {
                  triggeredBlocks.value = [...triggeredBlocks.value, id];
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
    const internalTypes = [
      "aspirations",
      "nousRejoindre",
      "bienvenue",
      "rejoins",
    ];
    const block = blocksCache.find((b) => b.id === id);

    // For internal animations, we need special handling
    if (internalTypes.includes(block?.type)) {
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
    // L'observer sera créé dans setupClient (onMounted)
  }

  function handleBlocksChange(blocks) {
    if (isAdmin.value) {
      const allIds = (blocks || []).map((b) => b.id).filter(Boolean);
      triggeredBlocks.value = [...allIds]; // Array au lieu de Set
      return;
    }
    // Mettre à jour blocksCache pour que setupFallbackObservers ait les bonnes données
    blocksCache = blocks || [];
    // En mode public, déclencher setupFallbackObservers si l'observer existe déjà
    // Sinon ce sera fait dans setupClient qui utilise déjà blocksCache
    if (observer) {
      nextTick(() => {
        setupFallbackObservers(blocks);
      });
    }
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

  function setupClient(blocksParam) {
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
        const allIds = (blocksCache || []).map((b) => b.id).filter(Boolean);
        triggeredBlocks.value = [...allIds];

        // Appliquer directement sur le DOM
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
    // Utiliser les blocs passés en paramètre si disponibles, sinon blocksCache
    const blocksToUse = blocksParam || blocksCache;

    if (!observer) {
      observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              const id = entry.target.dataset?.blockId;
              if (id) {
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
      // Un second nextTick pour être sûr que les refs sont montées
      nextTick(() => {
        observeElements();
        setupFallbackObservers(blocksToUse);
        // Déclencher immédiatement les blocs déjà visibles
        for (const [id, el] of Object.entries(wrapperRefs.value)) {
          if (el && observer) {
            const rect = el.getBoundingClientRect();
            if (rect.top < window.innerHeight * 0.9) {
              // Element is in viewport - marquer comme triggered
              if (!triggeredBlocks.value.includes(id)) {
                triggeredBlocks.value = [...triggeredBlocks.value, id];
              }
              if (!el.classList.contains("triggered")) {
                el.classList.add("triggered");
              }
              // Unobserver si on a déclenché - mais pas pour les blocs internal
              const block = blocksToUse.find((b) => b.id === id);
              if (
                block &&
                ![
                  "aspirations",
                  "bienvenue",
                  "nousRejoindre",
                  "rejoins",
                ].includes(block.type)
              ) {
                observer.unobserve(el);
              }
            }
          }
        }
      });
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
    checkAndObserveElement,
    setup,
    handleBlocksChange,
    handleAnimationChange,
    initAdminTrigger,
    observeElements,
    setupClient,
    teardownClient,
  };
}
