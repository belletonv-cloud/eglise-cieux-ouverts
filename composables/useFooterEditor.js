import { ref, watch } from 'vue'

const DEFAULT_FOOTER = {
  title: "Il y a une place pour toi !",
  email: "contact@cieuxouverts.bzh",
  schedule: "Rdv chaque dimanche | 10H",
  address: "2 rue Jean Monnet | 29600 Morlaix, Bretagne",
}

const footerData = ref({ ...DEFAULT_FOOTER })
const footerLoaded = ref(false)
const footerSaving = ref(false)
const editingField = ref(null)

export function useFooterEditor() {
  async function loadFooterFromFirestore() {
    if (footerLoaded.value) return
    try {
      const { getDoc, doc } = await import('firebase/firestore')
      const { $db } = useNuxtApp()
      const snap = await getDoc(doc($db, 'settings', 'footer'))
      if (snap.exists()) {
        const data = snap.data()
        if (data.title) footerData.value.title = data.title
        if (data.email) footerData.value.email = data.email
        if (data.schedule) footerData.value.schedule = data.schedule
        if (data.address) footerData.value.address = data.address
      }
    } catch (e) {
      console.warn('FooterEditor: could not load from Firestore', e)
    } finally {
      footerLoaded.value = true
    }
  }

  async function saveFooterToFirestore() {
    footerSaving.value = true
    try {
      const { setDoc, doc } = await import('firebase/firestore')
      const { $db } = useNuxtApp()
      await setDoc(doc($db, 'settings', 'footer'), {
        ...footerData.value,
        updatedAt: new Date().toISOString(),
      })
    } catch (e) {
      console.error('FooterEditor: save failed', e)
      throw e
    } finally {
      footerSaving.value = false
    }
  }

  function editField(field) {
    editingField.value = field
  }

  function closeEdit() {
    editingField.value = null
  }

  function updateField(field, value) {
    footerData.value[field] = value
  }

  let _saveTimer = null
  watch(footerData, () => {
    if (!footerLoaded.value) return
    clearTimeout(_saveTimer)
    _saveTimer = setTimeout(() => saveFooterToFirestore().catch(() => {}), 800)
  }, { deep: true })

  return {
    footerData,
    footerLoaded,
    footerSaving,
    editingField,
    loadFooterFromFirestore,
    saveFooterToFirestore,
    editField,
    closeEdit,
    updateField,
  }
}
