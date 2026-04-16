<template>
  <div class="container pt-8 pb-10 md:pt-12 md:pb-16">
    <div class="mb-8 flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
      <div>
        <h1 class="font-display text-3xl font-bold text-text-main">风云榜单</h1>
      </div>
    </div>

    <div v-if="loading" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <div v-for="n in 6" :key="n" class="h-44 bg-white rounded-card shadow-sm border border-border animate-pulse" />
    </div>
    
    <div v-else-if="!list.length" class="flex flex-col items-center justify-center py-24 bg-white rounded-card shadow-sm border border-border">
      <div class="w-20 h-20 bg-surfaceSoft rounded-full flex items-center justify-center mb-5">
        <svg class="w-10 h-10 text-text-light" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
      </div>
      <p class="text-text-muted text-lg font-medium">暂无榜单数据</p>
    </div>

    <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-fade-in">
      <a v-for="t in list" :key="t.tid" :href="`/rankings/${t.tid}`" class="group block bg-white rounded-card border border-border p-6 shadow-card hover:shadow-cardHover hover:-translate-y-1.5 transition-all duration-smooth relative overflow-hidden">
        <div class="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-brand-primary/5 to-transparent rounded-bl-full -z-0 pointer-events-none transition-transform group-hover:scale-110"></div>
        
        <div class="relative z-10 flex flex-col h-full justify-between">
          <div>
            <div class="w-12 h-12 rounded-xl bg-surfaceSoft text-brand-primary flex items-center justify-center mb-6 group-hover:bg-brand-primary group-hover:text-white transition-colors duration-smooth shadow-sm">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"></path></svg>
            </div>
            <h3 class="font-display text-xl font-bold text-text-main group-hover:text-brand-primary transition-colors leading-snug">{{ t.name }}</h3>
          </div>
          <div class="mt-8 flex items-end justify-between gap-4">
            <div class="flex items-center text-brand-primary font-medium text-sm group-hover:translate-x-2 transition-transform w-fit select-none">
              进入榜单
              <svg class="w-4 h-4 ml-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 8l4 4m0 0l-4 4m4-4H3"></path></svg>
            </div>
            <span class="text-xs text-text-light">{{ t.viewnum || 0 }}次浏览</span>
          </div>
        </div>
      </a>
    </div>
  </div>
</template>

<script setup>
useHead({
  title: '风云榜单'
})
const loading = ref(true)
const list = ref([])
const { $api } = useNuxtApp()

const load = async () => {
  loading.value = true
  try {
    const res = await $api('/Top/lists', { method: 'POST' })
    list.value = res?.data?.data || []
  } catch (e) {
    list.value = []
  } finally {
    loading.value = false
  }
}

onMounted(load)
</script>
