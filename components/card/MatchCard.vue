<template>
  <article class="rounded-card border border-gray-100 overflow-hidden">
    <ImgFallback :src="match.poster" alt="poster" class="w-full h-40 object-cover" />
    <div class="p-4">
      <h3 class="font-medium line-clamp-2">{{ match.title }}</h3>
      <p class="text-sm text-gray-500 mt-1">{{ match.starttime }} · {{ match.arena_name }}</p>
      <div class="flex items-center justify-between mt-3">
        <div class="flex items-center gap-2">
          <span class="text-xs text-gray-500">{{ match.status }}</span>
          <span v-if="match.distance !== undefined" class="text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded">
            {{ formatDistance(match.distance) }}
          </span>
        </div>
        <a :href="`/matches/${match.eventid}`" class="text-brand-primary text-sm">详情</a>
      </div>
    </div>
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

