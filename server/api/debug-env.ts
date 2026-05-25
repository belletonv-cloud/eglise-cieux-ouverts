export default defineEventHandler((event) => ({ pw: process.env.PW_TEST, config: useRuntimeConfig(event).TEST_ENV }))
