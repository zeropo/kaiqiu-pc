import { readEventBody } from './body'
import { buildKqAuthHeaders, ensureKqAuth } from './auth'

export default async function proxyRequest(event, method, path, { query = {}, body = {} } = {}) {
  const config = useRuntimeConfig()
  const base = config.kqBaseUrl
  const url = `${base}${path}`

  const auth = await ensureKqAuth(event)
  const headers = {
    Accept: 'application/json',
    ...buildKqAuthHeaders(auth)
  }
  const fetchOptions = { method, headers }

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
    const incomingBody = await readEventBody(event)
    const payload = toFormData({ ...incomingBody, ...body })
    fetchOptions.headers['Content-Type'] = 'application/x-www-form-urlencoded'
    fetchOptions.body = payload
  }

  return await $fetch(url, fetchOptions)
}
