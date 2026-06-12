<template>
  <footer class="site-footer">
    <div class="footer-inner">
      <div class="footer-left">
        <template v-if="isEditor">
          <div class="field-editor" :class="{ active: editingField === 'title' }">
            <input
              v-if="editingField === 'title'"
              v-model="localTitle"
              class="inline-input title-input"
              @blur="commitTitle"
              @keydown.enter="commitTitle"
              @keydown.escape="cancelTitle"
              ref="titleInputRef"
            />
            <h2
              v-else
              class="footer-title editable-label"
              @click="startEditTitle"
            >
              {{ footerData.title }}
            </h2>
          </div>
        </template>
        <template v-else>
          <h2 class="footer-title">
            <span
              v-for="(char, i) in titleChars"
              :key="i"
              class="shutter-char"
              :class="[char === ' ' ? 'space' : '', { 'place-bold': i >= 10 && i <= 14 }]"
              :style="getShutterStyle(i)"
            >
              {{ char === ' ' ? '\u00A0' : char }}
            </span>
          </h2>
        </template>
      </div>

      <div class="footer-right">
        <div class="footer-info">
          <template v-if="isEditor">
            <div class="field-editor" :class="{ active: editingField === 'email' }">
              <input
                v-if="editingField === 'email'"
                v-model="localEmail"
                class="inline-input"
                @blur="commitEmail"
                @keydown.enter="commitEmail"
                @keydown.escape="cancelEmail"
              />
              <a
                v-else
                :href="'mailto:' + footerData.email"
                class="footer-email editable-label"
                @click.prevent="startEdit('email')"
              >{{ footerData.email }}</a>
            </div>
            <div class="field-editor" :class="{ active: editingField === 'schedule' }">
              <input
                v-if="editingField === 'schedule'"
                v-model="localSchedule"
                class="inline-input"
                @blur="commitSchedule"
                @keydown.enter="commitSchedule"
                @keydown.escape="cancelSchedule"
              />
              <p
                v-else
                class="editable-label"
                @click="startEdit('schedule')"
                v-html="formattedSchedule"
              ></p>
            </div>
            <div class="field-editor" :class="{ active: editingField === 'address' }">
              <input
                v-if="editingField === 'address'"
                v-model="localAddress"
                class="inline-input"
                @blur="commitAddress"
                @keydown.enter="commitAddress"
                @keydown.escape="cancelAddress"
              />
              <p
                v-else
                class="editable-label"
                @click="startEdit('address')"
                v-html="formattedAddress"
              ></p>
            </div>
          </template>
          <template v-else>
            <a :href="'mailto:' + footerData.email" class="footer-email">{{ footerData.email }}</a>
            <p v-html="formattedSchedule"></p>
            <p v-html="formattedAddress"></p>
          </template>
        </div>
      </div>
    </div>
  </footer>
</template>

<script setup>
import { computed, ref, inject, nextTick } from 'vue'

const {
  footerData,
  editingField,
  editField,
  closeEdit,
  updateField,
} = useFooterEditor()

const isEditor = inject('isEditor', false)

const titleChars = computed(() => footerData.value.title.split(''))

const formattedSchedule = computed(() => {
  const parts = footerData.value.schedule.split('|')
  if (parts.length < 2) return footerData.value.schedule
  return parts[0] + '| <strong>' + parts[1].trim() + '</strong>'
})

const formattedAddress = computed(() => {
  const parts = footerData.value.address.split('|')
  if (parts.length < 2) return footerData.value.address
  return parts[0] + '| <strong>' + parts[1].trim() + '</strong>'
})

function getShutterStyle(i) {
  const total = titleChars.value.length
  const step = 15 / total
  const d = i * step
  const e = d + 2
  return {
    '--shutter-d': `${d}%`,
    '--shutter-e': `${e}%`,
  }
}

// Inline editing state
const localTitle = ref('')
const localEmail = ref('')
const localSchedule = ref('')
const localAddress = ref('')
const titleInputRef = ref(null)

function startEdit(field) {
  localTitle.value = footerData.value.title
  localEmail.value = footerData.value.email
  localSchedule.value = footerData.value.schedule
  localAddress.value = footerData.value.address
  editField(field)
  if (field === 'title') {
    nextTick(() => titleInputRef.value?.focus())
  }
}

function startEditTitle() { startEdit('title') }

function commitTitle() {
  updateField('title', localTitle.value.trim() || footerData.value.title)
  closeEdit()
}
function cancelTitle() { closeEdit() }

function commitEmail() {
  updateField('email', localEmail.value.trim() || footerData.value.email)
  closeEdit()
}
function cancelEmail() { closeEdit() }

function commitSchedule() {
  updateField('schedule', localSchedule.value.trim() || footerData.value.schedule)
  closeEdit()
}
function cancelSchedule() { closeEdit() }

function commitAddress() {
  updateField('address', localAddress.value.trim() || footerData.value.address)
  closeEdit()
}
function cancelAddress() { closeEdit() }
</script>

<style>
@font-face {
  font-family: 'wfont_9e41cf_58d674eb74ea449ba1ce06533c9a9704';
  src: url("https://static.wixstatic.com/ufonts/9e41cf_58d674eb74ea449ba1ce06533c9a9704/woff2/file.woff2") format("woff2"),
       url("https://static.wixstatic.com/ufonts/9e41cf_58d674eb74ea449ba1ce06533c9a9704/woff/file.woff") format("woff"),
       url("https://static.wixstatic.com/ufonts/9e41cf_58d674eb74ea449ba1ce06533c9a9704/ttf/file.ttf") format("truetype");
  font-display: swap;
}
</style>

<style scoped>
.site-footer {
  background: linear-gradient(to bottom, #064886 0%, #064886 24%, #5a9fcf 100%);
  color: white;
  position: relative;
  overflow: hidden;
  view-timeline-name: --footer;
  view-timeline-axis: block;
}

  .footer-inner {
    max-width: 1200px;
    margin: 0 auto;
    padding: 28px 24px 22px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 40px;
  }

.footer-left {
  flex: 1;
}

.footer-title {
  font-family: 'wfont_9e41cf_58d674eb74ea449ba1ce06533c9a9704', 'Nunito', sans-serif;
  font-size: 24px;
  font-weight: 400;
  color: #ffffff;
  margin: 0;
  white-space: nowrap;
}

.shutter-char {
  display: inline-block;
  clip-path: inset(0 0 0 0);
  opacity: 1;
}

@supports (animation-timeline: scroll()) {
  @media (prefers-reduced-motion: no-preference) {
    .shutter-char {
      overflow: hidden;
      clip-path: inset(0 100% 0 0);
      opacity: 0;
      animation-name: reveal;
      animation-timeline: --footer;
      animation-range: cover var(--shutter-d) cover var(--shutter-e);
      animation-fill-mode: both;
    }
  }
}

@keyframes reveal {
  0%, 3% { clip-path: inset(0 100% 0 0); opacity: 0; }
  6%, 25% { clip-path: inset(0 0 0 0); opacity: 1; }
  28%, 50% { clip-path: inset(0 100% 0 0); opacity: 0; }
  53%, 100% { clip-path: inset(0 0 0 0); opacity: 1; }
}

.space {
  display: inline-block;
  width: 0.35em;
}

.place-bold {
  font-weight: 700;
}

.footer-right {
  flex: 1;
  display: flex;
  justify-content: flex-end;
}

.footer-info {
  display: flex;
  flex-direction: column;
  gap: 6px;
  font-size: 19px;
  font-weight: 700;
  color: white;
  text-align: left;
  font-family: 'wfont_9e41cf_58d674eb74ea449ba1ce06533c9a9704', 'Nunito', sans-serif;
}

.footer-email {
  color: white;
  font-weight: 700;
  text-decoration: none;
  margin-bottom: 4px;
  font-size: 19px;
  display: block;
}

.footer-email:hover {
  text-decoration: underline;
}

.footer-email:focus-visible {
  outline: 2px solid #ffffff;
  outline-offset: 3px;
  border-radius: 4px;
}

.footer-info p {
  color: white;
  line-height: 1.6;
  margin: 0;
}

.footer-info strong {
  font-weight: 700;
  color: #f7fbff;
}

/* Admin inline editing */
.field-editor {
  position: relative;
}
.editable-label {
  cursor: text;
  border-bottom: 1px dashed rgba(255,255,255,0.3);
  transition: border-color 0.2s;
}
.editable-label:hover {
  border-bottom-color: rgba(255,255,255,0.8);
}
.field-editor.active .editable-label {
  display: none;
}
.inline-input {
  background: rgba(255,255,255,0.15);
  border: 1px solid rgba(255,255,255,0.4);
  border-radius: 4px;
  color: white;
  font: inherit;
  padding: 2px 6px;
  width: 100%;
  outline: none;
  transition: border-color 0.2s;
}
.inline-input:focus {
  border-color: white;
}
.title-input {
  font-family: 'wfont_9e41cf_58d674eb74ea449ba1ce06533c9a9704', 'Nunito', sans-serif;
  font-size: 24px;
  font-weight: 400;
}

@media (prefers-reduced-motion: reduce) {
  .shutter-char {
    animation: none !important;
    clip-path: inset(0 0 0 0) !important;
    opacity: 1 !important;
  }
}

  @media (max-width: 768px) {
  .site-footer {
    background: linear-gradient(180deg, #d46269 0%, #be4f56 100%);
    min-height: 0;
  }
  .footer-inner {
    flex-direction: column;
    align-items: center;
    text-align: center;
    gap: 16px;
    padding: 20px 10px 16px;
  }
  .footer-right {
    justify-content: center;
  }
  .footer-info {
    text-align: center;
    font-size: 0.92em;
  }
  .footer-title {
    white-space: normal;
    font-size: 24px;
    text-align: center;
  }
  .footer-email {
    margin-bottom: 4px;
    font-size: 1em;
  }
}
</style>
