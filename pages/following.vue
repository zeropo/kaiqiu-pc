<template>
  <div class="container pt-8 pb-10 md:pt-12 md:pb-16">
    <div class="mb-8 flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
      <div>
        <h1 class="font-display text-3xl font-bold text-text-main">我的关注</h1>
        <p class="mt-2 text-text-muted">进入页面后直接请求关注接口，有数据先按积分列表方式展示</p>
      </div>
    </div>

    <div class="mb-10 rounded-card border border-border bg-white p-5 shadow-sm">
      <SegmentTabs
        :model-value="activeTab"
        :tabs="tabs"
        wrapper-class="inline-flex w-auto self-start rounded-full bg-surfaceSoft p-1"
        button-base-class="relative z-10 rounded-full px-4 py-2.5 text-sm font-semibold whitespace-nowrap transition-colors duration-300"
        @update:model-value="changeTab"
      />
    </div>

    <div v-if="loading" class="space-y-4">
      <div v-for="n in 8" :key="n" class="h-16 rounded-xl border border-border bg-white animate-pulse" />
    </div>

    <div v-else class="overflow-hidden rounded-card border border-border bg-white shadow-sm">
      <div class="overflow-x-auto">
        <table class="min-w-full whitespace-nowrap text-left text-sm">
          <thead class="border-b border-border bg-surfaceSoft font-medium text-text-muted">
            <tr>
              <th class="px-6 py-4 rounded-tl-card">序号</th>
              <th class="px-6 py-4">名称</th>
              <th class="px-6 py-4">昵称/类型</th>
              <th class="px-6 py-4">当前积分/状态</th>
              <th class="px-6 py-4">最高积分/时间</th>
              <th class="px-6 py-4">性别/城市</th>
              <th class="px-6 py-4">来源接口</th>
              <th class="px-6 py-4 rounded-tr-card text-center">操作</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-border">
            <tr v-for="(item, index) in list" :key="`${activeTab}-${rowKey(item, index)}`" class="group transition-colors hover:bg-surfaceMuted">
              <td class="px-6 py-4 font-display font-semibold text-text-muted">{{ index + 1 }}</td>
              <td class="px-6 py-4 font-medium text-text-main">
                <component
                  :is="detailLink(item) ? 'NuxtLink' : 'span'"
                  :to="detailLink(item)"
                  class="transition-colors hover:text-brand-primary"
                >
                  {{ displayName(item) }}
                </component>
              </td>
              <td class="px-6 py-4 text-text-muted">{{ displayAlias(item) }}</td>
              <td class="px-6 py-4 text-base font-display font-bold text-brand-primary">{{ displayScore(item) }}</td>
              <td class="px-6 py-4 text-text-muted">{{ displayExtra(item) }}</td>
              <td class="px-6 py-4 text-text-muted">{{ displayMeta(item) }}</td>
              <td class="px-6 py-4 text-text-muted">{{ sourceLabel || '-' }}</td>
              <td class="px-6 py-4 text-center">
                <NuxtLink v-if="detailLink(item)" :to="detailLink(item)" class="inline-block font-medium text-brand-primary hover:text-brand-primaryHover">
                  <span class="relative inline-block">
                    详情
                    <svg class="absolute left-full top-1/2 ml-1 h-4 w-4 -translate-y-1/2 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path></svg>
                  </span>
                </NuxtLink>
                <span v-else class="text-text-light">-</span>
              </td>
            </tr>
            <tr v-if="!list.length">
              <td colspan="8" class="px-6 py-16 text-center text-text-muted">暂无关注数据</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup>
useHead({
  title: '我的关注'
})

const route = useRoute()
const router = useRouter()
const { $api } = useNuxtApp()

const tabs = [
  { value: 'player', label: '关注选手' },
  { value: 'match', label: '关注比赛' }
]

const normalizeActiveTab = (value) => value === 'match' ? 'match' : 'player'
const activeTab = ref(normalizeActiveTab(route.query.tab))
const loading = ref(true)
const list = ref([])
const sourceLabel = ref('')

const syncQuery = async () => {
  const nextQuery = { ...route.query, tab: activeTab.value }
  if (route.query.tab === nextQuery.tab) return
  await router.replace({ query: nextQuery })
}

const load = async () => {
  loading.value = true
  try {
    const res = await $api('/following/lists', {
      method: 'POST',
      body: {
        type: activeTab.value,
        page: 1
      }
    })
    list.value = Array.isArray(res?.data?.data) ? res.data.data : []
    sourceLabel.value = res?.data?.source || ''
  } catch (error) {
    list.value = []
    sourceLabel.value = ''
  } finally {
    loading.value = false
  }
}

const changeTab = async (tab) => {
  if (tab === activeTab.value) return
  activeTab.value = tab
  await syncQuery()
  await load()
}

const rowKey = (item, index) => item.uid || item.user_id || item.eventid || item.id || item.match_id || index
const displayName = (item) => item.realname || item.username || item.title || item.name || item.match_name || '-'
const displayAlias = (item) => item.username2 || item.nickname || item.type || item.matchtype || '-'
const displayScore = (item) => item.score || item.status || item.maxscore || item.dateline || '-'
const displayExtra = (item) => item.maxscore || item.time || item.matchtime || item.createtime || '-'
const displayMeta = (item) => {
  const sex = String(item.sex || '') === '1' ? '男' : String(item.sex || '') === '2' ? '女' : ''
  const city = item.residecity || item.city || item.address || ''
  return [sex, city].filter(Boolean).join(' / ') || '-'
}
const detailLink = (item) => {
  if (activeTab.value === 'player' && (item.uid || item.user_id)) return { path: `/scores/${item.uid || item.user_id}`, query: route.query }
  if (activeTab.value === 'match' && (item.eventid || item.id || item.match_id)) return { path: `/matches/${item.eventid || item.id || item.match_id}`, query: route.query }
  return null
}

onMounted(async () => {
  await syncQuery()
  await load()
})
</script>
