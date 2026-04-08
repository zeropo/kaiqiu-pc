<template>
  <div class="container pt-6 pb-8 md:pt-8 md:pb-10">
    <div class="rounded-card border border-gray-100 bg-white p-5 md:p-6">
      <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 class="text-xl md:text-2xl font-semibold">龙虎榜真机构买入筛选</h1>
          <p class="text-sm text-gray-500 mt-1">仅看买入营业部为“机构专用”，且卖出为0或无卖出</p>
        </div>
        <div class="flex flex-wrap items-center gap-2">
          <button
            class="h-11 px-4 rounded-btn bg-surfaceMuted hover:bg-gray-100 transition"
            :disabled="loading"
            @click="switchPrevDate"
          >
            上个交易日
          </button>
          <div ref="calendarRef" class="relative">
            <button
              type="button"
              class="h-11 min-w-[150px] px-3 rounded-btn border border-gray-200 bg-white text-left"
              :disabled="loading"
              @click="toggleCalendar"
            >
              {{ tradeDate || '请选择交易日期' }}
            </button>
            <div
              v-if="calendarOpen"
              class="absolute right-0 z-20 mt-2 w-[320px] rounded-card border border-gray-100 bg-white p-4 shadow-xl"
            >
              <div class="flex items-center justify-between">
                <button
                  type="button"
                  class="h-9 px-3 rounded-btn bg-surfaceMuted hover:bg-gray-100 transition"
                  :disabled="calendarLoading"
                  @click="switchCalendarMonth(-1)"
                >
                  上月
                </button>
                <div class="text-sm font-medium">{{ calendarTitle }}</div>
                <button
                  type="button"
                  class="h-9 px-3 rounded-btn bg-surfaceMuted hover:bg-gray-100 transition disabled:opacity-50 disabled:cursor-not-allowed"
                  :disabled="calendarLoading || isCalendarNextMonthDisabled"
                  @click="switchCalendarMonth(1)"
                >
                  下月
                </button>
              </div>

              <div class="mt-3 grid grid-cols-7 gap-1 text-center text-xs text-gray-400">
                <div v-for="week in weekLabels" :key="week" class="h-7 leading-7">{{ week }}</div>
              </div>

              <div class="grid grid-cols-7 gap-1">
                <button
                  v-for="day in calendarDays"
                  :key="day.date"
                  type="button"
                  class="h-9 rounded-btn text-sm transition disabled:cursor-not-allowed"
                  :class="[
                    day.isSelected ? 'bg-gray-900 text-white hover:bg-gray-900' : '',
                    !day.inCurrentMonth ? 'text-gray-200' : '',
                    day.inCurrentMonth && !day.disabled && !day.isSelected ? 'bg-surfaceMuted hover:bg-gray-100 text-gray-700' : '',
                    day.inCurrentMonth && day.disabled ? 'bg-gray-50 text-gray-300' : ''
                  ]"
                  :disabled="day.disabled || loading || calendarLoading"
                  @click="selectTradeDate(day.date)"
                >
                  {{ day.label }}
                </button>
              </div>

              <div class="mt-3 text-xs text-gray-400">
                {{ calendarLoading ? '交易日加载中...' : '仅可选择交易日' }}
              </div>
            </div>
          </div>
          <button
            class="h-11 px-4 rounded-btn bg-surfaceMuted hover:bg-gray-100 transition"
            :disabled="loading"
            @click="applyLatestDate"
          >
            最新交易日
          </button>
          <button
            class="h-11 px-4 rounded-btn bg-surfaceMuted hover:bg-gray-100 transition disabled:opacity-50 disabled:cursor-not-allowed"
            :disabled="loading || isNextDisabled"
            @click="switchNextDate"
          >
            下个交易日
          </button>
        </div>
      </div>

      <div class="mt-4 text-sm">
        <span v-if="loading">加载中...</span>
        <span v-else-if="errorMessage" class="text-red-600">{{ errorMessage }}</span>
        <span v-else class="text-gray-500">共 {{ institutionStocks.length }} 只个股</span>
      </div>
    </div>

    <div class="mt-6 rounded-card border border-gray-100 bg-white overflow-hidden">
      <div class="grid grid-cols-4 gap-3 px-4 py-3 bg-surfaceMuted text-sm text-gray-600">
        <div>代码</div>
        <div>名称</div>
        <div>机构买入合计(万元)</div>
        <div>席位个数</div>
      </div>
      <div v-if="institutionStocks.length === 0" class="px-4 py-10 text-center text-sm text-gray-500">
        暂无符合条件的个股
      </div>
      <div v-for="stock in institutionStocks" :key="stock.code" class="grid grid-cols-4 gap-3 px-4 py-3 border-t border-gray-100 text-sm">
        <div class="font-mono">{{ stock.code }}</div>
        <div class="font-medium">{{ stock.name }}</div>
        <div class="tabular-nums">{{ (stock.totalBuy / 10000).toFixed(2) }}</div>
        <div class="tabular-nums">
          {{ stock.items.length }}
          <span v-if="stock.hasThreeDayBoard" class="ml-1 text-orange-600 text-xs">(三日榜)</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { fetchLatestTradeDate, fetchMonthTradeDates, fetchNextTradeDate, fetchPrevTradeDate, fetchLhbRecords } from '@/services/dragon-tiger'

definePageMeta({ layout: 'empty' })
useHead({ title: '龙虎榜真机构' })

const { $api } = useNuxtApp()
const pad2 = (n) => String(n).padStart(2, '0')
const formatYmd = (d) => `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`
const formatMonth = (d) => `${d.getFullYear()}-${pad2(d.getMonth() + 1)}`
const parseYmd = (value) => {
  const [year, month, day] = value.split('-').map(Number)
  return new Date(year, month - 1, day)
}
const parseMonth = (value) => parseYmd(`${value}-01`)
const addMonths = (value, offset) => {
  const date = parseMonth(value)
  date.setMonth(date.getMonth() + offset)
  return formatMonth(date)
}

const weekLabels = ['日', '一', '二', '三', '四', '五', '六']
const tradeDate = ref('')
const latestTradeDate = ref('')
const loading = ref(false)
const calendarLoading = ref(false)
const calendarOpen = ref(false)
const calendarRef = ref(null)

const onClickOutside = (e) => {
  if (calendarRef.value && !calendarRef.value.contains(e.target)) {
    calendarOpen.value = false
  }
}
const calendarMonth = ref(formatMonth(new Date()))
const monthTradeDateMap = ref({})
const errorMessage = ref('')
const records = ref([])

const isAStock = (code) => {
  return code && (code.startsWith('0') || code.startsWith('3') || code.startsWith('6'))
}

const isStStock = (name) => {
  return name.includes('ST')
}

const institutionStocks = computed(() => {
  const map = new Map()
  for (const row of records.value) {
    if (!isAStock(row.code)) continue
    if (isStStock(row.name)) continue
    if (row.deptName !== '机构专用') continue
    if (row.sellAmt !== 0) continue
    const key = `${row.code}|${row.name}`
    const current = map.get(key) || { code: row.code, name: row.name, totalBuy: 0, items: [], _seen: new Set(), hasThreeDayBoard: false }
    const dedupKey = `${row.deptName}|${row.buyAmt}`
    if (current._seen.has(dedupKey)) continue
    current._seen.add(dedupKey)
    if (row.reason && row.reason.includes('连续三个交易日')) current.hasThreeDayBoard = true
    current.totalBuy += row.buyAmt
    current.items.push(row)
    map.set(key, current)
  }
  return Array.from(map.values()).sort((a, b) => b.totalBuy - a.totalBuy)
})

const isNextDisabled = computed(() => {
  return !latestTradeDate.value || tradeDate.value === latestTradeDate.value
})

const isCalendarNextMonthDisabled = computed(() => {
  return !latestTradeDate.value || calendarMonth.value >= latestTradeDate.value.slice(0, 7)
})

const calendarTitle = computed(() => {
  const [year, month] = calendarMonth.value.split('-')
  return `${year}年${month}月`
})

const currentMonthTradeDateSet = computed(() => {
  return new Set(monthTradeDateMap.value[calendarMonth.value] || [])
})

const calendarDays = computed(() => {
  const firstDay = parseMonth(calendarMonth.value)
  const start = new Date(firstDay)
  start.setDate(1 - firstDay.getDay())
  const days = []

  for (let i = 0; i < 42; i += 1) {
    const current = new Date(start)
    current.setDate(start.getDate() + i)
    const date = formatYmd(current)
    const inCurrentMonth = formatMonth(current) === calendarMonth.value
    const isTradeDate = currentMonthTradeDateSet.value.has(date)
    days.push({
      date,
      label: current.getDate(),
      inCurrentMonth,
      isSelected: date === tradeDate.value,
      disabled: !inCurrentMonth || !isTradeDate || (latestTradeDate.value && date > latestTradeDate.value)
    })
  }

  return days
})

const refreshLatestTradeDate = async () => {
  errorMessage.value = ''
  try {
    latestTradeDate.value = await fetchLatestTradeDate($api)
  } catch (e) {
    errorMessage.value = e && e.message ? e.message : '获取最新交易日失败'
  }
}

const ensureMonthTradeDates = async (month) => {
  if (monthTradeDateMap.value[month]) return
  calendarLoading.value = true
  try {
    const tradeDates = await fetchMonthTradeDates($api, month)
    monthTradeDateMap.value = {
      ...monthTradeDateMap.value,
      [month]: tradeDates
    }
  } catch (e) {
    errorMessage.value = e && e.message ? e.message : '获取交易日历失败'
  } finally {
    calendarLoading.value = false
  }
}

const queryRecords = async () => {
  if (!tradeDate.value) {
    errorMessage.value = '请选择交易日期'
    return
  }
  errorMessage.value = ''
  loading.value = true
  try {
    records.value = await fetchLhbRecords($api, tradeDate.value)
  } catch (e) {
    errorMessage.value = e && e.message ? e.message : '查询失败'
  } finally {
    loading.value = false
  }
}

const toggleCalendar = async () => {
  if (calendarOpen.value) {
    calendarOpen.value = false
    return
  }
  calendarMonth.value = tradeDate.value ? tradeDate.value.slice(0, 7) : (latestTradeDate.value ? latestTradeDate.value.slice(0, 7) : formatMonth(new Date()))
  calendarOpen.value = true
  await ensureMonthTradeDates(calendarMonth.value)
}

const switchCalendarMonth = async (offset) => {
  const nextMonth = addMonths(calendarMonth.value, offset)
  if (offset > 0 && latestTradeDate.value && nextMonth > latestTradeDate.value.slice(0, 7)) return
  calendarMonth.value = nextMonth
  await ensureMonthTradeDates(calendarMonth.value)
}

const selectTradeDate = async (date) => {
  tradeDate.value = date
  calendarOpen.value = false
  await queryRecords()
}

const applyLatestDate = async () => {
  errorMessage.value = ''
  loading.value = true
  try {
    if (!latestTradeDate.value) await refreshLatestTradeDate()
    tradeDate.value = latestTradeDate.value
  } catch (e) {
    errorMessage.value = e && e.message ? e.message : '获取最新交易日失败'
  } finally {
    loading.value = false
  }
  if (tradeDate.value) await queryRecords()
}

const switchPrevDate = async () => {
  if (!tradeDate.value) return
  errorMessage.value = ''
  loading.value = true
  try {
    tradeDate.value = await fetchPrevTradeDate($api, tradeDate.value)
  } catch (e) {
    errorMessage.value = e && e.message ? e.message : '切换上个交易日失败'
  } finally {
    loading.value = false
  }
  if (tradeDate.value) await queryRecords()
}

const switchNextDate = async () => {
  if (!tradeDate.value) return
  if (isNextDisabled.value) return
  errorMessage.value = ''
  loading.value = true
  try {
    tradeDate.value = await fetchNextTradeDate($api, tradeDate.value)
  } catch (e) {
    errorMessage.value = e && e.message ? e.message : '切换下个交易日失败'
  } finally {
    loading.value = false
  }
  if (tradeDate.value) await queryRecords()
}

onMounted(async () => {
  document.addEventListener('click', onClickOutside)
  await refreshLatestTradeDate()
  tradeDate.value = latestTradeDate.value
  if (tradeDate.value) {
    calendarMonth.value = tradeDate.value.slice(0, 7)
    await ensureMonthTradeDates(calendarMonth.value)
  }
  if (tradeDate.value) await queryRecords()
})

onBeforeUnmount(() => {
  document.removeEventListener('click', onClickOutside)
})
</script>

