<template>
  <div class="rounded-[28px] border border-border bg-[linear-gradient(180deg,rgba(248,250,252,0.95),rgba(255,255,255,1))] p-4 md:p-5">
    <div
      v-if="!plotPoints.length"
      class="flex h-[320px] items-center justify-center rounded-[24px] border border-dashed border-border bg-surfaceSoft/60 px-4 text-sm text-text-muted"
    >
      暂无积分走势数据
    </div>

    <div v-else class="relative" @mouseleave="clearActivePoint">
      <div
        v-if="activePoint"
        class="pointer-events-none absolute z-10 hidden max-w-[min(92vw,360px)] rounded-2xl border border-slate-200/80 bg-white/95 px-3.5 py-3 text-xs text-text-muted shadow-[0_24px_60px_-32px_rgba(15,23,42,0.35)] backdrop-blur min-[460px]:block"
        :style="tooltipStyle"
      >
        <p class="font-semibold text-text-main" :style="{ color: resolvedAccentColor }">赛后积分 {{ activePoint.postscoreText }}</p>
        <p class="mt-1.5 text-black/70">时间 {{ activePoint.dateText }}</p>
        <p class="mt-1.5 whitespace-normal break-words text-black/70">地点 {{ activePoint.placeText }}</p>
        <p class="mt-1.5 whitespace-normal break-words text-black/70">比赛 {{ activePoint.title }}</p>
      </div>

      <svg class="h-[320px] w-full overflow-visible" viewBox="0 0 640 320" fill="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient :id="gradientId" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" :stop-color="resolvedAccentColor" stop-opacity="0.32" />
            <stop offset="100%" :stop-color="resolvedAccentColor" stop-opacity="0.02" />
          </linearGradient>
          <filter :id="shadowId" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="10" stdDeviation="10" :flood-color="resolvedAccentColor" flood-opacity="0.18" />
          </filter>
        </defs>

        <g>
          <line
            v-for="guide in yGuides"
            :key="guide.value"
            :x1="padding.left"
            :x2="svgWidth - padding.right"
            :y1="guide.y"
            :y2="guide.y"
            stroke="#E2E8F0"
            stroke-dasharray="5 7"
          />
        </g>

        <path :d="areaPath" :fill="`url(#${gradientId})`" />
        <path
          :d="linePath"
          :stroke="resolvedAccentColor"
          stroke-width="4"
          stroke-linecap="round"
          stroke-linejoin="round"
          :filter="`url(#${shadowId})`"
        />

        <line
          v-if="activePoint"
          :x1="activePoint.x"
          :x2="activePoint.x"
          :y1="padding.top"
          :y2="baseLineY"
          stroke="#E2E8F0"
          stroke-dasharray="6 7"
        />

        <g v-for="point in plotPoints" :key="point.id">
          <circle
            :cx="point.x"
            :cy="point.y"
            r="12"
            fill="transparent"
            tabindex="0"
            @mouseenter="setActivePoint(point.index)"
            @focus="setActivePoint(point.index)"
            @blur="clearActivePoint"
            @click="setActivePoint(point.index)"
          />
          <circle
            :cx="point.x"
            :cy="point.y"
            :r="point.index === activeIndex ? 6.5 : 4.5"
            :fill="point.index === activeIndex ? resolvedAccentColor : '#FFFFFF'"
            :stroke="resolvedAccentColor"
            :stroke-width="point.index === activeIndex ? 3 : 2.5"
          />
        </g>

        <text
          v-for="guide in yGuides"
          :key="`${guide.value}-label`"
          :x="padding.left"
          :y="guide.y - 8"
          fill="#94A3B8"
          font-size="12"
        >
          {{ guide.label }}
        </text>
        <text
          :x="padding.left"
          :y="svgHeight - 10"
          text-anchor="start"
          fill="#94A3B8"
          font-size="12"
        >
          {{ firstDateLabel }}
        </text>
        <text
          :x="svgWidth / 2"
          :y="svgHeight - 10"
          text-anchor="middle"
          fill="#94A3B8"
          font-size="12"
        >
          最近 {{ points.length }} 场赛后积分
        </text>
        <text
          :x="svgWidth - padding.right"
          :y="svgHeight - 10"
          text-anchor="end"
          fill="#94A3B8"
          font-size="12"
        >
          {{ lastDateLabel }}
        </text>
      </svg>

      <div
        v-if="activePoint"
        class="mt-4 rounded-2xl border border-border bg-white/90 p-3 text-sm text-text-muted shadow-sm min-[460px]:hidden"
      >
        <p class="font-semibold text-text-main" :style="{ color: resolvedAccentColor }">赛后积分 {{ activePoint.postscoreText }}</p>
        <p class="mt-1 text-black/70">时间 {{ activePoint.dateText }}</p>
        <p class="mt-1 whitespace-normal break-words text-black/70">地点 {{ activePoint.placeText }}</p>
        <p class="mt-1 whitespace-normal break-words text-black/70">比赛 {{ activePoint.title }}</p>
      </div>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  points: {
    type: Array,
    default: () => []
  },
  accentColor: {
    type: String,
    default: '#D61F26'
  }
})

const svgWidth = 640
const svgHeight = 320
const padding = {
  top: 28,
  right: 28,
  bottom: 34,
  left: 32
}

const activeIndex = ref(-1)
const gradientId = `score-detail-area-${Math.random().toString(36).slice(2, 10)}`
const shadowId = `score-detail-shadow-${Math.random().toString(36).slice(2, 10)}`

const safePoints = computed(() => Array.isArray(props.points) ? props.points : [])
const scoreValues = computed(() => safePoints.value.map((point) => Number(point?.postscore ?? 0)).filter((value) => Number.isFinite(value)))
const resolvedAccentColor = computed(() => props.accentColor || '#D61F26')

const scoreBounds = computed(() => {
  if (!scoreValues.value.length) {
    return {
      min: 0,
      max: 100
    }
  }

  const rawMin = Math.min(...scoreValues.value)
  const rawMax = Math.max(...scoreValues.value)

  if (rawMin === rawMax) {
    return {
      min: rawMin - 10,
      max: rawMax + 10
    }
  }

  const gap = rawMax - rawMin
  const paddingSize = Math.max(8, gap * 0.14)

  return {
    min: rawMin - paddingSize,
    max: rawMax + paddingSize
  }
})

const chartWidth = computed(() => svgWidth - padding.left - padding.right)
const chartHeight = computed(() => svgHeight - padding.top - padding.bottom)
const baseLineY = computed(() => svgHeight - padding.bottom)

const plotPoints = computed(() => {
  const points = safePoints.value
  if (!points.length) return []

  const spread = Math.max(1, scoreBounds.value.max - scoreBounds.value.min)
  const stepX = points.length === 1 ? 0 : chartWidth.value / (points.length - 1)

  return points.map((point, index) => {
    const score = Number(point?.postscore ?? 0)
    const x = padding.left + stepX * index
    const y = padding.top + ((scoreBounds.value.max - score) / spread) * chartHeight.value

    return {
      ...point,
      index,
      score,
      x,
      y,
      xPercent: (x / svgWidth) * 100,
      yPercent: (y / svgHeight) * 100
    }
  })
})

const linePath = computed(() => {
  if (!plotPoints.value.length) return ''

  return plotPoints.value
    .map((point, index) => `${index === 0 ? 'M' : 'L'} ${point.x} ${point.y}`)
    .join(' ')
})

const areaPath = computed(() => {
  if (!plotPoints.value.length) return ''

  const firstPoint = plotPoints.value[0]
  const lastPoint = plotPoints.value[plotPoints.value.length - 1]
  return `${linePath.value} L ${lastPoint.x} ${baseLineY.value} L ${firstPoint.x} ${baseLineY.value} Z`
})

const yGuides = computed(() => {
  const steps = 3
  const values = []
  const spread = scoreBounds.value.max - scoreBounds.value.min

  for (let index = 0; index <= steps; index += 1) {
    const ratio = index / steps
    const value = Math.round(scoreBounds.value.max - spread * ratio)
    const y = padding.top + chartHeight.value * ratio

    values.push({
      value,
      y,
      label: String(value)
    })
  }

  return values
})

const activePoint = computed(() => plotPoints.value[activeIndex.value] || null)
const firstDateLabel = computed(() => plotPoints.value[0]?.dateText || '')
const lastDateLabel = computed(() => plotPoints.value[plotPoints.value.length - 1]?.dateText || '')

const tooltipStyle = computed(() => {
  if (!activePoint.value) return {}

  const left = Math.min(86, Math.max(14, activePoint.value.xPercent))
  const top = Math.min(76, Math.max(18, activePoint.value.yPercent - 4))
  let translateX = '-50%'

  if (activePoint.value.xPercent < 28) translateX = '0%'
  if (activePoint.value.xPercent > 72) translateX = '-100%'

  return {
    left: `${left}%`,
    top: `${top}%`,
    transform: `translate(${translateX}, -100%)`
  }
})

function setActivePoint(index) {
  activeIndex.value = index
}

function clearActivePoint() {
  activeIndex.value = -1
}

watch(plotPoints, (points) => {
  activeIndex.value = -1
}, { immediate: true })
</script>
