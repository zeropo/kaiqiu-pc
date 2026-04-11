<template>
  <div class="overflow-x-auto rounded-[28px] border border-border bg-gradient-to-br from-slate-50 to-white p-4 md:p-5">
    <div class="flex min-w-full items-start pb-4" :class="shouldCenterBracket ? 'justify-center' : 'justify-start'">
      <div class="inline-flex items-start" :style="bracketStyle">
        <div
          v-for="(round, roundIndex) in rounds"
          :key="round.title || `round-${roundIndex}`"
          class="shrink-0"
          :style="getRoundStyle()"
        >
          <div class="mb-4 text-center">
            <h4 class="font-display text-base font-bold text-text-main">{{ round.title }}</h4>
          </div>

          <div
            class="relative"
            :style="getColumnStyle(roundIndex)"
          >
            <div
              v-for="connector in getPairConnectors(roundIndex, round.matches.length)"
              :key="connector.id"
              class="pointer-events-none absolute border-r-2 border-slate-300"
              :style="getPairConnectorStyle(connector)"
            />
            <div
              v-for="(match, matchIndex) in round.matches"
              :key="match.id || `${roundIndex}-${matchIndex}`"
              class="relative z-10"
              :style="getMatchStyle(roundIndex, matchIndex, round.matches.length)"
            >
              <div
                v-if="roundIndex > 0"
                class="pointer-events-none absolute top-1/2 h-px -translate-y-1/2 bg-slate-300"
                :style="incomingConnectorStyle"
              />
              <div
                v-if="roundIndex < rounds.length - 1"
                class="pointer-events-none absolute top-1/2 h-px -translate-y-1/2 bg-slate-300"
                :style="outgoingConnectorStyle"
              />

              <div class="h-[100px] rounded-[22px] border border-border bg-white p-2.5 shadow-sm">
                <div class="flex h-full flex-col justify-between">
                  <div
                    v-for="player in [match.player1, match.player2]"
                    :key="player?.uid || player?.name"
                    class="flex h-[37px] items-center justify-between gap-2 rounded-lg border px-2.5"
                    :class="getPlayerCardClass(player)"
                  >
                    <button
                      v-if="canOpenMatchDetail(match)"
                      type="button"
                      class="min-w-0 flex-1 cursor-pointer truncate text-left text-[15px] font-medium leading-none underline decoration-current underline-offset-4 transition-colors hover:opacity-70"
                      :class="player?.isWinner ? 'hover:text-blue-700' : 'hover:text-text-main'"
                      @click="openMatchDetail(match)"
                    >
                      {{ player?.name || '-' }}
                    </button>
                    <span
                      v-else
                      class="min-w-0 flex-1 truncate text-left text-[15px] font-medium leading-none"
                    >
                      {{ player?.name || '-' }}
                    </span>
                    <span class="font-display text-lg font-bold leading-none">{{ player?.score ?? '-' }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  rounds: {
    type: Array,
    default: () => []
  }
})
const emit = defineEmits(['open-game-detail'])

const ROUND_WIDTH = 188
const COLUMN_GAP = 40
const CONNECTOR_SPAN = COLUMN_GAP / 2
const FULL_WIDTH_ROUND_COUNT = 5
const BASE_MATCH_HEIGHT = 100
const BASE_GAP = 20
const BASE_STEP = BASE_MATCH_HEIGHT + BASE_GAP

const roundCount = computed(() => props.rounds.length)

const shouldFillAvailableWidth = computed(() => roundCount.value === FULL_WIDTH_ROUND_COUNT)
const shouldCenterBracket = computed(() => roundCount.value > 0 && roundCount.value < FULL_WIDTH_ROUND_COUNT)

const getBracketWidth = () => {
  if (shouldFillAvailableWidth.value) return '100%'

  const totalRounds = roundCount.value
  if (!totalRounds) return '100%'

  return `${(ROUND_WIDTH * totalRounds) + (COLUMN_GAP * Math.max(totalRounds - 1, 0))}px`
}

const bracketStyle = computed(() => ({
  gap: `${COLUMN_GAP}px`,
  width: getBracketWidth()
}))

const incomingConnectorStyle = {
  left: `${-CONNECTOR_SPAN}px`,
  width: `${CONNECTOR_SPAN}px`
}

const outgoingConnectorStyle = {
  right: `${-CONNECTOR_SPAN}px`,
  width: `${CONNECTOR_SPAN}px`
}

const getRoundStyle = () => {
  if (shouldFillAvailableWidth.value) {
    return {
      flex: `1 0 ${ROUND_WIDTH}px`,
      minWidth: `${ROUND_WIDTH}px`
    }
  }

  return {
    width: `${ROUND_WIDTH}px`
  }
}

const getMatchStep = (roundIndex) => BASE_STEP * (2 ** roundIndex)

const getColumnOffset = (roundIndex) => {
  if (roundIndex === 0) return 0
  return (BASE_STEP * ((2 ** roundIndex) - 1)) / 2
}

const getColumnStyle = (roundIndex) => ({
  paddingTop: `${getColumnOffset(roundIndex)}px`
})

const getMatchSpacing = (roundIndex) => {
  return getMatchStep(roundIndex) - BASE_MATCH_HEIGHT
}

const getMatchStyle = (roundIndex, matchIndex, totalMatches) => {
  const isLast = matchIndex === totalMatches - 1
  return {
    marginBottom: isLast ? '0px' : `${getMatchSpacing(roundIndex)}px`
  }
}

const getMatchTop = (roundIndex, matchIndex) => {
  return getColumnOffset(roundIndex) + (getMatchStep(roundIndex) * matchIndex)
}

const getMatchCenter = (roundIndex, matchIndex) => {
  return getMatchTop(roundIndex, matchIndex) + (BASE_MATCH_HEIGHT / 2)
}

const getPairConnectors = (roundIndex, totalMatches) => {
  if (roundIndex >= props.rounds.length - 1 || totalMatches < 2) return []

  const connectors = []

  for (let matchIndex = 0; matchIndex < totalMatches - 1; matchIndex += 2) {
    const top = getMatchCenter(roundIndex, matchIndex)
    const bottom = getMatchCenter(roundIndex, matchIndex + 1)

    connectors.push({
      id: `${roundIndex}-${matchIndex}`,
      top,
      height: Math.max(bottom - top, 0)
    })
  }

  return connectors
}

const getPairConnectorStyle = (connector) => ({
  top: `${connector.top}px`,
  right: `${-CONNECTOR_SPAN}px`,
  width: `${CONNECTOR_SPAN}px`,
  height: `${connector.height}px`
})

const getPlayerCardClass = (player) => {
  if (player?.isWinner) {
    return 'border-blue-500/50 bg-blue-50 text-blue-600'
  }

  return 'border-slate-200 bg-white text-slate-500'
}

const canOpenMatchDetail = (match) => {
  return !!(match?.gameId || (match?.eventId && match?.itemId && match?.uid1 && match?.uid2))
}

const openMatchDetail = (match) => {
  if (!canOpenMatchDetail(match)) return

  emit('open-game-detail', {
    source: 'knockout',
    eventId: match.eventId,
    itemId: match.itemId,
    gameId: match.gameId,
    uid1: match.uid1,
    uid2: match.uid2,
    stageLabel: match.stageLabel || '淘汰赛'
  })
}
</script>
