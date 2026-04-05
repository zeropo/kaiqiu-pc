<template>
  <div class="overflow-x-auto rounded-[28px] border border-border bg-gradient-to-br from-slate-50 to-white p-4 md:p-5">
    <div class="inline-flex min-w-full items-start pb-4" :style="bracketStyle">
      <div
        v-for="(round, roundIndex) in rounds"
        :key="round.title || `round-${roundIndex}`"
        class="shrink-0"
        :style="getRoundStyle()"
      >
        <div class="mb-4 text-center">
          <p class="text-xs font-semibold uppercase tracking-[0.2em] text-text-light">淘汰赛</p>
          <h4 class="mt-1 font-display text-base font-bold text-text-main">{{ round.title }}</h4>
        </div>

        <div class="relative" :style="getColumnStyle(roundIndex)">
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
                  <a
                    v-if="player?.uid"
                    :href="`/scores/${player.uid}`"
                    target="_blank"
                    rel="noopener noreferrer"
                    class="min-w-0 flex-1 cursor-pointer truncate text-left text-[15px] font-medium leading-none transition-colors"
                    :class="player?.isWinner ? 'hover:text-blue-700' : 'hover:text-text-main'"
                  >
                    {{ player?.name || '-' }}
                  </a>
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
</template>

<script setup>
const props = defineProps({
  rounds: {
    type: Array,
    default: () => []
  }
})

const ROUND_WIDTH = 188
const COLUMN_GAP = 40
const CONNECTOR_SPAN = COLUMN_GAP / 2
const BASE_MATCH_HEIGHT = 100
const BASE_GAP = 20
const BASE_STEP = BASE_MATCH_HEIGHT + BASE_GAP

const bracketStyle = {
  gap: `${COLUMN_GAP}px`
}

const incomingConnectorStyle = {
  left: `${-CONNECTOR_SPAN}px`,
  width: `${CONNECTOR_SPAN}px`
}

const outgoingConnectorStyle = {
  right: `${-CONNECTOR_SPAN}px`,
  width: `${CONNECTOR_SPAN}px`
}

const getRoundStyle = () => ({
  width: `${ROUND_WIDTH}px`
})

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
</script>
