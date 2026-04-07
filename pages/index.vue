<template>
  <div class="animate-fade-in">
    <!-- Hero Section -->
    <section class="relative overflow-hidden bg-white">
      <div class="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-brand-primaryHover/10 via-white to-white"></div>
      <div class="absolute -top-24 -right-24 w-96 h-96 bg-brand-primary/5 rounded-full blur-3xl"></div>
      
      <div class="container relative pt-20 pb-24 md:pt-32 md:pb-36 flex flex-col items-center md:items-start text-center md:text-left">
        <div class="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-brand-primary/10 text-brand-primary text-sm font-semibold mb-6">
          <span class="w-2 h-2 rounded-full bg-brand-primary animate-pulse"></span>
          网页版全新上线
        </div>
        <h1 class="font-display text-4xl md:text-6xl font-bold tracking-tight text-text-main mb-6 leading-tight max-w-2xl">
          精准连接赛事 <br/> <span class="bg-clip-text text-transparent bg-gradient-to-r from-brand-primary to-brand-primaryHover">随时掌控积分</span>
        </h1>
        <p class="text-text-muted text-lg md:text-xl max-w-xl mb-10 leading-relaxed">
          全网最快最全查询系统，覆盖全国比赛、优选球馆、教练与裁判，致力于为您提供最高效的体验。
        </p>
        <div class="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
          <a href="/search" class="inline-flex items-center justify-center h-14 px-8 rounded-btn bg-brand-primary text-white font-medium shadow-card hover:shadow-cardHover hover:-translate-y-0.5 transition-all text-lg w-full sm:w-auto">
            立即开始搜索
            <svg class="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>
          </a>
          <a href="/matches" class="inline-flex items-center justify-center h-14 px-8 rounded-btn bg-surfaceSoft text-text-main font-medium border border-border hover:bg-white hover:border-brand-primary hover:text-brand-primary transition-all text-lg w-full sm:w-auto">
            浏览近期赛事
          </a>
        </div>
      </div>
    </section>

    <!-- Content Sections -->
    <div class="bg-surfaceMuted py-16 md:py-24 space-y-20">
      <div class="container space-y-16">
        
        <!-- Recent Matches -->
        <section>
          <div class="flex items-end justify-between mb-8">
            <div>
              <h2 class="font-display text-2xl md:text-3xl font-bold text-text-main">近期赛事</h2>
              <p class="text-text-muted mt-2 hidden sm:block">发现并参与您身边的精彩对决</p>
            </div>
            <a href="/matches" class="group inline-flex items-center text-brand-primary font-medium hover:text-brand-primaryHover transition-colors">
              查看更多 
              <svg class="w-4 h-4 ml-1 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path></svg>
            </a>
          </div>

          <div v-if="loadingMatches" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div v-for="n in 4" :key="n" class="h-64 bg-white rounded-card shadow-sm animate-pulse border border-border" />
          </div>
          <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <MatchCard v-for="m in matches" :key="m.eventid" :match="m" />
          </div>
        </section>

        <!-- Popular Players -->
        <section>
          <div class="flex items-end justify-between mb-8">
            <div>
              <h2 class="font-display text-2xl md:text-3xl font-bold text-text-main">风云榜</h2>
              <p class="text-text-muted mt-2 hidden sm:block">展示近期活跃的热门选手</p>
            </div>
            <a href="/scores" class="group inline-flex items-center text-brand-primary font-medium hover:text-brand-primaryHover transition-colors">
              查看全部
              <svg class="w-4 h-4 ml-1 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path></svg>
            </a>
          </div>

          <div v-if="loadingUsers" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div v-for="n in 4" :key="n" class="h-32 bg-white rounded-card shadow-sm animate-pulse border border-border" />
          </div>
          <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <article v-for="u in users" :key="u.uid" class="group relative rounded-card bg-white border border-border p-5 shadow-card hover:shadow-cardHover hover:-translate-y-1 transition-all duration-smooth flex flex-col justify-between h-full">
              <div class="flex items-start gap-4">
                <div class="w-12 h-12 rounded-full bg-gradient-to-br from-surfaceSoft to-border flex-shrink-0 flex items-center justify-center font-bold text-brand-secondary text-lg shadow-inner">
                  {{ u.realname?.charAt(0) || 'K' }}
                </div>
                <div>
                  <h3 class="font-semibold text-text-main text-lg group-hover:text-brand-primary transition-colors">{{ u.realname }}</h3>
                  <div class="text-sm text-text-muted mt-0.5 flex items-center gap-1.5">
                    <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
                    {{ u.residecity || '未知城市' }}
                  </div>
                </div>
              </div>
              
              <div class="flex items-center justify-between mt-5 pt-4 border-t border-surfaceSoft">
                <div class="flex flex-col">
                  <span class="text-xs text-text-light uppercase tracking-wider">当前积分</span>
                  <span class="font-display font-bold text-brand-primary text-xl">{{ u.score }}</span>
                </div>
                <div class="flex flex-col items-end">
                  <span class="text-xs text-text-light uppercase tracking-wider">最高纪录</span>
                  <span class="font-medium text-text-main">{{ u.maxscore }}</span>
                </div>
              </div>
              <NuxtLink :to="`/scores/${u.uid}`" target="_blank" rel="noopener noreferrer" class="absolute inset-0 z-10">
                <span class="sr-only">选手详情</span>
              </NuxtLink>
            </article>
          </div>
        </section>

      </div>
    </div>
  </div>
</template>

<script setup>
// 首页直接显示"开球网"，不使用template
useHead({
  title: '开球网',
  titleTemplate: null
})

const { $api } = useNuxtApp()
const { city, lat, lng, switchVersion, tryGeolocation } = useCity()
const matches = ref([])
const users = ref([])
const loadingMatches = ref(true)
const loadingUsers = ref(true)

const loadMatches = async () => {
  loadingMatches.value = true
  try {
    const res = await $api('/match/lists', { method: 'POST', body: { city: city.value, lat: lat.value, lng: lng.value, page: 1, sort: 2 } })
    let matchList = res?.data?.data || []
    
    // 按距离升序排序（距离越近越前面）
    if (matchList.length > 0) {
      matchList.sort((a, b) => {
        const distanceA = parseFloat(a.distance) || Infinity
        const distanceB = parseFloat(b.distance) || Infinity
        return distanceA - distanceB
      })
    }
    
    matches.value = matchList.slice(0, 4)
  } catch (e) {
    matches.value = []
  } finally {
    loadingMatches.value = false
  }
}

const loadUsers = async () => {
  loadingUsers.value = true
  try {
    const res = await $api('/user/lists', { method: 'POST', body: { city: city.value, sort: 2, page: 1, index: 0 } })
    users.value = res?.data?.data?.slice(0, 4) || []
  } catch (e) {
    users.value = []
  } finally {
    loadingUsers.value = false
  }
}

// 首屏不主动请求定位，避免浏览器警告。仅加载数据，用户可在页面触发定位后刷新列表。
watch(switchVersion, async () => {
  await Promise.all([loadMatches(), loadUsers()])
})

onMounted(async () => { await Promise.all([loadMatches(), loadUsers()]) })
</script>
