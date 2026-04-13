<template>
  <Modal :open="open" panel-class="max-w-[50rem]" @close="emit('close')">
    <div class="flex max-h-[82vh] flex-col">
      <div class="flex items-start justify-between gap-4 border-b border-border pb-4">
        <div>
          <h3 class="text-xl font-display font-bold text-text-main">团体赛小组比分</h3>
          <p class="mt-1 text-sm text-text-muted">查看团体对阵总比分与小场详情</p>
        </div>

        <button
          type="button"
          class="inline-flex h-10 w-10 items-center justify-center rounded-full bg-surfaceSoft text-text-muted transition-colors hover:text-text-main"
          @click="emit('close')"
        >
          <span class="sr-only">关闭弹窗</span>
          <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <div class="mt-5 overflow-y-auto pr-1">
        <div class="space-y-6 text-center">
          <section class="overflow-hidden rounded-[28px] border border-border bg-gradient-to-br from-surfaceSoft via-white to-brand-primary/10 p-5 shadow-sm md:p-6">
            <div class="text-sm font-semibold text-text-light">团体对阵总比分</div>
            <div class="mt-4 grid grid-cols-[1fr_auto_1fr] items-center gap-4 md:gap-6">
              <p class="text-lg font-display font-bold text-text-main md:text-xl">{{ leftTeamLabel }}</p>
              <p :class="['text-3xl font-display font-bold md:text-4xl', totalScoreState.leftWon ? 'text-brand-primary' : 'text-text-main']">{{ totalScoreText }}</p>
              <p class="text-lg font-display font-bold text-text-main md:text-xl">{{ rightTeamLabel }}</p>
            </div>
          </section>

          <div v-if="loading" class="rounded-[28px] border border-border bg-surfaceSoft/60 px-5 py-10 text-sm text-text-muted">
            团体赛比分加载中...
          </div>

          <div v-else-if="error" class="rounded-[28px] border border-red-200 bg-red-50 px-5 py-10 text-sm text-red-600">
            {{ error }}
          </div>

          <div v-else-if="!rows.length" class="rounded-[28px] border border-border bg-surfaceSoft/60 px-5 py-10 text-sm text-text-muted">
            当前暂无小场比分
          </div>

          <div v-else class="rounded-[28px] border border-border bg-white shadow-sm">
            <div class="overflow-x-auto">
              <table class="min-w-full text-left text-sm">
                <thead class="bg-surfaceSoft text-text-muted">
                  <tr>
                    <th class="px-4 py-3 font-medium">序号</th>
                    <th class="px-4 py-3 font-medium">选手1</th>
                    <th class="px-4 py-3 font-medium">选手2</th>
                    <th class="px-4 py-3 font-medium text-center">比分</th>
                    <th class="px-4 py-3 font-medium text-center">详情</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-border">
                  <tr v-for="row in rows" :key="row.id" class="group text-text-main">
                    <td class="px-4 py-3 font-semibold">{{ row.sequence }}</td>
                    <td class="px-4 py-3">
                      <a
                        v-if="row.leftPlayer.uid"
                        :href="`/scores/${row.leftPlayer.uid}`"
                        target="_blank"
                        rel="noopener noreferrer"
                        :class="['font-medium transition-colors hover:text-brand-primaryHover', row.leftWon ? 'text-brand-primary' : 'text-text-main']"
                      >
                        {{ row.player1 }}
                      </a>
                      <span v-else :class="['font-medium', row.leftWon ? 'text-brand-primary' : 'text-text-main']">{{ row.player1 }}</span>
                    </td>
                    <td class="px-4 py-3">
                      <a
                        v-if="row.rightPlayer.uid"
                        :href="`/scores/${row.rightPlayer.uid}`"
                        target="_blank"
                        rel="noopener noreferrer"
                        :class="['font-medium transition-colors hover:text-brand-primaryHover', row.rightWon ? 'text-brand-primary' : 'text-text-main']"
                      >
                        {{ row.player2 }}
                      </a>
                      <span v-else :class="['font-medium', row.rightWon ? 'text-brand-primary' : 'text-text-main']">{{ row.player2 }}</span>
                    </td>
                    <td :class="['px-4 py-3 text-center font-semibold', row.leftWon ? 'text-brand-primary' : 'text-text-main']">
                      {{ row.score || '-' }}
                    </td>
                    <td class="px-4 py-3 text-center">
                      <button
                        v-if="row.gameId && !row.disableDetail"
                        type="button"
                        class="inline-flex h-8 w-8 items-center justify-center rounded-full border border-surfaceSoft bg-white text-brand-primary transition-colors hover:border-brand-primary/30 hover:text-brand-primaryHover"
                        @click="emit('select-game', {
                          gameId: row.gameId,
                          leftPlayer: row.leftPlayer,
                          rightPlayer: row.rightPlayer
                        })"
                      >
                        <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
                        </svg>
                      </button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
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
    default: () => ({})
  }
})

const emit = defineEmits(['close', 'select-game'])

const normalizeText = (value) => String(value ?? '').trim()

const leftTeamLabel = computed(() => normalizeText(props.detail?.teamLeft?.name || props.detail?.leftName || '-'))
const rightTeamLabel = computed(() => normalizeText(props.detail?.teamRight?.name || props.detail?.rightName || '-'))
const totalScoreText = computed(() => normalizeText(props.detail?.scoreText || props.detail?.totalScore || '0:0'))

const isWalkoverToken = (value) => {
  const text = normalizeText(value).toLowerCase()
  return text === 'wo' || text === 'bye' || text === '轮空'
}

const getScoreState = (scoreText, leftPlayer = {}, rightPlayer = {}) => {
  const [left = '', right = ''] = normalizeText(scoreText).split(':')
  const leftText = normalizeText(left)
  const rightText = normalizeText(right)
  const leftScore = Number(leftText)
  const rightScore = Number(rightText)
  const hasLeftPlayer = !!normalizeText(leftPlayer?.uid || leftPlayer?.name)
  const hasRightPlayer = !!normalizeText(rightPlayer?.uid || rightPlayer?.name)

  if (!leftText && !rightText) {
    return {
      leftWon: hasLeftPlayer && !hasRightPlayer,
      rightWon: hasRightPlayer && !hasLeftPlayer
    }
  }

  if (isWalkoverToken(leftText) && isWalkoverToken(rightText)) {
    return { leftWon: false, rightWon: false }
  }

  if (isWalkoverToken(leftText)) {
    return { leftWon: false, rightWon: true }
  }

  if (isWalkoverToken(rightText)) {
    return { leftWon: true, rightWon: false }
  }

  if (Number.isFinite(leftScore) && Number.isFinite(rightScore)) {
    if (leftScore > rightScore) return { leftWon: true, rightWon: false }
    if (rightScore > leftScore) return { leftWon: false, rightWon: true }
    if (leftScore === 0 && rightScore === 0) {
      return {
        leftWon: hasLeftPlayer && !hasRightPlayer,
        rightWon: hasRightPlayer && !hasLeftPlayer
      }
    }
  }

  return {
    leftWon: hasLeftPlayer && !hasRightPlayer,
    rightWon: hasRightPlayer && !hasLeftPlayer
  }
}

const totalScoreState = computed(() => getScoreState(totalScoreText.value, props.detail?.teamLeft, props.detail?.teamRight))

const rows = computed(() => {
  const candidateRows = Array.isArray(props.detail?.rows) ? props.detail.rows : []
  return candidateRows.map((row, index) => {
    const sequence = row?.sequence || index + 1
    const score = normalizeText(row?.score)
    const leftPlayer = row?.leftPlayer || {
      uid: '',
      name: normalizeText(row?.player1Name || row?.player1 || row?.leftName)
    }
    const rightPlayer = row?.rightPlayer || {
      uid: '',
      name: normalizeText(row?.player2Name || row?.player2 || row?.rightName)
    }
    const scoreState = getScoreState(score, leftPlayer, rightPlayer)

    return {
      id: row?.id || `${row?.gameId || 'row'}-${index}`,
      sequence,
      player1: normalizeText(row?.player1Name || row?.player1 || row?.leftName),
      player2: normalizeText(row?.player2Name || row?.player2 || row?.rightName),
      score,
      leftWon: scoreState.leftWon,
      rightWon: scoreState.rightWon,
      disableDetail: sequence === 1,
      gameId: normalizeText(row?.gameId),
      leftPlayer,
      rightPlayer
    }
  })
})
</script>
