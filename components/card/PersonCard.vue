<template>
  <article class="rounded-card border border-gray-100 p-4">
    <div class="flex items-center gap-3">
      <ImgFallback :src="person.image || person.portrait" class="w-14 h-14 object-cover rounded-full" />
      <div class="text-sm">
        <div class="font-medium">{{ person.realname }}</div>
        <div class="text-gray-500">{{ subtitle }}</div>
      </div>
    </div>
    <div class="flex items-center justify-between mt-3">
      <span class="text-xs text-gray-500">{{ footnote }}</span>
      <a :href="link" class="text-brand-primary text-sm">详情</a>
    </div>
  </article>
</template>

<script setup>
const props = defineProps({
  person: { type: Object, required: true },
  type: { type: String, default: 'coach' } // coach | umpire
})

const link = computed(() => props.type === 'umpire' ? `/umpires/${props.person.uid}` : `/coaches/${props.person.uid}`)
const subtitle = computed(() => props.type === 'umpire' ? `级别 ${props.person.level}` : `${props.person.city || ''} ${props.person.province || ''}`)
const footnote = computed(() => props.type === 'umpire' ? `${props.person.city || ''} ${props.person.province || ''}` : props.person.arena_name || '')
</script>

