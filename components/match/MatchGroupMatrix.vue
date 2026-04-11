<template>
  <div class="overflow-x-auto rounded-[26px] border border-border">
    <table class="min-w-full border-separate border-spacing-0 text-sm text-center">
      <thead>
        <tr class="bg-surfaceSoft text-text-muted">
          <th class="sticky left-0 z-20 min-w-[164px] border-b border-r border-border bg-surfaceSoft px-4 py-3 text-left font-semibold">
            {{ group.title }}
          </th>
          <th
            v-for="(_, index) in players"
            :key="`head-${index}`"
            class="min-w-[56px] border-b border-r border-border px-3 py-3 font-medium"
          >
            {{ index + 1 }}
          </th>
          <th class="min-w-[74px] border-b border-r border-border px-3 py-3 font-medium">积分</th>
          <th class="min-w-[74px] border-b border-r border-border px-3 py-3 font-medium">计算</th>
          <th class="min-w-[74px] border-b border-border px-3 py-3 font-medium">名次</th>
        </tr>
      </thead>

      <tbody class="bg-white">
        <tr
          v-for="(player, rowIndex) in players"
          :key="player.uid || `row-${rowIndex}`"
          class="transition-colors hover:bg-surfaceSoft/40"
        >
          <th class="sticky left-0 z-10 border-b border-r border-border bg-white px-4 py-3 text-left font-medium text-text-main">
            <a
              v-if="player.uid"
              :href="`/scores/${player.uid}`"
              target="_blank"
              rel="noopener noreferrer"
              class="inline-flex max-w-[132px] cursor-pointer items-center text-brand-primary transition-colors hover:text-brand-primaryHover"
            >
              <span class="truncate">{{ rowIndex + 1 }} {{ player.name || '-' }}</span>
            </a>
            <span
              v-else
              class="inline-flex max-w-[132px] items-center text-text-main"
            >
              <span class="truncate">{{ rowIndex + 1 }} {{ player.name || '-' }}</span>
            </span>
          </th>

          <td
            v-for="(columnPlayer, columnIndex) in players"
            :key="`${player.uid || rowIndex}-${columnPlayer.uid || columnIndex}`"
            class="border-b border-r border-border px-2 py-3"
            :class="rowIndex === columnIndex ? 'bg-surfaceSoft/80' : ''"
          >
            <button
              v-if="rowIndex !== columnIndex && canOpenMatchDetail(player, columnPlayer)"
              type="button"
              class="font-semibold underline decoration-current underline-offset-4 transition-opacity hover:opacity-70"
              :class="getResultClass(player, columnPlayer)"
              @click="openMatchDetail(player, columnPlayer)"
            >
              {{ getResultText(player, columnPlayer) }}
            </button>
            <span
              v-else-if="rowIndex !== columnIndex"
              class="font-semibold"
              :class="getResultClass(player, columnPlayer)"
            >
              {{ getResultText(player, columnPlayer) }}
            </span>
          </td>

          <td class="border-b border-r border-border px-3 py-3 font-medium text-text-main">
            {{ formatNumber(player.score) }}
          </td>

          <td class="border-b border-r border-border px-3 py-3 font-semibold">
            <span :class="getCalcClass(player.calcTone)">{{ player.calcValue || '' }}</span>
          </td>

          <td class="border-b border-border px-3 py-3 font-semibold" :class="getRankClass(player.rank)">
            {{ formatNumber(player.rank) }}
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script setup>
const props = defineProps({
  group: {
    type: Object,
    default: () => ({})
  }
})
const emit = defineEmits(['open-game-detail'])

const players = computed(() => Array.isArray(props.group?.players) ? props.group.players : [])
const resultMap = computed(() => (props.group?.games && typeof props.group.games === 'object' ? props.group.games : {}))

const formatNumber = (value) => {
  if (value === undefined || value === null || value === '') return ''
  return String(value)
}

const splitScoreText = (scoreText) => {
  const [left = '', right = ''] = String(scoreText || '').split(':')
  return [left.trim(), right.trim()]
}

const compareScoreSegment = (left, right) => {
  const normalizedLeft = String(left || '').trim().toLowerCase()
  const normalizedRight = String(right || '').trim().toLowerCase()

  if (!normalizedLeft && !normalizedRight) return 0
  if (normalizedLeft === 'wo' && normalizedRight === 'wo') return 0
  if (normalizedLeft === 'wo') return -1
  if (normalizedRight === 'wo') return 1

  const leftNumber = Number(normalizedLeft)
  const rightNumber = Number(normalizedRight)

  if (!Number.isNaN(leftNumber) && !Number.isNaN(rightNumber)) {
    if (leftNumber === rightNumber) return 0
    return leftNumber > rightNumber ? 1 : -1
  }

  return 0
}

const getMatchMeta = (rowPlayer, columnPlayer) => {
  const rowKey = `${rowPlayer?.uid}:${columnPlayer?.uid}`
  const reverseKey = `${columnPlayer?.uid}:${rowPlayer?.uid}`
  const direct = resultMap.value[rowKey]
  const reverse = resultMap.value[reverseKey]

  if (direct) {
    const [left, right] = splitScoreText(direct)
    return {
      text: `${left}:${right}`,
      isWin: compareScoreSegment(left, right) > 0
    }
  }

  if (reverse) {
    const [left, right] = splitScoreText(reverse)
    return {
      text: `${right}:${left}`,
      isWin: compareScoreSegment(right, left) > 0
    }
  }

  return {
    text: '-',
    isWin: false
  }
}

const getResultText = (rowPlayer, columnPlayer) => getMatchMeta(rowPlayer, columnPlayer).text

const canOpenMatchDetail = (rowPlayer, columnPlayer) => {
  const meta = getMatchMeta(rowPlayer, columnPlayer)

  return meta.text !== '-'
    && !!props.group?.eventId
    && !!props.group?.itemId
    && !!rowPlayer?.uid
    && !!columnPlayer?.uid
}

const openMatchDetail = (rowPlayer, columnPlayer) => {
  if (!canOpenMatchDetail(rowPlayer, columnPlayer)) return

  emit('open-game-detail', {
    source: 'group',
    eventId: props.group.eventId,
    itemId: props.group.itemId,
    groupId: props.group.id,
    groupTitle: props.group.title,
    leftPlayer: {
      uid: rowPlayer.uid,
      name: rowPlayer.name || '-'
    },
    rightPlayer: {
      uid: columnPlayer.uid,
      name: columnPlayer.name || '-'
    },
    scoreText: getResultText(rowPlayer, columnPlayer)
  })
}

const getResultClass = (rowPlayer, columnPlayer) => {
  const meta = getMatchMeta(rowPlayer, columnPlayer)

  if (meta.text === '-') return 'text-text-light'
  return meta.isWin ? 'text-brand-primary' : 'text-text-main'
}

const getCalcClass = (tone) => {
  if (tone === 'blue') return 'text-blue-600'
  if (tone === 'red') return 'text-brand-primary'
  return 'text-text-main'
}

const getRankClass = (rank) => {
  const rankNumber = Number(rank)
  const qualifyCount = Number(props.group?.qualifyCount || 0)

  if (!Number.isNaN(rankNumber) && qualifyCount > 0 && rankNumber <= qualifyCount) {
    return 'text-brand-primary'
  }

  return 'text-text-main'
}
</script>
