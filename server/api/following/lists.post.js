import { readEventBody } from '../_utils/body'
import { okOrThrow } from '../_utils/form'
import proxy from '../_utils/request'

const FOLLOWEES_PATH = '/User/getUserFolloweesList'

export default defineEventHandler(async (event) => {
  const body = await readEventBody(event)
  const page = Number(body.page || 1)
  const payload = okOrThrow(await proxy(event, 'GET', FOLLOWEES_PATH, { query: { page } }))
  const rows = Array.isArray(payload?.data?.followeesList) ? payload.data.followeesList : []

  return {
    code: 1,
    msg: payload?.msg || '',
    data: {
      current_page: 1,
      last_page: 1,
      total: rows.length,
      data: rows,
      followeesList: rows,
      source: FOLLOWEES_PATH
    }
  }
})
