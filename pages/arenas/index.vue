<template>
  <div class="container pt-8 pb-10 md:pt-12 md:pb-16">
    <div class="mb-8 flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
      <div>
        <h1 class="font-display text-3xl font-bold text-text-main">球馆大厅</h1>
        <p class="mt-2 text-text-muted">浏览并筛选您身边的乒乓球馆</p>
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
              当前共展示 {{ displayList.length }} 家球馆
            </p>
          </div>

          <div class="grid grid-cols-2 gap-3 xl:min-w-[360px]">
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
        <article
          v-for="arena in displayList"
          :key="arena.id"
          class="group relative flex h-full flex-col overflow-hidden rounded-card border border-border bg-white shadow-card transition-all duration-smooth hover:-translate-y-1 hover:shadow-cardHover"
        >
          <NuxtLink :to="{ path: `/arenas/${arena.id}`, query: route.query }" class="flex h-full flex-col">
            <div class="relative aspect-[4/3] overflow-hidden">
              <div class="absolute inset-0 bg-surfaceSoft animate-pulse"></div>
              <ImgFallback
                :src="arena.image || arena.pic"
                :alt="arena.name || '球馆图片'"
                class="relative z-10 h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
              />
              <div class="absolute inset-0 z-10 bg-gradient-to-t from-black/15 via-transparent to-transparent"></div>
              <div class="absolute left-3 top-3 z-20 flex gap-2 pointer-events-none">
                <span class="inline-flex items-center rounded-sm bg-[#39b54a] px-2.5 py-1 text-xs font-semibold text-white shadow-sm">
                  {{ arena.city || arena.province || '球馆' }}
                </span>
                <span
                  v-if="arena.district"
                  class="inline-flex items-center rounded-md border border-white/10 bg-black/40 px-2 py-1 text-xs font-medium text-white backdrop-blur-md"
                >
                  {{ arena.district }}
                </span>
              </div>
            </div>

            <div class="flex flex-1 flex-col p-5">
              <h2 class="line-clamp-2 text-lg font-semibold leading-snug text-text-main transition-colors group-hover:text-brand-primary">
                {{ arena.name || '未命名球馆' }}
              </h2>

              <div class="mt-4 space-y-2">
                <div class="flex items-start gap-2 text-sm text-text-muted">
                  <svg class="h-4 w-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
                  <span class="line-clamp-2">{{ arena.address || '暂无地址信息' }}</span>
                </div>
                <div class="flex items-center gap-2 text-sm text-text-muted">
                  <svg class="h-4 w-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.128a11.042 11.042 0 005.516 5.516l1.128-2.257a1 1 0 011.21-.502l4.493 1.498A1 1 0 0121 15.72V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"></path></svg>
                  <span class="truncate">{{ getArenaPhone(arena) }}</span>
                </div>
                <div class="flex items-center gap-2 text-sm text-text-muted">
                  <svg class="h-4 w-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path></svg>
                  <span class="truncate">{{ arena.view || 0 }}人浏览</span>
                </div>
              </div>

              <div class="mt-auto pt-4">
                <div class="flex items-end justify-between gap-3 border-t border-surfaceSoft pt-4">
                <span class="rounded-md bg-brand-secondary/10 px-2.5 py-1 text-xs font-semibold text-brand-secondary">
                  距您 {{ formatDistance(arena) }}
                </span>
                <span></span>
                </div>
              </div>
            </div>
          </NuxtLink>
        </article>
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
  title: '球馆大厅'
})

const tabs = [
  { value: 'local', label: '同城球馆' },
  { value: 'all', label: '全部球馆' }
]

const sortOptions = [
  { value: 'default', label: '默认排序', description: '按收录时间由晚到早' },
  { value: 'distance', label: '距离排序', description: '按球馆距离由近到远' }
]

const route = useRoute()
const router = useRouter()
const { city, lat, lng } = useCity()
const { $api } = useNuxtApp()

const normalizeActiveTab = (value) => (value === 'all' ? 'all' : 'local')
const normalizeSortOption = (value) => (value === 'distance' ? 'distance' : 'default')

const activeTab = ref(normalizeActiveTab(route.query.tab))
const sortOption = ref(normalizeSortOption(route.query.sort))
const page = ref(1)
const rawList = ref([])
const hasMore = ref(false)
const loading = ref(true)
const loadingMore = ref(false)
const initialized = ref(false)

let requestVersion = 0

const requestCity = computed(() => activeTab.value === 'local' ? city.value : '-1')
const cityLabel = computed(() => city.value || '当前城市')
const currentViewLabel = computed(() => activeTab.value === 'local' ? '同城球馆' : '全部球馆')
const emptyTitle = computed(() => activeTab.value === 'local' ? `${cityLabel.value}暂无球馆数据` : '暂无球馆数据')
const emptyDescription = computed(() => activeTab.value === 'local'
  ? '当前城市暂未查询到可展示的球馆，可稍后再试或切换到全部球馆查看。'
  : '当前未查询到可展示的球馆信息，可稍后再来看看。')

const parseDistance = (arena) => {
  const juli = Number(arena.juli)
  if (Number.isFinite(juli)) return juli

  const distance = parseFloat(arena.distance)
  if (Number.isFinite(distance)) return distance

  return Number.MAX_SAFE_INTEGER
}

const formatDistance = (arena) => {
  if (arena.distance) return arena.distance

  const distance = parseDistance(arena)
  if (distance === Number.MAX_SAFE_INTEGER) return '--'
  if (distance < 1) return `${Math.round(distance * 1000)}m`

  return `${distance.toFixed(1)}km`
}

const getArenaPhone = (arena) => {
  const mobile = String(arena.mobile || '').trim()
  if (mobile) return mobile

  const phone = String(arena.phone || '').trim()
  if (phone) return phone

  return '无'
}

const requestSort = computed(() => (sortOption.value === 'distance' ? 1 : 2))

const hasDisplayValue = (value) => value !== null && value !== undefined && String(value).trim() !== ''

const mergeArena = (currentArena, nextArena) => {
  const merged = { ...currentArena }

  Object.entries(nextArena || {}).forEach(([key, value]) => {
    if (hasDisplayValue(value) && !hasDisplayValue(merged[key])) {
      merged[key] = value
    }
  })

  return merged
}

const dedupeArenas = (rows) => {
  const mapped = new Map()

  rows.forEach((arena, index) => {
    const name = String(arena?.name || '').trim()
    const key = name ? `name:${name}` : `id:${arena?.id || index}`

    if (!mapped.has(key)) {
      mapped.set(key, arena)
      return
    }

    mapped.set(key, mergeArena(mapped.get(key), arena))
  })

  return Array.from(mapped.values())
}

const displayList = computed(() => rawList.value)

const canLoadMore = computed(() => hasMore.value && !loading.value && !loadingMore.value)
const { loadMoreSentinel } = useAutoLoadMore({
  canLoadMore,
  onLoadMore: () => load(page.value + 1)
})

const syncQuery = async () => {
  const nextQuery = { ...route.query, tab: activeTab.value, sort: sortOption.value }
  if (route.query.tab === nextQuery.tab && route.query.sort === nextQuery.sort) return
  await router.replace({ query: nextQuery })
}

const resetState = () => {
  page.value = 1
  rawList.value = []
  hasMore.value = false
  loadingMore.value = false
}

const load = async (nextPage = 1) => {
  const isFirstPage = nextPage === 1

  if (!isFirstPage && (loading.value || loadingMore.value || !hasMore.value)) return

  const version = ++requestVersion

  if (isFirstPage) {
    loading.value = true
  } else {
    loadingMore.value = true
  }

  try {
    const response = await $api('/arena/lists', {
      method: 'POST',
      body: {
        city: requestCity.value,
        lat: lat.value,
        lng: lng.value,
        page: nextPage,
        sort: requestSort.value
      }
    })

    if (version !== requestVersion) return

    const rows = response.data.data
    const currentPage = Number(response.data.current_page || nextPage)
    const lastPage = Number(response.data.last_page || currentPage)

    rawList.value = isFirstPage ? dedupeArenas(rows) : dedupeArenas(rawList.value.concat(rows))
    page.value = currentPage
    hasMore.value = rows.length > 0 && currentPage < lastPage
  } catch {
    if (version !== requestVersion) return

    if (isFirstPage) rawList.value = []
    hasMore.value = false
  } finally {
    if (version !== requestVersion) return

    if (isFirstPage) {
      loading.value = false
    } else {
      loadingMore.value = false
    }
  }
}

const reload = async () => {
  resetState()
  await load(1)
}

const changeTab = async (tab) => {
  if (tab === activeTab.value) return

  activeTab.value = tab

  if (!initialized.value) return
  await syncQuery()
  await reload()
}

watch(sortOption, async (nextValue, prevValue) => {
  if (!initialized.value || nextValue === prevValue) return
  await syncQuery()
})

watch([city, lat, lng], async () => {
  if (!initialized.value) return
  await reload()
})

watch(sortOption, async (nextValue, prevValue) => {
  if (!initialized.value || nextValue === prevValue) return
  await reload()
})

onMounted(async () => {
  await syncQuery()
  await load(1)
  initialized.value = true
})
</script>
