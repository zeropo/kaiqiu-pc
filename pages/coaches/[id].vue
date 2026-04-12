<template>
  <div class="container pt-8 pb-10 md:pt-12 md:pb-16">
    <div v-if="loading" class="space-y-6">
      <div class="h-64 animate-pulse rounded-card border border-border bg-white" />
      <div class="grid gap-6 md:grid-cols-3">
        <div v-for="n in 3" :key="n" class="h-24 animate-pulse rounded-card border border-border bg-white" />
      </div>
      <div class="h-48 animate-pulse rounded-card border border-border bg-white" />
    </div>

    <div v-else-if="detail">
      <div class="overflow-hidden rounded-card border border-border bg-white shadow-card">
        <div class="flex flex-col gap-8 p-6 md:flex-row md:items-start md:p-10">
          <ImgFallback
            :src="detail.image || detail.portrait"
            :alt="detail.realname"
            class="h-48 w-48 shrink-0 rounded-2xl object-cover shadow-sm md:h-56 md:w-56"
          />

          <div class="min-w-0 flex-1">
            <div class="flex flex-wrap items-center gap-3">
              <h1 class="font-display text-3xl font-bold text-text-main">{{ detail.realname }}</h1>
              <span
                v-if="detail.sex"
                class="rounded-full border px-3 py-1 text-xs font-medium"
                :style="getSexTagStyle(detail.sex)"
              >
                {{ detail.sex }}
              </span>
              <span v-if="detail.bg" class="rounded-full border border-brand-primary/30 bg-brand-primary/5 px-3 py-1 text-xs font-medium text-brand-primary">
                {{ detail.bg }}
              </span>
            </div>

            <div class="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-text-muted">
              <span class="inline-flex items-center gap-1.5">
                <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
                {{ detail.province }}{{ detail.city }}
              </span>
              <span v-if="detail.arena_name" class="inline-flex items-center gap-1.5">
                <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path></svg>
                {{ detail.arena_name }}
              </span>
              <span v-if="detail.distance" class="inline-flex items-center gap-1.5">
                <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><circle cx="6" cy="19" r="2.5" stroke-width="2"></circle><circle cx="18" cy="5" r="2.5" stroke-width="2"></circle><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.5 19H17a3 3 0 000-6H7a3 3 0 010-6h8.5"></path></svg>
                距您{{ detail.distance }}
              </span>
            </div>

            <div class="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
              <div v-if="detail.price" class="rounded-xl border border-border bg-surfaceSoft/50 px-4 py-3">
                <p class="text-xs text-text-muted">课时价格</p>
                <p class="mt-1 text-lg font-bold text-brand-primary">¥{{ detail.price }}<span class="text-xs font-normal text-text-muted">/小时</span></p>
              </div>
              <div v-if="detail.schedule" class="rounded-xl border border-border bg-surfaceSoft/50 px-4 py-3">
                <p class="text-xs text-text-muted">授课时间</p>
                <p class="mt-1 text-base font-semibold text-text-main">{{ detail.schedule }}</p>
              </div>
              <div v-if="detail.score" class="rounded-xl border border-border bg-surfaceSoft/50 px-4 py-3">
                <p class="text-xs text-text-muted">积分</p>
                <p class="mt-1 text-base font-semibold text-text-main">{{ detail.score }}</p>
              </div>
              <div v-if="detail.mobile" class="rounded-xl border border-border bg-surfaceSoft/50 px-4 py-3">
                <p class="text-xs text-text-muted">手机号</p>
                <a
                  :href="`tel:${detail.mobile}`"
                  class="mt-1 inline-flex items-center gap-2 text-base font-semibold text-text-main transition-colors hover:text-brand-primary"
                >
                  <svg class="h-4 w-4 text-brand-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.128a11.042 11.042 0 005.516 5.516l1.128-2.257a1 1 0 011.21-.502l4.493 1.498A1 1 0 0121 15.72V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"></path></svg>
                  <span>{{ detail.mobile }}</span>
                </a>
              </div>
            </div>

            <div class="mt-5 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-text-muted">
              <span>{{ detail.viewnum || 0 }}人浏览</span>
              <span class="font-medium text-[#39b54a]">{{ detail.commentnum || 0 }}人推荐</span>
            </div>
          </div>
        </div>
      </div>

      <section class="mt-8 rounded-card border border-border bg-white p-6 shadow-sm">
        <h2 class="mb-4 flex items-center gap-2 text-lg font-semibold text-text-main">
          <svg class="h-5 w-5 text-brand-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg>
          教练简介
        </h2>
        <p class="whitespace-pre-line text-sm leading-7 text-text-muted">{{ detail.description || '暂无简介' }}</p>
      </section>
    </div>

    <div v-else class="flex flex-col items-center justify-center rounded-card border border-border bg-white py-20 shadow-sm">
      <div class="mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-surfaceSoft">
        <svg class="h-10 w-10 text-text-light" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
      </div>
      <p class="text-lg font-medium text-text-muted">未找到该教练</p>
      <p class="mt-2 text-sm text-text-light">该教练信息可能已下架或不存在</p>
    </div>
  </div>
</template>

<script setup>
useHead({
  title: '教练详情'
})

const MALE_ACCENT_COLOR = '#04a2eb'
const FEMALE_ACCENT_COLOR = '#D61F26'

const route = useRoute()
const id = computed(() => route.params.id)
const detail = ref(null)
const loading = ref(true)
const { $api } = useNuxtApp()

const getSexTagStyle = (sex) => {
  const color = String(sex) === '女' || String(sex) === '2' ? FEMALE_ACCENT_COLOR : MALE_ACCENT_COLOR
  return {
    color,
    borderColor: color,
    backgroundColor: `${color}1A`
  }
}

const fetchDetail = async () => {
  loading.value = true
  try {
    const res = await $api('/trainer/detail', { method: 'GET', params: { id: id.value, ump: 0 } })
    detail.value = res.data || null
  } catch (e) {
    detail.value = null
  } finally {
    loading.value = false
  }
}

onMounted(fetchDetail)
</script>
