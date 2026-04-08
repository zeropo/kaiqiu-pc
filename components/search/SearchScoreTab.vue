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
    </form>

    <div v-if="loading" class="space-y-3">
      <div
        v-for="item in 5"
        :key="item"
        class="h-16 animate-pulse rounded-2xl border border-border bg-white"
      ></div>
    </div>

    <div
      v-else-if="!hasSearched"
      class="rounded-3xl border border-dashed border-border bg-surfaceSoft/35 px-6 py-14 text-center"
    >
      <p class="text-lg font-semibold text-text-main">输入用户姓名开始查询积分</p>
      <p class="mt-2 text-sm text-text-muted">
        结果会展示姓名、当前积分、性别和所在地区。
      </p>
    </div>

    <div
      v-else-if="list.length"
      class="overflow-hidden rounded-3xl border border-border bg-white shadow-sm"
    >
      <div class="overflow-x-auto">
        <table class="min-w-full whitespace-nowrap text-left">
          <thead class="border-b border-border bg-surfaceSoft text-text-muted">
            <tr>
              <th class="px-5 py-4 font-semibold">序号</th>
              <th class="px-5 py-4 font-semibold">姓名</th>
              <th class="px-5 py-4 font-semibold">当前积分</th>
              <th class="px-5 py-4 font-semibold">性别</th>
              <th class="px-5 py-4 font-semibold">地区</th>
              <th class="px-5 py-4 font-semibold">详情</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-border text-base">
            <tr
              v-for="(user, index) in list"
              :key="user.uid"
              class="transition-colors hover:bg-surfaceSoft/40"
            >
              <td class="px-5 py-4 font-display font-semibold text-text-main">
                {{ index + 1 }}
              </td>
              <td class="px-5 py-4 font-semibold text-text-main">
                {{ user.realname || user.username2 || '-' }}
              </td>
              <td class="px-5 py-4 font-semibold text-text-main">
                {{ user.score || '-' }}
              </td>
              <td class="px-5 py-4 text-text-muted">
                {{ formatSex(user.sex) }}
              </td>
              <td class="px-5 py-4 text-text-muted">
                {{ formatLocation(user) }}
              </td>
              <td class="px-5 py-4">
                <NuxtLink :to="`/scores/${user.uid}`" target="_blank" rel="noopener noreferrer" class="font-medium text-brand-primary hover:text-brand-primaryHover">
                  详情
                </NuxtLink>
              </td>
            </tr>
          </tbody>
        </table>
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
      <p class="text-lg font-semibold text-text-main">没有找到对应积分用户</p>
      <p class="mt-2 text-sm text-text-muted">
        请确认姓名是否正确，或使用更完整的姓名再次查询。
      </p>
    </div>
  </div>
</template>

<script setup>
const { $api } = useNuxtApp()

const keyword = ref('')
const submittedKeyword = ref('')
const page = ref(1)
const perPage = ref(10)
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

const formatSex = (sex) => {
  if (String(sex) === '1') return '男'
  if (String(sex) === '2') return '女'
  return '-'
}

const formatLocation = (user) => {
  return user?.residecity || user?.resideprovince || '-'
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
    const response = await $api('/user/lists', {
      method: 'GET',
      params: {
        page: nextPage,
        key: submittedKeyword.value
      }
    })
    const rows = Array.isArray(response?.data?.data) ? response.data.data : []
    const currentPage = Number(response?.data?.current_page ?? nextPage)
    const lastPage = Number(response?.data?.last_page ?? currentPage)

    perPage.value = Number(response?.data?.per_page ?? perPage.value) || 10
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
