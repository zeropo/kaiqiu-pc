<template>
  <article class="rounded-card border border-gray-100 overflow-hidden">
    <ImgFallback :src="arena.image" class="w-full h-36 object-cover" />
    <div class="p-4">
      <h3 class="font-medium line-clamp-2">{{ arena.name }}</h3>
      <p class="text-sm text-gray-500 mt-1">{{ arena.address }}</p>
      <div class="flex items-center justify-between mt-3">
        <span class="text-xs text-gray-500">{{ arena.distance }}</span>
        <a :href="`/arenas/${arena.id}`" class="text-brand-primary text-sm">详情</a>
      </div>
    </div>
  </article>
</template>

<script setup>
defineProps({ arena: { type: Object, required: true } })
</script>

