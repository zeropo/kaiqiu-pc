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

      <div
        v-if="hasMore"
        ref="loadMoreSentinel"
        class="h-px w-full opacity-0 pointer-events-none"
        aria-hidden="true"
      ></div>
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
    const res = await $api('/arena/lists', { method: 'POST', body: { city: city.value, lat: lat.value, lng: lng.value, page: p } })
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
