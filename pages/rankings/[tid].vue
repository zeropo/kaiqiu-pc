<template>
  <div class="container py-8">
    <div class="flex flex-col md:flex-row md:items-end gap-3 mb-6">
      <div class="flex-1">
        <label class="block text-sm text-gray-500 mb-1">城市</label>
        <input v-model="city" placeholder="可选，如：杭州市" class="w-full h-11 px-3 rounded-btn border border-gray-200" />
      </div>
      <button @click="load()" class="h-11 px-4 rounded-btn bg-black text-white">筛选</button>
    </div>

    <div v-if="loading" class="space-y-3">
      <div v-for="n in 8" :key="n" class="h-12 bg-surfaceMuted rounded-card animate-pulse" />
    </div>

    <div v-else>
      <h1 class="text-xl font-semibold mb-4">{{ title }}</h1>
      <div class="rounded-card border border-gray-100 overflow-hidden">
        <table class="min-w-full text-sm">
          <thead class="bg-surfaceMuted text-gray-500">
            <tr>
              <th class="text-left p-3">排名</th>
              <th class="text-left p-3">姓名</th>
              <th class="text-left p-3">{{ th || '分值' }}</th>
              <th class="text-left p-3">操作</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(u, i) in list" :key="u.uid" class="border-t">
              <td class="p-3">{{ i + 1 }}</td>
              <td class="p-3">{{ u.realname }}</td>
              <td class="p-3">{{ u.score }}</td>
              <td class="p-3"><a :href="`/scores/${u.uid}`" class="text-brand-primary">详情</a></td>
            </tr>
            <tr v-if="!list.length">
              <td colspan="4" class="p-6 text-center text-gray-500">暂无数据</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup>
useHead({
  title: '排行榜详情'
})
const route = useRoute()
const tid = computed(() => route.params.tid)
const city = ref('')
const title = ref('')
const th = ref('')
const list = ref([])
const loading = ref(true)
const { $api } = useNuxtApp()

const load = async () => {
  loading.value = true
  try {
    const res = await $api('/Top/getTop100Data', { method: 'GET', params: { tid: tid.value, city: city.value || undefined } })
    title.value = res?.data?.title || ''
    th.value = res?.data?.th || ''
    list.value = res?.data?.list || []
  } catch (e) {
    list.value = []
  } finally {
    loading.value = false
  }
}

onMounted(load)
</script>

