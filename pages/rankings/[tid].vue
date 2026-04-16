<template>
  <div class="container pt-8 pb-10 md:pt-12 md:pb-16">
    <div class="mb-8 flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
      <div>
        <h1 class="font-display text-3xl font-bold text-text-main">{{ pageTitle }}</h1>
      </div>
    </div>

    <div class="mb-10 rounded-card border border-border bg-white p-5 shadow-sm">
      <SegmentTabs
        :model-value="activeTab"
        :tabs="tabs"
        wrapper-class="inline-flex w-auto rounded-full bg-surfaceSoft p-1"
        button-base-class="relative z-10 rounded-full px-4 py-2.5 text-sm font-semibold whitespace-nowrap transition-colors duration-300"
        @update:model-value="changeTab"
      />
    </div>

    <div v-if="loading" class="space-y-4">
      <div v-for="n in 8" :key="n" class="h-16 rounded-xl border border-border bg-white animate-pulse" />
    </div>

    <div
      v-else-if="!displayRows.length"
      class="flex flex-col items-center justify-center rounded-card border border-border bg-white px-6 py-20 text-center shadow-sm"
    >
      <div class="mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-surfaceSoft text-text-light">
        <svg v-if="errorMessage" class="h-8 w-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
        <svg v-else class="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m-7 5h8a2 2 0 002-2V7.414a2 2 0 00-.586-1.414l-3.414-3.414A2 2 0 0014.586 2H8a2 2 0 00-2 2v15a2 2 0 002 2z"></path></svg>
      </div>
      <p class="text-lg font-semibold text-text-main">{{ errorMessage || emptyTitle }}</p>
    </div>

    <div v-else class="overflow-hidden rounded-card border border-border bg-white shadow-sm">
      <div class="overflow-x-auto">
        <table class="min-w-full text-left text-sm whitespace-nowrap">
          <thead class="border-b border-border bg-surfaceSoft font-medium text-text-muted">
            <tr>
              <th
                v-for="column in tableColumns"
                :key="column.key"
                :class="[
                  'px-6 py-4',
                  column.key === 'rank' ? 'rounded-tl-card' : '',
                  column.key === lastColumnKey ? 'rounded-tr-card' : '',
                  column.align === 'center' ? 'text-center' : ''
                ]"
              >
                {{ column.label }}
              </th>
            </tr>
          </thead>
          <tbody class="divide-y divide-border">
            <tr
              v-for="row in displayRows"
              :key="row.key"
              class="group transition-colors hover:bg-surfaceMuted"
            >
              <td v-for="column in tableColumns" :key="column.key" :class="['px-6 py-4 align-middle', column.align === 'center' ? 'text-center' : '']">
                <template v-if="column.key === 'rank'">
                  <span
                    :class="[
                      'inline-flex min-w-[2.25rem] items-center justify-center rounded-full px-2.5 py-1 text-xs font-semibold',
                      getRankToneClass(row.rank)
                    ]"
                  >
                    {{ row.rank }}
                  </span>
                </template>

                <template v-else-if="column.key === 'name'">
                  <div class="min-w-[180px] whitespace-normal">
                    <NuxtLink
                      v-if="row.nameHref"
                      :to="row.nameHref"
                      class="font-medium text-text-main transition-colors hover:text-brand-primary"
                    >
                      {{ row.name }}
                    </NuxtLink>
                    <span v-else class="font-medium text-text-main">{{ row.name }}</span>
                  </div>
                </template>

                <template v-else-if="column.key === 'score'">
                  <span v-if="row.score === '0'" class="text-text-light">-</span>
                  <span v-else class="font-display text-base font-bold text-brand-primary">{{ row.score }}</span>
                </template>

                <template v-else-if="column.key === 'special'">
                  <span class="text-text-main">{{ row.special }}</span>
                </template>

                <template v-else-if="column.key === 'sex'">
                  <span class="text-text-muted">{{ row.sex }}</span>
                </template>

                <template v-else-if="column.key === 'action'">
                  <NuxtLink
                    v-if="row.actionHref && row.score !== '0'"
                    :to="row.actionHref"
                    class="inline-block font-medium text-brand-primary transition-colors hover:text-brand-primaryHover"
                  >
                    <span class="relative inline-block">
                      {{ row.actionLabel }}
                      <svg class="absolute left-full top-1/2 ml-1 h-4 w-4 -translate-y-1/2 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path></svg>
                    </span>
                  </NuxtLink>
                  <span v-else class="text-text-light">-</span>
                </template>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup>
const RANKING_TAB_INDEX_MAP = {
  city: '0',
  province: '1',
  global: '2'
}

const RANKING_TAB_OPTIONS = [
  { value: 'city', label: '同城排行' },
  { value: 'province', label: '同省排行' },
  { value: 'global', label: '全国排行' }
]

const route = useRoute()
const router = useRouter()
const { $api } = useNuxtApp()
const { city, switchVersion } = useCity()

const tid = computed(() => String(route.params.tid || ''))
const title = ref('')
const metricHeader = ref('')
const list = ref([])
const rankingCatalog = ref([])
const loading = ref(true)
const errorMessage = ref('')
const activeTab = ref(normalizeActiveTab(route.query.tab))

let requestVersion = 0
let syncingQuery = false

const currentRankingMeta = computed(() => {
  return rankingCatalog.value.find((item) => String(item?.tid || '') === tid.value) || null
})

const rankingShape = computed(() => {
  if (list.value.some((row) => hasClubIdentifiers(row))) return 'club'
  if (list.value.some((row) => normalizeIdentifier(row?.uid))) {
    return pageTitle.value.includes('裁判') ? 'umpire' : 'person'
  }
  return 'unknown'
})

const tabs = computed(() => RANKING_TAB_OPTIONS)
const lastColumnKey = computed(() => tableColumns.value[tableColumns.value.length - 1]?.key || '')

const pageTitle = computed(() => {
  return normalizeDisplayText(title.value)
    || normalizeDisplayText(currentRankingMeta.value?.name)
    || '榜单详情'
})

const pageSubtitle = computed(() => {
  const metaDesc = normalizeDisplayText(currentRankingMeta.value?.desc)
  return metaDesc
    ? `${metaDesc}，支持切换同城、同省和全国范围查看。`
    : '支持切换同城、同省和全国范围查看榜单数据。'
})

const currentViewLabel = computed(() => {
  if (activeTab.value === 'city') {
    return `${normalizeLocationLabel(city.value) || '当前城市'}同城排行`
  }

  if (activeTab.value === 'province') {
    return '同省排行'
  }

  return '全国排行'
})

const currentViewDescription = computed(() => {
  if (activeTab.value === 'city') {
    return `基于当前城市 ${city.value || '默认城市'} 展示该榜单数据。`
  }

  if (activeTab.value === 'province') {
    return '基于当前城市所属省份展示该榜单数据。'
  }

  return '展示全国范围内的榜单数据。'
})

const rankingKindLabel = computed(() => {
  if (rankingShape.value === 'club') return '俱乐部榜'
  if (rankingShape.value === 'umpire') return '裁判榜'
  if (rankingShape.value === 'person') return '人物榜'
  return '榜单'
})

const scoreColumnLabel = computed(() => {
  if (rankingShape.value === 'umpire') return '级别'
  return '当前积分'
})

const specialColumnLabel = computed(() => {
  return normalizeDisplayText(metricHeader.value) || '指标'
})

const tableColumns = computed(() => {
  const columns = [
    { key: 'rank', label: '序号' },
    { key: 'name', label: rankingShape.value === 'club' ? '俱乐部' : '姓名' }
  ]

  if (rankingShape.value !== 'club') {
    columns.push({ key: 'score', label: scoreColumnLabel.value })
  }

  columns.push({ key: 'special', label: specialColumnLabel.value })

  if (rankingShape.value !== 'club' && list.value.some((row) => String(row?.sex || '').trim())) {
    columns.push({ key: 'sex', label: '性别' })
  }

  if (list.value.some((row) => buildActionHref(row))) {
    columns.push({ key: 'action', label: '操作', align: 'center' })
  }

  return columns
})

const displayRows = computed(() => {
  return list.value.map((row, index) => {
    const uid = normalizeIdentifier(row?.uid)
    const shopId = normalizeIdentifier(row?.shopid)
    const actionHref = buildActionHref(row)
    const name = normalizeDisplayText(row?.realname) || '未命名'

    return {
      key: uid || shopId || normalizeIdentifier(row?.tagid) || `${tid.value}-${activeTab.value}-${index}`,
      rank: index + 1,
      name,
      nameHref: actionHref,
      score: formatCellValue(row?.score),
      special: formatMetricValue(specialColumnLabel.value, row?.special),
      sex: formatSex(row?.sex),
      actionHref,
      actionLabel: uid ? '详情' : shopId ? '球馆详情' : ''
    }
  })
})

const emptyTitle = computed(() => {
  return `暂无${pageTitle.value}数据`
})

const emptyDescription = computed(() => {
  return '这个榜单在当前范围下暂时没有可展示的数据，你可以切换到同城、同省或全国范围后再看看。'
})

useHead(() => ({
  title: pageTitle.value
}))

async function syncQuery() {
  const nextQuery = { ...route.query, tab: activeTab.value }
  if (route.query.tab === nextQuery.tab) return

  syncingQuery = true

  try {
    await router.replace({ query: nextQuery })
  } finally {
    syncingQuery = false
  }
}

async function fetchRankingCatalog() {
  const res = await $api('/Top/lists', {
    method: 'POST',
    body: {
      city: city.value
    }
  })

  return Array.isArray(res?.data?.data) ? res.data.data : []
}

async function fetchRankingDetail() {
  const res = await $api('/Top/getTop100Data', {
    method: 'GET',
    params: {
      tid: tid.value,
      city: city.value,
      tabIndex: RANKING_TAB_INDEX_MAP[activeTab.value]
    }
  })

  return {
    title: normalizeDisplayText(res?.data?.title),
    th: normalizeDisplayText(res?.data?.th),
    list: Array.isArray(res?.data?.list) ? res.data.list : []
  }
}

async function load() {
  const currentRequest = ++requestVersion
  loading.value = true
  errorMessage.value = ''

  try {
    const [detailResult, catalogResult] = await Promise.allSettled([
      fetchRankingDetail(),
      fetchRankingCatalog()
    ])

    if (currentRequest !== requestVersion) return

    if (catalogResult.status === 'fulfilled') {
      rankingCatalog.value = catalogResult.value
    }

    if (detailResult.status === 'fulfilled') {
      title.value = detailResult.value.title
      metricHeader.value = detailResult.value.th
      list.value = detailResult.value.list
    } else {
      title.value = ''
      metricHeader.value = ''
      list.value = []
      // 提取错误信息
      const reason = detailResult.reason
      errorMessage.value = reason?.data?.message || reason?.message || '接口请求失败'
    }
  } finally {
    if (currentRequest === requestVersion) {
      loading.value = false
    }
  }
}

async function changeTab(tab) {
  if (tab === activeTab.value) return

  activeTab.value = tab
  await syncQuery()
  await load()
}

function normalizeActiveTab(value) {
  return ['city', 'province', 'global'].includes(value) ? value : 'city'
}

function normalizeLocationLabel(value) {
  if (!value) return ''
  return String(value).replace(/(省|市|自治区|特别行政区)$/u, '')
}

function normalizeDisplayText(value) {
  const text = String(value || '').trim()
  return text && text !== '-' ? text : ''
}

function normalizeIdentifier(value) {
  const text = String(value || '').trim()
  return text && text !== '0' ? text : ''
}

function hasClubIdentifiers(row) {
  return Boolean(normalizeIdentifier(row?.tagid) || normalizeIdentifier(row?.shopid))
}

function formatSex(value) {
  if (String(value) === '1') return '男'
  if (String(value) === '2') return '女'
  return '-'
}

function formatCellValue(value, fallback = '-') {
  const text = normalizeDisplayText(value)
  if (!text && rankingShape.value === 'umpire') {
    return '国家三级'
  }
  return text || fallback
}

function formatMetricValue(label, value) {
  const text = normalizeDisplayText(value)

  if (!text || text === '0') return '-'

  if (label.includes('注册时间') && /^\d{4}$/.test(text)) {
    return `${text}年`
  }

  return text
}

function buildActionHref(row) {
  const uid = normalizeIdentifier(row?.uid)
  const shopId = normalizeIdentifier(row?.shopid)

  if (uid) {
    const path = rankingShape.value === 'umpire' ? `/umpires/${uid}` : `/scores/${uid}`
    return {
      path,
      query: { ...route.query, tab: activeTab.value }
    }
  }

  if (shopId) {
    return {
      path: `/arenas/${shopId}`,
      query: { ...route.query, tab: activeTab.value }
    }
  }

  return null
}

function getRankToneClass(rank) {
  if (rank === 1) return 'bg-amber-500 text-white'
  if (rank === 2) return 'bg-slate-400 text-white'
  if (rank === 3) return 'bg-orange-500 text-white'
  return 'bg-surfaceSoft text-text-main'
}

watch(
  () => route.query.tab,
  async (nextTab) => {
    if (syncingQuery) return

    const normalizedTab = normalizeActiveTab(nextTab)
    if (normalizedTab === activeTab.value) return

    activeTab.value = normalizedTab
    await load()
  }
)

watch(
  () => tid.value,
  async (nextTid, prevTid) => {
    if (!nextTid || nextTid === prevTid) return
    await load()
  }
)

watch(switchVersion, async () => {
  await load()
})

onMounted(async () => {
  await syncQuery()
  await load()
})
</script>
