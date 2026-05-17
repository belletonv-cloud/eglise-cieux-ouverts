import { defineStore } from 'pinia'

export const useAdminHistoryStore = defineStore('adminHistory', {
  state: () => ({
    data: {}, // Adapt fields here as needed
  }),
  actions: {
    $patch(payload) {
      Object.assign(this.$state, payload)
    }
  }
})
