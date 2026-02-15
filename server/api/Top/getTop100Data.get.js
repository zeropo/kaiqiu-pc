import proxy from '../_utils/request'
import { okOrThrow } from '../_utils/form'

export default defineEventHandler(async (event) => {
  const res = await proxy(event, 'GET', '/Top/getTop100Data')
  return okOrThrow(res)
})

