<template>
  <div class="container py-10 md:py-16">
    <div class="mb-8">
      <h1 class="font-display text-3xl font-bold text-text-main">积分排行</h1>
      <p class="text-text-muted mt-2">查询选手的实时积分与历史最高记录</p>
    </div>

    <div class="bg-white rounded-card shadow-sm border border-border p-5 mb-10 flex flex-col md:flex-row md:items-end gap-4">
      <div class="flex-1">
        <label class="block text-sm font-medium text-text-muted mb-1.5">城市</label>
        <div class="relative">
          <svg class="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-text-light" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path></svg>
          <input v-model="city" placeholder="如：杭州市" class="w-full h-11 pl-10 pr-4 rounded-btn border border-border focus:border-brand-primary focus:ring-1 focus:ring-brand-primary transition-all outline-none" />
        </div>
      </div>
      <button @click="load(1)" class="h-11 px-8 rounded-btn bg-brand-primary text-white font-medium hover:bg-brand-primaryHover shadow-card hover:shadow-cardHover transition-all active:scale-95">筛选</button>
    </div>

    <div v-if="loading" class="space-y-4">
      <div v-for="n in 8" :key="n" class="h-16 bg-white border border-border rounded-xl animate-pulse" />
    </div>

    <div v-else class="bg-white rounded-card border border-border shadow-sm overflow-hidden">
      <div class="overflow-x-auto">
        <table class="min-w-full text-sm text-left whitespace-nowrap">
          <thead class="bg-surfaceSoft text-text-muted font-medium border-b border-border">
            <tr>
              <th class="px-6 py-4 rounded-tl-card">姓名</th>
              <th class="px-6 py-4">积分</th>
              <th class="px-6 py-4">最高分</th>
              <th class="px-6 py-4">城市</th>
              <th class="px-6 py-4 rounded-tr-card text-right">操作</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-border">
            <tr v-for="u in list" :key="u.uid" class="hover:bg-surfaceMuted transition-colors group">
              <td class="px-6 py-4 font-medium text-text-main flex items-center gap-3">
                <div class="w-8 h-8 rounded-full bg-surfaceSoft flex-shrink-0 flex items-center justify-center font-bold text-brand-secondary text-xs shadow-inner">
                  {{ u.realname?.charAt(0) || 'K' }}
                </div>
                {{ u.realname }}
              </td>
              <td class="px-6 py-4 font-display font-bold text-brand-primary text-base">{{ u.score }}</td>
              <td class="px-6 py-4 text-text-muted">{{ u.maxscore }}</td>
              <td class="px-6 py-4 text-text-muted">{{ u.residecity || '-' }}</td>
              <td class="px-6 py-4 text-right">
                <a :href="`/scores/${u.uid}`" class="inline-flex items-center text-brand-primary font-medium hover:text-brand-primaryHover">
                  详情 <svg class="w-4 h-4 ml-0.5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path></svg>
                </a>
              </td>
            </tr>
            <tr v-if="!list.length">
              <td colspan="5" class="px-6 py-16 text-center text-text-muted">暂无符合条件的数据</td>
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
const { city, tryGeolocation } = useCity()
const page = ref(1)
const list = ref([])
const hasMore = ref(false)
const loading = ref(true)
const loadingMore = ref(false)

const { $api } = useNuxtApp()
const canAutoLoadMore = computed(() => hasMore.value && !loading.value && !loadingMore.value)
const { loadMoreSentinel } = useAutoLoadMore({
  canLoadMore: canAutoLoadMore,
  onLoadMore: () => load(page.value + 1)
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
    const res = await $api('/user/lists', { method: 'POST', body: { city: city.value, sort: 2, page: p, index: 0 } })
    const rows = Array.isArray(res?.data?.data) ? res.data.data : []

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

onMounted(async () => { await load(1) })
</script>

