function parseFormEncodedBody(raw = '') {
  const params = new URLSearchParams(raw)
  const parsed = {}

  for (const [key, value] of params.entries()) {
    parsed[key] = value
  }

  return parsed
}

async function readRequestBody(event) {
  const payload = await readBody(event)

  if (!payload) return {}
  if (typeof payload === 'string') return parseFormEncodedBody(payload)
  if (payload instanceof URLSearchParams) return Object.fromEntries(payload.entries())
  if (typeof payload === 'object') return payload

  return {}
}

function getProxyHeaders(event) {
  const headers = { Accept: 'application/json' }
  const cookie = getRequestHeader(event, 'cookie')
  const authorization = getRequestHeader(event, 'authorization')

  if (cookie) headers.cookie = cookie
  if (authorization) headers.authorization = authorization

  return headers
}

export default async function proxyRequest(event, method, path, { query = {}, body = {} } = {}) {
  const config = useRuntimeConfig()
  const base = config.kqBaseUrl
  const url = `${base}${path}`

  const headers = getProxyHeaders(event)
  let fetchOptions = { method, headers }

  if (method === 'GET') {
    const merged = { ...getQuery(event), ...query }
    const qs = Object.entries(merged)
      .filter(([, v]) => v !== undefined && v !== null && v !== '')
      .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(String(v))}`)
      .join('&')
    return await $fetch(`${url}${qs ? `?${qs}` : ''}`, { method: 'GET', headers })
  }

  if (method === 'POST') {
    const { toFormData } = await import('./form')
    const incomingBody = await readRequestBody(event)
    const payload = toFormData({ ...incomingBody, ...body })
    fetchOptions.headers['Content-Type'] = 'application/x-www-form-urlencoded'
    fetchOptions.body = payload
  }

  return await $fetch(url, fetchOptions)
}
