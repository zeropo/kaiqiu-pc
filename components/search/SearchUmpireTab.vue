<template>
  <div class="space-y-6">
    <form class="rounded-3xl border border-border bg-surfaceSoft/40 p-4 md:p-5" @submit.prevent="handleSearch">
      <div class="flex flex-col gap-3 md:flex-row">
        <div class="relative flex-1">
          <svg class="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-text-light" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m21 21-4.35-4.35M10.5 18a7.5 7.5 0 1 1 0-15 7.5 7.5 0 0 1 0 15Z"></path>
          </svg>
          <input
            v-model="keyword"
            type="search"
            placeholder="请输入裁判姓名"
            class="h-12 w-full rounded-2xl border border-border bg-white pl-12 pr-4 text-sm text-text-main outline-none transition-colors placeholder:text-text-light focus:border-brand-primary"
          />
        </div>

        <button
          type="submit"
          class="h-12 rounded-2xl bg-brand-primary px-6 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-brand-primaryHover"
        >
          搜索
        </button>
      </div>

      <div class="mt-4 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div class="flex flex-wrap items-center gap-2">
          <span class="text-sm font-semibold text-text-main">地区</span>
          <button
            type="button"
            :class="chipClass(cityMode === 'current')"
            @click="handleFilterChange({ city: 'current' })"
          >
            {{ cityLabel }}
          </button>
          <button
            type="button"
            :class="chipClass(cityMode === 'all')"
            @click="handleFilterChange({ city: 'all' })"
          >
            全国范围
          </button>
        </div>

        <div class="flex flex-wrap items-center gap-2">
          <span class="text-sm font-semibold text-text-main">等级</span>
          <button
            v-for="option in levelOptions"
            :key="option.value"
            type="button"
            :class="chipClass(levelValue === option.value)"
            @click="handleFilterChange({ level: option.value })"
          >
            {{ option.label }}
          </button>
        </div>
      </div>
    </form>

    <div v-if="loading" class="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
      <div
        v-for="item in 8"
        :key="item"
        class="h-64 animate-pulse rounded-card border border-border bg-white"
      ></div>
    </div>

    <div
      v-else-if="!hasSearched"
      class="rounded-3xl border border-dashed border-border bg-surfaceSoft/35 px-6 py-14 text-center"
    >
      <p class="text-lg font-semibold text-text-main">输入裁判姓名开始搜索</p>
      <p class="mt-2 text-sm text-text-muted">
        支持按姓名及当前城市或全国范围搜索，并可按等级进一步筛选。
      </p>
    </div>

    <div v-else-if="list.length" class="space-y-8">
      <div class="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <article
          v-for="umpire in list"
          :key="umpire.uid"
          class="group overflow-hidden rounded-card border border-border bg-white shadow-card transition-all duration-smooth hover:-translate-y-1 hover:shadow-cardHover"
        >
          <NuxtLink :to="{ path: `/umpires/${umpire.uid}`, query: route.query }" class="flex h-full flex-col">
            <div class="relative aspect-[4/3] overflow-hidden bg-surfaceSoft">
              <span class="absolute left-3 top-3 z-10 inline-flex items-center rounded-sm bg-[#39b54a] px-2.5 py-1 text-xs font-semibold text-white shadow-sm">
                {{ formatLevel(umpire.level) }}
              </span>
              <ImgFallback
                :src="umpire.image || umpire.portrait"
                :alt="umpire.realname || '裁判头像'"
                class="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
              />
              <div class="absolute inset-0 bg-gradient-to-t from-black/15 via-transparent to-transparent"></div>
            </div>

            <div class="flex flex-1 flex-col p-5">
              <h3 class="line-clamp-1 flex-1 text-lg font-semibold leading-snug text-text-main transition-colors group-hover:text-brand-primary">
                {{ umpire.realname || '未命名裁判' }}
              </h3>

              <div class="mt-4 space-y-2">
                <div class="flex items-center gap-2 text-sm text-text-muted">
                  <svg class="h-4 w-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
                  <span class="truncate">{{ formatLocation(umpire) }}</span>
                </div>
                <div class="flex items-center gap-2 text-sm text-text-muted">
                  <svg class="h-4 w-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg>
                  <span class="truncate">{{ formatSex(umpire.sex) }}</span>
                </div>
                <div v-if="umpire.birthyear" class="flex items-center gap-2 text-sm text-text-muted">
                  <svg class="h-4 w-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                  <span class="truncate">{{ formatAge(umpire.birthyear) }}岁</span>
                </div>
              </div>
            </div>
          </NuxtLink>
        </article>
      </div>

      <div
        v-if="hasMore"
        ref="loadMoreSentinel"
        class="h-px w-full opacity-0"
        aria-hidden="true"
      ></div>
    </div>

    <div
      v-else
      class="rounded-3xl border border-dashed border-border bg-white px-6 py-14 text-center"
    >
      <p class="text-lg font-semibold text-text-main">没有找到对应裁判</p>
      <p class="mt-2 text-sm text-text-muted">
        可以尝试切换到全国范围，或调整姓名关键词后重新搜索。
      </p>
    </div>
  </div>
</template>

<script setup>
const levelOptions = [
  { value: '', label: '不限' },
  { value: '1', label: '国际级' },
  { value: '2', label: '国家级' },
  { value: '3', label: '国家一级' },
  { value: '4', label: '国家二级' },
  { value: '5', label: '国家三级' }
]

const route = useRoute()
const router = useRouter()
const { city, lat, lng } = useCity()
const { $api } = useNuxtApp()

const keyword = ref(route.query.keyword || '')
const cityMode = ref(route.query.cityMode || 'current')
const levelValue = ref(route.query.level || '')
const submittedFilters = ref({
  key: route.query.keyword || '',
  city: route.query.cityMode === 'current' ? (city.value || '杭州市') : '',
  value: route.query.level || '',
  level: route.query.level || ''
})
const page = ref(1)
const list = ref([])
const hasMore = ref(false)
const hasSearched = ref(!!route.query.keyword || !!route.query.level)
const loading = ref(false)
const loadingMore = ref(false)
const initialized = ref(false)

const cityLabel = computed(() => city.value || '杭州市')

const chipClass = (active) => {
  return active
    ? 'rounded-2xl border border-brand-primary bg-brand-primary px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors'
    : 'rounded-2xl border border-border bg-white px-4 py-2.5 text-sm font-semibold text-text-muted transition-colors hover:border-brand-primary hover:text-brand-primary'
}

const canLoadMore = computed(() => hasMore.value && !loading.value && !loadingMore.value)
const { loadMoreSentinel } = useAutoLoadMore({
  canLoadMore,
  onLoadMore: () => load(page.value + 1)
})

const cardLevelTextMap = {
  4: '国际级',
  3: '国家级',
  2: '国家一级',
  1: '国家二级',
  0: '国家三级'
}

const formatLevel = (level) => cardLevelTextMap[String(level)] || '未定级'

const formatSex = (sex) => {
  if (String(sex) === '1') return '男'
  if (String(sex) === '2') return '女'
  return '-'
}

const formatAge = (birthyear) => {
  const year = Number(birthyear)
  if (!Number.isFinite(year) || year <= 0) return '--'
  return `${new Date().getFullYear() - year}`
}

const formatLocation = (umpire) => {
  const province = umpire?.province || ''
  const cityName = umpire?.city || ''
  return `${province}${cityName}` || '未知地区'
}

const updateQuery = async () => {
  await router.replace({
    query: {
      ...route.query,
      keyword: keyword.value.trim(),
      cityMode: cityMode.value,
      level: levelValue.value
    }
  })
}

const buildRequestBody = (nextPage = 1) => ({
  city: submittedFilters.value.city,
  key: submittedFilters.value.key,
  value: submittedFilters.value.value,
  level: submittedFilters.value.level,
  page: nextPage,
  lat: lat.value,
  lng: lng.value
})

const fetchPage = async (nextPage = 1) => {
  const response = await $api('/umpire/lists', {
    method: 'POST',
    body: buildRequestBody(nextPage)
  })

  return {
    rows: Array.isArray(response?.data?.data) ? response.data.data : [],
    currentPage: Number(response?.data?.current_page ?? nextPage),
    lastPage: Number(response?.data?.last_page ?? nextPage)
  }
}

const load = async (nextPage = 1) => {
  const isFirstPage = nextPage === 1

  if (isFirstPage) {
    loading.value = true
  } else {
    if (loading.value || loadingMore.value || !hasMore.value) return
    loadingMore.value = true
  }

  try {
    const { rows, currentPage, lastPage } = await fetchPage(nextPage)

    list.value = isFirstPage ? rows : list.value.concat(rows)
    page.value = currentPage
    hasMore.value = rows.length > 0 && Number.isFinite(currentPage) && Number.isFinite(lastPage) && currentPage < lastPage
    hasSearched.value = true
  } catch {
    if (isFirstPage) {
      list.value = []
      hasSearched.value = true
    }
    hasMore.value = false
  } finally {
    if (isFirstPage) {
      loading.value = false
    } else {
      loadingMore.value = false
    }
  }
}

const { data: initialData } = await useAsyncData(() => `search-umpire:${submittedFilters.value.key}:${submittedFilters.value.city}:${submittedFilters.value.level}:${lat.value}:${lng.value}`, async () => {
  if (!hasSearched.value) return null

  try {
    return await fetchPage(1)
  } catch {
    return { rows: [], currentPage: 1, lastPage: 1 }
  }
}, {
  default: () => null,
  watch: false
})

if (initialData.value) {
  list.value = initialData.value.rows
  page.value = initialData.value.currentPage
  hasMore.value = initialData.value.rows.length > 0 && initialData.value.currentPage < initialData.value.lastPage
  hasSearched.value = true
}

const handleSearch = async () => {
  submittedFilters.value = {
    key: keyword.value.trim(),
    city: cityMode.value === 'current' ? cityLabel.value : '',
    value: levelValue.value,
    level: levelValue.value
  }
  page.value = 1
  hasMore.value = false

  if (initialized.value) {
    await updateQuery()
  }

  await load(1)
}

const handleFilterChange = async ({ city, level }) => {
  const nextCityMode = city ?? cityMode.value
  const nextLevelValue = level ?? levelValue.value

  if (nextCityMode === cityMode.value && nextLevelValue === levelValue.value) return

  cityMode.value = nextCityMode
  levelValue.value = nextLevelValue
  await handleSearch()
}

onMounted(() => {
  initialized.value = true
})
</script>
