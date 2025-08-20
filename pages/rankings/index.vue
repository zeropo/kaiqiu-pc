<template>
  <div class="container py-8">
    <div v-if="loading" class="space-y-3">
      <div v-for="n in 6" :key="n" class="h-12 bg-surfaceMuted rounded-card animate-pulse" />
    </div>
    <ul v-else class="divide-y divide-gray-100 rounded-card border border-gray-100 overflow-hidden">
      <li v-for="t in list" :key="t.tid" class="p-4 flex items-center justify-between">
        <div>
          <div class="font-medium">{{ t.name }}</div>
          <div class="text-sm text-gray-500">{{ t.desc }}</div>
        </div>
        <a :href="`/rankings/${t.tid}`" class="text-brand-primary text-sm">查看</a>
      </li>
      <li v-if="!list.length" class="p-6 text-center text-gray-500">暂无数据</li>
    </ul>
  </div>
</template>

<script setup>
useHead({
  title: '排行榜'
})
const loading = ref(true)
const list = ref([])
const { $api } = useNuxtApp()

const load = async () => {
  loading.value = true
  try {
    const res = await $api('/Top/lists', { method: 'POST' })
    list.value = res?.data?.data || []
  } catch (e) {
    list.value = []
  } finally {
    loading.value = false
  }
}

onMounted(load)
</script>

