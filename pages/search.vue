<template>
  <div class="container py-10 md:py-16">
    <div class="mb-8 flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
      <div>
        <h1 class="font-display text-3xl font-bold text-text-main">搜索查询</h1>
        <p class="mt-2 text-text-muted">在同一页面快速查询比赛、教练、球馆、积分和裁判信息</p>
      </div>

    </div>

    <section class="mb-10 rounded-card border border-border bg-white p-5 shadow-sm">
      <div class="flex flex-col gap-4">
        <SegmentTabs
          :model-value="activeTab"
          :tabs="tabs"
          wrapper-class="inline-flex w-auto self-start rounded-full bg-surfaceSoft p-1"
          button-base-class="relative z-10 rounded-full px-4 py-2.5 text-sm font-semibold whitespace-nowrap transition-colors duration-300"
          @update:model-value="activeTab = $event"
        />

        <div class="flex flex-col gap-3 rounded-2xl bg-surfaceSoft/50 px-4 py-3 md:flex-row md:items-center md:justify-between">
          <div class="space-y-1">
            <p class="text-sm font-semibold text-text-main">{{ activeTabMeta.label }}搜索</p>
            <p class="text-sm text-text-muted">{{ activeTabMeta.description }}</p>
          </div>

          <div class="inline-flex items-center gap-2 self-start rounded-full bg-white px-3 py-1.5 text-xs font-medium text-brand-primary">
            <span class="h-2 w-2 rounded-full bg-[#39b54a]"></span>
            结果支持继续翻页加载
          </div>
        </div>
      </div>
    </section>

    <KeepAlive>
      <component :is="activeComponent" :key="activeTab" />
    </KeepAlive>
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
  { value: 'match', label: '比赛', description: '按标题、日期、城市、距离和标签组合筛选赛事。' },
  { value: 'coach', label: '教练', description: '支持教练姓名或证书编号搜索，并保留距离、浏览和推荐信息。' },
  { value: 'arena', label: '球馆', description: '按球馆名称搜索附近结果，展示地址、浏览量和评论数。' },
  { value: 'score', label: '积分', description: '按姓名搜索用户积分，结果直接沿用积分列表字段。' },
  { value: 'umpire', label: '裁判', description: '按当前城市搜索裁判，保留姓名、性别、年龄与级别信息。' }
]

const tabComponents = {
  match: SearchMatchTab,
  coach: SearchCoachTab,
  arena: SearchArenaTab,
  score: SearchScoreTab,
  umpire: SearchUmpireTab
}

const activeTab = ref('match')

const activeTabMeta = computed(() => {
  return tabs.find((tab) => tab.value === activeTab.value) || tabs[0]
})
const activeComponent = computed(() => tabComponents[activeTab.value] || SearchMatchTab)
</script>
