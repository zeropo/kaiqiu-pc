<template>
  <div class="space-y-6">
    <form class="rounded-3xl border border-border bg-surfaceSoft/40 p-4 md:p-5" @submit.prevent="handleSearch">
      <div class="flex flex-col gap-3 md:flex-row">
        <div class="relative flex-1">
          <svg class="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-text-light" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m21 21-4.35-4.35M10.5 18a7.5 7.5 0 1 1 0-15 7.5 7.5 0 0 1 0 15Z"></path>
          </svg>
          <input
            v-model="keyword"
            type="search"
            placeholder="请输入用户姓名"
            class="h-12 w-full rounded-2xl border border-border bg-white pl-12 pr-4 text-sm text-text-main outline-none transition-colors placeholder:text-text-light focus:border-brand-primary"
          />
        </div>

        <button
          type="submit"
          class="h-12 rounded-2xl bg-brand-primary px-6 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-brand-primaryHover"
        >
          搜索
        </button>
      </div>

      <div class="mt-4 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div class="flex flex-wrap items-center gap-2">
          <span class="text-sm font-semibold text-text-main">地区</span>
          <button
            type="button"
            :class="chipClass(cityMode === 'current')"
            @click="cityMode = 'current'"
          >
            {{ cityLabel }}
          </button>
          <button
            type="button"
            :class="chipClass(cityMode === 'all')"
            @click="cityMode = 'all'"
          >
            全国范围
          </button>
        </div>

        <div class="flex flex-wrap items-center gap-2">
          <span class="text-sm font-semibold text-text-main">等级</span>
          <button
            v-for="option in levelOptions"
            :key="option.value"
            type="button"
            :class="chipClass(levelValue === option.value)"
            @click="levelValue = option.value"
          >
            {{ option.label }}
          </button>
        </div>
      </div>
    </form>

    <div v-if="loading" class="space-y-4">
      <div
        v-for="item in 4"
        :key="item"
        class="h-36 animate-pulse rounded-3xl border border-border bg-white"
      ></div>
    </div>

    <div
      v-else-if="!hasSearched"
      class="rounded-3xl border border-dashed border-border bg-surfaceSoft/35 px-6 py-14 text-center"
    >
      <p class="text-lg font-semibold text-text-main">输入裁判姓名开始搜索</p>
      <p class="mt-2 text-sm text-text-muted">
        支持按当前城市或全国范围检索，并可按等级进一步筛选。
      </p>
    </div>

    <div v-else-if="list.length" class="space-y-4">
      <article
        v-for="umpire in list"
        :key="umpire.uid"
        class="overflow-hidden rounded-3xl border border-border bg-white shadow-sm transition-shadow hover:shadow-card"
      >
        <NuxtLink :to="`/umpires/${umpire.uid}`" class="grid gap-4 p-4 sm:grid-cols-[72px_minmax(0,1fr)] sm:p-5">
          <ImgFallback
            :src="umpire.image || umpire.portrait"
            :alt="umpire.realname || '裁判头像'"
            class="h-[72px] w-[72px] rounded-full object-cover"
          />

          <div class="min-w-0">
            <div class="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
              <h3 class="text-2xl font-semibold text-text-main">
                {{ umpire.realname || '未命名裁判' }}
              </h3>
              <span class="inline-flex rounded-xl border border-[#80d67e] px-3 py-1 text-sm font-medium text-[#39b54a]">
                {{ formatLevel(umpire.level) }}
              </span>
            </div>

            <div class="mt-3 flex flex-wrap items-center gap-x-5 gap-y-2 text-base text-text-muted">
              <span>性别: {{ formatSex(umpire.sex) }}</span>
              <span>年龄: {{ formatAge(umpire.birthyear) }}</span>
            </div>

            <p class="mt-4 text-base text-text-main">
              {{ formatLocation(umpire) }}
            </p>
          </div>
        </NuxtLink>
      </article>

      <div
        v-if="hasMore"
        ref="loadMoreSentinel"
        class="h-px w-full opacity-0"
        aria-hidden="true"
      ></div>
    </div>

    <div
      v-else
      class="rounded-3xl border border-dashed border-border bg-white px-6 py-14 text-center"
    >
      <p class="text-lg font-semibold text-text-main">没有找到对应裁判</p>
      <p class="mt-2 text-sm text-text-muted">
        可以尝试切换到全国范围，或调整姓名关键词后重新搜索。
      </p>
    </div>
  </div>
</template>

<script setup>
const levelOptions = [
  { value: '', label: '不限' },
  { value: '1', label: '国际级' },
  { value: '2', label: '国家级' },
  { value: '3', label: '国家一级' },
  { value: '4', label: '国家二级' },
  { value: '5', label: '国家三级' }
]

const { city, lat, lng } = useCity()
const { $api } = useNuxtApp()

const keyword = ref('')
const cityMode = ref('current')
const levelValue = ref('')
const submittedFilters = ref({
  key: '',
  city: '',
  value: '',
  level: ''
})
const page = ref(1)
const list = ref([])
const hasMore = ref(false)
const hasSearched = ref(false)
const loading = ref(false)
const loadingMore = ref(false)

const cityLabel = computed(() => city.value || '杭州市')

const chipClass = (active) => {
  return active
    ? 'rounded-2xl border border-brand-primary bg-brand-primary px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors'
    : 'rounded-2xl border border-border bg-white px-4 py-2.5 text-sm font-semibold text-text-muted transition-colors hover:border-brand-primary hover:text-brand-primary'
}

const canLoadMore = computed(() => hasMore.value && !loading.value && !loadingMore.value)
const { loadMoreSentinel } = useAutoLoadMore({
  canLoadMore,
  onLoadMore: () => load(page.value + 1)
})

const cardLevelTextMap = {
  4: '国际级',
  3: '国家级',
  2: '国家一级',
  1: '国家二级',
  0: '国家三级'
}

const formatLevel = (level) => cardLevelTextMap[String(level)] || '未定级'

const formatSex = (sex) => {
  if (String(sex) === '1') return '男'
  if (String(sex) === '2') return '女'
  return '-'
}

const formatAge = (birthyear) => {
  const year = Number(birthyear)
  if (!Number.isFinite(year) || year <= 0) return '--'
  return `${new Date().getFullYear() - year}`
}

const formatLocation = (umpire) => {
  const province = umpire?.province || ''
  const cityName = umpire?.city || ''
  return `${province}${cityName}` || '未知地区'
}

const load = async (nextPage = 1) => {
  const isFirstPage = nextPage === 1

  if (isFirstPage) {
    loading.value = true
  } else {
    if (loading.value || loadingMore.value || !hasMore.value) return
    loadingMore.value = true
  }

  try {
    const response = await $api('/umpire/lists', {
      method: 'POST',
      body: {
        city: submittedFilters.value.city,
        key: submittedFilters.value.key,
        value: submittedFilters.value.value,
        level: submittedFilters.value.level,
        page: nextPage,
        lat: lat.value,
        lng: lng.value
      }
    })
    const rows = Array.isArray(response?.data?.data) ? response.data.data : []
    const currentPage = Number(response?.data?.current_page ?? nextPage)
    const lastPage = Number(response?.data?.last_page ?? currentPage)

    list.value = isFirstPage ? rows : list.value.concat(rows)
    page.value = currentPage
    hasMore.value = rows.length > 0 && Number.isFinite(currentPage) && Number.isFinite(lastPage) && currentPage < lastPage
    hasSearched.value = true
  } catch {
    if (isFirstPage) {
      list.value = []
      hasSearched.value = true
    }
    hasMore.value = false
  } finally {
    if (isFirstPage) {
      loading.value = false
    } else {
      loadingMore.value = false
    }
  }
}

const handleSearch = async () => {
  submittedFilters.value = {
    key: keyword.value.trim(),
    city: cityMode.value === 'current' ? cityLabel.value : '',
    value: levelValue.value,
    level: levelValue.value
  }
  page.value = 1
  hasMore.value = false
  await load(1)
}
</script>
