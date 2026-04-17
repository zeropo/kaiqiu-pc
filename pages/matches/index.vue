<template>
  <div class="container pt-8 pb-10 md:pt-12 md:pb-16">
    <div class="mb-8 flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
      <div>
        <h1 class="font-display text-3xl font-bold text-text-main">比赛大厅</h1>
        <p class="mt-2 text-text-muted">浏览并筛选您身边的乒乓球赛事</p>
      </div>

    </div>

    <div class="mb-10 rounded-card border border-border bg-white p-5 shadow-sm">
      <div class="flex flex-col gap-5">
        <div class="flex flex-col gap-4 lg:flex-row lg:items-center">
          <SegmentTabs
            :model-value="activeTab"
            :tabs="tabs"
            @update:model-value="changeTab"
          />
        </div>

        <div class="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
          <div class="space-y-1">
            <p class="text-sm font-semibold text-text-main">{{ currentViewLabel }}</p>
            <p class="text-sm text-text-muted">
              当前共展示 {{ displayList.length }} 场赛事
            </p>
          </div>

          <div class="grid grid-cols-2 gap-3 md:grid-cols-4 xl:min-w-[720px]">
            <button
              v-for="option in sortOptions"
              :key="option.value"
              type="button"
              :class="[
                'rounded-2xl border px-4 py-3 text-left transition-all',
                sortOption === option.value
                  ? 'border-brand-primary bg-brand-primary text-white shadow-card'
                  : 'border-border bg-white text-text-main hover:border-brand-primary hover:bg-brand-primary/5'
              ]"
              @click="sortOption = option.value"
            >
              <span class="block text-sm font-semibold">{{ option.label }}</span>
              <span
                :class="[
                  'mt-1 block text-xs',
                  sortOption === option.value ? 'text-white/80' : 'text-text-muted'
                ]"
              >
                {{ option.description }}
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>

    <div v-if="loading" class="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
      <div v-for="n in 6" :key="n" class="h-64 rounded-card border border-border bg-white animate-pulse" />
    </div>

    <div v-else>
      <div v-if="displayList.length" class="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <MatchCard v-for="match in displayList" :key="getMatchKey(match)" :match="match" />
      </div>

      <div v-if="!displayList.length" class="flex flex-col items-center justify-center rounded-card border border-border bg-white py-20 shadow-sm">
        <div class="mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-surfaceSoft">
          <svg class="h-10 w-10 text-text-light" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
        </div>
        <p class="text-lg font-medium text-text-muted">{{ emptyTitle }}</p>
        <p class="mt-2 text-sm text-text-light">{{ emptyDescription }}</p>
      </div>

      <div
        v-if="hasMore"
        ref="loadMoreSentinel"
        class="h-px w-full opacity-0 pointer-events-none"
        aria-hidden="true"
      ></div>
    </div>
  </div>
</template>

<script setup>
useHead({
  title: '比赛大厅'
})

const tabs = [
  { value: 'local', label: '同城赛事' },
  { value: 'history', label: '历史赛事' }
]

const sortOptions = [
  { value: 'time_desc', label: '开赛更晚', description: '按时间由晚到早' },
  { value: 'time_asc', label: '开赛更早', description: '按时间由早到晚' },
  { value: 'distance_asc', label: '距离最近', description: '按距离由近到远' },
  { value: 'distance_desc', label: '距离最远', description: '按距离由远到近' }
]

const route = useRoute()
const router = useRouter()
const { city, lat, lng } = useCity()
const initialCity = city.value
const initialLat = lat.value
const initialLng = lng.value
const normalizeActiveTab = (value) => (value === 'history' ? 'history' : 'local')
const getDefaultSortForTab = (tab) => 'time_desc'
const normalizeSortOption = (value, tab) => sortOptions.some((option) => option.value === value) ? value : getDefaultSortForTab(tab)

const activeTab = ref(normalizeActiveTab(route.query.tab))
const sortOption = ref(normalizeSortOption(route.query.sort, activeTab.value))
const page = ref(1)
const rawList = ref([])
const hasMore = ref(false)
const loading = ref(true)
const loadingMore = ref(false)
const initialized = ref(false)

const { $api } = useNuxtApp()
const canAutoLoadMore = computed(() => hasMore.value && !loading.value && !loadingMore.value)
const { loadMoreSentinel } = useAutoLoadMore({
  canLoadMore: canAutoLoadMore,
  onLoadMore: () => load(page.value + 1)
})

const syncQuery = async () => {
  const nextQuery = { ...route.query, tab: activeTab.value, sort: sortOption.value }
  if (route.query.tab === nextQuery.tab && route.query.sort === nextQuery.sort) return
  await router.replace({ query: nextQuery })
}

const cityLabel = computed(() => city.value || '杭州市')
const requestCityName = computed(() => cityLabel.value)
const currentViewLabel = computed(() => activeTab.value === 'history' ? '历史赛事' : '同城赛事')
const requestCity = computed(() => activeTab.value === 'history' ? '-1' : city.value)
const emptyTitle = computed(() => activeTab.value === 'history' ? '暂无历史赛事数据' : `${cityLabel.value}暂无比赛数据`)
const emptyDescription = computed(() => activeTab.value === 'history'
  ? '当前未查询到已结束的赛事，可稍后再来看看。'
  : '当前城市暂无可报名或未结束赛事。')

const parseGrade = (match) => {
  const value = Number(match?.grade)
  return Number.isFinite(value) && value > 0 ? value : 0
}

const parseDistance = (match, fallback = Infinity) => {
  const value = Number(match?.juli)
  if (Number.isFinite(value)) return value

  const textValue = parseFloat(match?.distance)
  return Number.isFinite(textValue) ? textValue : fallback
}

const parseTime = (match, fallback = Infinity) => {
  const value = new Date(match?.starttime || '').getTime()
  return Number.isFinite(value) ? value : fallback
}

const isRecommended = (match) => parseGrade(match) > 0

const isHistoryMatch = (match) => {
  const status = String(match?.status || '')
  if (status.includes('积分已计算')) return true
  if (status.includes('已结束') && !status.includes('报名已结束')) return true

  const endFlag = match?.ifend
  if (endFlag !== undefined && endFlag !== null && endFlag !== '') {
    return String(endFlag) !== '0'
  }

  return false
}

const compareDistanceAsc = (a, b) => parseDistance(a) - parseDistance(b)
const compareDistanceDesc = (a, b) => parseDistance(b, -Infinity) - parseDistance(a, -Infinity)
const compareTimeAsc = (a, b) => parseTime(a) - parseTime(b)
const compareTimeDesc = (a, b) => parseTime(b, -Infinity) - parseTime(a, -Infinity)

const compareBySelectedSort = (a, b) => {
  switch (sortOption.value) {
    case 'distance_asc':
      return compareDistanceAsc(a, b)
    case 'distance_desc':
      return compareDistanceDesc(a, b)
    case 'time_asc':
      return compareTimeAsc(a, b)
    case 'time_desc':
      return compareTimeDesc(a, b)
    default:
      return 0
  }
}

const compareMatches = (a, b) => {
  const recommendedA = isRecommended(a)
  const recommendedB = isRecommended(b)

  if (recommendedA !== recommendedB) {
    return recommendedA ? -1 : 1
  }

  if (recommendedA && recommendedB) {
    const gradeDiff = parseGrade(b) - parseGrade(a)
    if (gradeDiff !== 0) return gradeDiff
  }

  const selectedDiff = compareBySelectedSort(a, b)
  if (selectedDiff !== 0) return selectedDiff

  const distanceDiff = compareDistanceAsc(a, b)
  if (distanceDiff !== 0) return distanceDiff

  const timeDiff = compareTimeAsc(a, b)
  if (timeDiff !== 0) return timeDiff

  return String(a?.eventid || '').localeCompare(String(b?.eventid || ''))
}

const getMatchKey = (match) => match?.eventid || `${match?.title || 'match'}-${match?.starttime || ''}-${match?.arena_name || ''}`

const dedupeMatches = (matches = []) => {
  const mapped = new Map()

  matches.forEach((match, index) => {
    const key = match?.eventid || `${match?.title || 'match'}-${match?.starttime || ''}-${index}`
    const prev = mapped.get(key)
    mapped.set(key, prev ? { ...prev, ...match } : match)
  })

  return Array.from(mapped.values())
}

const resolveHasMore = ({ rows, currentPage, lastPage, previousCount, nextCount }) => {
  if (!rows.length) return false

  if (Number.isFinite(currentPage) && Number.isFinite(lastPage) && currentPage > 0 && lastPage > 0) {
    return currentPage < lastPage
  }

  // History-match responses can omit pagination metadata entirely.
  // In that case keep requesting while we still receive unseen rows.
  return nextCount > previousCount
}

const buildRequestBody = (requestPage = 1) => ({
  city: requestCity.value,
  cityName: requestCityName.value,
  lat: lat.value,
  lng: lng.value,
  sort: 2,
  page: requestPage
})

const { data: initialListState } = await useAsyncData(() => `matches-page:${activeTab.value}:${requestCity.value}:${lat.value}:${lng.value}`, async () => {
  try {
    const res = await $api('/match/lists', {
      method: 'POST',
      body: buildRequestBody(1)
    })

    const rows = Array.isArray(res?.data?.data) ? res.data.data : []
    const nextList = dedupeMatches(rows)
    const currentPage = Number(res?.data?.current_page)
    const lastPage = Number(res?.data?.last_page)
    const resolvedCurrentPage = Number.isFinite(currentPage) && currentPage > 0 ? currentPage : 1

    return {
      rows: nextList,
      page: resolvedCurrentPage,
      hasMore: resolveHasMore({
        rows,
        currentPage,
        lastPage,
        previousCount: 0,
        nextCount: nextList.length
      })
    }
  } catch {
    return { rows: [], page: 1, hasMore: false }
  }
}, {
  default: () => ({ rows: [], page: 1, hasMore: false }),
  watch: false
})

rawList.value = initialListState.value.rows
page.value = initialListState.value.page
hasMore.value = initialListState.value.hasMore
loading.value = false

const displayList = computed(() => {
  return rawList.value
    .filter((match) => activeTab.value === 'history' ? isHistoryMatch(match) : !isHistoryMatch(match))
    .sort(compareMatches)
})

const load = async (p = 1) => {
  const isFirstPage = p === 1

  if (isFirstPage) {
    loading.value = true
  } else {
    if (loading.value || loadingMore.value || !hasMore.value) return
    loadingMore.value = true
  }

  try {
    const res = await $api('/match/lists', {
      method: 'POST',
      body: buildRequestBody(p)
    })

    const rows = Array.isArray(res?.data?.data) ? res.data.data : []
    const previousCount = rawList.value.length
    const nextList = isFirstPage ? dedupeMatches(rows) : dedupeMatches(rawList.value.concat(rows))

    const currentPage = Number(res?.data?.current_page)
    const lastPage = Number(res?.data?.last_page)
    const resolvedCurrentPage = Number.isFinite(currentPage) && currentPage > 0 ? currentPage : p

    rawList.value = nextList
    page.value = resolvedCurrentPage
    hasMore.value = resolveHasMore({
      rows,
      currentPage,
      lastPage,
      previousCount,
      nextCount: nextList.length
    })
  } catch (error) {
    if (isFirstPage) rawList.value = []
    hasMore.value = false
  } finally {
    if (isFirstPage) {
      loading.value = false
    } else {
      loadingMore.value = false
    }
  }
}

const changeTab = async (tab) => {
  if (tab === activeTab.value) return

  activeTab.value = tab
  sortOption.value = getDefaultSortForTab(tab)
  await syncQuery()
  page.value = 1
  rawList.value = []
  hasMore.value = false
  await load(1)
}

watch(sortOption, async (nextValue, prevValue) => {
  if (!initialized.value || nextValue === prevValue) return
  await syncQuery()
})

watch([city, lat, lng], async ([nextCity, nextLat, nextLng], [prevCity, prevLat, prevLng]) => {
  if (!initialized.value || activeTab.value !== 'local') return

  if (nextCity === prevCity && nextLat === prevLat && nextLng === prevLng) return

  page.value = 1
  rawList.value = []
  hasMore.value = false
  await load(1)
})

onMounted(async () => {
  await syncQuery()

  if (activeTab.value === 'local' && (city.value != initialCity || lat.value != initialLat || lng.value != initialLng)) {
    await load(1)
  }

  initialized.value = true
})
</script>
