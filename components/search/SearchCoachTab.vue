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
            placeholder="请输入教练姓名或证书编号"
            class="h-12 w-full rounded-2xl border border-border bg-white pl-12 pr-4 text-sm text-text-main outline-none transition-colors placeholder:text-text-light focus:border-brand-primary"
          />
        </div>

        <button
          type="submit"
          class="h-12 rounded-2xl bg-[#39b54a] px-6 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-[#2fa444]"
        >
          搜索
        </button>
      </div>

      <p class="mt-3 text-xs text-text-light">
        搜索时自动携带当前位置经纬度，用于计算“距您”距离。
      </p>
    </form>

    <div v-if="loading" class="space-y-4">
      <div
        v-for="item in 4"
        :key="item"
        class="h-40 animate-pulse rounded-3xl border border-border bg-white"
      ></div>
    </div>

    <div
      v-else-if="!hasSearched"
      class="rounded-3xl border border-dashed border-border bg-surfaceSoft/35 px-6 py-14 text-center"
    >
      <p class="text-lg font-semibold text-text-main">输入教练姓名开始搜索</p>
      <p class="mt-2 text-sm text-text-muted">
        支持按姓名或证书编号搜索，结果会展示积分、城市、距离和推荐情况。
      </p>
    </div>

    <div v-else-if="list.length" class="space-y-4">
      <article
        v-for="coach in list"
        :key="coach.uid"
        class="overflow-hidden rounded-3xl border border-border bg-white shadow-sm transition-shadow hover:shadow-card"
      >
        <NuxtLink :to="`/coaches/${coach.uid}`" class="grid gap-4 p-4 sm:grid-cols-[88px_minmax(0,1fr)] sm:p-5">
          <ImgFallback
            :src="coach.image || coach.portrait"
            :alt="coach.realname || '教练头像'"
            class="h-20 w-20 rounded-full object-cover sm:h-[88px] sm:w-[88px]"
          />

          <div class="min-w-0">
            <div>
              <h3 class="text-2xl font-semibold text-text-main">
                {{ coach.realname || coach.username || '未命名教练' }}
              </h3>
              <p class="mt-2 text-sm text-text-muted">
                积分: {{ coach.score || '0' }}
              </p>
            </div>

            <div class="mt-5 flex flex-wrap items-center gap-x-6 gap-y-3 text-sm">
              <span class="font-medium text-text-main">
                {{ formatLocation(coach) }}
              </span>
              <span class="text-text-main">
                距您 {{ coach.distance || '--' }}
              </span>
              <span class="text-text-muted">
                {{ coach.viewnum || '0' }}人浏览
              </span>
              <span class="rounded-xl border border-[#80d67e] px-3 py-1 font-medium text-[#39b54a]">
                {{ coach.commentnum || '0' }}人推荐
              </span>
            </div>
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
      <p class="text-lg font-semibold text-text-main">没有找到对应教练</p>
      <p class="mt-2 text-sm text-text-muted">
        可以换个姓名关键词或证书编号再试一次。
      </p>
    </div>
  </div>
</template>

<script setup>
const { lat, lng } = useCity()
const { $api } = useNuxtApp()

const keyword = ref('')
const submittedKeyword = ref('')
const page = ref(1)
const list = ref([])
const hasMore = ref(false)
const hasSearched = ref(false)
const loading = ref(false)
const loadingMore = ref(false)

const canLoadMore = computed(() => hasMore.value && !loading.value && !loadingMore.value)
const { loadMoreSentinel } = useAutoLoadMore({
  canLoadMore,
  onLoadMore: () => load(page.value + 1)
})

const formatLocation = (coach) => {
  const province = coach?.province || ''
  const city = coach?.city || ''
  return `${province}${city}` || '未知地区'
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
    const response = await $api('/trainer/lists', {
      method: 'POST',
      body: {
        key: submittedKeyword.value,
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
  submittedKeyword.value = keyword.value.trim()
  page.value = 1
  hasMore.value = false
  await load(1)
}
</script>
