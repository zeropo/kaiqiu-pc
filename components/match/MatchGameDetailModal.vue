<template>
  <Modal :open="open" panel-class="max-w-6xl" @close="emit('close')">
    <div class="flex max-h-[82vh] flex-col">
      <div class="flex items-start justify-between gap-4 border-b border-border pb-4">
        <div>
          <h3 class="text-xl font-display font-bold text-text-main">比赛现场</h3>
          <p class="mt-1 text-sm text-text-muted">查看本场数据与历史交战记录</p>
        </div>

        <button
          type="button"
          class="inline-flex h-10 w-10 items-center justify-center rounded-full bg-surfaceSoft text-text-muted transition-colors hover:text-text-main"
          @click="emit('close')"
        >
          <span class="sr-only">关闭弹窗</span>
          <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
        </button>
      </div>

      <div class="mt-5 overflow-y-auto pr-1">
        <div v-if="loading" class="space-y-4">
          <div class="h-56 rounded-[28px] border border-border bg-surfaceSoft/70 animate-pulse" />
          <div class="h-80 rounded-[28px] border border-border bg-surfaceSoft/70 animate-pulse" />
        </div>

        <div v-else-if="error" class="rounded-[28px] border border-red-200 bg-red-50 px-5 py-10 text-center text-sm text-red-600">
          {{ error }}
        </div>

        <div v-else-if="!currentGame" class="rounded-[28px] border border-border bg-surfaceSoft/60 px-5 py-10 text-center text-sm text-text-muted">
          暂无交战详情
        </div>

        <div v-else class="space-y-8">
          <section class="overflow-hidden rounded-[28px] border border-border bg-gradient-to-br from-surfaceSoft via-white to-brand-primary/10 p-5 shadow-sm md:p-6">
            <div class="grid gap-6 md:grid-cols-[1fr_auto_1fr] md:items-center">
              <div class="flex flex-col items-center text-center">
                <ImgFallback :src="currentPlayer1.avatar" class="h-20 w-20 rounded-full border-4 border-white object-cover shadow-sm md:h-24 md:w-24" />
                <h4 class="mt-3 text-lg font-display font-bold text-text-main md:text-xl">{{ currentPlayer1.heading }}</h4>
                <p class="mt-1.5 text-sm font-medium text-text-muted md:text-base">当前积分：{{ currentPlayer1.currentScore }}</p>
              </div>

              <div class="text-center">
                <p class="font-display text-3xl font-black tracking-[0.18em] text-brand-primary md:text-4xl">VS</p>
              </div>

              <div class="flex flex-col items-center text-center">
                <ImgFallback :src="currentPlayer2.avatar" class="h-20 w-20 rounded-full border-4 border-white object-cover shadow-sm md:h-24 md:w-24" />
                <h4 class="mt-3 text-lg font-display font-bold text-text-main md:text-xl">{{ currentPlayer2.heading }}</h4>
                <p class="mt-1.5 text-sm font-medium text-text-muted md:text-base">当前积分：{{ currentPlayer2.currentScore }}</p>
              </div>
            </div>
          </section>

          <section class="space-y-5">
            <h4 class="text-center font-display text-xl font-bold text-text-main md:text-[1.625rem]">本场数据</h4>

            <div class="rounded-[28px] border border-border bg-white p-5 shadow-sm">
              <div class="grid gap-4 md:grid-cols-[132px_minmax(0,1fr)] md:items-center">
                <div class="rounded-2xl bg-surfaceSoft px-4 py-5 text-center text-brand-primary">
                  <p class="font-display text-base font-bold leading-none whitespace-nowrap md:text-lg">{{ currentDateText }}</p>
                </div>

                <div class="space-y-3">
                  <a
                    v-if="currentEventHref"
                    :href="currentEventHref"
                    target="_blank"
                    rel="noopener noreferrer"
                    class="inline-flex items-center gap-2 text-lg font-display font-bold leading-snug text-brand-primary transition-colors hover:text-brand-primaryHover md:text-xl"
                  >
                    <span>{{ currentEventTitle }}</span>
                    <svg class="mt-1 h-5 w-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5h5m0 0v5m0-5L10 14"></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 9v10h10"></path></svg>
                  </a>
                  <p v-else class="text-lg font-display font-bold leading-snug text-brand-primary md:text-xl">{{ currentEventTitle }}</p>
                </div>
              </div>

              <div class="mt-8 text-center">
                <h5 class="font-display text-xl font-bold text-text-main md:text-2xl">
                  本场比分<span v-if="currentStageText">（{{ currentStageText }}）</span>
                </h5>

                <div class="mt-6 grid grid-cols-[1fr_auto_1fr] items-center gap-4">
                  <p class="text-3xl font-display font-bold text-brand-primary md:text-4xl">{{ currentResult.left }}</p>
                  <p class="text-xl font-display font-bold text-text-main md:text-2xl">:</p>
                  <p class="text-3xl font-display font-bold text-brand-primary md:text-4xl">{{ currentResult.right }}</p>
                </div>

                <div class="mt-8 space-y-6">
                  <div class="space-y-3">
                    <p class="text-base font-display font-bold text-text-main md:text-lg">报名积分</p>
                    <div class="grid grid-cols-[1fr_auto_1fr] items-center gap-4 text-xl font-medium text-text-main md:text-2xl">
                      <p>{{ currentBeforeScores.left }}</p>
                      <p class="text-text-muted">:</p>
                      <p>{{ currentBeforeScores.right }}</p>
                    </div>
                  </div>

                  <div class="space-y-3">
                    <p class="text-base font-display font-bold text-text-main md:text-lg">积分变化</p>
                    <div class="grid grid-cols-[1fr_auto_1fr] items-center gap-4 text-xl font-medium md:text-2xl">
                      <p :class="getDeltaTextClass(currentChanges.left)">{{ currentChanges.left }}</p>
                      <p class="text-text-muted">:</p>
                      <p :class="getDeltaTextClass(currentChanges.right)">{{ currentChanges.right }}</p>
                    </div>
                  </div>

                  <div v-if="showAfterScores" class="space-y-3">
                    <p class="text-base font-display font-bold text-text-main md:text-lg">赛后积分</p>
                    <div class="grid grid-cols-[1fr_auto_1fr] items-center gap-4 text-xl font-medium text-text-main md:text-2xl">
                      <p>{{ currentAfterScores.left }}</p>
                      <p class="text-text-muted">:</p>
                      <p>{{ currentAfterScores.right }}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section class="space-y-5">
            <h4 class="text-center font-display text-xl font-bold text-text-main md:text-[1.625rem]">历史交战全记录</h4>

            <div class="rounded-[28px] border border-border bg-white p-5 shadow-sm">
              <div class="grid gap-4 text-center md:grid-cols-[1fr_auto_1fr] md:items-center">
                <div>
                  <p class="text-base font-display font-bold text-text-main md:text-lg">{{ historyPlayer1.heading }}</p>
                  <p class="mt-2 text-2xl font-display font-bold text-brand-primary md:text-3xl">{{ historySummary.left }}</p>
                </div>

                <div class="text-center">
                  <p class="text-sm font-semibold uppercase tracking-[0.28em] text-text-light md:text-base">VS</p>
                  <p class="mt-2 text-xl font-display font-bold text-text-main md:text-2xl">{{ historyWinsText }}</p>
                </div>

                <div>
                  <p class="text-base font-display font-bold text-text-main md:text-lg">{{ historyPlayer2.heading }}</p>
                  <p class="mt-2 text-2xl font-display font-bold text-brand-primary md:text-3xl">{{ historySummary.right }}</p>
                </div>
              </div>

              <div class="mt-6 overflow-x-auto rounded-2xl border border-border">
                <table class="min-w-full border-separate border-spacing-0 text-sm text-left">
                  <thead class="bg-surfaceSoft text-text-muted">
                    <tr>
                      <th class="px-4 py-3 font-medium">序号</th>
                      <th class="px-4 py-3 font-medium">姓名</th>
                      <th class="px-4 py-3 font-medium">姓名</th>
                      <th class="px-4 py-3 text-center font-medium">比分</th>
                      <th class="px-4 py-3 text-center font-medium">变化</th>
                      <th class="px-4 py-3 text-center font-medium">日期</th>
                    </tr>
                  </thead>

                  <tbody class="divide-y divide-border">
                    <tr
                      v-for="row in historyRows"
                      :key="row.gameId"
                      class="group cursor-pointer"
                      @click="emit('select-game', row.gameId)"
                    >
                      <td
                        class="px-4 py-3 text-text-main transition-colors"
                        :class="historyRowFirstTdClass(row)"
                      >
                        {{ row.sequence }}
                      </td>
                      <td class="px-4 py-3 transition-colors" :class="historyRowTdClass(row)">
                        <a
                          v-if="row.player1.uid"
                          :href="`/scores/${row.player1.uid}`"
                          target="_blank"
                          rel="noopener noreferrer"
                          class="font-medium text-text-main transition-colors hover:text-brand-primary"
                          @click.stop
                        >
                          {{ row.player1.name }}
                        </a>
                        <span v-else class="font-medium text-text-main">
                          {{ row.player1.name }}
                        </span>
                      </td>
                      <td class="px-4 py-3 transition-colors" :class="historyRowTdClass(row)">
                        <a
                          v-if="row.player2.uid"
                          :href="`/scores/${row.player2.uid}`"
                          target="_blank"
                          rel="noopener noreferrer"
                          class="font-medium text-text-main transition-colors hover:text-brand-primary"
                          @click.stop
                        >
                          {{ row.player2.name }}
                        </a>
                        <span v-else class="font-medium text-text-main">
                          {{ row.player2.name }}
                        </span>
                      </td>
                      <td class="px-4 py-3 text-center transition-colors" :class="historyRowTdClass(row)">
                        <button
                          type="button"
                          class="inline-flex items-center justify-center px-1 py-1 font-semibold transition-colors"
                          :class="getHistoryButtonClass(row, 'score')"
                          @click.stop="emit('select-game', row.gameId)"
                        >
                          {{ row.scoreline }}
                        </button>
                      </td>
                      <td class="px-4 py-3 text-center transition-colors" :class="historyRowTdClass(row)">
                        <button
                          type="button"
                          class="inline-flex items-center justify-center px-1 py-1 font-semibold transition-colors"
                          :class="getHistoryButtonClass(row, 'delta')"
                          @click.stop="emit('select-game', row.gameId)"
                        >
                          {{ row.changeText }}
                        </button>
                      </td>
                      <td class="px-4 py-3 text-center transition-colors" :class="historyRowTdClass(row)">
                        <button
                          type="button"
                          class="inline-flex items-center justify-center px-1 py-1 font-medium text-text-muted"
                          @click.stop="emit('select-game', row.gameId)"
                        >
                          {{ row.dateText }}
                        </button>
                      </td>
                    </tr>

                    <tr v-if="!historyRows.length">
                      <td colspan="6" class="px-4 py-10 text-center text-text-muted">暂无历史交战记录</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  </Modal>
</template>

<script setup>
const props = defineProps({
  open: {
    type: Boolean,
    default: false
  },
  loading: {
    type: Boolean,
    default: false
  },
  error: {
    type: String,
    default: ''
  },
  detail: {
    type: Object,
    default: null
  },
  activeGameId: {
    type: String,
    default: ''
  }
})

const emit = defineEmits(['close', 'select-game'])

const normalizeText = (value) => String(value ?? '').trim()

const formatSignedValue = (value) => {
  const text = normalizeText(value)
  if (!text) return '0'
  if (/^[+-]/.test(text)) return text

  const numberValue = Number(text)
  if (Number.isNaN(numberValue)) return text
  if (numberValue > 0) return `+${numberValue}`
  return `${numberValue}`
}

const formatDisplayValue = (value, fallback = '-') => {
  const text = normalizeText(value)
  return text || fallback
}

const formatPlayerHeading = (realname, username) => {
  const primary = normalizeText(realname)
  const secondary = normalizeText(username)

  if (primary && secondary && primary !== secondary) {
    return `${primary} (${secondary})`
  }

  return primary || secondary || '-'
}

const formatDateText = (value) => {
  const text = normalizeText(value)
  const matched = text.match(/^(\d{4})[-/.](\d{2})[-/.](\d{2})$/)

  if (matched) {
    return `${matched[1]}-${matched[2]}-${matched[3]}`
  }

  return text || '--'
}

const formatStageText = (groupId) => {
  const normalized = normalizeText(groupId)
  if (!normalized) return ''
  return normalized === '-1' ? '淘汰赛' : '小组赛'
}

const getDateSortValue = (value) => {
  const text = normalizeText(value)
  const matched = text.match(/^(\d{4})[-/.](\d{1,2})[-/.](\d{1,2})(?:\s+(\d{1,2})(?::(\d{1,2}))?(?::(\d{1,2}))?)?$/)

  if (matched) {
    const [, year, month, day, hour = '0', minute = '0', second = '0'] = matched
    return Number(
      `${year}${month.padStart(2, '0')}${day.padStart(2, '0')}${hour.padStart(2, '0')}${minute.padStart(2, '0')}${second.padStart(2, '0')}`
    )
  }

  const timestamp = Date.parse(text.replace(/[./]/g, '-'))
  return Number.isNaN(timestamp) ? 0 : timestamp
}

const getDeltaTextClass = (value) => {
  if (String(value).startsWith('+')) return 'text-emerald-600'
  if (String(value).startsWith('-')) return 'text-rose-600'
  return 'text-text-main'
}

const payload = computed(() => {
  if (props.detail?.data && typeof props.detail.data === 'object') return props.detail.data
  if (props.detail && typeof props.detail === 'object') return props.detail
  return {}
})

const currentGame = computed(() => {
  return payload.value?.current_game && typeof payload.value.current_game === 'object'
    ? payload.value.current_game
    : null
})

const historyGames = computed(() => {
  return Array.isArray(payload.value?.history_game) ? payload.value.history_game : []
})

const selectedGameId = computed(() => normalizeText(props.activeGameId) || normalizeText(currentGame.value?.gameid))

const currentPlayer1 = computed(() => ({
  heading: formatPlayerHeading(currentGame.value?.realname1, currentGame.value?.username1),
  currentScore: formatDisplayValue(currentGame.value?.score1 || currentGame.value?.after_score1),
  avatar: currentGame.value?.headImg1 || ''
}))

const currentPlayer2 = computed(() => ({
  heading: formatPlayerHeading(currentGame.value?.realname2, currentGame.value?.username2),
  currentScore: formatDisplayValue(currentGame.value?.score2 || currentGame.value?.after_score2),
  avatar: currentGame.value?.headImg2 || ''
}))

const currentDateText = computed(() => formatDateText(currentGame.value?.start_time))
const currentEventTitle = computed(() => formatDisplayValue(currentGame.value?.title))
const currentEventHref = computed(() => {
  const eventId = normalizeText(currentGame.value?.eventid)
  return eventId ? `/matches/${eventId}` : ''
})

const currentStageText = computed(() => formatStageText(currentGame.value?.groupid))

const currentResult = computed(() => ({
  left: formatDisplayValue(currentGame.value?.result1),
  right: formatDisplayValue(currentGame.value?.result2)
}))

const currentBeforeScores = computed(() => ({
  left: formatDisplayValue(currentGame.value?.before_score1),
  right: formatDisplayValue(currentGame.value?.before_score2)
}))

const currentChanges = computed(() => ({
  left: formatSignedValue(currentGame.value?.change_score1),
  right: formatSignedValue(currentGame.value?.change_score2)
}))

const currentAfterScores = computed(() => ({
  left: formatDisplayValue(currentGame.value?.after_score1),
  right: formatDisplayValue(currentGame.value?.after_score2)
}))

const showAfterScores = computed(() => {
  return normalizeText(currentGame.value?.after_score1) || normalizeText(currentGame.value?.after_score2)
})

const historyPlayer1 = computed(() => ({
  heading: currentPlayer1.value.heading
}))

const historyPlayer2 = computed(() => ({
  heading: currentPlayer2.value.heading
}))

const historySummary = computed(() => ({
  left: formatDisplayValue(payload.value?.winCount1, '0'),
  right: formatDisplayValue(payload.value?.winCount2, '0')
}))

const historyWinsText = computed(() => `${historySummary.value.left} - ${historySummary.value.right}`)

const historyRows = computed(() => {
  const rawRows = [
    ...(currentGame.value ? [currentGame.value] : []),
    ...historyGames.value
  ]

  const deduped = []
  const seen = new Set()

  rawRows.forEach((row) => {
    const gameId = normalizeText(row?.gameid)
    if (!gameId || seen.has(gameId)) return
    seen.add(gameId)
    deduped.push(row)
  })

  const sortedRows = [...deduped].sort((leftRow, rightRow) => {
    const dateDiff = getDateSortValue(rightRow?.start_time) - getDateSortValue(leftRow?.start_time)
    if (dateDiff) return dateDiff

    return normalizeText(rightRow?.gameid).localeCompare(normalizeText(leftRow?.gameid), undefined, { numeric: true })
  })

  return sortedRows.map((row, index) => ({
    gameId: normalizeText(row?.gameid),
    sequence: index + 1,
    player1: {
      uid: normalizeText(row?.uid1),
      name: formatDisplayValue(row?.realname1 || row?.username1)
    },
    player2: {
      uid: normalizeText(row?.uid2),
      name: formatDisplayValue(row?.realname2 || row?.username2)
    },
    scoreline: `${formatDisplayValue(row?.result1, '0')}:${formatDisplayValue(row?.result2, '0')}`,
    changeText: formatSignedValue(row?.change_score1),
    dateText: formatDisplayValue(row?.start_time)
  }))
})

const historyRowTdClass = (row) => {
  return row.gameId === selectedGameId.value
    ? 'bg-brand-primary/10'
    : 'group-hover:bg-surfaceMuted'
}

const historyRowFirstTdClass = (row) => {
  return row.gameId === selectedGameId.value
    ? 'border-l-4 border-brand-primary bg-brand-primary/10'
    : 'group-hover:bg-surfaceMuted'
}

const getHistoryButtonClass = (row, type) => {
  if (type === 'score') {
    return 'font-bold text-brand-primary hover:text-brand-primaryHover'
  }

  const deltaClass = getDeltaTextClass(row.changeText)
  return `${deltaClass} hover:opacity-80`
}
</script>
