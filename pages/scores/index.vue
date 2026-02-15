<template>
  <div class="container py-8">
    <div class="flex flex-col md:flex-row md:items-end gap-3 mb-6">
      <div class="flex-1">
        <label class="block text-sm text-gray-500 mb-1">城市</label>
        <input v-model="city" placeholder="如：杭州市" class="w-full h-11 px-3 rounded-btn border border-gray-200" />
      </div>
      <button @click="load(1)" class="h-11 px-4 rounded-btn bg-black text-white">筛选</button>
    </div>

    <div v-if="loading" class="space-y-3">
      <div v-for="n in 8" :key="n" class="h-12 bg-surfaceMuted rounded-card animate-pulse" />
    </div>

    <div v-else class="rounded-card border border-gray-100 overflow-hidden">
      <table class="min-w-full text-sm">
        <thead class="bg-surfaceMuted text-gray-500">
          <tr>
            <th class="text-left p-3">姓名</th>
            <th class="text-left p-3">积分</th>
            <th class="text-left p-3">最高分</th>
            <th class="text-left p-3">城市</th>
            <th class="text-left p-3">操作</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="u in list" :key="u.uid" class="border-t">
            <td class="p-3">{{ u.realname }}</td>
            <td class="p-3">{{ u.score }}</td>
            <td class="p-3">{{ u.maxscore }}</td>
            <td class="p-3">{{ u.residecity }}</td>
            <td class="p-3"><a :href="`/scores/${u.uid}`" class="text-brand-primary">详情</a></td>
          </tr>
          <tr v-if="!list.length">
            <td colspan="5" class="p-6 text-center text-gray-500">暂无数据</td>
          </tr>
        </tbody>
      </table>
      <div class="flex items-center justify-center py-6" v-if="hasMore">
        <button @click="load(page+1)" class="h-10 px-6 rounded-btn border border-gray-200">加载更多</button>
      </div>
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

const { $api } = useNuxtApp()

const load = async (p = 1) => {
  loading.value = true
  try {
    const res = await $api('/user/lists', { method: 'POST', body: { city: city.value, sort: 2, page: p, index: 0 } })
    const rows = res?.data?.data || []
    if (p === 1) list.value = rows; else list.value = list.value.concat(rows)
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

onMounted(async () => { await load(1) })
</script>


