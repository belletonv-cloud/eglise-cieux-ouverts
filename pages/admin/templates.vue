<script setup>
import { ref, onMounted } from 'vue'

const templatesBlocks = ref([])
const templatesPages = ref([])
const loading = ref(false)

onMounted(async () => {
  loading.value = true
  try {
    const [blocksRes, pagesRes] = await Promise.all([
      fetch('/api/templates/blocks'),
      fetch('/api/templates/pages')
    ])
    if (blocksRes.ok) templatesBlocks.value = await blocksRes.json()
    if (pagesRes.ok) templatesPages.value = await pagesRes.json()
  } catch (e) {
    console.error('Erreur chargement templates:', e)
  } finally {
    loading.value = false
  }
})
</script>

<template>
  <div class="admin-templates-page">
    <h1>Templates</h1>
    
    <section v-if="loading">Chargement...</section>
    
    <section v-else>
      <h2>Templates de blocs</h2>
      <div class="templates-grid" v-if="templatesBlocks.length">
        <div v-for="tpl in templatesBlocks" :key="tpl.id" class="template-card">
          <h3>{{ tpl.name }}</h3>
          <p class="template-type">{{ tpl.type }}</p>
        </div>
      </div>
      <p v-else>Aucun template de bloc</p>

      <h2>Templates de pages</h2>
      <div class="templates-grid" v-if="templatesPages.length">
        <div v-for="tpl in templatesPages" :key="tpl.id" class="template-card">
          <h3>{{ tpl.name }}</h3>
          <p class="template-slug">{{ tpl.slug }}</p>
        </div>
      </div>
      <p v-else>Aucun template de page</p>
    </section>
  </div>
</template>

<style scoped>
.admin-templates-page {
  padding: 24px;
  max-width: 800px;
  margin: 0 auto;
}
.templates-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 16px;
  margin-top: 16px;
}
.template-card {
  padding: 16px;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  background: #fafafa;
}
.template-type, .template-slug {
  font-size: 12px;
  color: #6b7280;
  margin: 4px 0 0;
}
</style>
