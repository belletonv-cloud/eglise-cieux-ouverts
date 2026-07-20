import { isMemberTestEnv, requireBearer, resolveTestEmail, forwardToWorker, mockResult } from '~/server/utils/member-proxy'
import { setAttendanceMock } from '~/server/utils/member-mock.js'

export default defineEventHandler(async (event) => {
  const token = requireBearer(event)
  const id = getRouterParam(event, 'id')
  const body = await readBody(event)
  if (isMemberTestEnv()) {
    return mockResult(setAttendanceMock(await resolveTestEmail(event, token), id, body))
  }
  return forwardToWorker(event, token, `/api/member/events/${id}/attendance`, { method: 'POST', body })
})
