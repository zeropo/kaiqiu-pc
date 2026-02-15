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
        <ImgFallback :src="detail.portrait" class="w-24 h-24 rounded-full object-cover" />
        <div>
          <h1 class="text-xl font-semibold">{{ detail.realname }}</h1>
          <p class="text-gray-600">{{ detail.city }} · {{ detail.arena_name }}</p>
          <p class="text-gray-600">课价 ￥{{ detail.price }} ｜ 时间 {{ detail.schedule }}</p>
        </div>
      </div>
      <section class="mt-6">
        <h2 class="font-medium mb-2">简介</h2>
        <p class="text-gray-700 whitespace-pre-line">{{ detail.description }}</p>
      </section>
    </div>
    <div v-else class="text-center text-gray-500 py-10">未找到该教练</div>
  </div>
</template>

<script setup>
useHead({
  title: '教练详情'
})
const route = useRoute()
const id = computed(() => route.params.id)
const detail = ref(null)
const loading = ref(true)
const { $api } = useNuxtApp()

const fetchDetail = async () => {
  loading.value = true
  try {
    const res = await $api('/Trainer/detail', { method: 'GET', params: { id: id.value, ump: 0 } })
    detail.value = res?.data || null
  } catch (e) {
    detail.value = null
  } finally {
    loading.value = false
  }
}

onMounted(fetchDetail)
</script>

