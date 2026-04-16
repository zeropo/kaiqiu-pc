<template>
  <div class="container pt-8 pb-10 md:pt-12 md:pb-16">
    <div class="mb-8 flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
      <div>
        <h1 class="font-display text-3xl font-bold text-text-main">教练大厅</h1>
        <p class="mt-2 text-text-muted">浏览并筛选您身边的乒乓球教练</p>
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
              当前共展示 {{ displayList.length }} 位教练
            </p>
          </div>

          <div class="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:min-w-[640px]">
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
          v-for="coach in displayList"
          :key="getCoachKey(coach)"
          class="group relative z-0 flex h-full flex-col overflow-visible rounded-card border border-border bg-white shadow-card transition-all duration-smooth hover:z-20 hover:-translate-y-1 hover:shadow-cardHover"
        >
                    <NuxtLink :to="{ path: `/coaches/${coach.uid}`, query: route.query }" class="flex h-full flex-col">
            <div class="aspect-[4/3] overflow-hidden rounded-t-card bg-surfaceSoft">
              <ImgFallback
                :src="coach.image || coach.portrait"
                :alt="coach.realname || coach.username || '教练照片'"
                class="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
            </div>

            <div class="flex flex-1 flex-col p-5">
              <div class="flex items-start gap-3">
                <h3
                  class="min-w-0 flex-1 line-clamp-2 text-lg font-semibold leading-snug text-text-main transition-colors group-hover:text-brand-primary"
                  :title="coach.realname || coach.username || '未命名教练'"
                >
                  {{ coach.realname || coach.username || '未命名教练' }}
                </h3>

                <div class="flex shrink-0 items-start justify-end pl-2 text-sm text-right">
                  <span v-if="hasScore(coach)" class="font-semibold whitespace-nowrap text-text-main">
                    积分：{{ coach.score }}
                  </span>
                </div>
              </div>

              <div class="mt-4 space-y-2">
                <div class="flex items-center gap-2 text-sm text-text-muted">
                  <svg class="h-4 w-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
                  <span class="truncate">{{ formatLocation(coach) }}</span>
                </div>
                <div v-if="formatSex(coach.sex)" class="flex items-center gap-2 text-sm text-text-muted">
                  <svg class="h-4 w-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg>
                  <span>{{ formatSex(coach.sex) }}</span>
                </div>
                <div v-if="formatAge(coach.age)" class="flex items-center gap-2 text-sm text-text-muted">
                  <svg class="h-4 w-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                  <span>{{ formatAge(coach.age) }}</span>
                </div>
                <div class="flex items-center gap-2 text-sm text-text-muted">
                  <svg class="h-4 w-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path></svg>
                  <span class="truncate">{{ coach.viewnum || 0 }}人浏览</span>
                </div>
              </div>

              <div
                class="relative mt-3 flex-1"
                @mouseenter="showCoachTooltip(getCoachKey(coach))"
                @mouseleave="closeCoachTooltip"
              >
                <p class="line-clamp-3 text-sm leading-6 text-text-muted">
                  {{ coach.description || coach.arena_name || '暂无教练简介' }}
                </p>

                <div
                  v-if="activeCoachTooltip === getCoachKey(coach)"
                  class="absolute inset-x-0 bottom-full z-40 mb-2 rounded-2xl border border-border bg-white px-4 py-3 text-sm leading-6 text-text-main shadow-[0_24px_60px_-32px_rgba(15,23,42,0.35)]"
                >
                  <p class="text-base font-semibold text-brand-primary">教练简介</p>
                  <p class="mt-2 whitespace-pre-line text-black/75">{{ coach.description || coach.arena_name || '暂无教练简介' }}</p>
                </div>
              </div>

              <div class="mt-4 flex items-end justify-between gap-3 border-t border-surfaceSoft pt-4">
                <span class="rounded-md bg-brand-secondary/10 px-2.5 py-1 text-xs font-semibold text-brand-secondary">
                  {{ formatDistance(coach.distance) }}
                </span>
                <span class="inline-flex items-center rounded-md border border-[#39b54a] bg-white px-2.5 py-1 text-xs font-semibold text-[#39b54a]">
                  {{ coach.commentnum || 0 }}人推荐
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
        class="pointer-events-none h-px w-full opacity-0"
        aria-hidden="true"
      ></div>
    </div>
  </div>
</template>

<script setup>
useHead({
  title: '教练大厅'
})

const tabs = [
  { value: 'local', label: '同城教练' },
  { value: 'all', label: '全部教练' }
]

const sortOptions = [
  { value: 1, label: '距离升序', description: '按距离由近到远' },
  { value: 2, label: '好评降序', description: '按好评数由高到低' },
  { value: 3, label: '积分降序', description: '按积分由高到低' }
]

const route = useRoute()
const router = useRouter()
const { city, lat, lng } = useCity()
const { $api } = useNuxtApp()

const normalizeSortOption = (value) => {
  if (value === 'distance' || value === '1' || value === 1) return 1
  if (value === 'commentnum' || value === '2' || value === 2) return 2
  if (value === 'score' || value === '3' || value === 3) return 3
  return 1
}

const activeTab = ref(route.query.tab === 'all' ? 'all' : 'local')
const sortOption = ref(normalizeSortOption(route.query.sort))
const activeCoachTooltip = ref('')
const page = ref(1)
const list = ref([])
const hasMore = ref(false)
const loading = ref(true)
const loadingMore = ref(false)
const initialized = ref(false)

const canAutoLoadMore = computed(() => hasMore.value && !loading.value && !loadingMore.value)
const { loadMoreSentinel } = useAutoLoadMore({
  canLoadMore: canAutoLoadMore,
  onLoadMore: () => load(page.value + 1)
})

const cityLabel = computed(() => city.value || '杭州市')
const currentViewLabel = computed(() => activeTab.value === 'all' ? '全部教练' : '同城教练')
const requestCity = computed(() => activeTab.value === 'all' ? '' : city.value)
const emptyTitle = computed(() => activeTab.value === 'all' ? '暂无教练数据' : `${cityLabel.value}暂无教练数据`)
const emptyDescription = computed(() => activeTab.value === 'all'
  ? '当前未查询到可展示的教练，可稍后再来看看。'
  : '当前城市暂无可展示的教练资源。')

const displayList = computed(() => list.value)

const getCoachKey = (coach) => coach.uid || `${coach.realname || 'coach'}-${coach.city || ''}`

const dedupeCoaches = (rows) => {
  const mapped = new Map()

  rows.forEach((coach, index) => {
    const key = coach.uid || `${coach.realname || 'coach'}-${index}`
    mapped.set(key, coach)
  })

  return Array.from(mapped.values())
}

const formatLocation = (coach) => `${coach.province || ''}${coach.city || ''}` || '未知地区'
const formatDistance = (distance) => distance ? `距您${distance}` : '距离未知'
const hasScore = (coach) => Number(coach.score) > 0

const formatSex = (sex) => {
  if (String(sex) === '1' || String(sex) === '男') return '男'
  if (String(sex) === '2' || String(sex) === '女') return '女'
  return ''
}

const formatAge = (age) => {
  if (!age) return ''
  const ageStr = String(age)
  return ageStr.includes('岁') ? ageStr : `${ageStr}岁`
}
const showCoachTooltip = (key) => {
  activeCoachTooltip.value = key
}
const closeCoachTooltip = () => {
  activeCoachTooltip.value = ''
}

const syncQuery = async () => {
  const nextQuery = { ...route.query, tab: activeTab.value, sort: String(sortOption.value) }
  if (route.query.tab === nextQuery.tab && route.query.sort === nextQuery.sort) return
  await router.replace({ query: nextQuery })
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
    const response = await $api('/trainer/lists', {
      method: 'POST',
      body: {
        city: requestCity.value,
        lat: lat.value,
        lng: lng.value,
        page: nextPage,
        sort: sortOption.value
      }
    })

    const rows = response.data.data || []
    const currentPage = Number(response.data.current_page || nextPage)
    const lastPage = Number(response.data.last_page || currentPage)

    list.value = isFirstPage ? dedupeCoaches(rows) : dedupeCoaches(list.value.concat(rows))
    page.value = currentPage
    hasMore.value = rows.length > 0 && currentPage < lastPage
  } catch {
    if (isFirstPage) {
      list.value = []
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

const refreshList = async () => {
  resetList()
  await load(1)
}

const changeTab = async (tab) => {
  if (tab === activeTab.value) return

  activeTab.value = tab
  await syncQuery()
  await refreshList()
}

watch(sortOption, async (nextValue, prevValue) => {
  if (!initialized.value || nextValue === prevValue) return

  await syncQuery()
  await refreshList()
})

watch([city, lat, lng], async ([nextCity, nextLat, nextLng], [prevCity, prevLat, prevLng]) => {
  if (!initialized.value) return
  if (nextCity === prevCity && nextLat === prevLat && nextLng === prevLng) return

  await refreshList()
})

onMounted(async () => {
  await syncQuery()
  await load(1)
  initialized.value = true
})
</script>
