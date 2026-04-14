<template>
  <div class="container pt-8 pb-10">
    <div v-if="loading" class="animate-pulse">
      <div class="h-64 bg-white rounded-card border border-border mb-8" />
      <div class="h-16 bg-white rounded-card border border-border mb-6" />
      <div class="space-y-6">
        <div class="h-64 bg-white rounded-card border border-border" />
        <div class="h-96 bg-white rounded-card border border-border" />
      </div>
    </div>

    <div v-else-if="detail">
      <div class="w-full bg-white rounded-card shadow-sm border border-border overflow-hidden mb-8">
        <div class="w-full relative h-[280px] sm:h-[360px] md:h-[420px] lg:h-[460px] flex items-center justify-center overflow-hidden bg-gray-900">
          <ImgFallback :src="detail.poster" class="absolute inset-0 w-full h-full object-cover blur-3xl opacity-50 scale-125 saturate-150" />
          <div class="absolute inset-0 bg-gradient-to-t from-gray-900/80 via-gray-900/20 to-gray-900/40"></div>
          <ImgFallback :src="detail.poster" class="relative z-10 w-full h-[85%] md:h-[90%] object-contain drop-shadow-2xl rounded-sm" />
        </div>

          <div class="p-6 md:p-8">
            <h1 class="text-2xl md:text-3xl font-display font-bold text-text-main mb-4 leading-snug">
              {{ detail.title }}
            </h1>

          <p v-if="detail.note" class="max-w-4xl text-sm md:text-base text-text-muted leading-relaxed">
            {{ detail.note }}
          </p>

          <div class="mt-6 grid items-start gap-5 md:grid-cols-2 md:gap-6 xl:grid-cols-4 xl:gap-8">
            <div class="rounded-2xl border border-border bg-surfaceSoft/40 p-4">
              <p class="text-sm font-semibold uppercase tracking-[0.16em] text-text-light">报名时间</p>
              <p class="mt-3 text-sm font-semibold leading-6 text-text-main">{{ registrationTimeText }}</p>
              <p class="mt-2 text-sm text-text-muted">报名开始至报名截止</p>
            </div>

            <div class="rounded-2xl border border-border bg-surfaceSoft/40 p-4">
              <p class="text-sm font-semibold uppercase tracking-[0.16em] text-text-light">比赛时间</p>
              <p class="mt-3 text-sm font-semibold leading-6 text-text-main">{{ matchTimeText }}</p>
              <p class="mt-2 text-sm text-text-muted">比赛正式开始时间</p>
            </div>

            <div class="rounded-2xl border border-border bg-surfaceSoft/40 p-4">
              <p class="text-sm font-semibold uppercase tracking-[0.16em] text-text-light">举办球馆</p>
              <p class="mt-3 text-sm font-semibold leading-6 text-text-main">{{ detail.arena_name || '待公布' }}</p>
              <div class="mt-3 flex flex-wrap items-center gap-x-7 gap-y-1.5 text-sm text-text-muted">
                <span>{{ regionSummary }}</span>
                <a
                  v-if="detail.shopid"
                  :href="`/arenas/${detail.shopid}`"
                  target="_blank"
                  rel="noopener noreferrer"
                  class="inline-flex items-center gap-1 font-medium text-brand-primary transition-colors hover:text-brand-primaryHover"
                >
                  查看球馆主页
                  <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path></svg>
                </a>
              </div>
            </div>

            <div class="rounded-2xl border border-border bg-surfaceSoft/40 p-4">
              <p class="text-sm font-semibold uppercase tracking-[0.16em] text-text-light">赛事概况</p>
              <p class="mt-3 text-sm font-semibold leading-6 text-text-main">{{ items.length }} 个报名项目</p>
              <p class="mt-2 text-sm text-text-muted">当前报名 {{ detail.membernum || 0 }} 人</p>
            </div>
          </div>
        </div>
      </div>

      <div class="space-y-6">
        <div class="rounded-card border border-border bg-white p-5 shadow-sm">
          <SegmentTabs
            :model-value="activeTab"
            :tabs="tabs"
            @update:model-value="changeDetailTab"
          />
        </div>

        <div class="overflow-hidden">
          <Transition :name="tabTransitionName" mode="out-in">
            <div :key="activeTab">
              <div v-if="activeTab === 'detail'" class="space-y-8">
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
                          <th class="p-4 font-medium">参赛名单</th>
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
                          <td class="p-4">
                            <button
                              type="button"
                              class="inline-flex items-center rounded-lg border border-brand-primary/20 bg-brand-primary/5 px-3 py-1.5 text-sm font-medium text-brand-primary transition-colors hover:bg-brand-primary/10 disabled:cursor-not-allowed disabled:opacity-60"
                              :disabled="membersLoading && currentMemberItem?.id === it.id"
                              @click="openMembersModal(it)"
                            >
                              {{ membersLoading && currentMemberItem?.id === it.id ? '加载中...' : '查看名单' }}
                            </button>
                          </td>
                        </tr>
                        <tr v-if="!items.length">
                          <td colspan="5" class="p-8 text-center text-text-muted">当前暂无项目</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </section>

                <section v-if="detail.detail" class="bg-white rounded-card shadow-sm border border-border p-6 md:p-8">
                  <h2 class="font-display text-xl font-bold text-text-main mb-6 flex items-center gap-2 border-l-4 border-brand-primary pl-3">
                    赛事详情
                  </h2>
                  <div class="prose max-w-none prose-p:!mb-3 prose-p:!mt-0 prose-p:leading-relaxed prose-headings:!mt-8 prose-headings:!mb-3 prose-ul:!mb-3 prose-ul:!mt-0 prose-li:!my-0 prose-img:w-full prose-img:max-w-3xl prose-img:mx-auto prose-img:rounded-xl prose-img:shadow-sm prose-headings:font-display prose-a:text-brand-primary" v-html="decodedHtml"></div>
                </section>
              </div>

              <MatchCompetitionPanel
                v-else-if="activeTab === 'schedule'"
                title="赛程成绩"
                :items="competitionItems"
                :model-value="activeCompetitionItemId"
                :loading="competitionLoading"
                :error="competitionError"
                :show-refresh="true"
                :refreshing="competitionLoading"
                refresh-label="刷新赛程成绩"
                @update:model-value="activeCompetitionItemId = $event"
                @refresh="fetchCompetitionData()"
              />

              <section v-else class="bg-white rounded-card shadow-sm border border-border p-6 md:p-8">
                <div class="flex flex-wrap items-start justify-between gap-4">
                  <h2 class="flex items-center border-l-4 border-brand-primary pl-3 font-display text-xl font-bold text-text-main">
                    积分变动
                  </h2>
                </div>

                <div class="mt-6 space-y-6">
                  <MatchItemTabs
                    v-if="pointTabItems.length"
                    :model-value="activePointsItemId"
                    :tabs="pointTabItems"
                    @update:model-value="activePointsItemId = $event"
                  />

                  <div v-if="pointsLoading" class="rounded-2xl border border-border bg-surfaceSoft/60 px-4 py-10 text-center text-sm text-text-muted">
                    积分变动加载中...
                  </div>

                  <div v-else-if="pointsError" class="rounded-2xl border border-red-200 bg-red-50 px-4 py-10 text-center text-sm text-red-600">
                    {{ pointsError }}
                  </div>

                  <div v-else-if="pointsNotice && !selectedScoreChangeGroup" class="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-10 text-center text-sm text-amber-700">
                    {{ pointsNotice }}
                  </div>

                  <article
                    v-else-if="selectedScoreChangeGroup"
                    class="overflow-hidden rounded-2xl border border-border"
                  >
                    <div class="flex flex-wrap items-center justify-between gap-3 border-b border-border bg-surfaceSoft/50 px-5 py-4">
                      <div>
                        <h3 class="text-lg font-display font-bold text-text-main">{{ selectedScoreChangeGroup.name }}</h3>
                        <p v-if="selectedScoreChangeGroup.condition" class="mt-1 text-sm text-text-muted">
                          {{ selectedScoreChangeGroup.condition }}
                        </p>
                      </div>

                      <div class="flex flex-wrap items-center gap-2">
                        <span class="inline-flex rounded-full bg-white px-3 py-1 text-xs font-semibold text-text-muted">
                          {{ selectedScoreChangeGroup.rows.length }} 人
                        </span>
                        <span
                          class="inline-flex rounded-full px-3 py-1 text-xs font-semibold"
                          :class="selectedScoreChangeGroup.calculated ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'"
                        >
                          {{ selectedScoreChangeGroup.calculated ? '已算分' : '未算分' }}
                        </span>
                      </div>
                    </div>

                    <div v-if="selectedScoreChangeGroup.rows.length" class="overflow-x-auto">
                      <table class="min-w-full text-sm text-left">
                        <thead class="bg-white text-text-muted">
                          <tr>
                            <th class="p-4 font-medium">排名</th>
                            <th class="p-4 font-medium">选手</th>
                            <th class="p-4 font-medium">
                              <button
                                type="button"
                                class="inline-flex items-center gap-1.5 transition-colors hover:text-text-main"
                                @click="togglePointsSort('pre')"
                              >
                                <span>赛前积分</span>
                                <span class="text-xs" :class="getScoreSortIndicatorClass('pre')">{{ getScoreSortIndicator('pre') }}</span>
                              </button>
                            </th>
                            <th class="p-4 font-medium">
                              <button
                                type="button"
                                class="inline-flex items-center gap-1.5 transition-colors hover:text-text-main"
                                @click="togglePointsSort('change')"
                              >
                                <span>积分变动</span>
                                <span class="text-xs" :class="getScoreSortIndicatorClass('change')">{{ getScoreSortIndicator('change') }}</span>
                              </button>
                            </th>
                            <th class="p-4 font-medium">
                              <button
                                type="button"
                                class="inline-flex items-center gap-1.5 transition-colors hover:text-text-main"
                                @click="togglePointsSort('post')"
                              >
                                <span>赛后积分</span>
                                <span class="text-xs" :class="getScoreSortIndicatorClass('post')">{{ getScoreSortIndicator('post') }}</span>
                              </button>
                            </th>
                          </tr>
                        </thead>
                        <tbody class="divide-y divide-border">
                          <tr
                            v-for="row in sortedScoreChangeRows"
                            :key="row.sid || `${selectedScoreChangeGroup.id}-${row.uid}-${row.rank}`"
                            class="hover:bg-surfaceMuted transition-colors"
                          >
                            <td class="p-4 font-medium text-text-main">{{ row.rank }}</td>
                            <td class="p-4">
                              <a
                                v-if="row.uid"
                                :href="`/scores/${row.uid}`"
                                target="_blank"
                                rel="noopener noreferrer"
                                class="font-medium text-brand-primary transition-colors hover:text-brand-primaryHover"
                              >
                                {{ row.displayName }}
                              </a>
                              <span v-else class="font-medium text-text-main">{{ row.displayName }}</span>
                            </td>
                            <td class="p-4 text-text-main">{{ row.prescoreText }}</td>
                            <td class="p-4">
                              <span
                                class="inline-flex rounded-full px-2.5 py-1 text-xs font-semibold"
                                :class="row.changeToneClass"
                              >
                                {{ row.changeText }}
                              </span>
                            </td>
                            <td class="p-4 text-text-main">{{ row.postscoreText }}</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>

                    <div v-else class="px-5 py-8 text-center text-sm text-text-muted">
                      {{ selectedScoreChangeGroup.calculated ? '当前组别暂无积分变动数据' : '当前组别积分还未计算' }}
                    </div>
                  </article>

                  <div v-else class="rounded-2xl border border-border bg-surfaceSoft/60 px-4 py-10 text-center text-sm text-text-muted">
                    当前暂无积分变动数据
                  </div>
                </div>
              </section>
            </div>
          </Transition>
        </div>
      </div>

      <Modal :open="membersModalOpen" panel-class="max-w-5xl" @close="closeMembersModal">
        <div class="flex items-start justify-between gap-4">
          <div>
            <h3 class="text-xl font-display font-bold text-text-main">
              {{ detail.title }}
            </h3>
            <p v-if="currentMemberItem?.name" class="mt-2 text-sm text-text-muted">
              项目：{{ currentMemberItem.name }}
            </p>
          </div>

          <button
            type="button"
            class="inline-flex h-9 w-9 items-center justify-center rounded-full bg-surfaceSoft text-text-muted transition-colors hover:text-text-main"
            @click="closeMembersModal"
          >
            <span class="sr-only">关闭弹窗</span>
            <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
          </button>
        </div>

        <div class="mt-6 max-h-[68vh] overflow-y-auto pr-1">
          <div v-if="membersLoading" class="rounded-xl border border-border bg-surfaceSoft/60 px-4 py-10 text-center text-sm text-text-muted">
            参赛名单加载中...
          </div>

          <div v-else-if="membersError" class="rounded-xl border border-red-200 bg-red-50 px-4 py-10 text-center text-sm text-red-600">
            {{ membersError }}
          </div>

          <div v-else-if="!memberRows.length" class="rounded-xl border border-border bg-surfaceSoft/60 px-4 py-10 text-center text-sm text-text-muted">
            当前暂无参赛名单
          </div>

          <div v-else class="space-y-4">
            <div class="overflow-x-auto rounded-xl border border-border">
              <table class="min-w-full text-sm text-left">
                <thead class="bg-surfaceSoft text-text-muted">
                  <tr>
                    <th class="p-4 font-medium">序号</th>
                    <th class="p-4 font-medium">姓名</th>
                    <th class="p-4 font-medium">报名积分</th>
                    <th class="p-4 font-medium">性别</th>
                    <th class="p-4 font-medium">确认</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-border">
                  <tr v-for="member in memberRows" :key="member.enter_id || `${member.uid}-${member.number}`" class="hover:bg-surfaceMuted transition-colors">
                    <td class="p-4 text-text-main">{{ member.number || '-' }}</td>
                    <td class="p-4">
                      <a
                        v-if="member.uid"
                        :href="`/scores/${member.uid}`"
                        target="_blank"
                        rel="noopener noreferrer"
                        class="font-medium text-brand-primary transition-colors hover:text-brand-primaryHover"
                      >
                        {{ member.realname || member.name || member.username || '-' }}
                      </a>
                      <span v-else class="font-medium text-text-main">
                        {{ member.realname || member.name || member.username || '-' }}
                      </span>
                    </td>
                    <td class="p-4">
                      <div class="flex flex-col gap-1">
                        <span v-if="hasInitialScore(member)" class="font-semibold text-orange-500">{{ getInitialScoreText(member) }}</span>
                        <span v-if="shouldShowCurrentScore(member)" class="font-semibold text-green-600">{{ getCurrentScoreText(member) }}</span>
                        <span v-if="!hasInitialScore(member) && !hasCurrentScore(member)" class="text-text-light">-</span>
                      </div>
                    </td>
                    <td class="p-4 text-text-main">{{ getSexLabel(member.sex) }}</td>
                    <td class="p-4">
                      <span
                        class="inline-flex rounded-full px-3 py-1 text-xs font-semibold"
                        :class="isMemberPaid(member) ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'"
                      >
                        {{ isMemberPaid(member) ? '已交费' : '未交费' }}
                      </span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div class="space-y-2 text-sm leading-6">
              <p class="text-orange-500">橙色数字：组织者设定的初始积分，平台会进行调整</p>
              <p class="text-green-600">绿色数字：参赛者报名时刻的当前积分/年度积分</p>
            </div>
          </div>
        </div>
      </Modal>
    </div>

    <div v-else class="flex flex-col items-center justify-center py-32 bg-white rounded-card border border-border shadow-sm">
      <div class="w-20 h-20 bg-surfaceSoft rounded-full flex items-center justify-center mb-4">
        <svg class="w-10 h-10 text-text-light" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
      </div>
      <p class="text-text-muted text-lg font-medium">未找到该赛事信息</p>
      <NuxtLink :to="{ path: '/matches', query: route.query }" class="mt-6 px-6 py-2 rounded-btn bg-brand-primary text-white font-medium hover:bg-brand-primaryHover transition-colors">
        返回比赛列表
      </NuxtLink>
    </div>
  </div>
</template>

<script setup>
import {
  fetchMatchDetail,
  fetchMatchMemberDetail,
  fetchMatchGroups,
  fetchMatchAllHonors,
  fetchMatchResult,
  fetchMatchIncrementResult,
  fetchMatchScoreChange
} from '~/services/match'

const route = useRoute()
const id = computed(() => route.params.id)
const detail = ref(null)
const items = ref([])
const decodedHtml = ref('')
const activeTab = ref('detail')
const activeCompetitionItemId = ref('')
const activePointsItemId = ref('')
const tabTransitionName = ref('detail-tab-forward')
const membersModalOpen = ref(false)
const membersLoading = ref(false)
const membersError = ref('')
const memberRows = ref([])
const currentMemberItem = ref(null)
const memberCache = ref({})
const competitionLoading = ref(false)
const competitionError = ref('')
const competitionItems = ref([])
const pointsLoading = ref(false)
const pointsLoaded = ref(false)
const pointsError = ref('')
const pointsNotice = ref('')
const scoreChangeData = ref(null)
const pointsSortKey = ref('')
const pointsSortOrder = ref('asc')
const { decode } = useHtmlDecode()
const { lat, lng } = useCity()
const loading = ref(true)
const { $api } = useNuxtApp()

const tabs = [
  { value: 'detail', label: '赛事详情' },
  { value: 'schedule', label: '赛程成绩' },
  { value: 'points', label: '积分变动' }
]

useHead(() => ({
  title: detail.value?.title || '比赛详情'
}))

const padTime = (value) => String(value).padStart(2, '0')

const formatDateTime = (value) => {
  if (value === undefined || value === null) return ''

  const raw = String(value).trim()
  if (!raw || raw === '0') return ''

  if (/^\d{10,13}$/.test(raw)) {
    const timestamp = raw.length === 13 ? Number(raw) : Number(raw) * 1000
    const date = new Date(timestamp)

    if (!Number.isNaN(date.getTime())) {
      return `${date.getFullYear()}-${padTime(date.getMonth() + 1)}-${padTime(date.getDate())} ${padTime(date.getHours())}:${padTime(date.getMinutes())}`
    }
  }

  return raw
}

const formatTimeRange = (start, end) => {
  const startText = formatDateTime(start)
  const endText = formatDateTime(end)

  if (startText && endText) {
    return startText === endText ? startText : `${startText} 至 ${endText}`
  }

  return startText || endText || '待公布'
}

const registrationTimeText = computed(() => formatTimeRange(detail.value?.startenrolltime, detail.value?.deadline))
const matchTimeText = computed(() => formatTimeRange(detail.value?.starttime, detail.value?.endtime))
const regionSummary = computed(() => {
  return [detail.value?.province, detail.value?.city].filter(Boolean).join('') || '地点待公布'
})

const changeDetailTab = (tab) => {
  if (tab === activeTab.value) return

  const currentIndex = tabs.findIndex((item) => item.value === activeTab.value)
  const nextIndex = tabs.findIndex((item) => item.value === tab)

  tabTransitionName.value = nextIndex > currentIndex ? 'detail-tab-forward' : 'detail-tab-backward'
  activeTab.value = tab

  if (tab === 'points') {
    void fetchScoreChanges()
  }
}

const normalizeMemberScore = (value) => String(value ?? '').trim()

const getCurrentScoreText = (member) => {
  const value = normalizeMemberScore(member?.score)
  if (!value || value === '0' || value === '0.00') return ''
  return value
}

const getInitialScoreMeta = (member) => {
  const setscore = normalizeMemberScore(member?.setscore)

  if (!setscore || setscore === '0' || setscore === '0.00') {
    return { value: '', fromCurrentScore: false }
  }

  if (setscore === '1') {
    const currentScore = getCurrentScoreText(member)
    return {
      value: currentScore,
      fromCurrentScore: !!currentScore
    }
  }

  return {
    value: setscore,
    fromCurrentScore: false
  }
}

const getInitialScoreText = (member) => getInitialScoreMeta(member).value
const hasInitialScore = (member) => !!getInitialScoreText(member)
const hasCurrentScore = (member) => !!getCurrentScoreText(member)

const shouldShowCurrentScore = (member) => {
  const currentScore = getCurrentScoreText(member)
  if (!currentScore) return false

  const initialScore = getInitialScoreMeta(member)
  if (initialScore.fromCurrentScore && initialScore.value === currentScore) {
    return false
  }

  return true
}

const getSexLabel = (value) => {
  const normalized = String(value ?? '').trim()

  if (normalized === '1') return '男'
  if (normalized === '2') return '女'

  return '-'
}

const isMemberPaid = (member) => String(member?.paid ?? '').trim() === '1'
const normalizeText = (value) => String(value ?? '').trim()
const createEmptyScoreChangeData = () => ({
  sc: {},
  ifCal: {},
  showName: detail.value?.showName || 'realname'
})
const normalizeScoreChangeMap = (value) => {
  if (value && typeof value === 'object' && !Array.isArray(value)) {
    return value
  }

  return {}
}

const normalizeItems = (payload) => {
  const list = Array.isArray(payload?.items) ? payload.items : []
  if (list.length) {
    return list.map((item) => ({
      ...item,
      condition: item?.condition?.trim?.() || item?.match_type || '-'
    }))
  }

  const selectedItem = payload?.detail?.selectedItem
  if (selectedItem && typeof selectedItem === 'object') {
    return [{
      ...selectedItem,
      condition: selectedItem?.condition?.trim?.() || selectedItem?.match_type || '-'
    }]
  }

  return []
}

const pointTabItems = computed(() => {
  return items.value
    .filter((item) => normalizeText(item?.id))
    .map((item) => ({
      value: normalizeText(item.id),
      label: item?.name || `组别 ${item.id}`
    }))
})

const resetCompetitionState = () => {
  competitionLoading.value = false
  competitionError.value = ''
  competitionItems.value = []
  activeCompetitionItemId.value = ''
}

const getScoreChangeDisplayField = (value) => {
  const field = normalizeText(value)
  return field === 'username' ? 'username' : 'realname'
}

const getScoreChangeDisplayName = (row, field) => {
  const preferred = normalizeText(row?.[field])
  if (preferred) return preferred

  return normalizeText(row?.realname) || normalizeText(row?.username) || normalizeText(row?.uid) || '-'
}

const formatScoreValue = (value) => normalizeText(value) || '-'

const formatScoreDelta = (value) => {
  const text = normalizeText(value)

  if (!text) return '0'
  if (text === '-') return text
  if (/^[+-]/.test(text)) return text

  const num = Number(text)
  if (Number.isNaN(num)) return text
  if (num > 0) return `+${num}`

  return `${num}`
}

const getScoreDeltaClass = (value) => {
  const num = Number(normalizeText(value))

  if (!Number.isNaN(num)) {
    if (num > 0) return 'bg-emerald-50 text-emerald-700'
    if (num < 0) return 'bg-rose-50 text-rose-700'
  }

  return 'bg-surfaceSoft text-text-muted'
}

const isScoreGroupCalculated = (value, rows = []) => {
  const normalized = normalizeText(value)
  return normalized === '1' || normalized.toLowerCase?.() === 'true' || rows.length > 0
}

const scoreChangeGroups = computed(() => {
  const data = scoreChangeData.value
  const scoreMap = normalizeScoreChangeMap(data?.sc)
  const ifCalMap = normalizeScoreChangeMap(data?.ifCal)
  const showField = getScoreChangeDisplayField(data?.showName)
  const itemMap = new Map(
    items.value
      .filter((item) => normalizeText(item?.id))
      .map((item) => [normalizeText(item.id), item])
  )
  const orderedIds = []
  const seen = new Set()

  const appendGroupId = (value) => {
    const groupId = normalizeText(value)
    if (!groupId || seen.has(groupId)) return

    if (itemMap.size && !itemMap.has(groupId)) return

    seen.add(groupId)
    orderedIds.push(groupId)
  }

  items.value.forEach((item) => appendGroupId(item?.id))
  Object.keys(scoreMap).forEach(appendGroupId)
  Object.keys(ifCalMap).forEach(appendGroupId)

  return orderedIds.map((groupId, groupIndex) => {
    const item = itemMap.get(groupId)
    const rows = Array.isArray(scoreMap[groupId]) ? scoreMap[groupId] : []

    return {
      id: groupId,
      name: item?.name || `组别 ${groupIndex + 1}`,
      condition: normalizeText(item?.condition) || normalizeText(item?.match_type),
      calculated: isScoreGroupCalculated(ifCalMap[groupId], rows),
      rows: rows.map((row, rowIndex) => ({
        ...row,
        rank: rowIndex + 1,
        displayName: getScoreChangeDisplayName(row, showField),
        prescoreText: formatScoreValue(row?.prescore),
        postscoreText: formatScoreValue(row?.postscore),
        changeText: formatScoreDelta(row?.change),
        changeToneClass: getScoreDeltaClass(row?.change)
      }))
    }
  })
})

const selectedScoreChangeGroup = computed(() => {
  if (!scoreChangeGroups.value.length) return null

  return scoreChangeGroups.value.find((group) => group.id === activePointsItemId.value) || scoreChangeGroups.value[0]
})

const getScoreSortNumber = (row, key) => {
  const raw = key === 'pre' ? row.prescore : key === 'post' ? row.postscore : row.change
  const n = Number(normalizeText(raw))
  return Number.isNaN(n) ? 0 : n
}

const sortedScoreChangeRows = computed(() => {
  const group = selectedScoreChangeGroup.value
  if (!group) return []
  const rows = group.rows
  const key = pointsSortKey.value
  if (!key) return rows
  const copy = [...rows]
  copy.sort((a, b) => {
    const cmp = getScoreSortNumber(a, key) - getScoreSortNumber(b, key)
    return pointsSortOrder.value === 'asc' ? cmp : -cmp
  })
  return copy
})

const togglePointsSort = (key) => {
  if (pointsSortKey.value !== key) {
    pointsSortKey.value = key
    pointsSortOrder.value = 'desc'
    return
  }

  if (pointsSortOrder.value === 'desc') {
    pointsSortOrder.value = 'asc'
    return
  }

  pointsSortKey.value = ''
  pointsSortOrder.value = 'asc'
}

const getScoreSortIndicator = (key) => {
  if (pointsSortKey.value !== key) return '↕'
  return pointsSortOrder.value === 'asc' ? '↑' : '↓'
}

const getScoreSortIndicatorClass = (key) => {
  return pointsSortKey.value === key ? 'text-brand-primary' : 'text-text-light'
}

const resetPointsSort = () => {
  pointsSortKey.value = ''
  pointsSortOrder.value = 'asc'
}

watch(activePointsItemId, () => {
  resetPointsSort()
})

const resetScoreChangeState = () => {
  pointsLoading.value = false
  pointsLoaded.value = false
  pointsError.value = ''
  pointsNotice.value = ''
  scoreChangeData.value = null
  activePointsItemId.value = ''
  resetPointsSort()
}

const getCompetitionItemIds = (itemsList, groupsPayload, honorsPayload) => {
  const ids = []
  const seen = new Set()
  const knownItemIds = new Set(
    (itemsList || [])
      .map((item) => normalizeText(item?.id))
      .filter(Boolean)
  )

  const pushId = (value) => {
    const normalized = normalizeText(value)
    if (!normalized || seen.has(normalized)) return
    seen.add(normalized)
    ids.push(normalized)
  }

  const pushPayloadId = (value) => {
    const normalized = normalizeText(value)

    if (!normalized) return
    if (knownItemIds.size && !knownItemIds.has(normalized)) return

    pushId(normalized)
  }

  ;(itemsList || []).forEach((item) => pushId(item?.id))
  Object.keys(groupsPayload || {}).forEach(pushPayloadId)
  Object.keys(honorsPayload || {}).forEach(pushPayloadId)

  return ids
}

const parseProcessMeta = (process) => {
  const raw = Array.isArray(process) ? process[0] : process
  const normalized = normalizeText(raw)

  if (!normalized) {
    return { value: '', tone: '' }
  }

  const [value = '', toneToken = ''] = normalized.split(/\s+/)

  return {
    value,
    tone: toneToken === '_c0' ? 'blue' : toneToken === '_c1' ? 'red' : ''
  }
}

const normalizeScoreValue = (value) => {
  if (value === undefined || value === null || value === '') return ''
  return String(value)
}

const normalizePlayerName = (...candidates) => {
  for (const candidate of candidates) {
    const normalized = normalizeText(candidate)
    if (normalized) return normalized
  }

  return '-'
}

const normalizeNameToken = (value) => normalizeText(value).replace(/\s+/g, '')

const createParticipantNameCandidates = (primaryText, secondaryText = '') => {
  const primary = normalizeText(primaryText)
  const secondary = normalizeText(secondaryText)
  const segments = primary
    .split(/[\/／]/)
    .map((segment) => normalizeText(segment))
    .filter(Boolean)

  const candidates = []

  if (segments[0]) candidates.push(segments[0])
  if (segments[1]) {
    candidates.push(segments[1])
  } else if (secondary) {
    candidates.push(secondary)
  }
  if (!candidates.length && primary) candidates.push(primary)

  return candidates
}

const formatGroupStartTime = (rawTime, fallbackTime = '') => {
  const dateText = formatDateTime(rawTime)

  if (dateText) return dateText
  if (fallbackTime) return fallbackTime

  return '待公布'
}

const isWalkoverToken = (value) => {
  const text = normalizeText(value).toLowerCase()
  return text === 'wo' || text === 'bye' || text === '轮空'
}

const compareMatchScoreSegment = (left, right) => {
  const normalizedLeft = normalizeText(left).toLowerCase()
  const normalizedRight = normalizeText(right).toLowerCase()

  if (!normalizedLeft && !normalizedRight) return 0
  if (isWalkoverToken(normalizedLeft) && isWalkoverToken(normalizedRight)) return 0
  if (isWalkoverToken(normalizedLeft)) return -1
  if (isWalkoverToken(normalizedRight)) return 1

  const leftNumber = Number(normalizedLeft)
  const rightNumber = Number(normalizedRight)

  if (!Number.isNaN(leftNumber) && !Number.isNaN(rightNumber)) {
    if (leftNumber === rightNumber) return 0
    return leftNumber > rightNumber ? 1 : -1
  }

  return 0
}

const resolveByeWinner = ({ uid1, uid2, name1, name2, result1, result2 }) => {
  const normName1 = normalizeText(name1)
  const normName2 = normalizeText(name2)
  const hasLeft = !!(normalizeText(uid1) || normName1)
  const hasRight = !!(normalizeText(uid2) || normName2)

  if (hasLeft && !hasRight) return 1
  if (hasRight && !hasLeft) return -1

  if (isWalkoverToken(normName1) && !isWalkoverToken(normName2)) return -1
  if (!isWalkoverToken(normName1) && isWalkoverToken(normName2)) return 1

  if (isWalkoverToken(result1) && !isWalkoverToken(result2)) return -1
  if (!isWalkoverToken(result1) && isWalkoverToken(result2)) return 1

  if (normalizeText(result1) === '0' && normalizeText(result2) === '0') {
    if (hasLeft && !hasRight) return 1
    if (hasRight && !hasLeft) return -1
  }

  return 0
}

const getResultGroupsByItem = (resultData, itemId) => {
  const groupList = resultData?.groups?.[normalizeText(itemId)]
  return Array.isArray(groupList) ? groupList : []
}

const buildTeamBattleKey = (leftTeamId, rightTeamId) => {
  const ids = [normalizeText(leftTeamId), normalizeText(rightTeamId)].filter(Boolean).sort()
  return ids.length === 2 ? ids.join(':') : ''
}

const extractScorePair = (value) => {
  const [left = '', right = ''] = normalizeText(value).split(':')
  return {
    left: left || '0',
    right: right || '0'
  }
}

const extractPrimaryPlayerName = (primaryText) => {
  const firstSegment = normalizeText(primaryText)
    .split(/[\/／]/)
    .map((segment) => normalizeText(segment))
    .find(Boolean)

  return firstSegment || normalizeText(primaryText) || '-'
}

const buildTeamIdentityLookup = (members = []) => {
  const lookup = {}

  members.forEach((member) => {
    const teamId = normalizeText(member?.teamid)
    const teamName = normalizeText(member?.teamname || member?.username || member?.realname)

    if (!teamId || !teamName) return

    lookup[teamName] = {
      teamId,
      name: teamName,
      captainUid: normalizeText(member?.uid),
      captainName: normalizePlayerName(member?.teamname, member?.realname, member?.username)
    }
  })

  return lookup
}

const parseTeamBattleRoundName = (roundname, teamLookup = {}) => {
  const normalized = normalizeText(roundname)
  const matched = normalized.match(/^(.+?)\s+([0-9woWO]+:[0-9woWO]+)\s+(.+)$/)

  if (!matched) return null

  const [, leftNameRaw, scoreText, rightNameRaw] = matched
  const leftName = normalizeText(leftNameRaw)
  const rightName = normalizeText(rightNameRaw)
  const leftTeam = teamLookup[leftName]
  const rightTeam = teamLookup[rightName]
  const battleKey = buildTeamBattleKey(leftTeam?.teamId, rightTeam?.teamId)

  if (!leftTeam?.teamId || !rightTeam?.teamId || !battleKey) return null

  return {
    battleKey,
    scoreText,
    leftTeam,
    rightTeam
  }
}

const normalizeTeamBattleRows = (games = []) => {
  return (Array.isArray(games) ? games : []).map((game, index) => {
    const result1 = normalizeScoreValue(game?.result1) || '0'
    const result2 = normalizeScoreValue(game?.result2) || '0'

    return {
      id: normalizeText(game?.gameid) || `team-row-${index + 1}`,
      sequence: index + 1,
      gameId: normalizeText(game?.gameid),
      flag: normalizeText(game?.flag),
      player1Name: normalizePlayerName(game?.username1),
      player2Name: normalizePlayerName(game?.username2),
      leftPlayer: {
        uid: normalizeText(game?.uid1),
        name: extractPrimaryPlayerName(game?.username1)
      },
      rightPlayer: {
        uid: normalizeText(game?.uid2),
        name: extractPrimaryPlayerName(game?.username2)
      },
      score: `${result1}:${result2}`
    }
  })
}

const normalizeTeamBattleDetailGames = (members = []) => {
  const teamLookup = buildTeamIdentityLookup(members)
  const battleMap = {}

  members.forEach((member) => {
    const detailGames = Array.isArray(member?.detail_games) ? member.detail_games : []

    detailGames.forEach((battle) => {
      const parsed = parseTeamBattleRoundName(battle?.roundname, teamLookup)
      if (!parsed || battleMap[parsed.battleKey]) return

      battleMap[parsed.battleKey] = {
        id: normalizeText(battle?.tgameid) || parsed.battleKey,
        tgameid: normalizeText(battle?.tgameid),
        battleKey: parsed.battleKey,
        scoreText: parsed.scoreText,
        stageLabel: '',
        teamLeft: parsed.leftTeam,
        teamRight: parsed.rightTeam,
        rows: normalizeTeamBattleRows(battle?.games)
      }
    })
  })

  return battleMap
}

const buildKnockoutTeamBattleDetail = (game, detailGames) => {
  if (!Array.isArray(detailGames)) return null

  const name1 = normalizeText(game?.username1)
  const name2 = normalizeText(game?.username2)
  if (!name1 || !name2) return null

  const detailGame = detailGames.find((detail) => {
    const roundname = normalizeText(detail?.roundname)
    return roundname.includes(name1) && roundname.includes(name2)
  })

  if (!detailGame) return null

  const roundname = normalizeText(detailGame?.roundname)
  const scoreMatch = roundname.match(/\s+([0-9woWO]+:[0-9woWO]+)\s+/)
  const scoreTextInRoundname = scoreMatch ? scoreMatch[1] : ''
  const [leftPart = '', rightPart = ''] = roundname.split(scoreTextInRoundname)
  const shouldSwapRows = !!scoreTextInRoundname && !normalizeText(leftPart).endsWith(name1) && normalizeText(rightPart).endsWith(name1)

  let rows = normalizeTeamBattleRows(detailGame?.games)
  if (shouldSwapRows) {
    rows = rows.map((row) => ({
      ...row,
      player1Name: row?.player2Name || row?.player2 || '-',
      player2Name: row?.player1Name || row?.player1 || '-',
      leftPlayer: row?.rightPlayer || { uid: '', name: row?.player2Name || row?.player2 || '-' },
      rightPlayer: row?.leftPlayer || { uid: '', name: row?.player1Name || row?.player1 || '-' },
      score: (() => {
        const [l = '0', r = '0'] = normalizeText(row?.score).split(':')
        return `${r}:${l}`
      })()
    }))
  }

  return {
    id: normalizeText(detailGame.tgameid),
    tgameid: normalizeText(detailGame.tgameid),
    battleKey: '',
    scoreText: `${normalizeScoreValue(game?.result1) || '0'}:${normalizeScoreValue(game?.result2) || '0'}`,
    stageLabel: '',
    teamLeft: {
      teamId: normalizeText(game?.teamid1),
      name: name1,
      captainUid: normalizeText(game?.uid1) || '',
      captainName: name1
    },
    teamRight: {
      teamId: normalizeText(game?.teamid2),
      name: name2,
      captainUid: normalizeText(game?.uid2) || '',
      captainName: name2
    },
    rows
  }
}

const buildNameLookup = (groupsPayload, honorsPayload, resultPayloads = []) => {
  const lookup = {}

  const chooseBetterName = (currentValue, candidates = []) => {
    const current = normalizeText(currentValue)
    const normalizedCandidates = candidates.map((candidate) => normalizeText(candidate)).filter(Boolean)
    const currentLooksLikeTeam = /队$/.test(current)
    const betterCandidate = normalizedCandidates.find((candidate) => {
      if (!current) return true
      if (candidate === current) return false
      if (currentLooksLikeTeam && !/队$/.test(candidate)) return true
      return false
    })

    return betterCandidate || normalizePlayerName(current, ...normalizedCandidates)
  }

  const assignName = (uid, ...candidates) => {
    const normalizedUid = normalizeText(uid)
    if (!normalizedUid) return

    lookup[normalizedUid] = chooseBetterName(lookup[normalizedUid], candidates)
  }

  Object.values(groupsPayload || {}).forEach((itemGroups) => {
    const groups = Array.isArray(itemGroups?.groups) ? itemGroups.groups : []

    groups.forEach((group) => {
      ;(group || []).forEach((player) => {
        assignName(player?.uid, player?.realname, player?.username)
      })
    })
  })

  Object.values(honorsPayload || {}).forEach((honors) => {
    ;(honors || []).forEach((honor) => {
      assignName(honor?.uid, honor?.name, honor?.username)
    })
  })

  ;(resultPayloads || []).forEach((entry) => {
    const groups = getResultGroupsByItem(entry?.data, entry?.itemId)

    groups.forEach((group) => {
      ;(group || []).forEach((player) => {
        assignName(player?.uid, player?.realname, player?.username, player?.teamname)

        const detailGames = Array.isArray(player?.detail_games) ? player.detail_games : []
        detailGames.forEach((detailGame) => {
          ;(Array.isArray(detailGame?.games) ? detailGame.games : []).forEach((game) => {
            const leftNames = createParticipantNameCandidates(game?.username1, game?.username11)
            const rightNames = createParticipantNameCandidates(game?.username2, game?.username22)

            assignName(game?.uid1, ...leftNames)
            assignName(game?.uid11, leftNames[1], leftNames[0])
            assignName(game?.uid2, ...rightNames)
            assignName(game?.uid22, rightNames[1], rightNames[0])
          })
        })
      })
    })
  })

  return lookup
}

const buildUidNameLookup = (nameLookup = {}) => {
  const reverseLookup = {}

  Object.entries(nameLookup).forEach(([uid, name]) => {
    const key = normalizeNameToken(name)
    if (!key || reverseLookup[key]) return
    reverseLookup[key] = uid
  })

  return reverseLookup
}

const parseHonorDisplay = (honor, nameLookup = {}, uidNameLookup = {}) => {
  const teamName = normalizeText(honor?.teamname)
  const members = Array.isArray(honor?.members) ? honor.members : []

  if (teamName && members.length) {
    const memberItems = members
      .map((member) => {
        const memberName = normalizeText(member?.name)
        const memberUid = normalizeText(member?.uid)
        return {
          name: memberName || '-',
          uid: memberUid,
          isCaptain: memberUid && memberUid === normalizeText(honor?.uid)
        }
      })
      .filter((item) => item.name !== '-')

    return {
      name: teamName,
      teamLabel: teamName,
      memberItems
    }
  }

  const rawName = normalizeText(honor?.name) || normalizeText(honor?.username)
  const match = rawName.match(/^([^()（）]+)[(（]([^()（）]+)[)）]$/)

  if (!match) {
    return {
      name: rawName || '-',
      teamLabel: '',
      memberItems: []
    }
  }

  const teamLabel = normalizeText(match[1])
  const memberItems = match[2]
    .split(/[\/／]/)
    .map((memberName) => normalizeText(memberName))
    .filter(Boolean)
    .map((memberName) => {
      const key = normalizeNameToken(memberName)
      const uid = uidNameLookup[key] || ''

      return {
        name: memberName,
        uid: normalizeText(uid),
        isCaptain: normalizeText(uid) && normalizeText(uid) === normalizeText(honor?.uid)
      }
    })

  if (!memberItems.some((member) => member.uid === normalizeText(honor?.uid))) {
    const honorUid = normalizeText(honor?.uid)
    const honorName = nameLookup[honorUid]

    if (honorUid && honorName) {
      const existingIndex = memberItems.findIndex((member) => member.name === honorName)
      if (existingIndex >= 0) {
        memberItems[existingIndex] = {
          ...memberItems[existingIndex],
          uid: honorUid,
          isCaptain: true
        }
      }
    }
  }

  return {
    name: rawName || '-',
    teamLabel: teamLabel || '',
    memberItems
  }
}

const normalizeKnockoutRounds = (rounds, nameLookup = {}, context = {}) => {
  if (!Array.isArray(rounds)) return []

  const teamLookup = buildTeamIdentityLookup(context.members || [])
  const knockoutTeamBattleMap = context.isTeamEvent ? normalizeTeamBattleDetailGames(context.members || []) : {}

  return rounds
    .map((round, roundIndex) => {
      const parsedRoundBattle = context.isTeamEvent ? parseTeamBattleRoundName(round?.roundname, teamLookup) : null
      const roundBattleDetail = parsedRoundBattle ? knockoutTeamBattleMap[parsedRoundBattle.battleKey] || null : null

      if (roundBattleDetail) {
        roundBattleDetail.stageLabel = '淘汰赛'
      }

      const matches = Array.isArray(round?.games)
        ? round.games.map((game, gameIndex) => {
            const uid1 = normalizeText(game?.uid1)
            const uid2 = normalizeText(game?.uid2)
            const name1 = normalizePlayerName(nameLookup[uid1], game?.username1)
            const name2 = normalizePlayerName(nameLookup[uid2], game?.username2)
            const result1 = normalizeScoreValue(game?.result1) || '0'
            const result2 = normalizeScoreValue(game?.result2) || '0'
            const compareResult = compareMatchScoreSegment(result1, result2)
            const byeWinner = compareResult === 0
              ? resolveByeWinner({ uid1, uid2, name1, name2, result1, result2 })
              : 0

            const gameBattleDetail = context.isTeamEvent
              ? buildKnockoutTeamBattleDetail(game, context.knockoutDetailGames)
              : null
            const activeDetail = gameBattleDetail || roundBattleDetail

            const leftTeam = activeDetail?.teamLeft || parsedRoundBattle?.leftTeam || {
              teamId: normalizeText(game?.teamid1) || '',
              name: name1,
              captainUid: uid1,
              captainName: name1
            }
            const rightTeam = activeDetail?.teamRight || parsedRoundBattle?.rightTeam || {
              teamId: normalizeText(game?.teamid2) || '',
              name: name2,
              captainUid: uid2,
              captainName: name2
            }

            return {
              id: `${roundIndex}-${gameIndex}-${uid1}-${uid2}`,
              gameId: normalizeText(game?.gameid),
              eventId: normalizeText(game?.eventid) || normalizeText(context.eventId),
              itemId: normalizeText(context.itemId),
              uid1,
              uid2,
              isTeamEvent: !!context.isTeamEvent,
              detail: activeDetail,
              leftPlayer: {
                uid: leftTeam.captainUid || uid1,
                name: leftTeam.name || name1,
                teamId: leftTeam.teamId || ''
              },
              rightPlayer: {
                uid: rightTeam.captainUid || uid2,
                name: rightTeam.name || name2,
                teamId: rightTeam.teamId || ''
              },
              scoreText: `${result1}:${result2}`,
              stageLabel: '淘汰赛',
              player1: {
                uid: uid1,
                name: name1,
                score: result1,
                isWinner: compareResult > 0 || byeWinner > 0
              },
              player2: {
                uid: uid2,
                name: name2,
                score: result2,
                isWinner: compareResult < 0 || byeWinner < 0
              }
            }
          })
        : []

      return {
        title: round?.roundname || `第${roundIndex + 1}轮`,
        matches: matches.filter((match) => match.player1.name !== '-' || match.player2.name !== '-')
      }
    })
    .filter((round) => round.matches.length)
}

const normalizeCompetitionData = ({ eventId, itemsList, groupsPayload, honorsPayload, resultPayloads }) => {
  const itemMap = Object.fromEntries((itemsList || []).map((item) => [normalizeText(item.id), item]))
  const itemIds = getCompetitionItemIds(itemsList, groupsPayload, honorsPayload)
  const resultMap = Object.fromEntries((resultPayloads || []).map((entry) => [normalizeText(entry.itemId), entry.data || {}]))
  const nameLookup = buildNameLookup(groupsPayload, honorsPayload, resultPayloads)
  const uidNameLookup = buildUidNameLookup(nameLookup)

  return itemIds
    .map((itemId, itemIndex) => {
      const groupMeta = groupsPayload?.[itemId] && typeof groupsPayload[itemId] === 'object'
        ? groupsPayload[itemId]
        : {}
      const resultMeta = resultMap[itemId] && typeof resultMap[itemId] === 'object'
        ? resultMap[itemId]
        : {}
      const resultGroups = getResultGroupsByItem(resultMeta, itemId)
      const groups = resultGroups.length
        ? resultGroups
        : (Array.isArray(groupMeta?.groups) ? groupMeta.groups : [])
      const scoreMap = resultMeta?.incrementScores && typeof resultMeta.incrementScores === 'object' && !Array.isArray(resultMeta.incrementScores)
        ? resultMeta.incrementScores
        : {}
      const resultGameMap = resultMeta?.incrementGames && typeof resultMeta.incrementGames === 'object' && !Array.isArray(resultMeta.incrementGames)
        ? resultMeta.incrementGames
        : {}
      const knockoutRounds = resultMeta?.ttgames && typeof resultMeta.ttgames === 'object'
        ? resultMeta.ttgames[itemId]
        : []
      const knockoutDetailGames = resultMeta?.ttdetailgames && typeof resultMeta.ttdetailgames === 'object'
        ? resultMeta.ttdetailgames[itemId]
        : []
      const honors = Array.isArray(honorsPayload?.[itemId])
        ? honorsPayload[itemId].map((honor, honorIndex) => ({
            id: honor?.hid || `${itemId}-${honorIndex}`,
            uid: normalizeText(honor?.uid),
            honor: honor?.honor || `名次 ${honorIndex + 1}`,
            ...parseHonorDisplay(honor, nameLookup, uidNameLookup),
            subject: honor?.subject || ''
          }))
        : []
      const qualifyCount = Number(itemMap[itemId]?.qualNum || 0) || 0

      const normalizedGroups = groups
        .map((groupMembers, groupIndex) => {
          const members = Array.isArray(groupMembers) ? groupMembers : []
          const groupId = normalizeText(members[0]?.groupid)
          const groupScoreRows = Array.isArray(scoreMap[groupId]) ? scoreMap[groupId] : []
          const groupResults = resultGameMap[groupId] && typeof resultGameMap[groupId] === 'object'
            ? resultGameMap[groupId]
            : {}
          const scoreLookup = Object.fromEntries(groupScoreRows.map((row) => [normalizeText(row?.uid), row]))
          const tableNumber = normalizeText(members[0]?.tablenum || groupMeta?.groups_tablenum?.[groupIndex])
          const hasTeamMeta = members.some((member) => {
            const teamId = normalizeText(member?.teamid)
            return (teamId && teamId !== '0')
              || !!normalizeText(member?.teamname)
              || (Array.isArray(member?.detail_games) && member.detail_games.length > 0)
          })
          const groupTeamGames = hasTeamMeta
            ? (members.find((member) => member?.games && typeof member.games === 'object' && !Array.isArray(member.games))?.games || {})
            : {}
          const groupTeamBattleMap = hasTeamMeta ? normalizeTeamBattleDetailGames(members) : {}
          const groupTitle = `第${groupIndex + 1}组`

          Object.values(groupTeamBattleMap).forEach((battle) => {
            battle.stageLabel = groupTitle
          })

          return {
            id: groupId || `${itemId}-${groupIndex}`,
            title: groupTitle,
            eventId: normalizeText(eventId),
            itemId,
            isTeamEvent: hasTeamMeta,
            startTimeText: formatGroupStartTime(members[0]?.starttime, groupMeta?.starttimes?.[groupIndex] || ''),
            tableText: tableNumber ? `${tableNumber}号台` : '待公布',
            qualifyCount,
            games: groupResults,
            teamGames: groupTeamGames,
            teamBattleMap: groupTeamBattleMap,
            players: members.map((member) => {
              const uid = normalizeText(member?.uid)
              const scoreMeta = uid ? scoreLookup[uid] || {} : {}
              const processMeta = parseProcessMeta(scoreMeta?.process || member?.process)

              return {
                uid,
                teamId: normalizeText(member?.teamid),
                name: normalizePlayerName(member?.teamname, member?.realname, member?.username, nameLookup[uid]),
                score: normalizeScoreValue(scoreMeta?.score ?? member?.score),
                rank: normalizeScoreValue(scoreMeta?.rank ?? member?.rank),
                calcValue: processMeta.value,
                calcTone: processMeta.tone
              }
            })
          }
        })
        .filter((group) => group.players.length)

      return {
        id: itemId,
        eventId: normalizeText(eventId),
        label: itemMap[itemId]?.name || `积分组别 ${itemIndex + 1}`,
        groups: normalizedGroups,
        honors,
        knockoutRounds: normalizeKnockoutRounds(knockoutRounds, nameLookup, {
          eventId,
          itemId,
          isTeamEvent: normalizedGroups.some((group) => group.isTeamEvent),
          members: groups.flatMap((groupMembers) => Array.isArray(groupMembers) ? groupMembers : []),
          knockoutDetailGames
        })
      }
    })
    .filter((item) => item.groups.length || item.honors.length || item.knockoutRounds.length || item.label)
}

const closeMembersModal = () => {
  membersModalOpen.value = false
}

const openMembersModal = async (item) => {
  if (!item?.id) return

  currentMemberItem.value = item
  membersModalOpen.value = true
  membersError.value = ''

  const cachedRows = memberCache.value[item.id]
  if (cachedRows) {
    memberRows.value = cachedRows
    membersLoading.value = false
    return
  }

  membersLoading.value = true
  memberRows.value = []

  try {
    const res = await fetchMatchMemberDetail($api, {
      id: item.id,
      matchId: id.value
    })
    const rows = Array.isArray(res?.data?.list) ? res.data.list : []

    memberRows.value = rows
    memberCache.value = {
      ...memberCache.value,
      [item.id]: rows
    }
  } catch (error) {
    membersError.value = '参赛名单加载失败，请稍后重试'
    memberRows.value = []
  } finally {
    membersLoading.value = false
  }
}

const fetchScoreChanges = async ({ force = false } = {}) => {
  if (pointsLoading.value || (pointsLoaded.value && !force)) return

  pointsLoading.value = true
  pointsError.value = ''
  pointsNotice.value = ''

  try {
    const res = await fetchMatchScoreChange($api, { eventid: id.value })
    const code = Number(res?.code)
    const message = normalizeText(res?.msg)
    const hasData = !!(res?.data && typeof res.data === 'object')

    if (hasData) {
      scoreChangeData.value = res.data

      if (code !== 1 && message) {
        pointsNotice.value = message
      } else if (!scoreChangeGroups.value.length) {
        pointsNotice.value = '当前暂无积分变动数据'
      }
    } else if (code === 0) {
      scoreChangeData.value = createEmptyScoreChangeData()
      pointsNotice.value = message || '积分还未计算'
    } else {
      scoreChangeData.value = createEmptyScoreChangeData()
      pointsError.value = message || '积分变动加载失败，请稍后重试'
    }
  } catch (error) {
    scoreChangeData.value = createEmptyScoreChangeData()
    pointsError.value = '积分变动加载失败，请稍后重试'
  } finally {
    pointsLoading.value = false
    pointsLoaded.value = true

    if (scoreChangeGroups.value.length && !scoreChangeGroups.value.some((group) => group.id === activePointsItemId.value)) {
      activePointsItemId.value = scoreChangeGroups.value[0].id
    }
  }
}

const fetchCompetitionData = async (itemsList = items.value) => {
  const firstItemId = itemsList?.[0]?.id

  if (!id.value || !firstItemId) {
    resetCompetitionState()
    return
  }

  resetCompetitionState()

  competitionLoading.value = true
  competitionError.value = ''

  try {
    const [groupsRes, honorsRes] = await Promise.all([
      fetchMatchGroups($api, {
        eventId: id.value,
        itemId: firstItemId
      }),
      fetchMatchAllHonors($api, {
        eventId: id.value
      })
    ])

    const groupsPayload = groupsRes?.data && typeof groupsRes.data === 'object' ? groupsRes.data : {}
    const honorsPayload = honorsRes?.data && typeof honorsRes.data === 'object' ? honorsRes.data : {}
    const itemIds = getCompetitionItemIds(itemsList, groupsPayload, honorsPayload)

    const resultPayloads = await Promise.all(
      itemIds.map(async (itemId) => {
        try {
          const [resultRes, incrementRes] = await Promise.all([
            fetchMatchResult($api, {
              eventId: id.value,
              itemId
            }),
            fetchMatchIncrementResult($api, {
              eventId: id.value,
              itemId,
              posttime: 0
            })
          ])

          return {
            itemId,
            data: {
              ...(resultRes?.data || {}),
              incrementGames: incrementRes?.data?.games || {},
              incrementScores: incrementRes?.data?.scores || {}
            }
          }
        } catch (error) {
          return {
            itemId,
            data: {}
          }
        }
      })
    )

    const normalizedItems = normalizeCompetitionData({
      eventId: id.value,
      itemsList,
      groupsPayload,
      honorsPayload,
      resultPayloads
    })

    competitionItems.value = normalizedItems
    activeCompetitionItemId.value = normalizedItems.some((item) => item.id === activeCompetitionItemId.value)
      ? activeCompetitionItemId.value
      : normalizedItems[0]?.id || ''
  } catch (error) {
    competitionItems.value = []
    competitionError.value = '赛程与积分数据加载失败，请稍后重试'
    activeCompetitionItemId.value = ''
  } finally {
    competitionLoading.value = false
  }
}

const fetchDetail = async () => {
  loading.value = true
  resetScoreChangeState()

  try {
    const res = await fetchMatchDetail($api, {
      id: id.value,
      lat: lat.value,
      lng: lng.value
    })

    detail.value = res?.data?.detail || null
    const normalizedItems = normalizeItems(res?.data)
    items.value = normalizedItems
    activePointsItemId.value = normalizedItems[0]?.id || ''
    memberCache.value = {}
    memberRows.value = []
    membersModalOpen.value = false
    membersError.value = ''
    currentMemberItem.value = null
    let rawHtml = decode(res?.data?.detail?.detail || '')

    rawHtml = rawHtml.replace(/(?:<p>([\s\n\r]*|&nbsp;|<br\s*\/?>)*<\/p>\s*)+(?=<p>(\s*|&nbsp;|<br>)*\d+[、.])/gi, '')

    decodedHtml.value = rawHtml
      .replace(/<p>(\s*|&nbsp;|<br>)*([一二三四五六七八九十]+[、.])/g, '<p class="!mt-8 !mb-4 font-bold text-lg text-text-main">$2')
      .replace(/<p>(\s*|&nbsp;|<br>)*(\d+[、.])/g, '<p class="!my-0.5 text-text-muted">$2')

    await fetchCompetitionData(normalizedItems)
  } catch (error) {
    detail.value = null
    items.value = []
    decodedHtml.value = ''
    resetCompetitionState()
    resetScoreChangeState()
  } finally {
    loading.value = false

    if (activeTab.value === 'points' && detail.value) {
      void fetchScoreChanges()
    }
  }
}

onMounted(fetchDetail)
watch(id, (nextId, prevId) => {
  if (nextId !== prevId) {
    fetchDetail()
  }
})
</script>

<style scoped>
.detail-tab-forward-enter-active,
.detail-tab-forward-leave-active,
.detail-tab-backward-enter-active,
.detail-tab-backward-leave-active {
  transition: opacity 260ms ease, transform 320ms cubic-bezier(0.22, 1, 0.36, 1);
  will-change: opacity, transform;
}

.detail-tab-forward-enter-from,
.detail-tab-backward-leave-to {
  opacity: 0;
  transform: translate3d(28px, 0, 0);
}

.detail-tab-forward-leave-to,
.detail-tab-backward-enter-from {
  opacity: 0;
  transform: translate3d(-28px, 0, 0);
}
</style>




