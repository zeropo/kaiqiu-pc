<template>
  <div class="container pt-8 pb-10 md:pt-12 md:pb-16">
    <div class="mb-8 flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
      <div>
        <h1 class="font-display text-3xl font-bold text-text-main">搜索查询</h1>
        <p class="mt-2 text-text-muted">快速查询比赛、教练、球馆、积分和裁判信息</p>
      </div>

    </div>

    <section class="mb-10 rounded-card border border-border bg-white p-5 shadow-sm">
      <div class="flex flex-col gap-4">
        <SegmentTabs
          :model-value="activeTab"
          :tabs="tabs"
          wrapper-class="inline-flex w-auto self-start rounded-full bg-surfaceSoft p-1"
          button-base-class="relative z-10 rounded-full px-4 py-2.5 text-sm font-semibold whitespace-nowrap transition-colors duration-300"
          @update:model-value="handleTabChange"
        />

      </div>
    </section>

    <component :is="activeComponent" :key="activeTab" />
  </div>
</template>

<script setup>
import SearchArenaTab from '@/components/search/SearchArenaTab.vue'
import SearchCoachTab from '@/components/search/SearchCoachTab.vue'
import SearchMatchTab from '@/components/search/SearchMatchTab.vue'
import SearchScoreTab from '@/components/search/SearchScoreTab.vue'
import SearchUmpireTab from '@/components/search/SearchUmpireTab.vue'

useHead({
  title: '搜索查询'
})

const tabs = [
  { value: 'match', label: '比赛' },
  { value: 'coach', label: '教练' },
  { value: 'arena', label: '球馆' },
  { value: 'score', label: '积分' },
  { value: 'umpire', label: '裁判' }
]

const tabComponents = {
  match: SearchMatchTab,
  coach: SearchCoachTab,
  arena: SearchArenaTab,
  score: SearchScoreTab,
  umpire: SearchUmpireTab
}

const route = useRoute()
const router = useRouter()

const activeTab = ref(route.query.tab || 'match')

watch(
  () => route.query.tab,
  (tab) => {
    const next = tab || 'match'
    if (next !== activeTab.value) activeTab.value = next
  }
)

const handleTabChange = async (newTab) => {
  if (newTab === activeTab.value) return

  // 切换 Tab 时，先清空旧 Tab 的搜索参数，再挂载新的 Tab 组件。
  await router.replace({
    query: {
      tab: newTab
    }
  })
}

const activeComponent = computed(() => tabComponents[activeTab.value] || SearchMatchTab)
</script>
