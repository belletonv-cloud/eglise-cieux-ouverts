import { isMemberTestEnv, requireBearer, resolveTestEmail, forwardToWorker, mockResult } from '~/server/utils/member-proxy'
import { accessResourceMock } from '~/server/utils/member-mock.js'

export default defineEventHandler(async (event) => {
  const token = requireBearer(event)
  const id = getRouterParam(event, 'id')
  if (isMemberTestEnv()) {
    return mockResult(accessResourceMock(await resolveTestEmail(event, token), id))
  }
  return forwardToWorker(event, token, `/api/member/resources/${id}/access`, { method: 'POST', body: {} })
})
