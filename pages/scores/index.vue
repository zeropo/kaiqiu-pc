<template>
  <div class="container py-10 md:py-16">
    <div class="mb-8">
      <h1 class="font-display text-3xl font-bold text-text-main">积分排行</h1>
      <p class="text-text-muted mt-2">查询选手的实时积分与历史最高记录</p>
    </div>

    <div class="mb-10 rounded-card border border-border bg-white p-5 shadow-sm">
      <div class="flex flex-col gap-4">
        <SegmentTabs
          :model-value="activeTab"
          :tabs="tabs"
          wrapper-class="inline-flex w-auto self-start rounded-full bg-surfaceSoft p-1"
          button-base-class="relative z-10 rounded-full px-4 py-2.5 text-sm font-semibold whitespace-nowrap transition-colors duration-300"
          @update:model-value="changeTab"
        />
      </div>
    </div>

    <div v-if="loading" class="space-y-4">
      <div v-for="n in 8" :key="n" class="h-16 bg-white border border-border rounded-xl animate-pulse" />
    </div>

    <div v-else class="bg-white rounded-card border border-border shadow-sm overflow-hidden">
      <div class="overflow-x-auto">
        <table class="min-w-full text-sm text-left whitespace-nowrap">
          <thead class="bg-surfaceSoft text-text-muted font-medium border-b border-border">
            <tr>
              <th class="px-6 py-4 rounded-tl-card">序号</th>
              <th class="px-6 py-4">姓名</th>
              <th class="px-6 py-4">当前积分</th>
              <th class="px-6 py-4">最高积分</th>
              <th class="px-6 py-4">性别</th>
              <th class="px-6 py-4">城市</th>
              <th class="px-6 py-4 rounded-tr-card text-center">操作</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-border">
            <tr v-for="(u, index) in list" :key="`${activeTab}-${u.uid}`" class="hover:bg-surfaceMuted transition-colors group">
              <td class="px-6 py-4 font-display font-semibold text-text-muted">
                {{ index + 1 }}
              </td>
              <td class="px-6 py-4 font-medium text-text-main">
                {{ u.realname || '-' }}
              </td>
              <td class="px-6 py-4 font-display font-bold text-brand-primary text-base">{{ u.score || '-' }}</td>
              <td class="px-6 py-4 text-text-muted">{{ u.maxscore || '-' }}</td>
              <td class="px-6 py-4 text-text-muted">{{ formatSex(u.sex) }}</td>
              <td class="px-6 py-4 text-text-muted">{{ u.residecity || '-' }}</td>
              <td class="px-6 py-4 text-center">
                <a :href="`/scores/${u.uid}`" class="inline-block text-brand-primary font-medium hover:text-brand-primaryHover">
                  <span class="relative inline-block">
                    详情
                    <svg class="absolute left-full top-1/2 ml-1 w-4 h-4 -translate-y-1/2 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path></svg>
                  </span>
                </a>
              </td>
            </tr>
            <tr v-if="!list.length">
              <td colspan="7" class="px-6 py-16 text-center text-text-muted">暂无符合条件的数据</td>
            </tr>
          </tbody>
        </table>
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
  title: '积分列表'
})

const SCORE_TAB_INDEX_MAP = {
  city: 11111,
  province: 21111,
  global: 31111
}

const SCORE_TAB_CITY_MAP = {
  city: '-1',
  province: '-2'
}

const { city } = useCity()
const activeTab = ref('city')
const page = ref(1)
const list = ref([])
const hasMore = ref(false)
const loading = ref(true)
const loadingMore = ref(false)
const tabLabels = ref([])

const { $api } = useNuxtApp()
const canAutoLoadMore = computed(() => hasMore.value && !loading.value && !loadingMore.value)
const { loadMoreSentinel } = useAutoLoadMore({
  canLoadMore: canAutoLoadMore,
  onLoadMore: () => load(page.value + 1)
})

const normalizeLocationLabel = (value) => {
  if (!value) return ''
  return String(value).replace(/(省|市|自治区|特别行政区)$/u, '')
}

const fallbackTabLabels = computed(() => [
  `${normalizeLocationLabel(city.value) || '当前市'}积分`,
  '当前省积分',
  '全球积分'
])

const tabs = computed(() => [
  { value: 'city', label: tabLabels.value[0] || fallbackTabLabels.value[0] },
  { value: 'province', label: tabLabels.value[1] || fallbackTabLabels.value[1] },
  { value: 'global', label: tabLabels.value[2] || fallbackTabLabels.value[2] }
])

const formatSex = (sex) => {
  if (String(sex) === '1') return '男'
  if (String(sex) === '2') return '女'
  return '-'
}

const currentRequestCity = computed(() => {
  return SCORE_TAB_CITY_MAP[activeTab.value] || city.value
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
    const res = await $api('/user/lists', {
      method: 'POST',
      body: {
        city: currentRequestCity.value,
        now: city.value,
        sort: 2,
        page: p,
        index: SCORE_TAB_INDEX_MAP[activeTab.value]
      }
    })
    const rows = Array.isArray(res?.data?.data) ? res.data.data : []
    const responseTabLabels = Array.isArray(rows[0]?.th) ? rows[0].th.slice(0, 3) : []

    if (responseTabLabels.length === 3) {
      tabLabels.value = responseTabLabels
    }

    if (isFirstPage) {
      list.value = rows
    } else {
      list.value = list.value.concat(rows)
    }

    const currentPage = Number(res?.data?.current_page ?? p)
    const lastPage = Number(res?.data?.last_page ?? currentPage)

    page.value = currentPage
    hasMore.value = rows.length > 0 && Number.isFinite(currentPage) && Number.isFinite(lastPage) && currentPage < lastPage
  } catch (e) {
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

const changeTab = async (tab) => {
  if (tab === activeTab.value) return

  activeTab.value = tab
  page.value = 1
  hasMore.value = false
  await load(1)
}

onMounted(async () => { await load(1) })
</script>
