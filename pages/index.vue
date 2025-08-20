<template>
  <div>
    <section class="bg-surfaceMuted">
      <div class="container py-10 md:py-14">
        <div class="flex flex-col md:flex-row md:items-center gap-4 md:gap-8">
          <div class="flex-1">
            <h1 class="text-2xl md:text-3xl font-semibold mb-2">开球网（网页版）</h1>
            <p class="text-gray-600">查询比赛、球馆、教练、裁判、积分与排行榜。</p>
          </div>
          <a href="/search" class="inline-flex items-center justify-center h-11 px-5 rounded-btn bg-brand-primary text-white shadow-card hover:shadow-cardHover transition">开始搜索</a>
        </div>
      </div>
    </section>

    <div class="container py-10 space-y-12">
      <section>
        <div class="flex items-center justify-between mb-4">
          <h2 class="text-lg font-semibold">近期赛事</h2>
          <a href="/matches" class="text-sm text-gray-500">更多</a>
        </div>
        <div v-if="loadingMatches" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div v-for="n in 4" :key="n" class="h-40 bg-surfaceMuted rounded-card animate-pulse" />
        </div>
        <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <MatchCard v-for="m in matches" :key="m.eventid" :match="m" />
        </div>
      </section>

      <section>
        <div class="flex items-center justify-between mb-4">
          <h2 class="text-lg font-semibold">热门选手</h2>
          <a href="/scores" class="text-sm text-gray-500">更多</a>
        </div>
        <div v-if="loadingUsers" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div v-for="n in 4" :key="n" class="h-24 bg-surfaceMuted rounded-card animate-pulse" />
        </div>
        <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <article v-for="u in users" :key="u.uid" class="rounded-card border border-gray-100 p-4">
            <div class="text-sm">
              <div class="font-medium">{{ u.realname }}</div>
              <div class="text-gray-500">
                积分 {{ u.score }}<template v-if="u.residecity"> · {{ u.residecity }}</template>
              </div>
            </div>
            <div class="flex items-center justify-between mt-3">
              <span class="text-xs text-gray-500">最高 {{ u.maxscore }}</span>
              <NuxtLink :to="`/scores/${u.uid}`" class="text-brand-primary text-sm">详情</NuxtLink>
            </div>
          </article>
        </div>
      </section>
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
const { city, lat, lng, tryGeolocation } = useCity()
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
onMounted(async () => { await Promise.all([loadMatches(), loadUsers()]) })
</script>

