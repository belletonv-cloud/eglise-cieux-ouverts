import { isMemberTestEnv, requireBearer, resolveTestEmail, forwardToWorker } from '~/server/utils/member-proxy'
import { getMemberRequestsMock } from '~/server/utils/member-mock.js'

export default defineEventHandler(async (event) => {
  const token = requireBearer(event)
  if (isMemberTestEnv()) {
    return getMemberRequestsMock(await resolveTestEmail(event, token))
  }
  return forwardToWorker(event, token, '/api/member/requests')
})
