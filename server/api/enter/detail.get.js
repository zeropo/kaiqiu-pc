import proxy from '../_utils/request'
import { okOrThrow } from '../_utils/form'

export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const res = await proxy(event, 'GET', '/enter/detail', {
    query: {
      lat: query.lat || '30.21',
      lng: query.lng || '120.21'
    }
  })
  return okOrThrow(res)
})
