export default defineNuxtPlugin(() => {
  if (process.server) return
  if (!('geolocation' in navigator)) return

  const lat = useState('lat', () => '')
  const lng = useState('lng', () => '')

  const set = (la, ln) => {
    lat.value = String(la || '')
    lng.value = String(ln || '')
    try {
      localStorage.setItem('kq_lat', lat.value)
      localStorage.setItem('kq_lng', lng.value)
    } catch {}
  }

  // 优先读取缓存，避免重复弹窗
  try {
    const la = localStorage.getItem('kq_lat')
    const ln = localStorage.getItem('kq_lng')
    if (la && ln) {
      set(la, ln)
      return
    }
  } catch {}

  // 进入站点即请求定位
  navigator.geolocation.getCurrentPosition(
    (pos) => set(pos.coords.latitude, pos.coords.longitude),
    () => {},
    { timeout: 3000 }
  )
})

