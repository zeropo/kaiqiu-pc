<template>
  <div class="rounded-[30px] border border-border bg-white p-5 shadow-sm md:p-6">
    <div>
      <h3 class="font-display text-xl font-bold text-text-main">名次列表</h3>
    </div>

    <div v-if="groups.length" class="mt-5 space-y-4">
      <section
        v-for="group in groups"
        :key="group.honor"
        class="rounded-[24px] border p-4"
        :class="getGroupCardClass(group.honor)"
      >
        <div class="mb-3 flex items-center gap-3">
          <span
            class="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl"
            :class="getGroupBadgeClass(group.honor)"
          >
            <svg class="h-[18px] w-[18px]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="M8 21h8m-4-4v4m-5-16h10l-1.2 6.1a2 2 0 0 1-2 1.6H10.2a2 2 0 0 1-2-1.6L7 5Zm0 0H5m12 0h2" />
            </svg>
          </span>
          <h4 class="min-w-0 truncate text-base font-semibold text-text-main">
            {{ group.honor }}
          </h4>
        </div>

        <div class="space-y-2.5">
          <template v-for="honor in group.items" :key="honor.id">
            <a
              v-if="honor.uid"
              :href="`/scores/${honor.uid}`"
              target="_blank"
              rel="noopener noreferrer"
              class="group flex cursor-pointer items-center justify-between gap-3 rounded-2xl border border-white/90 bg-white px-4 py-3 text-sm text-brand-primary shadow-[0_12px_24px_-24px_rgba(15,23,42,0.45)] transition-all duration-200 hover:-translate-y-0.5 hover:border-brand-primary/20 hover:bg-brand-primary/5 hover:shadow-md"
            >
              <span class="min-w-0 flex-1 truncate text-[15px] font-semibold transition-colors group-hover:text-brand-primaryHover">
                {{ honor.name || '-' }}
              </span>
              <span class="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-surfaceSoft text-text-light transition-all duration-200 group-hover:bg-brand-primary/10 group-hover:text-brand-primary">
                <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
                </svg>
              </span>
            </a>

            <div
              v-else
              class="flex cursor-default items-center justify-between gap-3 rounded-2xl border border-border/80 bg-white px-4 py-3 text-sm text-text-main shadow-[0_12px_24px_-24px_rgba(15,23,42,0.45)]"
            >
              <span class="min-w-0 flex-1 truncate text-[15px] font-semibold text-text-main">
                {{ honor.name || '-' }}
              </span>
            </div>
          </template>
        </div>
      </section>
    </div>

    <div
      v-else
      class="mt-5 rounded-[24px] border border-dashed border-border bg-surfaceSoft/60 px-4 py-10 text-center text-sm text-text-muted"
    >
      暂无名次数据
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  honors: {
    type: Array,
    default: () => []
  }
})

const groups = computed(() => {
  const order = []
  const mapping = {}

  props.honors.forEach((honor, index) => {
    const label = honor?.honor || `名次 ${index + 1}`

    if (!mapping[label]) {
      mapping[label] = {
        honor: label,
        items: []
      }
      order.push(mapping[label])
    }

    mapping[label].items.push({
      id: honor?.id || `${label}-${index}`,
      uid: honor?.uid ? String(honor.uid) : '',
      name: honor?.name || honor?.username || '-',
      honor: label
    })
  })

  return order
})

const getGroupBadgeClass = (label) => {
  const text = String(label || '')

  if (text.includes('冠军')) return 'bg-[rgba(212,175,55,0.14)] text-[#D4AF37] ring-1 ring-[#D4AF37]/20'
  if (text.includes('亚军')) return 'bg-[rgba(224,224,224,0.78)] text-slate-500 ring-1 ring-[#E0E0E0]'
  if (text.includes('季军')) return 'bg-[rgba(205,127,50,0.14)] text-[#CD7F32] ring-1 ring-[#CD7F32]/20'
  if (text.includes('第五')) return 'bg-[rgba(139,58,46,0.14)] text-[#8B3A2E] ring-1 ring-[#8B3A2E]/20'

  return 'bg-slate-100 text-slate-500'
}

const getGroupCardClass = (label) => {
  const text = String(label || '')

  if (text.includes('冠军')) return 'border-[#D4AF37]/25 bg-[linear-gradient(135deg,rgba(212,175,55,0.2),rgba(255,255,255,1)_60%,rgba(255,255,255,1))]'
  if (text.includes('亚军')) return 'border-[#E0E0E0] bg-[linear-gradient(135deg,rgba(224,224,224,0.88),rgba(255,255,255,1)_62%,rgba(255,255,255,1))]'
  if (text.includes('季军')) return 'border-[#CD7F32]/25 bg-[linear-gradient(135deg,rgba(205,127,50,0.18),rgba(255,255,255,1)_60%,rgba(255,255,255,1))]'
  if (text.includes('第五')) return 'border-[#8B3A2E]/25 bg-[linear-gradient(135deg,rgba(139,58,46,0.18),rgba(255,255,255,1)_60%,rgba(255,255,255,1))]'

  return 'border-border bg-gradient-to-br from-slate-50 via-white to-white'
}
</script>
