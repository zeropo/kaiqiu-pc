<template>
  <div class="space-y-8">
    <form class="rounded-3xl border border-border bg-surfaceSoft/40 p-4 md:p-6" @submit.prevent="handleSearch">
      <div class="space-y-5">
        <div class="grid gap-3 lg:grid-cols-[120px_minmax(0,1fr)] lg:items-center">
          <label class="text-sm font-semibold text-text-main md:text-base">比赛标题</label>
          <input
            v-model="eventTitle"
            type="search"
            placeholder="请输入关键字"
            class="h-12 rounded-2xl border border-border bg-white px-4 text-sm text-text-main outline-none transition-colors placeholder:text-text-light focus:border-brand-primary"
          />
        </div>

        <div class="grid gap-3 lg:grid-cols-[120px_minmax(0,1fr)] lg:items-center">
          <label class="text-sm font-semibold text-text-main md:text-base">起始日期</label>
          <input
            v-model="startDate"
            type="date"
            class="h-12 rounded-2xl border border-border bg-white px-4 text-sm text-text-main outline-none transition-colors focus:border-brand-primary"
            @change="selectedPreset = ''"
          />
        </div>

        <div class="grid gap-3 lg:grid-cols-[120px_minmax(0,1fr)] lg:items-center">
          <label class="text-sm font-semibold text-text-main md:text-base">截止日期</label>
          <input
            v-model="endDate"
            type="date"
            class="h-12 rounded-2xl border border-border bg-white px-4 text-sm text-text-main outline-none transition-colors focus:border-brand-primary"
            @change="selectedPreset = ''"
          />
        </div>

        <div class="grid gap-3 lg:grid-cols-[120px_minmax(0,1fr)] lg:items-start">
          <span class="pt-1 text-sm font-semibold text-text-main md:text-base">快捷日期</span>
          <div class="flex flex-wrap gap-2">
            <button
              v-for="preset in datePresets"
              :key="preset.value"
              type="button"
              :class="chipClass(selectedPreset === preset.value)"
              @click="applyDatePreset(preset.value)"
            >
              {{ preset.label }}
            </button>
          </div>
        </div>

        <div class="grid gap-3 lg:grid-cols-[120px_minmax(0,1fr)] lg:items-start">
          <span class="pt-1 text-sm font-semibold text-text-main md:text-base">举办城市</span>
          <div class="flex flex-wrap gap-2">
            <button
              type="button"
              :class="cityScope === 'current' ? activeLocationClass : inactiveLocationClass"
              @click="cityScope = 'current'"
            >
              <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657 13.414 20.9a1.998 1.998 0 0 1-2.827 0L6.343 16.657a8 8 0 1 1 11.314 0Z"></path>
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"></path>
              </svg>
              <span>{{ cityLabel }}</span>
            </button>
            <button
              type="button"
              :class="chipClass(cityScope === 'unlimitedCity')"
              @click="cityScope = 'unlimitedCity'"
            >
              全国范围
            </button>
            <button
              type="button"
              :class="chipClass(cityScope === 'overseas')"
              @click="cityScope = 'overseas'"
            >
              海外城市
            </button>
          </div>
        </div>

        <div class="grid gap-3 lg:grid-cols-[120px_minmax(0,1fr)] lg:items-start">
          <span class="pt-1 text-sm font-semibold text-text-main md:text-base">距离区间</span>
          <div class="space-y-3">
            <div class="inline-flex items-center rounded-2xl border border-border bg-white px-4 py-3 text-sm text-text-muted">
              与我的位置
            </div>
            <div class="flex flex-wrap gap-2">
              <button
                v-for="option in distanceOptions"
                :key="option.value"
                type="button"
                :class="chipClass(distance === option.value)"
                @click="distance = option.value"
              >
                {{ option.label }}
              </button>
            </div>
          </div>
        </div>

        <div class="grid gap-3 lg:grid-cols-[120px_minmax(0,1fr)] lg:items-start">
          <span class="pt-1 text-sm font-semibold text-text-main md:text-base">赛事标签</span>
          <div class="flex flex-wrap gap-2">
            <button
              v-for="tag in quickTagOptions"
              :key="tag.value"
              type="button"
              :class="chipClass(selectedTags.includes(tag.value))"
              @click="toggleTag(tag.value)"
            >
              {{ tag.label }}
            </button>
          </div>
        </div>

        <div class="grid gap-3 lg:grid-cols-[120px_minmax(0,1fr)] lg:items-start">
          <span class="pt-1 text-sm font-semibold text-text-main md:text-base">排序方式</span>
          <div class="flex flex-wrap gap-2">
            <button
              v-for="option in sortOptions"
              :key="option.value"
              type="button"
              :class="chipClass(sortType === option.value)"
              @click="sortType = option.value"
            >
              {{ option.label }}
            </button>
          </div>
        </div>
      </div>

      <div class="mt-6 flex flex-col gap-3 border-t border-border pt-5 sm:flex-row sm:justify-end">
        <button
          type="button"
          class="h-12 rounded-2xl border border-border px-5 text-sm font-semibold text-text-muted transition-colors hover:border-brand-primary hover:text-brand-primary"
          @click="resetFilters"
        >
          重置
        </button>
        <button
          type="submit"
          class="h-12 rounded-2xl bg-[#39b54a] px-8 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-[#2fa444]"
        >
          搜索
        </button>
      </div>
    </form>

    <div v-if="loading" class="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
      <div
        v-for="item in 6"
        :key="item"
        class="h-72 animate-pulse rounded-card border border-border bg-white"
      ></div>
    </div>

    <div
      v-else-if="!hasSearched"
      class="rounded-3xl border border-dashed border-border bg-surfaceSoft/35 px-6 py-14 text-center"
    >
      <p class="text-lg font-semibold text-text-main">从比赛开始搜索</p>
      <p class="mt-2 text-sm text-text-muted">
        标题、日期、城市、距离、标签和排序都可以自由组合，结果会自动带上当前位置经纬度。
      </p>
    </div>

    <div v-else-if="list.length" class="space-y-5">
      <div class="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p class="text-sm font-semibold text-text-main">比赛结果</p>
          <p class="mt-1 text-sm text-text-muted">
            当前已加载 {{ list.length }} 场赛事
          </p>
        </div>
        <p class="text-sm text-text-light">
          城市：{{ citySummary }} · 排序：{{ sortSummary }}
        </p>
      </div>

      <div class="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
        <MatchCard
          v-for="match in list"
          :key="match.eventid || `${match.title}-${match.starttime}`"
          :match="match"
        />
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
      <p class="text-lg font-semibold text-text-main">未找到符合条件的比赛</p>
      <p class="mt-2 text-sm text-text-muted">
        可以尝试放宽日期或距离范围，或者切换到全国范围重新搜索。
      </p>
    </div>
  </div>
</template>

<script setup>
const datePresets = [
  { value: 'thisWeekend', label: '本周末' },
  { value: 'thisWeek', label: '本周' },
  { value: 'lastWeek', label: '上周' },
  { value: 'thisMonth', label: '本月' },
  { value: 'next45Days', label: '未来45天' },
  { value: 'next90Days', label: '未来90天' }
]

const distanceOptions = [
  { value: 'gt0', label: '不限' },
  { value: 'lt3', label: '<=3公里' },
  { value: 'lt5', label: '<=5公里' },
  { value: 'lt10', label: '<=10公里' },
  { value: 'lt20', label: '<=20公里' },
  { value: 'lt50', label: '<=50公里' },
  { value: 'lt100', label: '<=100公里' },
  { value: 'lt200', label: '<=200公里' }
]

const quickTagOptions = [
  { value: '网红', label: '网红' },
  { value: '大奖赛', label: '大奖赛' },
  { value: '青少年', label: '青少年' }
]

const sortOptions = [
  { value: 0, label: '时间近到远' },
  { value: 1, label: '距离近到远' }
]

const { city, lat, lng } = useCity()
const { $api } = useNuxtApp()

const eventTitle = ref('')
const startDate = ref('')
const endDate = ref('')
const selectedPreset = ref('')
const cityScope = ref('current')
const distance = ref('gt0')
const selectedTags = ref([])
const sortType = ref(0)
const submittedFilters = ref(null)
const page = ref(1)
const list = ref([])
const hasMore = ref(false)
const hasSearched = ref(false)
const loading = ref(false)
const loadingMore = ref(false)

const cityLabel = computed(() => city.value || '杭州市')
const citySummary = computed(() => {
  if (!submittedFilters.value) return cityLabel.value
  if (submittedFilters.value.city === 'unlimitedCity') return '全国范围'
  if (submittedFilters.value.city === 'overseas') return '海外城市'
  return submittedFilters.value.city || cityLabel.value
})
const sortSummary = computed(() => (
  submittedFilters.value?.searchResultSortType === 1 ? '距离近到远' : '时间近到远'
))

const activeLocationClass = 'inline-flex items-center gap-2 rounded-2xl border border-[#39b54a]/25 bg-[#39b54a]/10 px-4 py-3 text-sm font-semibold text-[#2fa444]'
const inactiveLocationClass = 'inline-flex items-center gap-2 rounded-2xl border border-border bg-white px-4 py-3 text-sm font-semibold text-text-muted transition-colors hover:border-brand-primary hover:text-brand-primary'

const chipClass = (active) => {
  return active
    ? 'rounded-2xl border border-[#ff9f0a] bg-[#ff9f0a] px-4 py-3 text-sm font-semibold text-white shadow-[0_18px_36px_-24px_rgba(255,159,10,0.95)] transition-colors'
    : 'rounded-2xl border border-border bg-white px-4 py-3 text-sm font-semibold text-text-muted transition-colors hover:border-[#ff9f0a] hover:text-[#a06100]'
}

const canLoadMore = computed(() => hasMore.value && !loading.value && !loadingMore.value)
const { loadMoreSentinel } = useAutoLoadMore({
  canLoadMore,
  onLoadMore: () => load(page.value + 1)
})

const startOfDay = (date) => new Date(date.getFullYear(), date.getMonth(), date.getDate(), 0, 0, 0, 0)
const endOfDay = (date) => new Date(date.getFullYear(), date.getMonth(), date.getDate(), 23, 59, 59, 999)

const formatDateInput = (date) => {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

const addDays = (date, days) => {
  const target = new Date(date)
  target.setDate(target.getDate() + days)
  return target
}

const parseDateInput = (value) => {
  if (!value) return null

  const [year, month, day] = String(value).split('-').map((item) => Number(item))
  if (!year || !month || !day) return null

  return new Date(year, month - 1, day, 0, 0, 0, 0)
}

const toTimestampSeconds = (date) => Math.floor(date.getTime() / 1000)

const getWeekStart = (date) => {
  const current = startOfDay(date)
  const day = current.getDay() || 7
  current.setDate(current.getDate() - day + 1)
  return current
}

const getWeekEnd = (date) => {
  const current = getWeekStart(date)
  current.setDate(current.getDate() + 6)
  return endOfDay(current)
}

const resolvePresetRange = (preset) => {
  const today = new Date()
  const weekStart = getWeekStart(today)

  switch (preset) {
    case 'thisWeekend': {
      const saturday = addDays(weekStart, 5)
      const sunday = addDays(weekStart, 6)
      return {
        start: startOfDay(saturday),
        end: endOfDay(sunday)
      }
    }
    case 'thisWeek':
      return {
        start: weekStart,
        end: getWeekEnd(today)
      }
    case 'lastWeek': {
      const lastWeekStart = new Date(weekStart)
      lastWeekStart.setDate(lastWeekStart.getDate() - 7)
      const lastWeekEnd = new Date(lastWeekStart)
      lastWeekEnd.setDate(lastWeekEnd.getDate() + 6)
      return {
        start: startOfDay(lastWeekStart),
        end: endOfDay(lastWeekEnd)
      }
    }
    case 'thisMonth':
      return {
        start: new Date(today.getFullYear(), today.getMonth(), 1, 0, 0, 0, 0),
        end: new Date(today.getFullYear(), today.getMonth() + 1, 0, 23, 59, 59, 999)
      }
    case 'next45Days': {
      return {
        start: startOfDay(today),
        end: endOfDay(addDays(today, 45))
      }
    }
    case 'next90Days': {
      return {
        start: startOfDay(today),
        end: endOfDay(addDays(today, 90))
      }
    }
    default:
      return null
  }
}

const applyDatePreset = (preset) => {
  const range = resolvePresetRange(preset)
  if (!range) return

  selectedPreset.value = preset
  startDate.value = formatDateInput(range.start)
  endDate.value = formatDateInput(range.end)
}

const toggleTag = (value) => {
  if (selectedTags.value.includes(value)) {
    selectedTags.value = selectedTags.value.filter((item) => item !== value)
    return
  }

  selectedTags.value = quickTagOptions
    .map((tag) => tag.value)
    .filter((tag) => tag === value || selectedTags.value.includes(tag))
}

const dedupeMatches = (rows = []) => {
  const mapped = new Map()

  rows.forEach((row, index) => {
    const key = row?.eventid || `${row?.title || 'match'}-${row?.starttime || ''}-${index}`
    mapped.set(key, mapped.has(key) ? { ...mapped.get(key), ...row } : row)
  })

  return Array.from(mapped.values())
}

const buildSubmittedFilters = () => {
  const start = parseDateInput(startDate.value)
  const end = parseDateInput(endDate.value)

  let normalizedStart = start
  let normalizedEnd = end

  if (normalizedStart && normalizedEnd && normalizedStart.getTime() > normalizedEnd.getTime()) {
    normalizedStart = end
    normalizedEnd = start
  }

  return {
    city: cityScope.value === 'current' ? cityLabel.value : cityScope.value,
    eventTitle: eventTitle.value.trim(),
    startMatchTimestamp: normalizedStart ? toTimestampSeconds(normalizedStart) : undefined,
    endMatchTimestamp: normalizedEnd ? toTimestampSeconds(addDays(normalizedEnd, 1)) : undefined,
    quickTags: selectedTags.value.length ? selectedTags.value.join(',') : undefined,
    distance: distance.value,
    search: 1,
    searchResultSortType: sortType.value,
    lat: lat.value,
    lng: lng.value
  }
}

const load = async (nextPage = 1) => {
  const isFirstPage = nextPage === 1

  if (!submittedFilters.value) return

  if (isFirstPage) {
    loading.value = true
  } else {
    if (loading.value || loadingMore.value || !hasMore.value) return
    loadingMore.value = true
  }

  const previousCount = isFirstPage ? 0 : list.value.length

  try {
    const response = await $api('/match/lists', {
      method: 'POST',
      body: {
        ...submittedFilters.value,
        page: nextPage
      }
    })
    const rows = Array.isArray(response?.data?.data) ? response.data.data : []
    const merged = isFirstPage ? dedupeMatches(rows) : dedupeMatches(list.value.concat(rows))

    list.value = merged
    page.value = nextPage
    hasSearched.value = true
    hasMore.value = rows.length > 0 && merged.length > previousCount
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

const handleSearch = async () => {
  submittedFilters.value = buildSubmittedFilters()
  page.value = 1
  hasMore.value = false
  await load(1)
}

const resetFilters = () => {
  eventTitle.value = ''
  startDate.value = ''
  endDate.value = ''
  selectedPreset.value = ''
  cityScope.value = 'current'
  distance.value = 'gt0'
  selectedTags.value = []
  sortType.value = 0
}
</script>
