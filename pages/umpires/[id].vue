<template>
  <div class="container pt-8 pb-10 md:pt-12 md:pb-16">
    <div v-if="loading" class="space-y-6">
      <div class="h-72 animate-pulse rounded-card border border-border bg-white" />
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
            class="h-56 w-full rounded-2xl object-cover shadow-sm md:h-60 md:w-60 md:shrink-0"
          />

          <div class="min-w-0 flex-1">
            <div class="flex flex-wrap items-center gap-3">
              <h1 class="font-display text-3xl font-bold text-text-main">{{ detail.realname }}</h1>
              <span
                v-if="detail.sex"
                class="rounded-full border px-3 py-1 text-xs font-medium"
                :style="getSexTagStyle(detail.sex)"
              >
                {{ formatSex(detail.sex) }}
              </span>
              <span v-if="detail.level !== undefined" class="rounded-full border border-[#39b54a]/30 bg-[#39b54a]/5 px-3 py-1 text-xs font-medium text-[#39b54a]">
                {{ formatLevel(detail.level) }}
              </span>
              <span v-else-if="detail.bg" class="rounded-full border border-[#39b54a]/30 bg-[#39b54a]/5 px-3 py-1 text-xs font-medium text-[#39b54a]">
                {{ detail.bg }}
              </span>
            </div>

            <div class="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-text-muted">
              <span class="inline-flex items-center gap-1.5">
                <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
                {{ detail.province }}{{ detail.city }}
              </span>
              <span v-if="detail.age" class="inline-flex items-center gap-1.5">
                <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                {{ detail.age }}
              </span>
            </div>

            <div class="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
              <div v-if="detail.unit" class="rounded-xl border border-border bg-surfaceSoft/50 px-4 py-3">
                <p class="text-xs text-text-muted">所属单位</p>
                <p class="mt-1 text-base font-semibold text-text-main">{{ detail.unit }}</p>
              </div>
              <div v-if="detail.certOrg" class="rounded-xl border border-border bg-surfaceSoft/50 px-4 py-3">
                <p class="text-xs text-text-muted">发证机构</p>
                <p class="mt-1 text-base font-semibold text-text-main">{{ detail.certOrg }}</p>
              </div>
              <div v-if="detail.certcode" class="rounded-xl border border-border bg-surfaceSoft/50 px-4 py-3">
                <p class="text-xs text-text-muted">证书编号</p>
                <p class="mt-1 text-base font-semibold text-text-main">{{ detail.certcode }}</p>
              </div>
              <div v-if="detail.highest" class="rounded-xl border border-border bg-surfaceSoft/50 px-4 py-3">
                <p class="text-xs text-text-muted">最高执裁赛事</p>
                <p class="mt-1 text-base font-semibold text-text-main">{{ detail.highest }}</p>
              </div>
              <div v-if="detail.year && String(detail.year) !== '0'" class="rounded-xl border border-border bg-surfaceSoft/50 px-4 py-3">
                <p class="text-xs text-text-muted">获证年份</p>
                <p class="mt-1 text-base font-semibold text-text-main">{{ detail.year }}年</p>
              </div>
            </div>

            <!-- <div class="mt-5 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-text-muted">
              <span>{{ detail.viewnum || 0 }}人浏览</span>
            </div> -->
          </div>
        </div>
      </div>

      <div class="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-3">
        <div class="lg:col-span-2 space-y-8">
          <section class="rounded-card border border-border bg-white p-6 shadow-sm">
            <div class="mb-6 flex flex-wrap items-center justify-between gap-3">
              <h2 class="flex items-center gap-2 text-lg font-semibold text-text-main">
                <svg class="h-5 w-5 text-brand-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                执裁经历
              </h2>
              <span v-if="matchHistory.length" class="text-sm text-text-muted">共 {{ matchHistory.length }} 场</span>
            </div>
            <div v-if="matchHistory.length" class="grid grid-cols-1 gap-3">
              <div
                v-for="(match, index) in matchHistory"
                :key="index"
                class="flex items-center gap-3 rounded-xl border border-border bg-surfaceSoft/30 px-4 py-3"
              >
                <p class="text-sm font-medium text-text-main">{{ match.title }}</p>
              </div>
            </div>
            <div v-else class="flex flex-col items-center justify-center py-12 text-text-muted">
              <p class="text-sm">暂无相关执裁经历</p>
            </div>
          </section>
        </div>

        <div class="space-y-8">
          <section v-if="detail.certimage" class="rounded-card border border-border bg-white p-6 shadow-sm">
            <h2 class="mb-4 flex items-center gap-2 text-lg font-semibold text-text-main">
              <svg class="h-5 w-5 text-brand-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path></svg>
              资质证明
            </h2>
            <div class="overflow-hidden rounded-xl border border-border">
              <ImgFallback
                :src="detail.certimage"
                alt="资质证书"
                class="w-full object-contain"
              />
            </div>
          </section>
        </div>
      </div>
    </div>

    <div v-else class="flex flex-col items-center justify-center rounded-card border border-border bg-white py-20 shadow-sm">
      <div class="mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-surfaceSoft">
        <svg class="h-10 w-10 text-text-light" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
      </div>
      <p class="text-lg font-medium text-text-muted">未找到该裁判</p>
      <p class="mt-2 text-sm text-text-light">该裁判信息可能已下架或不存在</p>
    </div>
  </div>
</template>

<script setup>
useHead({
  title: '裁判详情'
})

const MALE_ACCENT_COLOR = '#04a2eb'
const FEMALE_ACCENT_COLOR = '#D61F26'

const cardLevelTextMap = {
  4: '国际级',
  3: '国家级',
  2: '国家一级',
  1: '国家二级',
  0: '国家三级'
}

const formatLevel = (level) => {
  const levelStr = String(level ?? '')
  if (!levelStr || levelStr === 'undefined' || levelStr === 'null') return '国家三级'
  return cardLevelTextMap[levelStr] || '国家三级'
}

const route = useRoute()
const id = computed(() => route.params.id)
const detail = ref(null)
const matchHistory = ref([])
const loading = ref(true)
const { $api } = useNuxtApp()

const formatSex = (sex) => {
  if (String(sex) === '1' || String(sex) === '男') return '男'
  if (String(sex) === '2' || String(sex) === '女') return '女'
  return '保密'
}

const getSexTagStyle = (sex) => {
  const isFemale = String(sex) === '女' || String(sex) === '2'
  const color = isFemale ? FEMALE_ACCENT_COLOR : MALE_ACCENT_COLOR
  return {
    color,
    borderColor: color,
    backgroundColor: `${color}1A`
  }
}

const formatImageUrl = (url) => {
  if (!url) return ''
  if (url.startsWith('http')) return url
  return `https://kaiqiu.oss-cn-beijing.aliyuncs.com${url.startsWith('/') ? '' : '/'}${url}`
}

const fetchDetail = async () => {
  loading.value = true
  try {
    const res = await $api('/trainer/detail', { method: 'GET', params: { id: id.value, ump: 1 } })
    detail.value = res.data || null
    if (detail.value && detail.value.certimage) {
      detail.value.certimage = formatImageUrl(detail.value.certimage)
    }
    matchHistory.value = res.data?.events || []
  } catch (e) {
    detail.value = null
  } finally {
    loading.value = false
  }
}

onMounted(fetchDetail)
</script>
