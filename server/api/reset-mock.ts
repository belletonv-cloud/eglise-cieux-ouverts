import { resetMock } from '~/server/utils/firestore-mock.js'

export default defineEventHandler(() => {
  resetMock()
  return {
    ok: true,
    message: 'Firestore mock reset successfully',
  }
})
