export default defineNuxtPlugin(() => {
  const config = useRuntimeConfig()
  const base = config.public.apiBase
  const api = (path, options = {}) => $fetch(`${base}${path}`, options)
  return { provide: { api } }
})

