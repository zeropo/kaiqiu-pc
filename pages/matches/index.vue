<template>
  <div class="container py-10 md:py-16">
    <div class="mb-8">
      <h1 class="font-display text-3xl font-bold text-text-main">比赛大厅</h1>
      <p class="text-text-muted mt-2">浏览、搜索并筛选您身边的乒乓球赛事</p>
    </div>
    
    <div class="bg-white rounded-card shadow-sm border border-border p-5 mb-10 flex flex-col md:flex-row md:items-end gap-4">
      <div class="flex-1">
        <label class="block text-sm font-medium text-text-muted mb-1.5">城市</label>
        <div class="relative">
          <svg class="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-text-light" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path></svg>
          <input v-model="city" placeholder="如：杭州市" class="w-full h-11 pl-10 pr-4 rounded-btn border border-border focus:border-brand-primary focus:ring-1 focus:ring-brand-primary transition-all outline-none" />
        </div>
      </div>
      <div class="min-w-[180px]">
        <label class="block text-sm font-medium text-text-muted mb-1.5">排序方式</label>
        <select v-model="sortOption" class="w-full h-11 px-3 rounded-btn border border-border focus:border-brand-primary focus:ring-1 focus:ring-brand-primary transition-all outline-none bg-white appearance-none cursor-pointer">
          <option value="distance_asc">距离：从近到远</option>
          <option value="distance_desc">距离：从远到近</option>
          <option value="time_asc">时间：从早到晚</option>
          <option value="time_desc">时间：从晚到早</option>
        </select>
      </div>
      <button @click="load(1)" class="h-11 px-8 rounded-btn bg-brand-primary text-white font-medium hover:bg-brand-primaryHover shadow-card hover:shadow-cardHover transition-all active:scale-95">筛选结果</button>
    </div>

    <div v-if="loading" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      <div v-for="n in 6" :key="n" class="h-64 bg-white border border-border rounded-card animate-pulse" />
    </div>

    <div v-else>
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <MatchCard v-for="m in list" :key="m.eventid" :match="m" />
      </div>

      <div class="flex items-center justify-center mt-12" v-if="hasMore">
        <button @click="load(page+1)" class="h-11 px-8 rounded-btn border border-border text-text-main hover:border-brand-primary hover:text-brand-primary transition-colors bg-white font-medium">加载更多</button>
      </div>
      <div v-if="!list.length && !loading" class="flex flex-col items-center justify-center py-20 bg-white rounded-card shadow-sm border border-border">
        <div class="w-20 h-20 bg-surfaceSoft rounded-full flex items-center justify-center mb-4">
          <svg class="w-10 h-10 text-text-light" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
        </div>
        <p class="text-text-muted font-medium text-lg">当前城市暂无比赛数据</p>
      </div>
    </div>
  </div>
</template>

<script setup>
useHead({
  title: '比赛列表'
})

const { city, lat, lng } = useCity()
const sortOption = ref('distance_asc') // 默认按距离从近到远
const page = ref(1)
const list = ref([])
const hasMore = ref(false)
const loading = ref(true)

const { $api } = useNuxtApp()

// 客户端排序函数
const sortMatches = (matches, sortType) => {
  const sorted = [...matches]
  
  switch (sortType) {
    case 'distance_asc':
      return sorted.sort((a, b) => {
        const distanceA = parseFloat(a.distance) || Infinity
        const distanceB = parseFloat(b.distance) || Infinity
        return distanceA - distanceB
      })
    case 'distance_desc':
      return sorted.sort((a, b) => {
        const distanceA = parseFloat(a.distance) || -Infinity
        const distanceB = parseFloat(b.distance) || -Infinity
        return distanceB - distanceA
      })
    case 'time_asc':
      return sorted.sort((a, b) => new Date(a.starttime) - new Date(b.starttime))
    case 'time_desc':
      return sorted.sort((a, b) => new Date(b.starttime) - new Date(a.starttime))
    default:
      return sorted
  }
}

const load = async (p = 1) => {
  loading.value = true
  try {
    // 使用接口的默认排序，然后在客户端重新排序
    const res = await $api('/match/lists', { method: 'POST', body: { city: city.value, lat: lat.value, lng: lng.value, sort: 2, page: p } })
    let rows = res?.data?.data || []
    
    if (p === 1) {
      // 第一页：直接排序并设置
      list.value = sortMatches(rows, sortOption.value)
    } else {
      // 加载更多：合并数据后重新排序整个列表
      const combinedList = list.value.concat(rows)
      list.value = sortMatches(combinedList, sortOption.value)
    }
    
    page.value = p
    const pg = res?.data
    hasMore.value = pg?.current_page < pg?.last_page
  } catch (e) {
    if (p === 1) list.value = []
    hasMore.value = false
  } finally {
    loading.value = false
  }
}

// 监听排序变化，自动重新加载第一页
watch(sortOption, () => {
  if (list.value.length > 0) {
    load(1)
  }
}, { immediate: false })

// 不在首屏自动请求定位，避免权限提示。
onMounted(async () => { await load(1) })
</script>

