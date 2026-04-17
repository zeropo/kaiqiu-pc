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

    <div v-if="loading" class="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
      <div
        v-for="item in 8"
        :key="item"
        class="h-64 animate-pulse rounded-card border border-border bg-white"
      ></div>
    </div>

    <div
      v-else-if="!hasSearched"
      class="rounded-3xl border border-dashed border-border bg-surfaceSoft/35 px-6 py-14 text-center"
    >
      <p class="text-lg font-semibold text-text-main">输入球馆名称开始搜索</p>
      <p class="mt-2 text-sm text-text-muted">
        支持按名称搜索，结果会展示地址、距离和浏览量等。
      </p>
    </div>

    <div v-else-if="list.length" class="space-y-8">
      <div class="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <article
          v-for="arena in list"
          :key="arena.id"
          class="group relative flex h-full flex-col overflow-hidden rounded-card border border-border bg-white shadow-card transition-all duration-smooth hover:-translate-y-1 hover:shadow-cardHover"
        >
          <NuxtLink :to="{ path: `/arenas/${arena.id}`, query: route.query }" class="flex h-full flex-col">
            <div class="relative aspect-[4/3] overflow-hidden bg-surfaceSoft">
              <ImgFallback
                :src="arena.image || arena.pic"
                :alt="arena.name || '球馆图片'"
                class="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
              />
              <div class="absolute inset-0 bg-gradient-to-t from-black/15 via-transparent to-transparent"></div>
              <div class="absolute left-3 top-3 z-20 flex gap-2 pointer-events-none">
                <span class="inline-flex items-center rounded-sm bg-[#39b54a] px-2.5 py-1 text-xs font-semibold text-white shadow-sm">
                  {{ arena.city || arena.province || '球馆' }}
                </span>
              </div>
            </div>

            <div class="flex flex-1 flex-col p-5">
              <h2 class="line-clamp-2 text-lg font-semibold leading-snug text-text-main transition-colors group-hover:text-brand-primary">
                {{ arena.name || '未命名球馆' }}
              </h2>

              <div class="mt-4 space-y-2">
                <div class="flex items-start gap-2 text-sm text-text-muted">
                  <svg class="h-4 w-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
                  <span class="line-clamp-2">{{ arena.address || '暂无地址信息' }}</span>
                </div>
                <div class="flex items-center gap-2 text-sm text-text-muted">
                  <svg class="h-4 w-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path></svg>
                  <span class="truncate">{{ arena.view || 0 }}人浏览</span>
                </div>
              </div>

              <div class="mt-auto pt-4">
                <div class="border-t border-surfaceSoft pt-4">
                  <span class="rounded-md bg-brand-secondary/10 px-2.5 py-1 text-xs font-semibold text-brand-secondary">
                    距您 {{ arena.distance || '--' }}
                  </span>
                </div>
              </div>
            </div>
          </NuxtLink>
        </article>
      </div>

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

const route = useRoute()
const router = useRouter()

const keyword = ref(route.query.keyword || '')
const submittedKeyword = ref(route.query.keyword || '')
const page = ref(1)
const list = ref([])
const hasMore = ref(false)
const hasSearched = ref(!!route.query.keyword)
const loading = ref(false)
const loadingMore = ref(false)
const initialized = ref(false)

const canLoadMore = computed(() => hasMore.value && !loading.value && !loadingMore.value)
const { loadMoreSentinel } = useAutoLoadMore({
  canLoadMore,
  onLoadMore: () => load(page.value + 1)
})

const updateQuery = async () => {
  await router.replace({
    query: {
      ...route.query,
      keyword: submittedKeyword.value
    }
  })
}

const buildRequestBody = (nextPage = 1) => ({
  key: submittedKeyword.value,
  page: nextPage,
  lat: lat.value,
  lng: lng.value
})

const fetchPage = async (nextPage = 1) => {
  const response = await $api('/arena/lists', {
    method: 'POST',
    body: buildRequestBody(nextPage)
  })

  return {
    rows: Array.isArray(response?.data?.data) ? response.data.data : [],
    currentPage: Number(response?.data?.current_page ?? nextPage),
    lastPage: Number(response?.data?.last_page ?? nextPage)
  }
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
    const { rows, currentPage, lastPage } = await fetchPage(nextPage)

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

const { data: initialData } = await useAsyncData(() => `search-arena:${submittedKeyword.value}:${lat.value}:${lng.value}`, async () => {
  if (!submittedKeyword.value) return null

  try {
    return await fetchPage(1)
  } catch {
    return { rows: [], currentPage: 1, lastPage: 1 }
  }
}, {
  default: () => null,
  watch: false
})

if (initialData.value) {
  list.value = initialData.value.rows
  page.value = initialData.value.currentPage
  hasMore.value = initialData.value.rows.length > 0 && initialData.value.currentPage < initialData.value.lastPage
  hasSearched.value = true
}

const handleSearch = async () => {
  submittedKeyword.value = keyword.value.trim()
  page.value = 1
  hasMore.value = false

  if (initialized.value) {
    await updateQuery()
  }

  await load(1)
}

onMounted(() => {
  initialized.value = true
})
</script>
