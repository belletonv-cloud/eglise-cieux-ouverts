import { isMemberTestEnv, requireBearer, resolveTestEmail, forwardToWorker, mockResult } from '~/server/utils/member-proxy'
import { createCandidacyMock } from '~/server/utils/member-mock.js'

export default defineEventHandler(async (event) => {
  const token = requireBearer(event)
  const body = await readBody(event)
  if (isMemberTestEnv()) {
    return mockResult(createCandidacyMock(await resolveTestEmail(event, token), body))
  }
  return forwardToWorker(event, token, '/api/member/candidacies', { method: 'POST', body })
})
