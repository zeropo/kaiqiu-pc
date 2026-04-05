import { buildSilentLoginPayload, ensureKqAuth } from '../_utils/auth'

export default defineEventHandler(async (event) => {
  const auth = await ensureKqAuth(event, { throwOnError: true })
  return buildSilentLoginPayload(auth)
})
