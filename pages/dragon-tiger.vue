<template>
  <div class="container py-8 md:py-10">
    <div class="rounded-card border border-gray-100 bg-white p-5 md:p-6">
      <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 class="text-xl md:text-2xl font-semibold">龙虎榜真机构买入筛选</h1>
          <p class="text-sm text-gray-500 mt-1">仅看买入营业部为“机构专用”，且卖出为0或无卖出</p>
        </div>
        <div class="flex items-center gap-2">
          <input v-model="tradeDate" type="date" class="h-11 px-3 rounded-btn border border-gray-200 bg-white" />
          <button class="h-11 px-4 rounded-btn bg-surfaceMuted hover:bg-gray-100 transition" :disabled="loading" @click="loadLatestDate">
            最新交易日
          </button>
          <button class="h-11 px-4 rounded-btn bg-brand-primary text-white shadow-card hover:shadow-cardHover transition" :disabled="loading" @click="queryRecords">
            查询
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
        <div>席位条数</div>
      </div>
      <div v-if="institutionStocks.length === 0" class="px-4 py-10 text-center text-sm text-gray-500">
        暂无符合条件的个股
      </div>
      <div v-for="stock in institutionStocks" :key="stock.code" class="grid grid-cols-4 gap-3 px-4 py-3 border-t border-gray-100 text-sm">
        <div class="font-mono">{{ stock.code }}</div>
        <div class="font-medium">{{ stock.name }}</div>
        <div class="tabular-nums">{{ stock.totalBuy.toFixed(2) }}</div>
        <div class="tabular-nums">{{ stock.items.length }}</div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { fetchLatestTradeDate, fetchLhbRecords } from '@/services/dragon-tiger'

useHead({ title: '龙虎榜真机构' })

const { $api } = useNuxtApp()
const tradeDate = ref('')
const loading = ref(false)
const errorMessage = ref('')
const records = ref([])

const isAStock = (code) => {
  return code && (code.startsWith('0') || code.startsWith('3') || code.startsWith('6'))
}

const institutionStocks = computed(() => {
  const map = new Map()
  for (const row of records.value) {
    if (!isAStock(row.code)) continue
    if (row.deptName !== '机构专用') continue
    if (row.sellAmt !== 0) continue
    const key = `${row.code}|${row.name}`
    const current = map.get(key) || { code: row.code, name: row.name, totalBuy: 0, items: [] }
    current.totalBuy += row.buyAmt
    current.items.push(row)
    map.set(key, current)
  }
  return Array.from(map.values()).sort((a, b) => b.totalBuy - a.totalBuy)
})

const loadLatestDate = async () => {
  errorMessage.value = ''
  loading.value = true
  try {
    tradeDate.value = await fetchLatestTradeDate($api)
  } catch (e) {
    errorMessage.value = e && e.message ? e.message : '获取最新交易日失败'
  } finally {
    loading.value = false
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

onMounted(async () => {
  await loadLatestDate()
  if (tradeDate.value) await queryRecords()
})
</script>

