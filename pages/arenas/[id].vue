<template>
  <div class="container py-8">
    <div v-if="loading">
      <div class="h-48 bg-surfaceMuted rounded-card animate-pulse" />
      <div class="grid md:grid-cols-3 gap-6 mt-6">
        <div class="md:col-span-2 space-y-3">
          <div v-for="n in 6" :key="n" class="h-10 bg-surfaceMuted rounded-card animate-pulse" />
        </div>
        <div class="space-y-3">
          <div v-for="n in 3" :key="n" class="h-20 bg-surfaceMuted rounded-card animate-pulse" />
        </div>
      </div>
    </div>

    <div v-else-if="detail">
      <div class="grid md:grid-cols-3 gap-6">
        <div class="md:col-span-2">
          <ImgFallback :src="detail.image" class="w-full h-56 object-cover rounded-card" />
          <h1 class="text-xl font-semibold mt-4">{{ detail.name }}</h1>
          <p class="text-gray-600 mt-1">{{ detail.address }}</p>
          <p class="text-gray-600">电话 {{ detail.mobile }}</p>

          <section class="mt-6">
            <h2 class="font-medium mb-2">简介</h2>
            <p class="text-gray-700 whitespace-pre-line">{{ detail.intro }}</p>
          </section>
        </div>

        <aside class="space-y-6">
          <div class="rounded-card border border-gray-100 p-4">
            <h3 class="font-medium">教练</h3>
            <ul class="mt-2 space-y-2">
              <li v-for="t in trainers" :key="t.uid" class="text-sm flex items-center justify-between">
                <span>{{ t.realname }}</span>
                <a :href="`/coaches/${t.uid}`" class="text-brand-primary">查看</a>
              </li>
              <li v-if="!trainers.length" class="text-gray-500 text-sm">暂无</li>
            </ul>
          </div>
          <div class="rounded-card border border-gray-100 p-4">
            <h3 class="font-medium">相关比赛</h3>
            <ul class="mt-2 space-y-2">
              <li v-for="m in matches" :key="m.eventid" class="text-sm flex items-center justify-between">
                <span class="line-clamp-1">{{ m.title }}</span>
                <a :href="`/matches/${m.eventid}`" class="text-brand-primary">详情</a>
              </li>
              <li v-if="!matches.length" class="text-gray-500 text-sm">暂无</li>
            </ul>
          </div>
        </aside>
      </div>
    </div>
    <div v-else class="text-center text-gray-500 py-10">未找到该球馆</div>
  </div>
</template>

<script setup>
useHead({
  title: '球馆详情'
})
const route = useRoute()
const id = computed(() => route.params.id)
const detail = ref(null)
const trainers = ref([])
const matches = ref([])
const loading = ref(true)
const { $api } = useNuxtApp()

const fetchAll = async () => {
  loading.value = true
  try {
    const [d, t, m] = await Promise.all([
      $api('/arena/detail', { method: 'GET', params: { id: id.value } }),
      $api('/arena/trainer_list', { method: 'POST', body: { id: id.value } }),
      $api('/arena/match_list', { method: 'POST', body: { id: id.value } })
    ])
    detail.value = d?.data || null
    trainers.value = t?.data?.data || []
    matches.value = m?.data?.data || []
  } catch (e) {
    detail.value = null
    trainers.value = []
    matches.value = []
  } finally {
    loading.value = false
  }
}

onMounted(fetchAll)
</script>

