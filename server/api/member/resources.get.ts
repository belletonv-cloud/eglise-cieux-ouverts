import { isMemberTestEnv, requireBearer, resolveTestEmail, forwardToWorker } from '~/server/utils/member-proxy'
import { getMemberResourcesMock } from '~/server/utils/member-mock.js'

export default defineEventHandler(async (event) => {
  const token = requireBearer(event)
  if (isMemberTestEnv()) {
    return getMemberResourcesMock(await resolveTestEmail(event, token))
  }
  return forwardToWorker(event, token, '/api/member/resources')
})
