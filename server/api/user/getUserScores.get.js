import proxy from '../_utils/request'
import { okOrThrow } from '../_utils/form'

export default defineEventHandler(async (event) => {
  const res = await proxy(event, 'GET', '/User/getUserScores')
  return okOrThrow(res)
})

