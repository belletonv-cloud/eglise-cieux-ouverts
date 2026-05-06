<template>
  <div class="props-panel">
    <div class="props-header">
      <span class="props-icon">{{ blockDef?.icon }}</span>
      <h3 class="props-title">{{ blockDef?.label }}</h3>
      <button class="props-close" @click="$emit('close')">✕</button>
    </div>

    <!-- Visibility toggles -->
    <div class="props-section">
      <p class="props-section-label">Visibilité</p>
      <div class="visibility-row">
        <button
          v-for="device in devices"
          :key="device.key"
          class="vis-btn"
          :class="{ active: localBlock.visibility[device.key] !== false }"
          @click="toggleVisibility(device.key)"
          :title="device.label"
        >
          {{ device.icon }} {{ device.label }}
        </button>
      </div>
    </div>

    <!-- Props fields -->
    <div class="props-section">
      <p class="props-section-label">Contenu</p>
      <div class="props-fields">
        <div v-for="field in blockDef?.schema" :key="field.key" class="field-group">
          <label class="field-label">{{ field.label }}</label>

          <!-- Text -->
          <input
            v-if="field.type === 'text'"
            type="text"
            class="field-input"
            :value="localBlock.props[field.key]"
            @input="updateProp(field.key, $event.target.value)"
          />

          <!-- Textarea -->
          <textarea
            v-else-if="field.type === 'textarea' || field.type === 'richtext'"
            class="field-textarea"
            rows="3"
            :value="localBlock.props[field.key]"
            @input="updateProp(field.key, $event.target.value)"
          ></textarea>

          <!-- Number -->
          <div v-else-if="field.type === 'number'" class="field-number-row">
            <input
              type="range"
              class="field-range"
              :min="field.min ?? 0"
              :max="field.max ?? 100"
              :value="localBlock.props[field.key]"
              @input="updateProp(field.key, Number($event.target.value))"
            />
            <span class="field-number-val">{{ localBlock.props[field.key] }}</span>
          </div>

          <!-- Color -->
          <div v-else-if="field.type === 'color'" class="field-color-row">
            <input
              type="color"
              class="field-color"
              :value="localBlock.props[field.key]"
              @input="updateProp(field.key, $event.target.value)"
            />
            <input
              type="text"
              class="field-color-text"
              :value="localBlock.props[field.key]"
              @input="updateProp(field.key, $event.target.value)"
            />
          </div>

          <!-- Boolean -->
          <label v-else-if="field.type === 'boolean'" class="field-toggle">
            <input
              type="checkbox"
              :checked="localBlock.props[field.key]"
              @change="updateProp(field.key, $event.target.checked)"
            />
            <span class="toggle-slider"></span>
          </label>

          <!-- Image -->
          <div v-else-if="field.type === 'image'" class="field-image-wrap">
            <input
              type="text"
              class="field-input"
              placeholder="/chemin/image.jpg"
              :value="localBlock.props[field.key]"
              @input="updateProp(field.key, $event.target.value)"
            />
            <img
              v-if="localBlock.props[field.key]"
              :src="localBlock.props[field.key]"
              class="field-image-preview"
              alt="preview"
            />
          </div>

          <!-- Select -->
          <select
            v-else-if="field.type === 'select'"
            class="field-select"
            :value="localBlock.props[field.key]"
            @change="updateProp(field.key, $event.target.value)"
          >
            <option v-for="opt in field.options" :key="opt" :value="opt">{{ opt }}</option>
          </select>

          <!-- Animation picker -->
          <div v-else-if="field.type === 'animation'" class="field-animations">
            <button
              v-for="anim in ANIMATIONS"
              :key="anim.id"
              class="anim-btn"
              :class="{ active: localBlock.props[field.key] === anim.id }"
              @click="updateProp(field.key, anim.id)"
            >{{ anim.label }}</button>
          </div>

          <!-- Array (ex: activités) -->
          <div v-else-if="field.type === 'array'" class="field-array">
            <div
              v-for="(item, idx) in localBlock.props[field.key]"
              :key="idx"
              class="array-item"
            >
              <div class="array-item-header">
                <span class="array-item-num">#{{ idx + 1 }}</span>
                <button class="array-item-del" @click="removeArrayItem(field.key, idx)" title="Supprimer">✕</button>
              </div>
              <input
                type="text"
                class="field-input"
                placeholder="Titre"
                :value="item.title"
                @input="updateArrayItemProp(field.key, idx, 'title', $event.target.value)"
              />
              <textarea
                class="field-textarea"
                rows="3"
                placeholder="Description"
                :value="item.description"
                @input="updateArrayItemProp(field.key, idx, 'description', $event.target.value)"
              ></textarea>
              <input
                type="text"
                class="field-input"
                placeholder="URL image"
                :value="item.image"
                @input="updateArrayItemProp(field.key, idx, 'image', $event.target.value)"
              />
              <img v-if="item.image" :src="item.image" class="field-image-preview" alt="preview" />
            </div>
            <button class="array-add-btn" @click="addArrayItem(field.key)">+ Ajouter</button>
          </div>

          <!-- Images list (ex: galerie) -->
          <div v-else-if="field.type === 'images'" class="field-array">
            <div
              v-for="(url, idx) in localBlock.props[field.key]"
              :key="idx"
              class="array-item"
            >
              <div class="array-item-header">
                <span class="array-item-num">#{{ idx + 1 }}</span>
                <button class="array-item-del" @click="removeImageItem(field.key, idx)" title="Supprimer">✕</button>
              </div>
              <input
                type="text"
                class="field-input"
                placeholder="URL image"
                :value="url"
                @input="updateImageItem(field.key, idx, $event.target.value)"
              />
              <img v-if="url" :src="url" class="field-image-preview" alt="preview" />
            </div>
            <button class="array-add-btn" @click="addImageItem(field.key)">+ Ajouter une image</button>
          </div>
        </div>
      </div>
    </div>

    <!-- Delete block -->
    <div class="props-footer">
      <button class="btn-delete" @click="$emit('delete', localBlock.id)">🗑 Supprimer ce bloc</button>
    </div>
  </div>
</template>

<script setup>
import { BLOCK_TYPES, ANIMATIONS } from '~/utils/blockTypes.js'

const props = defineProps({
  block: { type: Object, required: true },
})
const emit = defineEmits(['update', 'close', 'delete'])

// Copie locale uniquement à l'ouverture du bloc — pas de watch pour éviter
// la boucle : edit → emit → parent splice → watch réécrase localBlock
const localBlock = ref(JSON.parse(JSON.stringify(props.block)))

watch(() => props.block.id, (newId) => {
  // Recharger seulement si on change de bloc sélectionné
  localBlock.value = JSON.parse(JSON.stringify(props.block))
})

const blockDef = computed(() => BLOCK_TYPES[localBlock.value.type])

const devices = [
  { key: 'desktop', icon: '🖥️', label: 'Desktop' },
  { key: 'tablet',  icon: '📱', label: 'Tablette' },
  { key: 'mobile',  icon: '📲', label: 'Mobile' },
]

function toggleVisibility(key) {
  const current = localBlock.value.visibility[key]
  localBlock.value.visibility[key] = current === false ? true : false
  emit('update', JSON.parse(JSON.stringify(localBlock.value)))
}

function updateProp(key, value) {
  localBlock.value.props[key] = value
  emit('update', JSON.parse(JSON.stringify(localBlock.value)))
}

// Array (activités)
function removeArrayItem(key, idx) {
  localBlock.value.props[key].splice(idx, 1)
  emit('update', JSON.parse(JSON.stringify(localBlock.value)))
}
function addArrayItem(key) {
  localBlock.value.props[key].push({ title: '', description: '', image: '' })
  emit('update', JSON.parse(JSON.stringify(localBlock.value)))
}
function updateArrayItemProp(key, idx, prop, value) {
  localBlock.value.props[key][idx][prop] = value
  emit('update', JSON.parse(JSON.stringify(localBlock.value)))
}

// Images (galerie)
function removeImageItem(key, idx) {
  localBlock.value.props[key].splice(idx, 1)
  emit('update', JSON.parse(JSON.stringify(localBlock.value)))
}
function addImageItem(key) {
  localBlock.value.props[key].push('')
  emit('update', JSON.parse(JSON.stringify(localBlock.value)))
}
function updateImageItem(key, idx, value) {
  localBlock.value.props[key][idx] = value
  emit('update', JSON.parse(JSON.stringify(localBlock.value)))
}
</script>

<style scoped>
.props-panel {
  width: 320px;
  min-width: 280px;
  background: #1e1e2e;
  color: #e2e8f0;
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow-y: auto;
  border-left: 1px solid #2d2d3f;
}

.props-header {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 16px 16px 14px;
  border-bottom: 1px solid #2d2d3f;
  position: sticky;
  top: 0;
  background: #1e1e2e;
  z-index: 1;
}

.props-icon { font-size: 1.2em; }
.props-title { font-size: 0.95em; font-weight: 700; color: white; flex: 1; margin: 0; }

.props-close {
  background: none;
  border: none;
  color: #888;
  font-size: 1.1em;
  cursor: pointer;
  padding: 2px 6px;
  border-radius: 4px;
}
.props-close:hover { background: #2d2d3f; color: white; }

.props-section {
  padding: 14px 16px;
  border-bottom: 1px solid #2d2d3f;
}

.props-section-label {
  font-size: 0.72em;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: #7c7c9a;
  margin-bottom: 10px;
}

/* Visibility */
.visibility-row {
  display: flex;
  gap: 6px;
}
.vis-btn {
  flex: 1;
  padding: 7px 4px;
  background: #2d2d3f;
  border: 1.5px solid #3d3d55;
  border-radius: 8px;
  color: #888;
  font-size: 0.72em;
  cursor: pointer;
  text-align: center;
  transition: all 0.15s;
}
.vis-btn.active {
  background: #064886;
  border-color: #064886;
  color: white;
}

/* Fields */
.props-fields {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.field-group {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.field-label {
  font-size: 0.78em;
  color: #9999bb;
  font-weight: 500;
}

.field-input, .field-textarea, .field-select {
  background: #2d2d3f;
  border: 1px solid #3d3d55;
  border-radius: 6px;
  color: #e2e8f0;
  padding: 7px 10px;
  font-size: 0.88em;
  font-family: inherit;
  outline: none;
  width: 100%;
}
.field-input:focus, .field-textarea:focus, .field-select:focus {
  border-color: #064886;
}
.field-textarea { resize: vertical; min-height: 70px; }

.field-number-row {
  display: flex;
  align-items: center;
  gap: 10px;
}
.field-range { flex: 1; accent-color: #064886; }
.field-number-val {
  font-size: 0.82em;
  color: #9999bb;
  min-width: 30px;
  text-align: right;
}

.field-color-row {
  display: flex;
  align-items: center;
  gap: 8px;
}
.field-color {
  width: 36px;
  height: 36px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  padding: 2px;
  background: none;
}
.field-color-text {
  flex: 1;
  background: #2d2d3f;
  border: 1px solid #3d3d55;
  border-radius: 6px;
  color: #e2e8f0;
  padding: 7px 10px;
  font-size: 0.82em;
  font-family: monospace;
  outline: none;
}

/* Toggle */
.field-toggle {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  position: relative;
}
.field-toggle input { display: none; }
.toggle-slider {
  width: 40px;
  height: 22px;
  background: #3d3d55;
  border-radius: 11px;
  position: relative;
  transition: background 0.2s;
  flex-shrink: 0;
}
.toggle-slider::after {
  content: '';
  position: absolute;
  width: 16px;
  height: 16px;
  background: white;
  border-radius: 50%;
  top: 3px;
  left: 3px;
  transition: transform 0.2s;
}
.field-toggle input:checked + .toggle-slider { background: #064886; }
.field-toggle input:checked + .toggle-slider::after { transform: translateX(18px); }

/* Image */
.field-image-preview {
  width: 100%;
  max-height: 80px;
  object-fit: cover;
  border-radius: 6px;
  margin-top: 4px;
}

/* Animations */
.field-animations {
  display: flex;
  flex-wrap: wrap;
  gap: 5px;
}
.anim-btn {
  padding: 5px 10px;
  background: #2d2d3f;
  border: 1.5px solid #3d3d55;
  border-radius: 20px;
  color: #9999bb;
  font-size: 0.75em;
  cursor: pointer;
  transition: all 0.15s;
}
.anim-btn.active {
  background: #064886;
  border-color: #064886;
  color: white;
  font-weight: 600;
}
.anim-btn:hover { border-color: #064886; color: white; }

/* Footer */
.props-footer {
  padding: 16px;
  margin-top: auto;
}

/* Array editor */
.field-array {
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.array-item {
  background: #13131f;
  border: 1px solid #2d2d3f;
  border-radius: 8px;
  padding: 10px;
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.array-item-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 4px;
}
.array-item-num {
  font-size: 0.72em;
  font-weight: 700;
  color: #7c7c9a;
  text-transform: uppercase;
  letter-spacing: 0.08em;
}
.array-item-del {
  background: none;
  border: none;
  color: #EF4B54;
  cursor: pointer;
  font-size: 0.85em;
  padding: 2px 5px;
  border-radius: 4px;
}
.array-item-del:hover { background: rgba(239,75,84,0.1); }
.array-add-btn {
  background: #2d2d3f;
  border: 1.5px dashed #3d3d55;
  border-radius: 8px;
  color: #9999bb;
  font-size: 0.82em;
  padding: 8px;
  cursor: pointer;
  transition: all 0.15s;
}
.array-add-btn:hover { border-color: #064886; color: white; }
.btn-delete {
  width: 100%;
  padding: 10px;
  background: transparent;
  border: 1.5px solid #EF4B54;
  border-radius: 8px;
  color: #EF4B54;
  font-size: 0.88em;
  cursor: pointer;
  transition: background 0.15s;
}
.btn-delete:hover { background: rgba(239,75,84,0.1); }
</style>
