<template>
  <div class="container pt-8 pb-10 md:pt-12 md:pb-16">
    <div class="mb-8 flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
      <div>
        <h1 class="font-display text-3xl font-bold text-text-main">裁判大厅</h1>
        <p class="mt-2 text-text-muted">浏览全国注册裁判信息，并按执裁等级快速筛选。</p>
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
            <p class="text-sm text-text-muted">当前共展示 {{ displayList.length }} 位裁判</p>
          </div>

          <div class="grid grid-cols-2 gap-3 md:grid-cols-4 xl:min-w-[720px]">
            <button
              v-for="option in levelOptions"
              :key="option.value"
              type="button"
              :class="[
                'rounded-2xl border px-4 py-3 text-left transition-all',
                selectedLevel === option.value
                  ? 'border-brand-primary bg-brand-primary text-white shadow-card'
                  : 'border-border bg-white text-text-main hover:border-brand-primary hover:bg-brand-primary/5'
              ]"
              @click="changeLevel(option.value)"
            >
              <span class="block text-sm font-semibold">{{ option.label }}</span>
              <span
                :class="[
                  'mt-1 block text-xs',
                  selectedLevel === option.value ? 'text-white/80' : 'text-text-muted'
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
          v-for="umpire in displayList"
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
              <p class="mt-1 text-sm text-text-muted">编号：{{ umpire.uid }}</p>

              <div class="mt-4 space-y-2">
                <div class="flex items-center gap-2 text-sm text-text-muted">
                  <svg class="h-4 w-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
                  <span class="truncate">{{ formatLocation(umpire) }}</span>
                </div>
                <div class="flex items-center gap-2 text-sm text-text-muted">
                  <svg class="h-4 w-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5.121 17.804A3 3 0 016 17h12a3 3 0 01.879.804M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
                  <span class="truncate">{{ formatSex(umpire.sex) }} / {{ formatAge(umpire.birthyear) }}</span>
                </div>
              </div>

              <div class="mt-5 flex items-center justify-between border-t border-surfaceSoft pt-4">
                <span class="rounded-md bg-brand-secondary/10 px-2.5 py-1 text-xs font-semibold text-brand-secondary">
                  {{ formatSex(umpire.sex) }}
                </span>
                <span class="inline-flex items-center rounded-md border border-[#39b54a] bg-white px-2.5 py-1 text-xs font-semibold text-[#39b54a]">
                  {{ formatAge(umpire.birthyear) }}
                </span>
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
        class="h-px w-full pointer-events-none opacity-0"
        aria-hidden="true"
      ></div>
    </div>
  </div>
</template>

<script setup>
useHead({
  title: '裁判大厅'
})

const tabs = [
  { value: 'local', label: '同城裁判' },
  { value: 'all', label: '全部裁判' }
]

const levelOptions = [
  { value: '', label: '全部', description: '查看全部执裁等级' },
  { value: '3', label: '国家一级', description: '高级执裁资格' },
  { value: '4', label: '国家二级', description: '常见区域赛事级别' },
  { value: '5', label: '国家三级', description: '基础执裁信息' }
]

const levelTextMap = {
  3: '国家一级',
  4: '国家二级',
  5: '国家三级'
}

const legacyLevelTextMap = {
  2: '国家一级',
  1: '国家二级',
  0: '国家三级'
}

const route = useRoute()
const router = useRouter()
const { city } = useCity()
const { $api } = useNuxtApp()

const normalizeActiveTab = (value) => (value === 'all' ? 'all' : 'local')
const normalizeSelectedLevel = (value) => {
  const normalized = String(value ?? '')

  if (['3', '4', '5', ''].includes(normalized)) return normalized
  if (normalized === '2') return '3'
  if (normalized === '1') return '4'
  if (normalized === '0') return '5'

  return ''
}
const activeTab = ref(normalizeActiveTab(route.query.tab))
const selectedLevel = ref(normalizeSelectedLevel(route.query.level))
const page = ref(1)
const list = ref([])
const hasMore = ref(false)
const loading = ref(true)
const loadingMore = ref(false)
const initialized = ref(false)

const cityLabel = computed(() => city.value || '杭州市')
const requestCity = computed(() => activeTab.value === 'all' ? '' : city.value)
const activeLevelLabel = computed(() => levelTextMap[selectedLevel.value] || '全部')
const currentViewLabel = computed(() => {
  const scopeLabel = activeTab.value === 'all' ? '全部裁判' : '同城裁判'
  return selectedLevel.value ? `${scopeLabel} · ${activeLevelLabel.value}` : scopeLabel
})
const emptyTitle = computed(() => {
  const prefix = activeTab.value === 'all' ? '' : `${cityLabel.value}`
  return selectedLevel.value ? `${prefix}暂无${activeLevelLabel.value}裁判` : `${prefix}暂无裁判数据`
})
const emptyDescription = computed(() => activeTab.value === 'all'
  ? '当前筛选条件下暂未查询到裁判信息，可切换其他等级后再试。'
  : '当前城市下暂未查询到裁判信息，可切换到全部裁判或调整等级后再试。')

const displayList = computed(() => list.value)

const canAutoLoadMore = computed(() => hasMore.value && !loading.value && !loadingMore.value)
const { loadMoreSentinel } = useAutoLoadMore({
  canLoadMore: canAutoLoadMore,
  onLoadMore: () => load(page.value + 1)
})

const syncQuery = async () => {
  const nextQuery = { ...route.query, tab: activeTab.value }
  if (selectedLevel.value) {
    nextQuery.level = selectedLevel.value
  } else {
    delete nextQuery.level
  }

  if ((route.query.tab || 'local') === nextQuery.tab && (route.query.level || '') === (nextQuery.level || '')) return
  await router.replace({ query: nextQuery })
}

const formatLevel = (level) => levelTextMap[String(level)] || legacyLevelTextMap[String(level)] || '未定级'

const formatSex = (sex) => {
  if (String(sex) === '1') return '男'
  if (String(sex) === '2') return '女'
  return '性别待完善'
}

const formatAge = (birthyear) => {
  const year = Number(birthyear)
  if (!year) return '年龄待完善'
  return `${new Date().getFullYear() - year}岁`
}

const formatLocation = (umpire) => {
  const text = `${umpire.province || ''}${umpire.city || ''}`
  return text || '地区待完善'
}

const resetList = () => {
  page.value = 1
  list.value = []
  hasMore.value = false
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
    const response = await $api('/umpire/lists', {
      method: 'POST',
      body: {
        city: requestCity.value,
        level: selectedLevel.value,
        page: nextPage
      }
    })
    const rows = response.data.data
    const currentPage = Number(response.data.current_page || nextPage)
    const lastPage = Number(response.data.last_page || currentPage)

    list.value = isFirstPage ? rows : list.value.concat(rows)
    page.value = currentPage
    hasMore.value = currentPage < lastPage
  } catch {
    if (isFirstPage) list.value = []
    hasMore.value = false
  } finally {
    if (isFirstPage) {
      loading.value = false
    } else {
      loadingMore.value = false
    }
  }
}

const refreshList = async () => {
  resetList()
  await load(1)
}

const changeTab = async (tab) => {
  if (activeTab.value === tab) return

  activeTab.value = tab
  await syncQuery()
  await refreshList()
}

const changeLevel = async (level) => {
  if (selectedLevel.value === level) return

  selectedLevel.value = level
  await syncQuery()
  await refreshList()
}

watch(city, async (nextCity, prevCity) => {
  if (!initialized.value || nextCity === prevCity) return
  if (activeTab.value !== 'local') return

  await refreshList()
})

onMounted(async () => {
  await syncQuery()
  await load(1)
  initialized.value = true
})
</script>
