export default defineNuxtPlugin(() => {
  const config = useRuntimeConfig()
  const base = config.public.apiBase

  const api = (path, options = {}) => {
    const method = options.method || 'GET'
    const params = options.params || {}
    const body = options.body || undefined
    const headers = { Accept: 'application/json' }

    if (method === 'GET') {
      const qs = Object.entries(params)
        .filter(([, v]) => v !== undefined && v !== null && v !== '')
        .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(String(v))}`)
        .join('&')
      return $fetch(`${base}${path}${qs ? `?${qs}` : ''}`, { method: 'GET', headers })
    }

    if (method === 'POST') {
      const pairs = []
      Object.entries(body || {}).forEach(([k, v]) => {
        if (v === undefined || v === null || v === '') return
        pairs.push(`${encodeURIComponent(k)}=${encodeURIComponent(String(v))}`)
      })
      return $fetch(`${base}${path}`, {
        method: 'POST',
        headers: { ...headers, 'Content-Type': 'application/x-www-form-urlencoded' },
        body: pairs.join('&')
      })
    }
  }

  return {
    provide: { api }
  }
})

