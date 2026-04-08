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
            placeholder="请输入球馆名称"
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
    </form>

    <div v-if="loading" class="space-y-4">
      <div
        v-for="item in 4"
        :key="item"
        class="h-48 animate-pulse rounded-3xl border border-border bg-white"
      ></div>
    </div>

    <div
      v-else-if="!hasSearched"
      class="rounded-3xl border border-dashed border-border bg-surfaceSoft/35 px-6 py-14 text-center"
    >
      <p class="text-lg font-semibold text-text-main">输入球馆名称开始搜索</p>
      <p class="mt-2 text-sm text-text-muted">
        会展示球馆名称、地址、距离、浏览量和评论数。
      </p>
    </div>

    <div v-else-if="list.length" class="space-y-4">
      <article
        v-for="arena in list"
        :key="arena.id"
        class="overflow-hidden rounded-3xl border border-border bg-white shadow-sm transition-shadow hover:shadow-card"
      >
        <NuxtLink :to="`/arenas/${arena.id}`" class="grid gap-4 p-4 sm:grid-cols-[132px_minmax(0,1fr)] sm:p-5">
          <div class="relative overflow-hidden rounded-2xl bg-surfaceSoft">
            <ImgFallback
              :src="arena.image"
              :alt="arena.name || '球馆图片'"
              class="h-32 w-full object-cover sm:h-full"
            />
            <span class="absolute left-2 top-2 rounded-md bg-[#39b54a] px-2.5 py-1 text-xs font-semibold text-white shadow-sm">
              {{ arena.city || arena.province || '球馆' }}
            </span>
          </div>

          <div class="min-w-0">
            <h3 class="text-2xl font-semibold text-text-main">
              {{ arena.name || '未命名球馆' }}
            </h3>
            <p class="mt-3 line-clamp-2 text-base leading-7 text-text-muted">
              地址：{{ arena.address || '暂无地址信息' }}
            </p>

            <div class="mt-5 flex flex-wrap items-center gap-x-6 gap-y-3 text-sm">
              <span class="text-text-main">
                距您 {{ arena.distance || '--' }}
              </span>
              <span class="text-text-muted">
                {{ arena.view || '0' }}人浏览
              </span>
              <span class="rounded-xl border border-[#80d67e] px-3 py-1 font-medium text-[#39b54a]">
                {{ arena.reviews || '0' }}评论
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
      <p class="text-lg font-semibold text-text-main">没有找到对应球馆</p>
      <p class="mt-2 text-sm text-text-muted">
        可以尝试使用更短的球馆名关键词再次搜索。
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

const load = async (nextPage = 1) => {
  const isFirstPage = nextPage === 1

  if (isFirstPage) {
    loading.value = true
  } else {
    if (loading.value || loadingMore.value || !hasMore.value) return
    loadingMore.value = true
  }

  try {
    const response = await $api('/arena/lists', {
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
