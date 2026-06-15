<template>
  <teleport to="body">
    <div v-if="modelValue" class="event-modal-overlay" @click.self="close" role="dialog" aria-modal="true" :aria-label="title || 'Détail événement'" data-open="true">
      <div class="event-modal-content" ref="content" tabindex="-1">
        <button class="event-modal-close" @click="close" aria-label="Fermer la fenêtre">✕</button>
        <h2 v-if="title" class="event-modal-title">{{ title }}</h2>
        <slot />
        <div v-if="footer" class="event-modal-footer">{{ footer }}</div>
      </div>
    </div>
  </teleport>
</template>

<script setup>
import { onMounted, onUnmounted, watch, ref, nextTick } from 'vue'
const props = defineProps({
  modelValue: { type: Boolean, default: false },
  title: { type: String, default: '' },
  footer: { type: String, default: '' }
})
const emit = defineEmits(['update:modelValue','close'])
const content = ref(null)

const close = () => {
  try { document.body.style.overflow = '' } catch (e) { console.warn("EventModal: could not reset body overflow on close", e); }
  emit('update:modelValue', false)
  emit('close')
}

const onKey = (e) => { if (e.key === 'Escape') close() }

let _previousActive = null
watch(() => props.modelValue, async (open) => {
  if (open) {
    try { _previousActive = document.activeElement } catch (e) { _previousActive = null }
    document.body.style.overflow = 'hidden'
    try { document.body.classList.add('modal-open') } catch (e) { console.warn("EventModal: could not add modal-open class", e); }
    await nextTick()
    if (content.value && typeof content.value.focus === 'function') {
      content.value.focus()
      try { content.value.scrollIntoView({ block: 'center', behavior: 'auto' }) } catch (e) { console.warn("EventModal: scrollIntoView failed", e); }
    }
    window.addEventListener('keydown', onKey)
  } else {
    if (_previousActive && typeof _previousActive.focus === 'function') {
      try { _previousActive.focus() } catch (e) { console.warn("EventModal: could not restore focus", e); }
    }
    _previousActive = null
    document.body.style.overflow = ''
    try { document.body.classList.remove('modal-open') } catch (e) { console.warn("EventModal: could not remove modal-open class", e); }
    window.removeEventListener('keydown', onKey)
  }
})
onUnmounted(() => {
  window.removeEventListener('keydown', onKey)
  document.body.style.overflow = ''
  try { document.body.classList.remove('modal-open') } catch (e) { console.warn("EventModal: could not remove modal-open class on unmount", e); }
})
</script>

<style scoped>
.event-modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 99999;
  padding: 20px;
}
.event-modal-content {
  background: #fff;
  max-width: 780px;
  width: 100%;
  max-height: 90vh;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 12px 40px rgba(0,0,0,0.25);
  overflow: auto;
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;
}
.event-modal-title {
  margin: 0 0 8px 0;
  color: var(--primary-teal, #118e8e);
  font-size: 1.2em;
  font-weight: 700;
  text-align: center;
  line-height: 1.2;
  padding: 8px 48px 0;
  max-width: calc(100% - 96px);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.event-modal-close {
  position: absolute;
  right: 14px;
  top: 14px;
  background: var(--primary-coral, #e95e5e);
  color: white;
  border: none;
  width: 44px;
  height: 44px;
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 22px;
  z-index: 3;
}
.event-modal-footer {
  margin-top: 14px;
  text-align: center;
}
@media (max-width: 600px) {
  .event-modal-content {
    padding:12px;
    max-width: 99vw;
    max-height: 99dvh;
  }
  .event-modal-close {
    width:38px; height:38px; font-size:19px; right:8px; top:8px;
  }
  .event-modal-title {
    padding: 8px 16px 0;
    font-size: 1em;
  }
}
</style>
