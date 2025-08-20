<template>
  <div class="container py-8">
    <div v-if="loading">
      <div class="h-56 bg-surfaceMuted rounded-card animate-pulse" />
      <div class="space-y-3 mt-6">
        <div v-for="n in 6" :key="n" class="h-10 bg-surfaceMuted rounded-card animate-pulse" />
      </div>
    </div>

    <div v-else-if="detail">
      <div class="flex items-center gap-4">
        <ImgFallback :src="detail.image || detail.portrait" class="w-24 h-24 rounded-full object-cover" />
        <div>
          <h1 class="text-xl font-semibold">{{ detail.realname }}</h1>
          <p class="text-gray-600">级别 {{ detail.level }} · {{ detail.city }}</p>
        </div>
      </div>
      <section class="mt-6">
        <h2 class="font-medium mb-2">执裁赛事</h2>
        <ul class="space-y-2">
          <li v-for="e in detail.events || []" :key="e.title" class="text-sm text-gray-700">
            {{ e.title }}
          </li>
          <li v-if="!(detail.events || []).length" class="text-gray-500 text-sm">暂无</li>
        </ul>
      </section>
    </div>
    <div v-else class="text-center text-gray-500 py-10">未找到该裁判</div>
  </div>
</template>

<script setup>
useHead({
  title: '裁判详情'
})
const route = useRoute()
const id = computed(() => route.params.id)
const detail = ref(null)
const loading = ref(true)
const { $api } = useNuxtApp()

const fetchDetail = async () => {
  loading.value = true
  try {
    const res = await $api('/Trainer/detail', { method: 'GET', params: { id: id.value, ump: 1 } })
    detail.value = res?.data || null
  } catch (e) {
    detail.value = null
  } finally {
    loading.value = false
  }
}

onMounted(fetchDetail)
</script>

