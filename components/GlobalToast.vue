<template>
  <Transition name="toast-fade">
    <div v-if="toastMsg" class="toast-msg" :class="toastType">{{ toastMsg }}</div>
  </Transition>
</template>
<script setup>
import { useToast } from '~/composables/useToast'
const { toastMsg, toastType } = useToast()
</script>
<style scoped>
.toast-msg {
  position: fixed;
  left: 50%;
  bottom: 30px;
  transform: translateX(-50%) translateY(50px) scale(0.98);
  min-width: 160px;
  max-width: 90vw;
  padding: 14px 30px;
  border-radius: 12px;
  font-weight: bold;
  font-size: 1em;
  z-index: 2000;
  background: #10b981;
  color: #fff;
  box-shadow: 0 4px 28px rgba(0,0,0,0.23);
  opacity: 0.98;
  pointer-events: none;
  transition:
    opacity .32s cubic-bezier(.7,0,.84,.32),
    transform .4s cubic-bezier(.38,1.14,.56,.85);
}
.toast-msg.toast-success { background: #10b981; }
.toast-msg.toast-error { background: #EF4B54; }

.toast-fade-enter-active, .toast-fade-leave-active {
  transition: opacity 0.3s, transform 0.38s;
}
.toast-fade-enter-from, .toast-fade-leave-to {
  opacity: 0;
  transform: translateX(-50%) translateY(80px) scale(0.88);
}
.toast-fade-enter-to, .toast-fade-leave-from {
  opacity: 0.98;
  transform: translateX(-50%) translateY(0px) scale(1);
}
</style>
