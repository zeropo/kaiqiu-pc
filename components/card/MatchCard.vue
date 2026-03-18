<template>
  <article class="group relative bg-white rounded-card border border-border overflow-hidden shadow-card hover:shadow-cardHover hover:-translate-y-1 transition-all duration-smooth flex flex-col h-full">
    <div class="relative overflow-hidden aspect-[4/3]">
      <div class="absolute inset-0 bg-surfaceSoft z-0 animate-pulse"></div>
      <ImgFallback :src="match.poster" alt="poster" class="w-full h-full object-cover relative z-10 group-hover:scale-105 transition-transform duration-700 ease-out" />
      <div class="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent z-10"></div>
      <div class="absolute bottom-3 left-3 z-20 flex gap-2">
        <span class="text-xs text-white bg-black/40 backdrop-blur-md px-2 py-1 rounded-md font-medium border border-white/10">
          {{ match.status }}
        </span>
      </div>
    </div>
    <div class="p-5 flex flex-col flex-1">
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
      </div>
      
      <div class="flex items-center justify-between mt-5 pt-4 border-t border-surfaceSoft">
        <span v-if="match.distance !== undefined" class="text-xs font-semibold text-brand-secondary bg-brand-secondary/10 px-2.5 py-1 rounded-md">
          距您 {{ formatDistance(match.distance) }}
        </span>
        <span v-else></span>
        <a :href="`/matches/${match.eventid}`" class="inline-flex items-center font-medium text-brand-primary text-sm group-hover:translate-x-1 transition-transform">
          详情 <svg class="w-4 h-4 ml-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path></svg>
        </a>
      </div>
    </div>
    <!-- Overlay link applied to entire card -->
    <a :href="`/matches/${match.eventid}`" class="absolute inset-0 z-30"><span class="sr-only">比赛详情</span></a>
  </article>
</template>
<script setup>
defineProps({ match: { type: Object, required: true } })

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

