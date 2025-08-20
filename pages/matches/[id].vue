<template>
  <div class="container py-8">
    <div v-if="loading">
      <div class="h-56 bg-surfaceMuted rounded-card animate-pulse" />
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
          <ImgFallback :src="detail.poster" class="w-full h-56 object-cover rounded-card" />
          <h1 class="text-xl font-semibold mt-4">{{ detail.title }}</h1>
          <p class="text-gray-600 mt-1">{{ detail.province }}{{ detail.city }} · {{ detail.arena_name }}</p>
          <p class="text-gray-600">开始 {{ detail.starttime }} · 截止 {{ detail.deadline }}</p>

          <section class="mt-6">
            <h2 class="font-medium mb-2">报名项目</h2>
            <div class="overflow-x-auto rounded-card border border-gray-100">
              <table class="min-w-full text-sm">
                <thead class="bg-surfaceMuted text-gray-500">
                  <tr>
                    <th class="text-left p-3">项目</th>
                    <th class="text-left p-3">条件</th>
                    <th class="text-left p-3">名额</th>
                    <th class="text-left p-3">费用</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="it in items" :key="it.id" class="border-t">
                    <td class="p-3">{{ it.name }}</td>
                    <td class="p-3">{{ it.condition }}</td>
                    <td class="p-3">{{ it.curr_count }}/{{ it.count }}</td>
                    <td class="p-3">￥{{ it.cost }}</td>
                  </tr>
                  <tr v-if="!items.length">
                    <td colspan="4" class="p-6 text-center text-gray-500">无项目</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          <section v-if="detail.detail" class="mt-6">
            <h2 class="font-medium mb-2">赛事详情</h2>
            <div class="prose max-w-none" v-html="decodedHtml"></div>
          </section>
        </div>

        <aside>
          <div class="rounded-card border border-gray-100 p-4">
            <h3 class="font-medium">举办球馆</h3>
            <p class="text-sm text-gray-600">{{ detail.arena_name }}</p>
            <a v-if="detail.shopid" :href="`/arenas/${detail.shopid}`" class="text-brand-primary text-sm mt-2 inline-block">查看球馆</a>
          </div>
        </aside>
      </div>
    </div>
    <div v-else class="text-center text-gray-500 py-10">未找到该赛事</div>
  </div>
</template>

<script setup>
useHead({
  title: '比赛详情'
})
const route = useRoute()
const id = computed(() => route.params.id)
const detail = ref(null)
const items = ref([])
const decodedHtml = ref('')
const { decode } = useHtmlDecode()
const loading = ref(true)
const { $api } = useNuxtApp()

const fetchDetail = async () => {
  loading.value = true
  try {
    const res = await $api('/enter/detail', { method: 'GET', params: { id: id.value } })
    detail.value = res?.data?.detail || null
    items.value = res?.data?.items || []
    decodedHtml.value = decode(res?.data?.detail?.detail || '')
  } catch (e) {
    detail.value = null
    items.value = []
    decodedHtml.value = ''
  } finally {
    loading.value = false
  }
}

onMounted(fetchDetail)


</script>

