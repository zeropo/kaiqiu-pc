<template>
  <Modal :open="open" panel-class="max-w-[50rem]" @close="emit('close')">
    <div class="space-y-6 text-center">
      <div class="rounded-[28px] border border-border bg-gradient-to-r from-surfaceSoft via-white to-brand-primary/10 p-5 shadow-sm">
        <p class="font-display text-sm font-semibold text-text-light">组队对阵总比分</p>
        <p class="mt-2 text-xl font-bold text-brand-primary">
          {{ leftTeamLabel }} {{ totalScoreText }} {{ rightTeamLabel }}
        </p>
        <p v-if="stageText" class="mt-1 text-sm text-text-muted">{{ stageText }}</p>
      </div>

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
                  <span class="font-medium text-brand-primary">{{ row.player1 }}</span>
                </td>
                <td class="px-4 py-3">
                  <span class="font-medium text-text-main">{{ row.player2 }}</span>
                </td>
                <td class="px-4 py-3 text-center font-semibold text-brand-primary">
                  {{ row.score || '-' }}
                </td>
                <td class="px-4 py-3 text-center">
                  <button
                    v-if="row.gameId"
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
const stageText = computed(() => normalizeText(props.detail?.stageLabel || props.detail?.label))

const rows = computed(() => {
  const candidateRows = Array.isArray(props.detail?.rows) ? props.detail.rows : []
  return candidateRows.map((row, index) => ({
    id: row?.id || `${row?.gameId || 'row'}-${index}`,
    sequence: row?.sequence || index + 1,
    player1: normalizeText(row?.player1Name || row?.player1 || row?.leftName),
    player2: normalizeText(row?.player2Name || row?.player2 || row?.rightName),
    score: normalizeText(row?.score),
    gameId: normalizeText(row?.gameId),
    leftPlayer: row?.leftPlayer || {
      uid: '',
      name: normalizeText(row?.player1Name || row?.player1 || row?.leftName)
    },
    rightPlayer: row?.rightPlayer || {
      uid: '',
      name: normalizeText(row?.player2Name || row?.player2 || row?.rightName)
    }
  }))
})
</script>
