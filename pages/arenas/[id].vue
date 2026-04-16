<template>
  <div class="container pt-8 pb-10 md:pt-12 md:pb-16">
    <div v-if="loading" class="space-y-6">
      <div class="h-72 animate-pulse rounded-card border border-border bg-white" />
      <div class="h-52 animate-pulse rounded-card border border-border bg-white" />
      <div class="h-48 animate-pulse rounded-card border border-border bg-white" />
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
            <h1 class="font-display text-3xl font-bold text-text-main">{{ arenaName }}</h1>

            <div class="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-text-muted">
              <span class="inline-flex items-center gap-1.5">
                <svg class="h-4 w-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
                <span class="whitespace-pre-line">{{ arenaAddress }}</span>
              </span>
            </div>

            <div v-if="distanceText" class="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-text-muted">
              <span class="inline-flex items-center gap-1.5">
                <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><circle cx="6" cy="19" r="2.5" stroke-width="2"></circle><circle cx="18" cy="5" r="2.5" stroke-width="2"></circle><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.5 19H17a3 3 0 000-6H7a3 3 0 010-6h8.5"></path></svg>
                距您{{ distanceText }}
              </span>
            </div>

            <div class="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
              <div class="rounded-xl border border-border bg-surfaceSoft/50 px-4 py-3">
                <p class="text-xs text-text-muted">联系人</p>
                <p class="mt-1 text-base font-semibold text-text-main">{{ arenaContact }}</p>
              </div>

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
            </div>

            <div class="mt-5 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-text-muted">
              <span>{{ arenaViewCount }}人浏览</span>
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

      <section class="mt-8 rounded-card border border-border bg-white p-6 shadow-sm">
        <div class="mb-6 flex flex-wrap items-center justify-between gap-3">
          <h2 class="flex items-center gap-2 text-lg font-semibold text-text-main">
            <svg class="h-5 w-5 text-brand-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
            近期比赛
          </h2>
          <span class="text-sm text-text-muted">共 {{ relatedMatches.length }} 场</span>
        </div>

        <div v-if="relatedMatches.length" class="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <MatchCard
            v-for="match in relatedMatches"
            :key="getMatchKey(match)"
            :match="match"
            :open-in-new-tab="true"
          />
        </div>

        <div v-else class="rounded-2xl border border-border bg-surfaceSoft/60 px-4 py-12 text-center text-sm text-text-muted">
          当前暂无相关比赛
        </div>
      </section>

      <section class="mt-8 rounded-card border border-border bg-white p-6 shadow-sm">
        <h2 class="mb-4 flex items-center gap-2 text-lg font-semibold text-text-main">
          <svg class="h-5 w-5 shrink-0 text-brand-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"></path></svg>
          管理者
        </h2>

        <div v-if="managers.length" class="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <template v-for="m in managers" :key="getManagerKey(m)">
            <NuxtLink
              v-if="isCoachNavigable(m)"
              :to="`/coaches/${m.uid}`"
              target="_blank"
              rel="noopener noreferrer"
              class="group flex flex-col items-center rounded-2xl border border-border bg-surfaceSoft/20 p-4 text-center shadow-card transition-shadow duration-300 hover:shadow-cardHover"
            >
              <div class="shrink-0">
                <ImgFallback
                  :src="managerAvatarCoach(m)"
                  :alt="formatManagerDisplayName(m)"
                  class="h-16 w-16 rounded-full object-cover"
                />
              </div>
              <p class="mt-3 line-clamp-2 text-sm font-semibold text-text-main group-hover:text-brand-primary">
                {{ formatManagerDisplayName(m) }}
              </p>
              <div class="mt-3 h-7">
                <span
                  v-if="managerGradeLabel(m.grade)"
                  class="inline-flex items-center rounded-full border border-brand-primary/20 bg-brand-primary/5 px-2.5 py-1 text-xs font-medium leading-none text-brand-primary"
                >
                  {{ managerGradeLabel(m.grade) }}
                </span>
              </div>
              <p class="mt-3 text-xs text-text-muted">
                授权时间: {{ formatManagerAuthTime(m.dateline) }}
              </p>
            </NuxtLink>
            <article
              v-else
              class="flex flex-col items-center rounded-2xl border border-border bg-surfaceSoft/20 p-4 text-center shadow-card"
            >
              <div class="shrink-0">
                <ImgFallback
                  :src="managerFaceOnly(m)"
                  :alt="formatManagerDisplayName(m)"
                  class="h-16 w-16 rounded-full object-cover"
                />
              </div>
              <p class="mt-3 line-clamp-2 text-sm font-semibold text-text-main">
                {{ formatManagerDisplayName(m) }}
              </p>
              <div class="mt-3 h-7">
                <span
                  v-if="managerGradeLabel(m.grade)"
                  class="inline-flex items-center rounded-full border border-brand-primary/20 bg-brand-primary/5 px-2.5 py-1 text-xs font-medium leading-none text-brand-primary"
                >
                  {{ managerGradeLabel(m.grade) }}
                </span>
              </div>
              <p class="mt-3 text-xs text-text-muted">
                授权时间: {{ formatManagerAuthTime(m.dateline) }}
              </p>
            </article>
          </template>
        </div>

        <div v-else class="rounded-2xl border border-border bg-surfaceSoft/60 px-4 py-12 text-center text-sm text-text-muted">
          暂无管理者信息
        </div>
      </section>
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
import { fetchArenaDetail, fetchArenaMatches, fetchArenaAuthorizedUsers } from '~/services/arena'
import { fetchTrainerDetail } from '~/services/trainer'

const route = useRoute()
const { lat, lng } = useCity()
const { $api } = useNuxtApp()

const id = computed(() => route.params.id)
const detail = ref(null)
const matches = ref([])
const authorizedUsers = ref([])
const trainerDetailByUid = ref({})
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
const distanceText = computed(() => normalizeText(detail.value?.distance))
const arenaViewCount = computed(() => Number(detail.value?.view || detail.value?.viewnum || 0))

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

const relatedMatches = computed(() => {
  const arenaDist = distanceText.value
  return dedupeByKey(matches.value, (match, index) => normalizeText(match?.eventid) || `${normalizeText(match?.title)}-${index}`)
    .map((match) => {
      let d
      if (hasDisplayValue(match?.distance)) {
        d = match.distance
      } else if (normalizeText(match?.juli) !== '') {
        d = match.juli
      } else if (hasDisplayValue(arenaDist)) {
        d = arenaDist
      }
      return {
        ...match,
        distance: d
      }
    })
})

const managers = computed(() => dedupeByKey(authorizedUsers.value, (m) => normalizeText(m.uid)))

const MANAGER_GRADE_LABELS = {
  9: '主席',
  8: '副主席'
}

const managerGradeLabel = (grade) => {
  const n = Number(grade)
  return MANAGER_GRADE_LABELS[n] || ''
}

const formatManagerDisplayName = (m) => {
  const nick = normalizeText(m.username2)
  const real = normalizeText(m.realname)
  if (nick && real) {
    if (nick === real) {
      return nick
    }
    return `${nick} (${real})`
  }
  return nick || real || '未命名'
}

const formatManagerAuthTime = (dateline) => {
  const n = Number(dateline)
  if (!n || n <= 0) {
    return '--'
  }
  const d = new Date(n * 1000)
  const y = d.getFullYear()
  const mo = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${mo}-${day}`
}

const managerFaceOnly = (m) => normalizeText(m.face) || ''

const managerAvatarCoach = (m) => {
  const uid = normalizeText(m.uid)
  const d = trainerDetailByUid.value[uid]
  if (d) {
    const fromDetail = normalizeText(d.image) || normalizeText(d.portrait)
    if (fromDetail) {
      return fromDetail
    }
  }
  return normalizeText(m.face) || ''
}

const isCoachNavigable = (m) => {
  const uid = normalizeText(m.uid)
  const d = trainerDetailByUid.value[uid]
  if (!d) {
    return false
  }
  const exp = normalizeText(d.expiretime)
  if (!exp) {
    return true
  }
  return exp.slice(0, 10) !== '1970-01-01'
}

const loadManagerTrainerDetails = async (uids, requestId) => {
  const cleaned = [...new Set(uids.map((u) => normalizeText(u)).filter(Boolean))]
  const next = {}
  await Promise.all(
    cleaned.map(async (uid) => {
      try {
        const res = await fetchTrainerDetail($api, { id: uid })
        next[uid] = res.data || null
      } catch {
        next[uid] = null
      }
    })
  )
  if (requestId !== latestRequestId) {
    return
  }
  trainerDetailByUid.value = next
}

const getManagerKey = (m) => normalizeText(m.uid)

const getMatchKey = (match) => normalizeText(match?.eventid) || `${normalizeText(match?.title)}-${normalizeText(match?.starttime)}`

const fetchAll = async () => {
  const arenaId = normalizeText(id.value)
  if (!arenaId) {
    detail.value = null
    matches.value = []
    authorizedUsers.value = []
    trainerDetailByUid.value = {}
    loading.value = false
    return
  }

  const requestId = ++latestRequestId
  loading.value = true

  try {
    const [detailResult, matchResult, authResult] = await Promise.allSettled([
      fetchArenaDetail($api, { id: arenaId, lat: lat.value, lng: lng.value }),
      fetchArenaMatches($api, { id: arenaId, page: 1 }),
      fetchArenaAuthorizedUsers($api, { shopid: arenaId })
    ])

    if (requestId !== latestRequestId) return

    detail.value = detailResult.status === 'fulfilled' ? detailResult.value?.data || null : null
    matches.value = matchResult.status === 'fulfilled' ? matchResult.value?.data?.data || [] : []
    authorizedUsers.value = authResult.status === 'fulfilled' ? authResult.value?.data?.managerList || [] : []
    trainerDetailByUid.value = {}
    const managerUids = dedupeByKey(authorizedUsers.value, (row) => normalizeText(row?.uid)).map((row) => row.uid)
    await loadManagerTrainerDetails(managerUids, requestId)
  } catch {
    if (requestId !== latestRequestId) return

    detail.value = null
    matches.value = []
    authorizedUsers.value = []
    trainerDetailByUid.value = {}
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
