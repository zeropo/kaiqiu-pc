<template>
  <div class="container pt-8 pb-10 md:pt-12 md:pb-16">
    <div v-if="loading" class="space-y-6">
      <div class="h-72 animate-pulse rounded-card border border-border bg-white" />
      <div class="h-52 animate-pulse rounded-card border border-border bg-white" />
      <div class="grid gap-6 xl:grid-cols-[360px_minmax(0,1fr)]">
        <div class="h-80 animate-pulse rounded-card border border-border bg-white" />
        <div class="h-[28rem] animate-pulse rounded-card border border-border bg-white" />
      </div>
    </div>

    <div v-else-if="detail">
      <div class="overflow-hidden rounded-card border border-border bg-white shadow-card">
        <div class="flex flex-col gap-8 p-6 md:flex-row md:items-start md:p-10">
          <ImgFallback
            :src="arenaImage"
            :alt="arenaName"
            class="h-56 w-full rounded-2xl object-cover shadow-sm md:h-60 md:w-60 md:shrink-0"
          />

          <div class="min-w-0 flex-1">
            <div class="flex flex-wrap items-center gap-3">
              <h1 class="font-display text-3xl font-bold text-text-main">{{ arenaName }}</h1>
              <span
                v-if="detail.district"
                class="rounded-full border border-brand-primary/20 bg-brand-primary/5 px-3 py-1 text-xs font-medium text-brand-primary"
              >
                {{ detail.district }}
              </span>
              <span
                v-if="arenaGradeLabel"
                class="rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-xs font-medium text-amber-700"
              >
                {{ arenaGradeLabel }}
              </span>
            </div>

            <div class="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-text-muted">
              <span class="inline-flex items-center gap-1.5">
                <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
                {{ arenaLocation }}
              </span>
              <span v-if="distanceText" class="inline-flex items-center gap-1.5">
                <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><circle cx="6" cy="19" r="2.5" stroke-width="2"></circle><circle cx="18" cy="5" r="2.5" stroke-width="2"></circle><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.5 19H17a3 3 0 000-6H7a3 3 0 010-6h8.5"></path></svg>
                距您{{ distanceText }}
              </span>
              <span v-if="hasDisplayValue(detail.contact)" class="inline-flex items-center gap-1.5">
                <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0z"></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 22a10 10 0 100-20 10 10 0 000 20z"></path></svg>
                联系人 {{ detail.contact }}
              </span>
            </div>

            <div class="mt-4 flex items-start gap-2 text-sm leading-6 text-text-muted">
              <svg class="mt-0.5 h-4 w-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 11c0 1.657-1.343 3-3 3S6 12.657 6 11s1.343-3 3-3 3 1.343 3 3z"></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19.5 11c0 7-7.5 11-7.5 11S4.5 18 4.5 11a7.5 7.5 0 1115 0z"></path></svg>
              <span class="whitespace-pre-line">{{ arenaAddress }}</span>
            </div>

            <div class="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
              <div class="rounded-xl border border-border bg-surfaceSoft/50 px-4 py-3">
                <p class="text-xs text-text-muted">手机号</p>
                <a
                  v-if="arenaPhone !== '无'"
                  :href="`tel:${arenaPhone}`"
                  class="mt-1 inline-flex items-center gap-2 text-base font-semibold text-text-main transition-colors hover:text-brand-primary"
                >
                  <svg class="h-4 w-4 text-brand-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.128a11.042 11.042 0 005.516 5.516l1.128-2.257a1 1 0 011.21-.502l4.493 1.498A1 1 0 0121 15.72V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"></path></svg>
                  <span>{{ arenaPhone }}</span>
                </a>
                <p v-else class="mt-1 text-base font-semibold text-text-main">无</p>
              </div>

              <div class="rounded-xl border border-border bg-surfaceSoft/50 px-4 py-3">
                <p class="text-xs text-text-muted">微信号</p>
                <p class="mt-1 text-base font-semibold text-text-main">{{ arenaWechat }}</p>
              </div>

              <div class="rounded-xl border border-border bg-surfaceSoft/50 px-4 py-3">
                <p class="text-xs text-text-muted">联系人</p>
                <p class="mt-1 text-base font-semibold text-text-main">{{ arenaContact }}</p>
              </div>

              <div class="rounded-xl border border-border bg-surfaceSoft/50 px-4 py-3">
                <p class="text-xs text-text-muted">浏览量</p>
                <p class="mt-1 text-base font-semibold text-text-main">{{ arenaViewCount }}</p>
              </div>
            </div>

            <div class="mt-5 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-text-muted">
              <span>{{ arenaReviewCount }}条评论</span>
              <span>{{ arenaWantgoCount }}人想去</span>
              <span>{{ arenaGoesCount }}人去过</span>
            </div>
          </div>
        </div>
      </div>

      <section class="mt-8 rounded-card border border-border bg-white p-6 shadow-sm">
        <h2 class="mb-4 flex items-center gap-2 text-lg font-semibold text-text-main">
          <svg class="h-5 w-5 text-brand-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6M7 4h10a2 2 0 012 2v12a2 2 0 01-2 2H7a2 2 0 01-2-2V6a2 2 0 012-2z"></path></svg>
          球馆简介
        </h2>
        <p class="whitespace-pre-line text-sm leading-7 text-text-muted">{{ arenaIntro }}</p>
      </section>

      <div class="mt-8 grid gap-8 xl:grid-cols-[360px_minmax(0,1fr)]">
        <section class="rounded-card border border-border bg-white p-6 shadow-sm">
          <h2 class="mb-4 flex items-center gap-2 text-lg font-semibold text-text-main">
            <svg class="h-5 w-5 text-brand-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5V4H2v16h5m10 0v-4a3 3 0 00-3-3H10a3 3 0 00-3 3v4m10 0H7m10-11a2 2 0 11-4 0 2 2 0 014 0zm-6 0a2 2 0 11-4 0 2 2 0 014 0z"></path></svg>
            驻场教练
          </h2>

          <div v-if="relatedTrainers.length" class="space-y-3">
            <article
              v-for="trainer in relatedTrainers"
              :key="getTrainerKey(trainer)"
              class="group rounded-2xl border border-border bg-surfaceSoft/20 p-4 transition-all duration-200 hover:-translate-y-0.5 hover:border-brand-primary/30 hover:bg-white"
            >
              <NuxtLink :to="`/coaches/${trainer.uid}`" class="flex items-start gap-3">
                <ImgFallback
                  :src="trainer.image || trainer.portrait"
                  :alt="trainer.realname || trainer.username || '教练头像'"
                  class="h-16 w-16 shrink-0 rounded-2xl object-cover"
                />

                <div class="min-w-0 flex-1">
                  <div class="flex items-start justify-between gap-3">
                    <h3 class="line-clamp-2 text-base font-semibold text-text-main transition-colors group-hover:text-brand-primary">
                      {{ trainer.realname || trainer.username || '未命名教练' }}
                    </h3>
                    <span v-if="Number(trainer.score) > 0" class="shrink-0 text-xs font-semibold text-text-main">
                      积分 {{ trainer.score }}
                    </span>
                  </div>

                  <div class="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-text-muted">
                    <span>{{ formatTrainerLocation(trainer) }}</span>
                    <span v-if="hasDisplayValue(trainer.distance)">距您{{ trainer.distance }}</span>
                  </div>

                  <div class="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-text-muted">
                    <span>{{ trainer.viewnum || 0 }}人浏览</span>
                    <span class="font-medium text-[#39b54a]">{{ trainer.commentnum || 0 }}人推荐</span>
                  </div>
                </div>
              </NuxtLink>
            </article>
          </div>

          <div v-else class="rounded-2xl border border-border bg-surfaceSoft/60 px-4 py-12 text-center text-sm text-text-muted">
            当前暂无驻场教练信息
          </div>
        </section>

        <section class="rounded-card border border-border bg-white p-6 shadow-sm">
          <div class="mb-6 flex flex-wrap items-center justify-between gap-3">
            <h2 class="flex items-center gap-2 text-lg font-semibold text-text-main">
              <svg class="h-5 w-5 text-brand-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
              近期比赛
            </h2>
            <span class="text-sm text-text-muted">共 {{ relatedMatches.length }} 场</span>
          </div>

          <div v-if="relatedMatches.length" class="grid grid-cols-1 gap-6 md:grid-cols-2">
            <MatchCard
              v-for="match in relatedMatches"
              :key="getMatchKey(match)"
              :match="match"
            />
          </div>

          <div v-else class="rounded-2xl border border-border bg-surfaceSoft/60 px-4 py-12 text-center text-sm text-text-muted">
            当前暂无相关比赛
          </div>
        </section>
      </div>
    </div>

    <div v-else class="flex flex-col items-center justify-center rounded-card border border-border bg-white py-20 shadow-sm">
      <div class="mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-surfaceSoft">
        <svg class="h-10 w-10 text-text-light" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
      </div>
      <p class="text-lg font-medium text-text-muted">未找到该球馆</p>
      <p class="mt-2 text-sm text-text-light">该球馆信息可能已下架或不存在</p>
    </div>
  </div>
</template>

<script setup>
import { fetchArenaDetail, fetchArenaTrainers, fetchArenaMatches } from '~/services/arena'

const route = useRoute()
const { lat, lng } = useCity()
const { $api } = useNuxtApp()

const id = computed(() => route.params.id)
const detail = ref(null)
const trainers = ref([])
const matches = ref([])
const loading = ref(true)

let latestRequestId = 0

const normalizeText = (value) => String(value ?? '').trim()
const hasDisplayValue = (value) => normalizeText(value) !== ''

const arenaName = computed(() => normalizeText(detail.value?.name) || '未命名球馆')
const arenaImage = computed(() => detail.value?.image || detail.value?.pic || '')
const arenaIntro = computed(() => normalizeText(detail.value?.intro) || normalizeText(detail.value?.message) || '暂无简介')
const arenaPhone = computed(() => normalizeText(detail.value?.mobile) || normalizeText(detail.value?.phone) || '无')
const arenaWechat = computed(() => normalizeText(detail.value?.wx) || '无')
const arenaContact = computed(() => normalizeText(detail.value?.contact) || '无')
const arenaAddress = computed(() => normalizeText(detail.value?.address) || '暂无地址信息')
const arenaLocation = computed(() => {
  const parts = [detail.value?.province, detail.value?.city, detail.value?.district]
    .map((item) => normalizeText(item))
    .filter(Boolean)

  return parts.join(' ') || '位置待补充'
})
const distanceText = computed(() => normalizeText(detail.value?.distance))
const arenaViewCount = computed(() => Number(detail.value?.view || detail.value?.viewnum || 0))
const arenaReviewCount = computed(() => Number(detail.value?.sumreview || detail.value?.reviews || 0))
const arenaWantgoCount = computed(() => Number(detail.value?.wantgo || 0))
const arenaGoesCount = computed(() => Number(detail.value?.goes || 0))
const arenaGradeLabel = computed(() => {
  const grade = normalizeText(detail.value?.arenaGrade)
  if (!grade || grade === '0') return ''
  return grade === '1' ? '精选球馆' : `等级 ${grade}`
})

useHead(() => ({
  title: arenaName.value || '球馆详情'
}))

const dedupeByKey = (rows, getKey) => {
  const mapped = new Map()

  rows.forEach((row, index) => {
    const key = getKey(row, index)
    if (!key || mapped.has(key)) return
    mapped.set(key, row)
  })

  return Array.from(mapped.values())
}

const relatedTrainers = computed(() => {
  return dedupeByKey(trainers.value, (trainer, index) => normalizeText(trainer?.uid) || `${normalizeText(trainer?.realname)}-${index}`)
})

const relatedMatches = computed(() => {
  return dedupeByKey(matches.value, (match, index) => normalizeText(match?.eventid) || `${normalizeText(match?.title)}-${index}`)
    .map((match) => ({
      ...match,
      distance: hasDisplayValue(match?.distance) ? match.distance : undefined
    }))
})

const formatTrainerLocation = (trainer) => {
  const parts = [trainer?.province, trainer?.city]
    .map((item) => normalizeText(item))
    .filter(Boolean)

  return parts.join(' ') || '地区待补充'
}

const getTrainerKey = (trainer) => normalizeText(trainer?.uid) || normalizeText(trainer?.realname)
const getMatchKey = (match) => normalizeText(match?.eventid) || `${normalizeText(match?.title)}-${normalizeText(match?.starttime)}`

const fetchAll = async () => {
  const arenaId = normalizeText(id.value)
  if (!arenaId) {
    detail.value = null
    trainers.value = []
    matches.value = []
    loading.value = false
    return
  }

  const requestId = ++latestRequestId
  loading.value = true

  try {
    const [detailResult, trainerResult, matchResult] = await Promise.allSettled([
      fetchArenaDetail($api, { id: arenaId, lat: lat.value, lng: lng.value }),
      fetchArenaTrainers($api, { id: arenaId, page: 1 }),
      fetchArenaMatches($api, { id: arenaId, page: 1 })
    ])

    if (requestId !== latestRequestId) return

    detail.value = detailResult.status === 'fulfilled' ? detailResult.value?.data || null : null
    trainers.value = trainerResult.status === 'fulfilled' ? trainerResult.value?.data?.data || [] : []
    matches.value = matchResult.status === 'fulfilled' ? matchResult.value?.data?.data || [] : []
  } catch {
    if (requestId !== latestRequestId) return

    detail.value = null
    trainers.value = []
    matches.value = []
  } finally {
    if (requestId === latestRequestId) {
      loading.value = false
    }
  }
}

watch([id, lat, lng], () => {
  fetchAll()
}, { immediate: true })
</script>
