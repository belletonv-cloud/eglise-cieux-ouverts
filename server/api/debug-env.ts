export default defineEventHandler((event) => ({ pw: process.env.PW_TEST, config: useRuntimeConfig(event).public?.TEST_ENV }))
