/**
 * Menu editor composable — manages navigation items in admin mode.
 * In edit mode, clicking a menu item opens the editor instead of navigating.
 * Persisted to Firestore: settings/menu → { menuItems }
 */
import { ref, provide, watch } from 'vue'

const DEFAULT_MENU_ITEMS = [
  { id: 'accueil', label: 'Accueil', to: '/', visible: true, children: [] },
  { id: 'messages', label: 'Messages', to: '/messages', visible: true, children: [] },
  { id: 'agenda', label: 'Agenda', to: '/agenda', visible: true, children: [] },
  { id: 'photos', label: 'Photos', to: '/photos', visible: true, children: [] },
  { id: 'billetterie', label: 'Billetterie Événements', to: '/billetterie', visible: true, children: [] },
  { id: 'contact', label: 'Contact', to: '/contact', visible: true, children: [] },
]

const menuItems = ref(JSON.parse(JSON.stringify(DEFAULT_MENU_ITEMS)))
const editingMenuItemId = ref(null)
const menuEditorOpen = ref(false)
const menuLoaded = ref(false)
const menuSaving = ref(false)
let _menuEditorOpen = menuEditorOpen // alias for provide reactivity

export function useMenuEditor() {
  const activeMenuItem = computed(() => {
    if (!editingMenuItemId.value) return null
    return findItemById(menuItems.value, editingMenuItemId.value)
  })

  function findItemById(items, id) {
    for (const item of items) {
      if (item.id === id) return item
      if (item.children?.length) {
        const found = findItemById(item.children, id)
        if (found) return found
      }
    }
    return null
  }

  function initMenuItems(items) {
    if (items && items.length) {
      menuItems.value = JSON.parse(JSON.stringify(items))
    }
  }

  function openMenuEditor(itemId = null) {
    menuEditorOpen.value = true
    if (itemId) editingMenuItemId.value = itemId
  }

  function closeMenuEditor() {
    menuEditorOpen.value = false
    editingMenuItemId.value = null
  }

  function toggleMenuEditor() {
    if (menuEditorOpen.value) closeMenuEditor()
    else openMenuEditor()
  }

  function selectMenuItem(id) {
    editingMenuItemId.value = id
  }

  function updateMenuItem(id, updates) {
    const item = findItemById(menuItems.value, id)
    if (item) Object.assign(item, updates)
  }

  function addMenuItem(afterId = null) {
    const newItem = {
      id: 'item_' + Date.now(),
      label: 'Nouveau lien',
      to: '/',
      visible: true,
      children: [],
    }
    if (afterId) {
      const idx = menuItems.value.findIndex(i => i.id === afterId)
      menuItems.value.splice(idx + 1, 0, newItem)
    } else {
      menuItems.value.push(newItem)
    }
    editingMenuItemId.value = newItem.id
  }

  function addSubMenuItem(parentId) {
    const newItem = {
      id: 'sub_' + Date.now(),
      label: 'Sous-menu',
      to: '/',
      visible: true,
      children: [],
    }
    const parent = findItemById(menuItems.value, parentId)
    if (parent) {
      if (!parent.children) parent.children = []
      parent.children.push(newItem)
      editingMenuItemId.value = newItem.id
    }
  }

  function removeMenuItem(id) {
    function remove(items) {
      return items.filter(item => {
        if (item.id === id) return false
        if (item.children) item.children = remove(item.children)
        return true
      })
    }
    menuItems.value = remove(menuItems.value)
    if (editingMenuItemId.value === id) editingMenuItemId.value = null
  }

  function moveMenuItem(id, direction) {
    const idx = menuItems.value.findIndex(i => i.id === id)
    if (idx < 0) return
    const newIdx = idx + direction
    if (newIdx < 0 || newIdx >= menuItems.value.length) return
    const [item] = menuItems.value.splice(idx, 1)
    menuItems.value.splice(newIdx, 0, item)
  }

  function toggleMenuItemVisibility(id) {
    const item = findItemById(menuItems.value, id)
    if (item) item.visible = !item.visible
  }

  function getVisibleItems() {
    return menuItems.value.filter(i => i.visible)
  }

  function getMenuItems() {
    return menuItems.value
  }

  function resetToDefault() {
    menuItems.value = JSON.parse(JSON.stringify(DEFAULT_MENU_ITEMS))
    editingMenuItemId.value = null
  }

  // ── Firestore persistence ──
  async function loadMenuFromFirestore() {
    if (menuLoaded.value) return
    try {
      const { getDoc, doc } = await import('firebase/firestore')
      const { $db } = useNuxtApp()
      const snap = await getDoc(doc($db, 'settings', 'menu'))
      if (snap.exists() && snap.data().menuItems?.length) {
        menuItems.value = JSON.parse(JSON.stringify(snap.data().menuItems))
      }
    } catch (e) {
      console.warn('MenuEditor: could not load menu from Firestore, using defaults', e)
    } finally {
      menuLoaded.value = true
    }
  }

  async function saveMenuToFirestore() {
    if (!menuLoaded.value) return
    menuSaving.value = true
    try {
      const { setDoc, doc } = await import('firebase/firestore')
      const { $db } = useNuxtApp()
      await setDoc(doc($db, 'settings', 'menu'), {
        menuItems: JSON.parse(JSON.stringify(menuItems.value)),
        updatedAt: new Date().toISOString(),
      })
    } catch (e) {
      console.error('MenuEditor: save failed', e)
      throw e
    } finally {
      menuSaving.value = false
    }
  }

  // Auto-save on changes (debounced)
  let _saveTimer = null
  watch(menuItems, () => {
    if (!menuLoaded.value) return
    clearTimeout(_saveTimer)
    _saveTimer = setTimeout(() => saveMenuToFirestore().catch(() => {}), 800)
  }, { deep: true })

  provide('menuItems', menuItems)
  provide('menuEditorOpen', menuEditorOpen)
  provide('editingMenuItemId', editingMenuItemId)

  return {
    menuItems,
    editingMenuItemId,
    menuEditorOpen,
    activeMenuItem,
    menuLoaded,
    menuSaving,
    initMenuItems,
    loadMenuFromFirestore,
    saveMenuToFirestore,
    openMenuEditor,
    closeMenuEditor,
    toggleMenuEditor,
    selectMenuItem,
    updateMenuItem,
    addMenuItem,
    addSubMenuItem,
    removeMenuItem,
    moveMenuItem,
    toggleMenuItemVisibility,
    getVisibleItems,
    getMenuItems,
    resetToDefault,
  }
}
