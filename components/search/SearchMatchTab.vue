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
          <label class="text-sm font-semibold text-text-main md:text-base">比赛日期</label>
          <div class="grid grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center gap-3">
            <SearchCalendarPicker
              :model-value="startDate"
              panel-align="left"
              placeholder="起始日期"
              @update:model-value="handleStartDateChange"
            />
            <span class="text-sm text-text-light">至</span>
            <SearchCalendarPicker
              :model-value="endDate"
              :min-value="startDate"
              panel-align="right"
              placeholder="截止日期"
              @update:model-value="handleEndDateChange"
            />
          </div>
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
          <div class="flex flex-wrap items-center gap-2">
            <button
              type="button"
              :class="chipClass(cityMode === 'current')"
              @click="cityMode = 'current'"
            >
              {{ cityLabel }}
            </button>
            <button
              type="button"
              :class="chipClass(cityMode === 'all')"
              @click="cityMode = 'all'"
            >
              全国范围
            </button>
          </div>
        </div>

        <div class="grid gap-3 lg:grid-cols-[120px_minmax(0,1fr)] lg:items-start">
          <span class="pt-1 text-sm font-semibold text-text-main md:text-base">距离区间</span>
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
          class="h-12 rounded-2xl bg-brand-primary px-8 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-brand-primaryHover"
        >
          搜索
        </button>
      </div>
    </form>

    <div v-if="loading" class="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
      <div
        v-for="item in 8"
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
        标题、日期、距离、标签支持自由组合，并支持按当前城市或全国范围搜索。
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

      <div class="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
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
        可以尝试放宽日期或距离范围后重新搜索。
      </p>
    </div>
  </div>
</template>

<script setup>
const SearchCalendarPicker = defineComponent({
  name: 'SearchCalendarPicker',
  props: {
    modelValue: {
      type: String,
      default: ''
    },
    minValue: {
      type: String,
      default: ''
    },
    placeholder: {
      type: String,
      default: '请选择日期'
    },
    panelAlign: {
      type: String,
      default: 'left'
    }
  },
  emits: ['update:modelValue'],
  setup(props, { emit }) {
    const weekLabels = ['日', '一', '二', '三', '四', '五', '六']
    const calendarRef = ref(null)
    const panelOpen = ref(false)
    const panelMonth = ref(new Date())

    const syncPanelMonth = (value) => {
      const current = parseDateInput(value) || new Date()
      panelMonth.value = new Date(current.getFullYear(), current.getMonth(), 1)
    }

    const calendarTitle = computed(() => `${panelMonth.value.getFullYear()}年${panelMonth.value.getMonth() + 1}月`)

    const calendarDays = computed(() => {
      const firstDay = new Date(panelMonth.value.getFullYear(), panelMonth.value.getMonth(), 1)
      const startDate = new Date(firstDay)
      startDate.setDate(1 - firstDay.getDay())
      const today = formatDateInput(new Date())
      const minDate = parseDateInput(props.minValue)

      return Array.from({ length: 42 }, (_, index) => {
        const current = new Date(startDate)
        current.setDate(startDate.getDate() + index)
        const value = formatDateInput(current)

        return {
          key: `${value}-${index}`,
          value,
          label: current.getDate(),
          isCurrentMonth: current.getFullYear() === panelMonth.value.getFullYear() && current.getMonth() === panelMonth.value.getMonth(),
          isToday: value === today,
          isSelected: value === props.modelValue,
          isDisabled: minDate ? current.getTime() < minDate.getTime() : false
        }
      })
    })

    const getDayClass = (day) => {
      if (day.isDisabled) {
        return 'h-10 cursor-not-allowed rounded-xl bg-surfaceMuted text-sm text-text-light/60'
      }

      if (day.isSelected) {
        return 'h-10 rounded-xl bg-brand-primary text-sm font-semibold text-white shadow-sm transition-colors'
      }

      const monthClass = day.isCurrentMonth
        ? 'bg-surfaceSoft/60 text-text-main hover:bg-brand-primary/5 hover:text-brand-primary'
        : 'bg-transparent text-text-light hover:bg-surfaceSoft/60 hover:text-text-main'

      const todayClass = day.isToday ? ' border border-brand-primary/30' : ''
      return `h-10 rounded-xl text-sm transition-colors ${monthClass}${todayClass}`
    }

    const closePanel = () => {
      panelOpen.value = false
    }

    const togglePanel = () => {
      if (panelOpen.value) {
        closePanel()
        return
      }

      syncPanelMonth(props.modelValue)
      panelOpen.value = true
    }

    const changeMonth = (offset) => {
      panelMonth.value = new Date(panelMonth.value.getFullYear(), panelMonth.value.getMonth() + offset, 1)
    }

    const selectDate = (day) => {
      if (day.isDisabled) return

      emit('update:modelValue', day.value)
      closePanel()
    }

    const handleClickOutside = (event) => {
      if (calendarRef.value && !calendarRef.value.contains(event.target)) {
        closePanel()
      }
    }

    watch(
      () => props.modelValue,
      (value) => {
        if (!panelOpen.value) {
          syncPanelMonth(value)
        }
      },
      { immediate: true }
    )

    onMounted(() => {
      document.addEventListener('click', handleClickOutside)
    })

    onBeforeUnmount(() => {
      document.removeEventListener('click', handleClickOutside)
    })

    return () => h('div', { ref: calendarRef, class: 'relative w-full' }, [
      h(
        'button',
        {
          type: 'button',
          class: 'flex h-12 w-full items-center justify-between gap-3 rounded-2xl border border-border bg-white px-4 text-left text-sm transition-colors hover:border-brand-primary/40',
          onClick: togglePanel
        },
        [
          h(
            'span',
            {
              class: `truncate ${props.modelValue ? 'text-text-main' : 'text-text-light'}`
            },
            props.modelValue || props.placeholder
          ),
          h(
            'svg',
            {
              class: `h-4 w-4 shrink-0 transition-transform ${panelOpen.value ? 'rotate-180 text-brand-primary' : 'text-text-light'}`,
              fill: 'none',
              stroke: 'currentColor',
              viewBox: '0 0 24 24'
            },
            [
              h('path', {
                'stroke-linecap': 'round',
                'stroke-linejoin': 'round',
                'stroke-width': '2',
                d: 'm6 9 6 6 6-6'
              })
            ]
          )
        ]
      ),
      panelOpen.value
        ? h('div', { class: `absolute ${props.panelAlign === 'right' ? 'right-0' : 'left-0'} top-full z-30 mt-2 w-[320px] max-w-[calc(100vw-2rem)] rounded-card border border-border bg-white p-4 shadow-xl` }, [
            h('div', { class: 'flex items-center justify-between gap-2' }, [
              h(
                'button',
                {
                  type: 'button',
                  class: 'flex h-9 items-center rounded-xl bg-surfaceMuted px-3 text-sm text-text-main transition-colors hover:bg-surfaceSoft',
                  onClick: () => changeMonth(-1)
                },
                '上月'
              ),
              h('div', { class: 'text-sm font-semibold text-text-main' }, calendarTitle.value),
              h(
                'button',
                {
                  type: 'button',
                  class: 'flex h-9 items-center rounded-xl bg-surfaceMuted px-3 text-sm text-text-main transition-colors hover:bg-surfaceSoft',
                  onClick: () => changeMonth(1)
                },
                '下月'
              )
            ]),
            h(
              'div',
              { class: 'mt-3 grid grid-cols-7 gap-1 text-center text-xs text-text-light' },
              weekLabels.map((label) => h('div', { key: label, class: 'h-7 leading-7' }, label))
            ),
            h(
              'div',
              { class: 'mt-1 grid grid-cols-7 gap-1' },
              calendarDays.value.map((day) => h(
                'button',
                {
                  key: day.key,
                  type: 'button',
                  class: getDayClass(day),
                  disabled: day.isDisabled,
                  onClick: () => selectDate(day)
                },
                String(day.label)
              ))
            )
          ])
        : null
    ])
  }
})

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
const route = useRoute()
const router = useRouter()

const eventTitle = ref(route.query.keyword || '')
const startDate = ref(route.query.startDate || '')
const endDate = ref(route.query.endDate || '')
const selectedPreset = ref(route.query.preset || '')
const cityMode = ref(route.query.cityMode === 'all' ? 'all' : 'current')
const distance = ref(route.query.distance || 'gt0')
const selectedTags = ref(route.query.tags ? route.query.tags.split(',') : [])
const sortType = ref(Number(route.query.sort || 0))
const submittedFilters = ref(null)
const page = ref(1)
const list = ref([])
const hasMore = ref(false)
const hasSearched = ref(false)
const loading = ref(false)
const loadingMore = ref(false)

const cityLabel = computed(() => city.value || '杭州市')

const updateQuery = () => {
  const nextQuery = {
    ...route.query,
    keyword: eventTitle.value.trim(),
    startDate: startDate.value,
    endDate: endDate.value,
    preset: selectedPreset.value,
    cityMode: cityMode.value,
    distance: distance.value,
    tags: selectedTags.value.join(','),
    sort: sortType.value
  }
  delete nextQuery.cityScope
  router.replace({ query: nextQuery })
}
const citySummary = computed(() => {
  if (!submittedFilters.value) return cityMode.value === 'all' ? '全国范围' : cityLabel.value
  return submittedFilters.value.city === 'unlimitedCity' ? '全国范围' : submittedFilters.value.city
})
const sortSummary = computed(() => (
  submittedFilters.value?.searchResultSortType === 1 ? '距离近到远' : '时间近到远'
))

const chipClass = (active) => {
  return active
    ? 'rounded-2xl border border-brand-primary bg-brand-primary px-4 py-3 text-sm font-semibold text-white shadow-sm transition-colors'
    : 'rounded-2xl border border-border bg-white px-4 py-3 text-sm font-semibold text-text-muted transition-colors hover:border-brand-primary hover:bg-brand-primary/5 hover:text-brand-primary'
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

// 移除这里的默认调用，改为在 onMounted 中根据逻辑处理
// applyDatePreset('thisWeekend')

const clearInvalidEndDate = () => {
  const start = parseDateInput(startDate.value)
  const end = parseDateInput(endDate.value)

  if (start && end && end.getTime() < start.getTime()) {
    endDate.value = ''
  }
}

const handleStartDateChange = (value) => {
  startDate.value = value
  selectedPreset.value = ''
  clearInvalidEndDate()
}

const handleEndDateChange = (value) => {
  endDate.value = value
  selectedPreset.value = ''
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

  return {
    city: cityMode.value === 'all' ? 'unlimitedCity' : cityLabel.value,
    eventTitle: eventTitle.value.trim(),
    startMatchTimestamp: start ? toTimestampSeconds(start) : undefined,
    endMatchTimestamp: end ? toTimestampSeconds(addDays(end, 1)) : undefined,
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
  clearInvalidEndDate()
  submittedFilters.value = buildSubmittedFilters()
  updateQuery()
  page.value = 1
  hasMore.value = false
  await load(1)
}

const resetFilters = async () => {
  eventTitle.value = ''
  startDate.value = ''
  endDate.value = ''
  selectedPreset.value = ''
  cityMode.value = 'current'
  distance.value = 'gt0'
  selectedTags.value = []
  sortType.value = 0
  applyDatePreset('thisWeekend')
  await handleSearch()
}

onMounted(() => {
  clearInvalidEndDate()

  if (route.query.keyword || route.query.startDate || route.query.preset || route.query.cityMode) {
    submittedFilters.value = buildSubmittedFilters()
    load(1)
    return
  }

  applyDatePreset('thisWeekend')
})
</script>
