export function useCity() {
  const city = useState('city', () => '')
  const lat = useState('lat', () => '')
  const lng = useState('lng', () => '')

  const setCity = (c) => { city.value = c || '' }
  const setLocation = (la, ln) => { lat.value = la || ''; lng.value = ln || '' }

  const tryGeolocation = () => new Promise((resolve) => {
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

  onMounted(() => {
    // restore
    if (process.client) {
      const s = window.localStorage
      city.value = s.getItem('kq_city') || ''
      lat.value = s.getItem('kq_lat') || ''
      lng.value = s.getItem('kq_lng') || ''
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

