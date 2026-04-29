<template>
  <article class="group relative bg-white rounded-card border border-border overflow-hidden shadow-card hover:shadow-cardHover hover:-translate-y-1 transition-all duration-smooth flex flex-col h-full">
    <div class="relative overflow-hidden aspect-[4/3]">
      <div class="absolute inset-0 bg-surfaceSoft z-0 animate-pulse"></div>
      <ImgFallback :src="match.poster" alt="poster" class="w-full h-full object-cover relative z-10 group-hover:scale-105 transition-transform duration-700 ease-out" />
      <div class="absolute inset-0 bg-gradient-to-t from-black/15 via-transparent to-transparent z-10"></div>
      <div v-if="cityLabel" class="absolute top-3 left-3 z-20 pointer-events-none">
        <span class="inline-flex items-center rounded-sm bg-[#39b54a] px-2.5 py-1 text-xs font-semibold text-white shadow-sm">
          {{ cityLabel }}
        </span>
      </div>
      <div class="absolute bottom-3 left-3 z-20 flex gap-2 pointer-events-none">
        <span class="text-xs text-white bg-black/40 backdrop-blur-md px-2 py-1 rounded-md font-medium border border-white/10">
          {{ displayStatus }}
        </span>
      </div>
      <div v-if="isWanghong" class="absolute right-3 bottom-3 z-20 pointer-events-none">
        <span class="inline-flex items-center rounded-md bg-white/85 px-2.5 py-1 text-xs font-semibold text-orange-500 backdrop-blur-md shadow-sm">
          网红
        </span>
      </div>
    </div>
    <div class="relative p-5 flex flex-col flex-1">
      <h3 class="font-semibold text-text-main line-clamp-2 leading-snug group-hover:text-brand-primary transition-colors text-lg flex-1">
        {{ match.title }}
      </h3>
      
      <div class="mt-4 space-y-2">
        <div class="flex items-center text-sm text-text-muted gap-2">
          <svg class="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
          <span class="truncate">{{ match.starttime }}</span>
        </div>
        <div class="flex items-center text-sm text-text-muted gap-2">
          <svg class="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
          <span class="truncate">{{ match.arena_name }}</span>
        </div>
        <div class="flex items-center text-sm text-text-muted gap-2">
          <svg class="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path></svg>
          <span class="truncate">{{ match.viewnum || 0 }}人浏览</span>
        </div>
      </div>

      <img
        v-if="isRecommended"
        src="/recommend.png"
        alt="推荐赛事"
        class="pointer-events-none absolute right-2 bottom-6 z-10 h-48 w-auto object-contain"
      >
      
      <div class="mt-4 flex items-end justify-between gap-3 border-t border-surfaceSoft pt-4">
        <span v-if="match.distance !== undefined" class="rounded-md bg-brand-secondary/10 px-2.5 py-1 text-xs font-semibold text-brand-secondary">
          距您 {{ formatDistance(match.distance) }}
        </span>
        <span v-else></span>
        <div v-if="joinCountLabel" class="flex flex-col items-end gap-2">
          <span
            class="inline-flex items-center rounded-md border border-[#39b54a] bg-white px-2.5 py-1 text-xs font-semibold text-[#39b54a]"
          >
            {{ joinCountLabel }}
          </span>
        </div>
        <span v-else class="inline-flex items-center text-sm font-medium text-brand-primary transition-transform group-hover:translate-x-1">
          详情
          <svg class="ml-0.5 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path></svg>
        </span>
      </div>
    </div>
    <!-- Overlay link applied to entire card -->
    <NuxtLink
      :to="{ path: `/matches/${match.eventid}`, query: route.query }"
      class="absolute inset-0 z-30"
      v-bind="openInNewTab ? { target: '_blank', rel: 'noopener noreferrer' } : {}"
    >
      <span class="sr-only">比赛详情</span>
    </NuxtLink>
  </article>
</template>
<script setup>
const route = useRoute()
const props = defineProps({
  match: { type: Object, required: true },
  openInNewTab: { type: Boolean, default: false }
})

const cityLabel = computed(() => {
  const city = props.match?.city?.trim?.()
  const province = props.match?.province?.trim?.()
  return city || province || ''
})

const joinCountLabel = computed(() => {
  const count = props.match?.membernum
  if (count === null || count === undefined || count === '') return ''
  return `${count}人参加`
})

const isRecommended = computed(() => {
  const grade = Number(props.match?.grade)
  return Number.isFinite(grade) && grade > 0
})

const isWanghong = computed(() => {
  return String(props.match?.wanghong ?? '').trim() === '1'
})

const displayStatus = computed(() => props.match?.displayStatus || props.match?.status || '详情')

// 格式化距离显示
const formatDistance = (distance) => {
  if (distance === null || distance === undefined) return ''
  const km = parseFloat(distance)
  if (km < 1) {
    return `${Math.round(km * 1000)}m`
  } else {
    return `${km.toFixed(1)}km`
  }
}
</script>
