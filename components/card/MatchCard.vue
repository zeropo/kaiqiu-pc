<template>
  <article class="rounded-card border border-gray-100 overflow-hidden">
    <ImgFallback :src="match.poster" alt="poster" class="w-full h-40 object-cover" />
    <div class="p-4">
      <h3 class="font-medium line-clamp-2">{{ match.title }}</h3>
      <p class="text-sm text-gray-500 mt-1">{{ match.starttime }} · {{ match.arena_name }}</p>
      <div class="flex items-center justify-between mt-3">
        <span class="text-xs text-gray-500">{{ match.status }}</span>
        <a :href="`/matches/${match.eventid}`" class="text-brand-primary text-sm">详情</a>
      </div>
    </div>
  </article>
</template>

<script setup>
defineProps({ match: { type: Object, required: true } })
</script>

