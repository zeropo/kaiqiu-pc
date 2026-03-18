<template>
  <div class="container py-10">
    <div v-if="loading" class="animate-pulse">
      <div class="h-64 bg-white rounded-card border border-border mb-8" />
      <div class="grid lg:grid-cols-3 gap-8">
        <div class="lg:col-span-2 space-y-6">
          <div class="h-40 bg-white rounded-card border border-border" />
          <div class="h-96 bg-white rounded-card border border-border" />
        </div>
        <div>
          <div class="h-32 bg-white rounded-card border border-border" />
        </div>
      </div>
    </div>

    <div v-else-if="detail">
      <!-- Full-width hero banner for the poster -->
      <div class="w-full bg-white rounded-card shadow-sm border border-border overflow-hidden mb-8">
        <div class="w-full relative bg-surfaceMuted aspect-video md:aspect-[21/9] flex items-center justify-center">
          <!-- Using object-contain prevents stretching and cutting off text -->
          <ImgFallback :src="detail.poster" class="w-full h-full object-contain backdrop-blur-sm" />
        </div>
        <div class="p-6 md:p-8">
          <div class="inline-flex items-center gap-2 px-3 py-1 bg-brand-primary/10 text-brand-primary text-xs font-semibold rounded-md mb-4 uppercase tracking-wider">
            赛事详情
          </div>
          <h1 class="text-2xl md:text-3xl font-display font-bold text-text-main mb-4 leading-snug">{{ detail.title }}</h1>
          
          <div class="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-6 text-text-muted text-sm border-t border-surfaceSoft pt-5 mt-2">
            <div class="flex items-center gap-2">
              <svg class="w-4 h-4 text-brand-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path></svg>
              <span>{{ detail.province }}{{ detail.city }} · {{ detail.arena_name }}</span>
            </div>
            <div class="hidden sm:block w-1 h-1 rounded-full bg-border"></div>
            <div class="flex items-center gap-2">
              <svg class="w-4 h-4 text-brand-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
              <span>{{ detail.starttime }} 开始  ——  {{ detail.deadline }} 截止</span>
            </div>
          </div>
        </div>
      </div>

      <div class="grid lg:grid-cols-3 gap-8">
        <div class="lg:col-span-2 space-y-8">
          
          <section class="bg-white rounded-card shadow-sm border border-border p-6 md:p-8">
            <h2 class="font-display text-xl font-bold text-text-main mb-6 flex items-center gap-2 border-l-4 border-brand-primary pl-3">
              报名项目
            </h2>
            <div class="overflow-x-auto rounded-xl border border-border">
              <table class="min-w-full text-sm text-left">
                <thead class="bg-surfaceSoft text-text-muted">
                  <tr>
                    <th class="p-4 font-medium">项目</th>
                    <th class="p-4 font-medium">条件</th>
                    <th class="p-4 font-medium">名额</th>
                    <th class="p-4 font-medium">费用</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-border">
                  <tr v-for="it in items" :key="it.id" class="hover:bg-surfaceMuted transition-colors">
                    <td class="p-4 font-medium text-text-main">{{ it.name }}</td>
                    <td class="p-4 text-text-muted">{{ it.condition }}</td>
                    <td class="p-4 text-text-muted">
                      <span class="text-brand-primary font-medium">{{ it.curr_count }}</span> / {{ it.count }}
                    </td>
                    <td class="p-4 font-medium text-text-main">￥{{ it.cost }}</td>
                  </tr>
                  <tr v-if="!items.length">
                    <td colspan="4" class="p-8 text-center text-text-muted">当前暂无项目</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          <section v-if="detail.detail" class="bg-white rounded-card shadow-sm border border-border p-6 md:p-8">
            <h2 class="font-display text-xl font-bold text-text-main mb-6 flex items-center gap-2 border-l-4 border-brand-primary pl-3">
              赛事详情
            </h2>
            <!-- Fixed prose images: prose-img forces width and prose-p ensures centering -->
            <div class="prose max-w-none prose-img:w-full prose-img:max-w-3xl prose-img:mx-auto prose-img:rounded-xl prose-img:shadow-sm prose-p:leading-relaxed prose-headings:font-display prose-a:text-brand-primary" v-html="decodedHtml"></div>
          </section>

        </div>

        <aside class="space-y-6">
          <div class="bg-white rounded-card shadow-sm border border-border p-6">
            <h3 class="font-display text-lg font-bold text-text-main mb-4 border-b border-surfaceSoft pb-3">举办球馆</h3>
            <div class="flex items-start gap-4">
              <div class="w-12 h-12 rounded-full bg-brand-primary/10 flex items-center justify-center text-brand-primary shrink-0">
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path></svg>
              </div>
              <div>
                <p class="font-medium text-text-main text-base">{{ detail.arena_name }}</p>
                <a v-if="detail.shopid" :href="`/arenas/${detail.shopid}`" class="inline-flex items-center text-brand-primary text-sm mt-3 hover:text-brand-primaryHover font-medium transition-colors">
                  查看球馆主页
                  <svg class="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path></svg>
                </a>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </div>

    <div v-else class="flex flex-col items-center justify-center py-32 bg-white rounded-card border border-border shadow-sm">
      <div class="w-20 h-20 bg-surfaceSoft rounded-full flex items-center justify-center mb-4">
        <svg class="w-10 h-10 text-text-light" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
      </div>
      <p class="text-text-muted text-lg font-medium">未找到该赛事信息</p>
      <a href="/matches" class="mt-6 px-6 py-2 rounded-btn bg-brand-primary text-white font-medium hover:bg-brand-primaryHover transition-colors">
        返回比赛列表
      </a>
    </div>
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
const { lat, lng } = useCity()
const loading = ref(true)
const { $api } = useNuxtApp()

const fetchDetail = async () => {
  loading.value = true
  try {
    const res = await $api('/enter/detail', {
      method: 'GET',
      params: {
        id: id.value,
        lat: lat.value,
        lng: lng.value
      }
    })
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
