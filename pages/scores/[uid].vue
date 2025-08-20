<template>
  <div class="container py-8">
    <div v-if="loading">
      <div class="h-24 bg-surfaceMuted rounded-card animate-pulse" />
      <div class="grid md:grid-cols-3 gap-6 mt-6">
        <div class="md:col-span-2 space-y-3">
          <div v-for="n in 6" :key="n" class="h-10 bg-surfaceMuted rounded-card animate-pulse" />
        </div>
        <div class="space-y-3">
          <div v-for="n in 6" :key="n" class="h-10 bg-surfaceMuted rounded-card animate-pulse" />
        </div>
      </div>
    </div>

    <div v-else-if="profile">
      <section class="flex items-center gap-4">
        <NuxtImg :src="profile.realpic" class="w-20 h-20 rounded-full object-cover" />
        <div>
          <h1 class="text-xl font-semibold">{{ profile.realname || profile.username }}</h1>
          <p class="text-gray-600">积分 {{ profile.score }} · 最高 {{ profile.maxscore }}</p>
        </div>
      </section>

      <section class="mt-6">
        <h2 class="font-medium mb-2">积分走势</h2>
        <div class="h-48 rounded-card border border-gray-100 flex items-end gap-1 p-2">
          <div v-for="(p, i) in scores" :key="i" class="bg-brand-primary/60" :style="{ height: barHeight(p.postscore) }" style="width: 6px"></div>
        </div>
      </section>

      <section class="mt-6">
        <h2 class="font-medium mb-2">近期战绩</h2>
        <div class="rounded-card border border-gray-100 overflow-hidden">
          <table class="min-w-full text-sm">
            <thead class="bg-surfaceMuted text-gray-500">
              <tr>
                <th class="text-left p-3">日期</th>
                <th class="text-left p-3">对手</th>
                <th class="text-left p-3">比分</th>
                <th class="text-left p-3">增分</th>
                <th class="text-left p-3">赛事</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="g in games" :key="g.gameid" class="border-t">
                <td class="p-3">{{ g.dateline }}</td>
                <td class="p-3">{{ g.username1 }} vs {{ g.username2 }}</td>
                <td class="p-3">{{ g.result1 }}:{{ g.result2 }}</td>
                <td class="p-3">{{ g.score1 }}</td>
                <td class="p-3"><NuxtLink :to="`/matches/${g.eventid}`" class="text-brand-primary">查看赛事</NuxtLink></td>
              </tr>
              <tr v-if="!games.length">
                <td colspan="5" class="p-6 text-center text-gray-500">暂无数据</td>
              </tr>
            </tbody>
          </table>
          <div class="flex items-center justify-center py-6" v-if="gamesHasMore">
            <button @click="loadGames(gamePage+1)" class="h-10 px-6 rounded-btn border border-gray-200">加载更多</button>
          </div>
        </div>
      </section>
    </div>
    <div v-else class="text-center text-gray-500 py-10">未找到该选手</div>
  </div>
</template>

<script setup>
useHead({
  title: '积分详情'
})
const route = useRoute()
const uid = computed(() => route.params.uid)
const profile = ref(null)
const scores = ref([])
const games = ref([])
const gamePage = ref(1)
const gamesHasMore = ref(false)
const loading = ref(true)
const { $api } = useNuxtApp()

const fetchProfile = () => $api('/user/adv_profile', { method: 'GET', params: { uid: uid.value } })
// const fetchScores = () => $api('/user/getUserScores', { method: 'GET', params: { uid: uid.value } })
const fetchGames = (p=1) => $api('/user/getGames', { method: 'GET', params: { uid: uid.value, page: p } })

const loadAll = async () => {
  loading.value = true
  try {
    const [p, g] = await Promise.all([fetchProfile(), fetchGames(1)])
    profile.value = p?.data || null
    scores.value = []
    const pg = g?.data
    games.value = pg?.data || []
    gamePage.value = pg?.current_page || 1
    gamesHasMore.value = pg?.current_page < pg?.last_page
  } catch (e) {
    profile.value = null
    scores.value = []
    games.value = []
    gamesHasMore.value = false
  } finally {
    loading.value = false
  }
}

const loadGames = async (p) => {
  try {
    const res = await fetchGames(p)
    const pg = res?.data
    games.value = games.value.concat(pg?.data || [])
    gamePage.value = pg?.current_page || p
    gamesHasMore.value = pg?.current_page < pg?.last_page
  } catch (e) {}
}

onMounted(loadAll)

const barHeight = (score) => {
  const s = Number(score || 0)
  const min = 1000, max = 3000
  const h = Math.max(0, Math.min(1, (s - min) / (max - min)))
  return `${Math.round(16 + h * 160)}px`
}
</script>


