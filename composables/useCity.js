export function useCity() {
  const city = useState('city', () => '杭州市')
  const lat = useState('lat', () => '30.21')
  const lng = useState('lng', () => '120.21')

  const setCity = (c) => { city.value = c || '杭州市' }
  const setLocation = (la, ln) => { lat.value = la || '30.21'; lng.value = ln || '120.21' }

  const tryGeolocation = () => new Promise((resolve) => {
    // 开发环境直接使用默认经纬度
    if (process.dev) {
      setLocation('30.21', '120.21')
      return resolve(true)
    }
    
    // 检查浏览器支持
    if (!process.client || !navigator.geolocation) return resolve(false)
    
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocation(String(pos.coords.latitude), String(pos.coords.longitude))
        resolve(true)
      },
      () => resolve(false),
      { timeout: 2500 }
    )
  })

  onMounted(async () => {
    if (!process.client) return
    
    const s = window.localStorage
    city.value = s.getItem('kq_city') || '杭州市'
    
    // 开发环境直接使用默认经纬度
    if (process.dev) {
      lat.value = '30.21'
      lng.value = '120.21'
      return
    }
    
    // 线上环境：优先读取缓存，没有缓存则自动获取位置
    const cachedLat = s.getItem('kq_lat')
    const cachedLng = s.getItem('kq_lng')
    
    if (cachedLat && cachedLng) {
      lat.value = cachedLat
      lng.value = cachedLng
    } else {
      // 没有缓存，自动获取位置
      await tryGeolocation()
    }
  })

  watch([city, lat, lng], () => {
    if (process.client) {
      const s = window.localStorage
      s.setItem('kq_city', city.value)
      s.setItem('kq_lat', lat.value)
      s.setItem('kq_lng', lng.value)
    }
  })

  return { city, lat, lng, setCity, setLocation, tryGeolocation }
}

