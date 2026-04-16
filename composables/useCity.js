const DEFAULT_CITY = '杭州市'
const DEFAULT_LAT = '30.184'
const DEFAULT_LNG = '120.204'

export function useCity() {
  const city = useState('city', () => DEFAULT_CITY)
  const lat = useState('lat', () => DEFAULT_LAT)
  const lng = useState('lng', () => DEFAULT_LNG)
  const cityGroups = useState('city-groups', () => [])
  const cityLoaded = useState('city-loaded', () => false)
  const cityLoading = useState('city-loading', () => false)
  const switchVersion = useState('city-switch-version', () => 0)

  const setCity = (c) => {
    city.value = c || DEFAULT_CITY
  }

  const setLocation = (la, ln) => {
    lat.value = la || DEFAULT_LAT
    lng.value = ln || DEFAULT_LNG
  }

  const markSwitched = () => {
    switchVersion.value += 1
  }

  const syncCitiesToStorage = () => {
    if (!process.client || !cityGroups.value.length) return
    window.localStorage.setItem('kq_city_groups', JSON.stringify(cityGroups.value))
  }

  const loadCitiesFromStorage = () => {
    if (!process.client || cityLoaded.value) return false

    const raw = window.localStorage.getItem('kq_city_groups')
    if (!raw) return false

    try {
      const parsed = JSON.parse(raw)
      cityGroups.value = parsed
      cityLoaded.value = true
      return true
    } catch {
      window.localStorage.removeItem('kq_city_groups')
      return false
    }
  }

  const normalizeCityGroups = (groups = []) => {
    return groups.map((group) => ({
      letter: group.letter,
      list: group.list || []
    }))
  }

  const ensureCityGroups = async (force = false) => {
    if (!process.client) return cityGroups.value
    if (!force && cityLoaded.value && cityGroups.value.length) return cityGroups.value
    if (!force && loadCitiesFromStorage()) return cityGroups.value
    if (cityLoading.value) return cityGroups.value

    cityLoading.value = true

    try {
      const { $api } = useNuxtApp()
      const res = await $api('/public/cities')
      cityGroups.value = normalizeCityGroups(res.data || [])
      cityLoaded.value = true
      syncCitiesToStorage()
    } finally {
      cityLoading.value = false
    }

    return cityGroups.value
  }

  const switchCity = (nextCity) => {
    setCity(nextCity)
    setLocation(DEFAULT_LAT, DEFAULT_LNG)
    markSwitched()
  }

  const tryGeolocation = () => new Promise((resolve) => {
    if (process.dev) {
      setLocation(DEFAULT_LAT, DEFAULT_LNG)
      return resolve(true)
    }

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

  const resolveCityByCoords = async (latitude, longitude) => {
    try {
      const resp = await fetch(
        `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json&accept-language=zh`
      )
      const data = await resp.json()
      return data.address?.city || data.address?.town || ''
    } catch {
      return ''
    }
  }

  onMounted(async () => {
    if (!process.client) return

    const s = window.localStorage
    const cachedCity = s.getItem('kq_city')
    city.value = cachedCity || DEFAULT_CITY

    if (process.dev) {
      lat.value = DEFAULT_LAT
      lng.value = DEFAULT_LNG
      loadCitiesFromStorage()
      return
    }

    const cachedLat = s.getItem('kq_lat')
    const cachedLng = s.getItem('kq_lng')

    if (cachedLat && cachedLng) {
      lat.value = cachedLat
      lng.value = cachedLng
      loadCitiesFromStorage()
      return
    }

    const located = await tryGeolocation()
    loadCitiesFromStorage()

    // 首次访问定位成功，根据坐标逆地理编码匹配城市
    if (located && !cachedCity) {
      const geoCity = await resolveCityByCoords(lat.value, lng.value)
      if (geoCity) {
        await ensureCityGroups()
        const allCities = cityGroups.value.flatMap(g => g.list)
        const matched = allCities.find(c => c.name === geoCity) ||
          allCities.find(c => geoCity.includes(c.name) || c.name.includes(geoCity))
        if (matched) {
          setCity(matched.name)
          markSwitched()
        }
      }
    }
  })

  watch([city, lat, lng], () => {
    if (!process.client) return

    const s = window.localStorage
    s.setItem('kq_city', city.value)
    s.setItem('kq_lat', lat.value)
    s.setItem('kq_lng', lng.value)
  })

  return {
    city,
    lat,
    lng,
    cityGroups,
    cityLoaded,
    cityLoading,
    switchVersion,
    setCity,
    setLocation,
    switchCity,
    ensureCityGroups,
    tryGeolocation
  }
}
