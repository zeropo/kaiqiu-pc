<template>
  <div class="container py-8">
    <div class="max-w-2xl mx-auto">
      <div class="flex items-center gap-2">
        <input v-model="q" type="search" placeholder="搜索选手姓名"
               class="flex-1 h-11 px-4 rounded-btn border border-gray-200 outline-none focus:ring-2 focus:ring-brand-primary/30" />
        <button @click="doSearch" class="h-11 px-4 rounded-btn bg-black text-white">搜索</button>
      </div>

      <div class="mt-8" v-if="loading">
        <div class="space-y-3">
          <div v-for="n in 6" :key="n" class="h-12 bg-surfaceMuted rounded-card animate-pulse" />
        </div>
      </div>

      <div class="mt-8" v-else>
        <h2 class="text-sm text-gray-500 mb-2" v-if="q">“{{ q }}” 的搜索结果</h2>
        <ul class="divide-y divide-gray-100 rounded-card border border-gray-100">
          <li v-for="u in list" :key="u.uid" class="p-4 flex items-center justify-between">
            <div class="text-sm">
              <div class="font-medium">{{ u.realname || u.username2 }}</div>
              <div class="text-gray-500">积分 {{ u.score }} · {{ u.residecity }}</div>
            </div>
            <a :href="`/scores/${u.uid}`" class="text-brand-primary text-sm">查看</a>
          </li>
          <li v-if="!list.length" class="p-6 text-center text-gray-500">暂无数据</li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script setup>
useHead({
  title: '搜索'
})

const q = ref('')
const list = ref([])
const loading = ref(true)
const timer = ref(null)

const { $api } = useNuxtApp()

const fetchHot = async () => {
  loading.value = true
  try {
    const res = await $api('/user/hotlists', { method: 'POST' })
    list.value = res?.data || []
  } catch (e) {
    list.value = []
  } finally {
    loading.value = false
  }
}

onMounted(fetchHot)

const doSearch = async () => {
  loading.value = true
  try {
    const res = await $api('/user/lists', { method: 'GET', params: { key: q.value, page: 1 } })
    const data = res?.data?.data || []
    list.value = data
  } catch (e) {
    list.value = []
  } finally {
    loading.value = false
  }
}

watch(q, (val) => {
  clearTimeout(timer.value)
  if (!val) return fetchHot()
  timer.value = setTimeout(() => doSearch(), 500)
})
</script>

