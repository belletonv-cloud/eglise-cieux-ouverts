import { isMemberTestEnv, requireBearer, resolveTestEmail, forwardToWorker } from '~/server/utils/member-proxy'
import { getMemberMeMock } from '~/server/utils/member-mock.js'

export default defineEventHandler(async (event) => {
  const token = requireBearer(event)
  if (isMemberTestEnv()) {
    return getMemberMeMock(await resolveTestEmail(event, token))
  }
  return forwardToWorker(event, token, '/api/member/me')
})
