// Mock minimal Firestore service pour permettre à Nuxt de démarrer
// À adapter selon les besoins réels de l’application

export const getFirestore = () => {
  return {
    collection: () => ({
      doc: () => ({
        get: async () => ({}),
        set: async () => {},
        update: async () => {},
      }),
    }),
  }
}
