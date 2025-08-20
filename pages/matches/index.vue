<template>
  <div class="container py-8">
    <div class="flex flex-col md:flex-row md:items-end gap-3 mb-6">
      <div class="flex-1">
        <label class="block text-sm text-gray-500 mb-1">城市</label>
        <input v-model="city" placeholder="如：杭州市" class="w-full h-11 px-3 rounded-btn border border-gray-200" />
      </div>
      <div class="min-w-[160px]">
        <label class="block text-sm text-gray-500 mb-1">排序方式</label>
        <select v-model="sortOption" class="w-full h-11 px-3 rounded-btn border border-gray-200 text-sm">
          <option value="distance_asc">距离：从近到远</option>
          <option value="distance_desc">距离：从远到近</option>
          <option value="time_asc">时间：从早到晚</option>
          <option value="time_desc">时间：从晚到早</option>
        </select>
      </div>
      <button @click="load(1)" class="h-11 px-4 rounded-btn bg-black text-white">筛选</button>
    </div>

    <div v-if="loading" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      <div v-for="n in 6" :key="n" class="h-48 bg-surfaceMuted rounded-card animate-pulse" />
    </div>

    <div v-else>
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <MatchCard v-for="m in list" :key="m.eventid" :match="m" />
      </div>

      <div class="flex items-center justify-center mt-8" v-if="hasMore">
        <button @click="load(page+1)" class="h-10 px-6 rounded-btn border border-gray-200">加载更多</button>
      </div>
      <div v-if="!list.length && !loading" class="text-center text-gray-500 py-10">暂无数据</div>
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

