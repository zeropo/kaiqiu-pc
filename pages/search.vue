<template>
  <div class="pb-12 md:pb-16">
    <section class="relative overflow-hidden bg-white">
      <div class="absolute inset-x-0 top-0 h-full bg-[linear-gradient(135deg,rgba(255,186,87,0.22),rgba(255,255,255,0.92)_42%,rgba(230,247,234,0.68)_100%)]"></div>
      <div class="absolute right-0 top-0 h-60 w-60 rounded-full bg-[#ffedd2] blur-3xl"></div>
      <div class="absolute left-0 top-20 h-44 w-44 rounded-full bg-[#e3f7e7] blur-3xl"></div>

      <div class="container relative py-10 md:py-14">
        <div class="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px] lg:items-end">
          <div>
            <div class="inline-flex items-center gap-2 rounded-full bg-[#fff6e8] px-4 py-2 text-sm font-semibold text-[#a06100]">
              <span class="h-2 w-2 rounded-full bg-[#ff9f0a]"></span>
              搜索查询
            </div>
            <h1 class="mt-5 font-display text-4xl font-bold leading-tight text-text-main md:text-5xl">
              一页完成比赛、教练、球馆、积分和裁判搜索
            </h1>
            <p class="mt-4 max-w-3xl text-base leading-8 text-text-muted md:text-lg">
              搜索页已按五个独立查询面板重构。除积分搜索外，其余搜索会自动带上当前位置的经纬度，
              方便直接计算赛事、教练、球馆与裁判的距离相关结果。
            </p>
          </div>

          <div class="rounded-[28px] border border-white/80 bg-white/85 p-5 shadow-card backdrop-blur">
            <p class="text-sm text-text-muted">当前定位城市</p>
            <p class="mt-2 text-3xl font-bold text-text-main">{{ locationLabel }}</p>
            <p class="mt-3 text-sm leading-6 text-text-muted">
              当前城市会作为比赛和裁判搜索的默认城市来源，也会参与距离排序与附近结果计算。
            </p>
          </div>
        </div>
      </div>
    </section>

    <div class="container relative z-10 -mt-4 md:-mt-6">
      <section class="rounded-[28px] border border-border bg-white/95 p-4 shadow-card backdrop-blur md:p-6">
        <SegmentTabs
          :model-value="activeTab"
          :tabs="tabs"
          variant="underline"
          wrapper-class="inline-flex w-full items-center gap-6 overflow-x-auto border-b border-[#1f2937]/10 bg-transparent"
          button-base-class="relative z-10 shrink-0 px-1 pb-4 pt-1 text-left text-xl font-semibold tracking-tight transition-colors duration-300 sm:text-2xl"
          active-button-class="text-[#ff9f0a]"
          inactive-button-class="text-text-main/70 hover:text-text-main"
          @update:model-value="activeTab = $event"
        />

        <div class="mt-4 flex flex-col gap-3 border-b border-border/70 pb-4 text-sm text-text-muted md:flex-row md:items-center md:justify-between">
          <p>{{ activeTabMeta.description }}</p>
          <div class="inline-flex items-center gap-2 rounded-full bg-[#fff6e8] px-3 py-1.5 text-xs font-medium text-[#a06100]">
            <span class="h-2 w-2 rounded-full bg-[#39b54a]"></span>
            结果支持继续翻页加载
          </div>
        </div>

        <div class="mt-6">
          <KeepAlive>
            <component :is="activeComponent" :key="activeTab" />
          </KeepAlive>
        </div>
      </section>
    </div>
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

const { city } = useCity()

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

const locationLabel = computed(() => city.value || '杭州市')
const activeTabMeta = computed(() => {
  return tabs.find((tab) => tab.value === activeTab.value) || tabs[0]
})
const activeComponent = computed(() => tabComponents[activeTab.value] || SearchMatchTab)
</script>
