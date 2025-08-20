<template>
  <div class="container py-8">
    <div class="flex flex-col md:flex-row md:items-end gap-3 mb-6">
      <div class="flex-1">
        <label class="block text-sm text-gray-500 mb-1">城市</label>
        <input v-model="city" placeholder="如：杭州市" class="w-full h-11 px-3 rounded-btn border border-gray-200" />
      </div>
      <button @click="load(1)" class="h-11 px-4 rounded-btn bg-black text-white">筛选</button>
    </div>

    <div v-if="loading" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      <div v-for="n in 6" :key="n" class="h-44 bg-surfaceMuted rounded-card animate-pulse" />
    </div>

    <div v-else>
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <ArenaCard v-for="a in list" :key="a.id" :arena="a" />
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
  title: '球馆列表'
})

const { city, lat, lng } = useCity()
const page = ref(1)
const list = ref([])
const hasMore = ref(false)
const loading = ref(true)

const { $api } = useNuxtApp()

const load = async (p = 1) => {
  loading.value = true
  try {
    const res = await $api('/arena/lists', { method: 'POST', body: { city: city.value, lat: lat.value, lng: lng.value, page: p } })
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

