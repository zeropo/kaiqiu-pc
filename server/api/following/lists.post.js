import { readEventBody } from '../_utils/body'
import proxy from '../_utils/request'

const FOLLOWING_TARGETS = {
  player: [
    { path: '/user/following', method: 'GET' },
    { path: '/user/following', method: 'POST' },
    { path: '/user/follow/list', method: 'GET' },
    { path: '/user/follow/list', method: 'POST' }
  ],
  match: [
    { path: '/match/following', method: 'GET' },
    { path: '/match/following', method: 'POST' }
  ]
}

function normalizeRows(payload) {
  if (Array.isArray(payload?.data?.data)) return payload.data.data
  if (Array.isArray(payload?.data?.list)) return payload.data.list
  if (Array.isArray(payload?.data)) return payload.data
  if (Array.isArray(payload?.list)) return payload.list
  return []
}

function normalizeMeta(payload, rows) {
  const source = payload?.data && typeof payload.data === 'object' ? payload.data : payload || {}
  return {
    current_page: Number(source.current_page || 1),
    last_page: Number(source.last_page || 1),
    total: Number(source.total || rows.length || 0)
  }
}

export default defineEventHandler(async (event) => {
  const body = await readEventBody(event)
  const type = body.type === 'match' ? 'match' : 'player'
  const page = Number(body.page || 1)
  const errors = []

  for (const target of FOLLOWING_TARGETS[type]) {
    try {
      const payload = await proxy(event, target.method, target.path, {
        query: target.method === 'GET' ? { page } : {},
        body: target.method === 'POST' ? { page } : {}
      })
      const rows = normalizeRows(payload)
      const meta = normalizeMeta(payload, rows)

      if (rows.length) {
        return {
          code: 1,
          msg: '',
          data: {
            current_page: meta.current_page,
            last_page: meta.last_page,
            total: meta.total,
            data: rows,
            source: target.path,
            type
          }
        }
      }

      errors.push({ path: target.path, method: target.method, code: payload?.code || 0, msg: payload?.msg || '' })
    } catch (error) {
      errors.push({ path: target.path, method: target.method, msg: error?.statusMessage || error?.message || '请求失败' })
    }
  }

  return {
    code: 1,
    msg: '',
    data: {
      current_page: 1,
      last_page: 1,
      total: 0,
      data: [],
      source: '',
      type,
      errors
    }
  }
})
