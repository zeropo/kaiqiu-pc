<template>
  <section class="bg-white rounded-card shadow-sm border border-border p-6 md:p-8">
    <div class="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
      <h2 class="flex items-center border-l-4 border-brand-primary pl-3 font-display text-xl font-bold text-text-main">{{ title }}</h2>

      <div class="flex flex-wrap items-center justify-end gap-3">
        <button
          v-if="showRefresh"
          type="button"
          class="inline-flex items-center rounded-lg border border-brand-primary/20 bg-brand-primary/5 px-3 py-2 text-sm font-medium text-brand-primary transition-colors hover:bg-brand-primary/10 disabled:cursor-not-allowed disabled:opacity-60"
          :disabled="refreshing"
          @click="emit('refresh')"
        >
          {{ refreshing ? '刷新中...' : refreshLabel }}
        </button>
      </div>
    </div>

    <div v-if="loading" class="mt-6 space-y-4">
      <div class="h-12 rounded-full border border-border bg-surfaceSoft/80" />
      <div class="grid gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
        <div class="space-y-4">
          <div class="h-80 rounded-[28px] border border-border bg-surfaceSoft/80" />
          <div class="h-72 rounded-[28px] border border-border bg-surfaceSoft/80" />
        </div>
        <div class="h-80 rounded-[28px] border border-border bg-surfaceSoft/80" />
      </div>
    </div>

    <div
      v-else-if="error"
      class="mt-6 rounded-[28px] border border-red-200 bg-red-50 px-5 py-12 text-center text-sm text-red-600"
    >
      {{ error }}
    </div>

    <div
      v-else-if="!selectedItem"
      class="mt-6 rounded-[28px] border border-dashed border-border bg-surfaceSoft/50 px-5 py-12 text-center text-sm text-text-muted"
    >
      暂无赛程和积分数据
    </div>

    <div v-else class="mt-6 space-y-6">
      <MatchItemTabs
        v-if="tabItems.length"
        :model-value="modelValue"
        :tabs="tabItems"
        @update:model-value="emit('update:modelValue', $event)"
      />

      <div class="grid gap-6 xl:grid-cols-[minmax(0,1fr)_380px] xl:items-start">
        <div class="space-y-6">
          <section
            v-for="group in selectedItem.groups"
            :key="group.id || group.title"
            class="rounded-[28px] border border-border bg-white p-5 shadow-sm"
          >
            <div class="flex flex-col gap-4 border-b border-border pb-4 md:flex-row md:items-center md:justify-between">
              <h3 class="font-display text-lg font-bold text-text-main">{{ group.title }}</h3>

              <div class="flex flex-wrap items-center gap-3 text-sm text-text-muted">
                <span class="inline-flex items-center rounded-full bg-surfaceSoft px-3 py-1.5">
                  比赛时间：{{ group.startTimeText || '待公布' }}
                </span>
                <span class="inline-flex items-center rounded-full bg-surfaceSoft px-3 py-1.5">
                  桌号：{{ group.tableText || '待公布' }}
                </span>
              </div>
            </div>

            <div class="mt-5">
              <MatchGroupMatrix :group="group" @open-game-detail="openGroupGameDetail" />
            </div>
          </section>
        </div>

        <aside class="xl:sticky xl:top-6">
          <MatchHonorRanking :honors="selectedItem.honors" />
        </aside>
      </div>

      <section
        v-if="selectedItem.knockoutRounds.length"
        class="rounded-[28px] border border-border bg-white p-5 shadow-sm"
      >
        <div class="border-b border-border pb-4">
          <h3 class="font-display text-lg font-bold text-text-main">{{ selectedItem.label }}</h3>
          <p class="mt-1 text-sm text-text-muted">淘汰赛，点击姓名查看详情</p>
        </div>

        <div class="mt-5">
          <MatchKnockoutBracket :rounds="selectedItem.knockoutRounds" @open-game-detail="openKnockoutGameDetail" />
        </div>
      </section>

      <MatchTeamBattleDetailModal
        :open="teamBattleModalOpen"
        :loading="teamBattleLoading"
        :error="teamBattleError"
        :detail="teamBattleDetail"
        @close="closeTeamBattleModal"
        @select-game="openTeamBattleGameDetail"
      />

      <MatchGameDetailModal
        :open="gameDetailModalOpen"
        :loading="gameDetailLoading"
        :error="gameDetailError"
        :detail="gameDetailData"
        :active-game-id="activeGameId"
        :preferred-primary="gameDetailPerspective"
        @close="closeGameDetailModal"
        @select-game="openGameDetailById"
      />
    </div>
  </section>
</template>

<script setup>
import { fetchMatchGameIdByPlayers, fetchMatchGameDetail } from '~/services/match'
import { fetchUserGames } from '~/services/user'

const props = defineProps({
  title: {
    type: String,
    default: ''
  },
  description: {
    type: String,
    default: ''
  },
  items: {
    type: Array,
    default: () => []
  },
  modelValue: {
    type: String,
    default: ''
  },
  loading: {
    type: Boolean,
    default: false
  },
  error: {
    type: String,
    default: ''
  },
  showRefresh: {
    type: Boolean,
    default: false
  },
  refreshing: {
    type: Boolean,
    default: false
  },
  refreshLabel: {
    type: String,
    default: '刷新赛程'
  }
})

const emit = defineEmits(['update:modelValue', 'refresh'])
const { $api } = useNuxtApp()
const gameDetailModalOpen = ref(false)
const gameDetailLoading = ref(false)
const gameDetailError = ref('')
const gameDetailData = ref(null)
const activeGameId = ref('')
const teamBattleModalOpen = ref(false)
const teamBattleLoading = ref(false)
const teamBattleError = ref('')
const teamBattleDetail = ref(null)
const gameDetailPerspective = ref({
  uid: '',
  name: ''
})
let latestGameDetailRequestId = 0

const tabItems = computed(() => {
  return props.items.map((item) => ({
    value: item.id,
    label: item.label
  }))
})

const selectedItem = computed(() => {
  if (!props.items.length) return null
  return props.items.find((item) => item.id === props.modelValue) || props.items[0]
})

const normalizeText = (value) => String(value ?? '').trim()

const extractGameId = (response) => {
  const candidates = [
    response?.data?.gameid,
    response?.data?.gameId,
    response?.data?.id,
    response?.data?.data?.gameid,
    response?.data?.data?.gameId,
    response?.data?.data?.id,
    response?.data?.data,
    response?.data,
    response?.gameid,
    response?.gameId,
    response?.id
  ]

  for (const candidate of candidates) {
    const normalized = normalizeText(candidate)
    if (normalized) return normalized
  }

  return ''
}

const closeGameDetailModal = () => {
  gameDetailModalOpen.value = false
}

const closeTeamBattleModal = () => {
  teamBattleModalOpen.value = false
}

const splitScoreText = (scoreText) => {
  const [left = '0', right = '0'] = normalizeText(scoreText).split(':')
  return {
    left: left || '0',
    right: right || '0'
  }
}

const reverseScoreText = (scoreText) => {
  const score = splitScoreText(scoreText)
  return `${score.right}:${score.left}`
}

const orientTeamBattleRow = (row, shouldSwap) => {
  if (!shouldSwap) return row

  return {
    ...row,
    player1Name: row?.player2Name || row?.player2 || '-',
    player2Name: row?.player1Name || row?.player1 || '-',
    leftPlayer: row?.rightPlayer || { uid: '', name: row?.player2Name || row?.player2 || '-' },
    rightPlayer: row?.leftPlayer || { uid: '', name: row?.player1Name || row?.player1 || '-' },
    score: reverseScoreText(row?.score)
  }
}

const buildTeamBattleDetailForView = (payload) => {
  const sourceDetail = payload?.detail && typeof payload.detail === 'object' ? payload.detail : null
  if (!sourceDetail) return null

  const clickedLeftTeamId = normalizeText(payload?.leftPlayer?.teamId)
  const sourceLeftTeamId = normalizeText(sourceDetail?.teamLeft?.teamId)
  const shouldSwap = !!clickedLeftTeamId && !!sourceLeftTeamId && clickedLeftTeamId !== sourceLeftTeamId

  return {
    teamLeft: shouldSwap ? sourceDetail.teamRight : sourceDetail.teamLeft,
    teamRight: shouldSwap ? sourceDetail.teamLeft : sourceDetail.teamRight,
    scoreText: normalizeText(payload?.scoreText) || (shouldSwap ? reverseScoreText(sourceDetail?.scoreText) : normalizeText(sourceDetail?.scoreText)),
    stageLabel: payload?.groupTitle || sourceDetail?.stageLabel || '',
    rows: (Array.isArray(sourceDetail?.rows) ? sourceDetail.rows : []).map((row) => orientTeamBattleRow(row, shouldSwap))
  }
}

const loadGameDetail = async (gameId) => {
  const normalizedGameId = normalizeText(gameId)
  if (!normalizedGameId) {
    gameDetailLoading.value = false
    gameDetailError.value = '未找到本场交战详情'
    gameDetailData.value = null
    activeGameId.value = ''
    return
  }

  const requestId = ++latestGameDetailRequestId
  gameDetailLoading.value = true
  gameDetailError.value = ''
  activeGameId.value = normalizedGameId

  try {
    const response = await fetchMatchGameDetail($api, { gameId: normalizedGameId })

    if (requestId !== latestGameDetailRequestId) return

    if (Number(response?.code) !== 1 || !response?.data?.current_game) {
      gameDetailData.value = null
      activeGameId.value = ''
      gameDetailError.value = normalizeText(response?.msg) || '交战详情加载失败，请稍后重试'
      return
    }

    gameDetailData.value = response
    activeGameId.value = normalizedGameId
  } catch (error) {
    if (requestId !== latestGameDetailRequestId) return

    gameDetailData.value = null
    activeGameId.value = ''
    gameDetailError.value = '交战详情加载失败，请稍后重试'
  } finally {
    if (requestId === latestGameDetailRequestId) {
      gameDetailLoading.value = false
    }
  }
}

const resolveGameIdByPlayers = async (payload) => {
  const eventId = normalizeText(payload?.eventId)
  const itemId = normalizeText(payload?.itemId)
  const groupId = normalizeText(payload?.groupId)
  const uid1 = normalizeText(payload?.uid1 || payload?.leftPlayer?.uid)
  const uid2 = normalizeText(payload?.uid2 || payload?.rightPlayer?.uid)

  if (!eventId || !itemId || !uid1 || !uid2) return ''

  try {
    const response = await fetchMatchGameIdByPlayers($api, {
      eventId,
      itemId,
      uid1,
      uid2
    })

    if (Number(response?.code) === 1) {
      const resolvedGameId = extractGameId(response)
      if (resolvedGameId) return resolvedGameId
    }
  } catch (error) {
    // Some group-stage matches return "data error" from Match/getGameidByUIDAndMatchItem.
    // Fall back to the per-user game list to recover the game id for the same event/opponent.
  }

  const matchGameFromRows = (rows = []) => {
    const normalizedRows = Array.isArray(rows) ? rows : []
    const exactGroupMatch = normalizedRows.find((row) => {
      const rowEventId = normalizeText(row?.eventid)
      const rowGroupId = normalizeText(row?.groupid)
      const rowUid1 = normalizeText(row?.uid1)
      const rowUid2 = normalizeText(row?.uid2)

      return rowEventId === eventId
        && rowGroupId === groupId
        && ((rowUid1 === uid1 && rowUid2 === uid2) || (rowUid1 === uid2 && rowUid2 === uid1))
    })

    if (exactGroupMatch) return normalizeText(exactGroupMatch?.gameid)

    const eventMatch = normalizedRows.find((row) => {
      const rowEventId = normalizeText(row?.eventid)
      const rowUid1 = normalizeText(row?.uid1)
      const rowUid2 = normalizeText(row?.uid2)

      return rowEventId === eventId
        && ((rowUid1 === uid1 && rowUid2 === uid2) || (rowUid1 === uid2 && rowUid2 === uid1))
    })

    return normalizeText(eventMatch?.gameid)
  }

  for (const uid of [uid1, uid2]) {
    try {
      const response = await fetchUserGames($api, { uid, page: 1 })
      const rows = Array.isArray(response?.data?.data) ? response.data.data : []
      const resolvedGameId = matchGameFromRows(rows)

      if (resolvedGameId) return resolvedGameId
    } catch (error) {
      // Ignore and continue trying other fallbacks.
    }
  }

  return ''
}

const openGameDetailFromPayload = async (payload) => {
  gameDetailModalOpen.value = true
  gameDetailData.value = null
  activeGameId.value = ''
  gameDetailError.value = ''
  gameDetailPerspective.value = {
    uid: normalizeText(payload?.leftPlayer?.uid || payload?.uid1),
    name: normalizeText(payload?.leftPlayer?.name || payload?.player1?.name)
  }

  const directGameId = normalizeText(payload?.gameId)

  if (directGameId) {
    await loadGameDetail(directGameId)
    return
  }

  gameDetailLoading.value = true

  try {
    const resolvedGameId = await resolveGameIdByPlayers(payload)
    await loadGameDetail(resolvedGameId)
  } catch (error) {
    gameDetailLoading.value = false
    gameDetailData.value = null
    activeGameId.value = ''
    gameDetailError.value = '交战详情加载失败，请稍后重试'
  }
}

const openGroupGameDetail = async (payload) => {
  if (payload?.source === 'group-team') {
    gameDetailModalOpen.value = false
    activeGameId.value = ''
    gameDetailData.value = null
    gameDetailError.value = ''

    teamBattleLoading.value = false
    teamBattleError.value = ''
    teamBattleDetail.value = buildTeamBattleDetailForView(payload)
    teamBattleModalOpen.value = true

    if (!teamBattleDetail.value) {
      teamBattleError.value = '当前未找到该场团队详细对阵'
    }

    return
  }

  await openGameDetailFromPayload(payload)
}

const openKnockoutGameDetail = async (payload) => {
  await openGameDetailFromPayload(payload)
}

const openGameDetailById = async (gameId) => {
  gameDetailModalOpen.value = true
  await loadGameDetail(gameId)
}

const openTeamBattleGameDetail = async (payload) => {
  await openGameDetailFromPayload({
    gameId: payload?.gameId,
    leftPlayer: payload?.leftPlayer,
    rightPlayer: payload?.rightPlayer
  })
}
</script>
