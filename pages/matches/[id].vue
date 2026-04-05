<template>
  <div class="container py-10">
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
          <div class="flex flex-wrap items-center gap-3 mb-4">
            <div class="inline-flex items-center gap-2 px-3 py-1 bg-brand-primary/10 text-brand-primary text-xs font-semibold rounded-md uppercase tracking-wider">
              赛事详情
            </div>
            <div v-if="detail.membernum" class="inline-flex items-center gap-2 px-3 py-1 bg-emerald-50 text-emerald-700 text-xs font-semibold rounded-md">
              已报名 {{ detail.membernum }} 人
            </div>
          </div>

          <h1 class="text-2xl md:text-3xl font-display font-bold text-text-main mb-4 leading-snug">
            {{ detail.title }}
          </h1>

          <p v-if="detail.note" class="max-w-4xl text-sm md:text-base text-text-muted leading-relaxed">
            {{ detail.note }}
          </p>

          <div class="grid items-start gap-4 md:grid-cols-2 xl:grid-cols-4 mt-6">
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

              <section v-else-if="activeTab === 'schedule'" class="bg-white rounded-card shadow-sm border border-border p-8 md:p-10">
                <h2 class="font-display text-xl font-bold text-text-main">赛程</h2>
                <p class="mt-4 text-sm leading-7 text-text-muted">
                  赛程模块预留中，后续会在这里补充分组、轮次和对阵安排。
                </p>
              </section>

              <section v-else class="bg-white rounded-card shadow-sm border border-border p-8 md:p-10">
                <h2 class="font-display text-xl font-bold text-text-main">积分</h2>
                <p class="mt-4 text-sm leading-7 text-text-muted">
                  积分模块预留中，后续会在这里补充赛事积分相关内容。
                </p>
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
      <a href="/matches" class="mt-6 px-6 py-2 rounded-btn bg-brand-primary text-white font-medium hover:bg-brand-primaryHover transition-colors">
        返回比赛列表
      </a>
    </div>
  </div>
</template>

<script setup>
import { fetchMatchDetail, fetchMatchMemberDetail } from '~/services/match'

const route = useRoute()
const id = computed(() => route.params.id)
const detail = ref(null)
const items = ref([])
const decodedHtml = ref('')
const activeTab = ref('detail')
const tabTransitionName = ref('detail-tab-forward')
const membersModalOpen = ref(false)
const membersLoading = ref(false)
const membersError = ref('')
const memberRows = ref([])
const currentMemberItem = ref(null)
const memberCache = ref({})
const { decode } = useHtmlDecode()
const { lat, lng } = useCity()
const loading = ref(true)
const { $api } = useNuxtApp()

const tabs = [
  { value: 'detail', label: '详情' },
  { value: 'schedule', label: '赛程' },
  { value: 'points', label: '积分' }
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

const hasInitialScore = (member) => {
  return !!getInitialScoreText(member)
}

const hasCurrentScore = (member) => {
  return !!getCurrentScoreText(member)
}

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
  } catch (e) {
    membersError.value = '参赛名单加载失败，请稍后重试'
    memberRows.value = []
  } finally {
    membersLoading.value = false
  }
}

const fetchDetail = async () => {
  loading.value = true
  try {
    const res = await fetchMatchDetail($api, {
      id: id.value,
      lat: lat.value,
      lng: lng.value
    })

    detail.value = res?.data?.detail || null
    items.value = normalizeItems(res?.data)
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
