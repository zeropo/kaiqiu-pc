export default defineNuxtPlugin(async () => {
  const ready = useCookie('kq_auth_ready')
  const status = useState('kq-auth-status', () => (ready.value === '1' ? 'ready' : 'idle'))

  if (status.value === 'ready' || status.value === 'pending') return

  status.value = 'pending'

  try {
    await $fetch('/api/user/login', {
      method: 'POST',
      credentials: 'include'
    })
    ready.value = '1'
    status.value = 'ready'
  } catch {
    status.value = 'idle'
  }
})
