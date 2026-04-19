<template>
  <div class="container pt-8 pb-10 md:pt-12 md:pb-16">
    <div class="mb-8 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
      <div>
        <h1 class="font-display text-3xl font-bold text-text-main">我的关注</h1>
        <p class="mt-2 text-text-muted">浏览并了解关注选手的积分详情</p>
      </div>
      <div class="inline-flex items-center gap-2 self-start rounded-full bg-surfaceSoft px-4 py-2 text-sm font-medium text-text-muted">
        <span class="inline-block h-2 w-2 rounded-full bg-brand-primary"></span>
        共 {{ total }} 位关注人
      </div>
    </div>

    <div v-if="loading" class="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
      <div
        v-for="n in 9"
        :key="n"
        class="h-48 rounded-card border border-border bg-white animate-pulse"
      />
    </div>

    <div
      v-else-if="errorMessage"
      class="rounded-card border border-red-200 bg-red-50 px-6 py-8 text-sm text-red-600"
    >
      {{ errorMessage }}
    </div>

    <div v-else-if="list.length" class="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
      <article
        v-for="item in list"
        :key="rowKey(item)"
        :class="[
          'group relative rounded-card border border-border bg-white p-5 shadow-card transition-all duration-300 ease-smooth hover:-translate-y-1 hover:shadow-cardHover',
          detailLink(item) ? 'cursor-pointer' : ''
        ]"
      >
        <div class="flex items-start gap-4">
          <ImgFallback
            :src="item.face_url"
            :alt="displayName(item)"
            class="h-16 w-16 rounded-full border border-border bg-surfaceSoft object-cover"
          />
          <div class="min-w-0 flex-1">
            <div class="block truncate text-lg font-semibold text-text-main transition-colors group-hover:text-brand-primary">
              {{ displayName(item) }}
            </div>
            <p class="mt-1 text-sm text-text-muted">
              昵称：{{ displayNickname(item) }}
            </p>
            <p v-if="displayMessage(item)" class="mt-3 text-sm leading-6 text-text-muted">
              {{ displayMessage(item) }}
            </p>
          </div>
        </div>

        <div class="mt-5 flex items-center justify-between border-t border-surfaceSoft pt-4">
          <span class="text-xs uppercase tracking-[0.2em] text-text-light">
            UID {{ item.fuid || '-' }}
          </span>
          <span
            v-if="detailLink(item)"
            class="inline-flex items-center gap-1 text-sm font-medium text-brand-primary transition-colors group-hover:text-brand-primaryHover"
          >
            查看详情
            <svg class="h-4 w-4 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path></svg>
          </span>
        </div>

        <NuxtLink v-if="detailLink(item)" :to="detailLink(item)" class="absolute inset-0 z-10">
          <span class="sr-only">查看 {{ displayName(item) }} 的积分详情</span>
        </NuxtLink>
      </article>
    </div>

    <div
      v-else
      class="rounded-card border border-border bg-white px-6 py-16 text-center shadow-sm"
    >
      <h2 class="font-display text-2xl font-semibold text-text-main">暂无关注人</h2>
      <p class="mt-3 text-text-muted">当前账号还没有关注的选手，稍后再来看看。</p>
    </div>
  </div>
</template>

<script setup>
useHead({
  title: '我的关注'
})

const { $api } = useNuxtApp()

const loading = ref(true)
const list = ref([])
const errorMessage = ref('')

const total = computed(() => list.value.length)

const load = async () => {
  loading.value = true
  errorMessage.value = ''

  try {
    const res = await $api('/following/lists', {
      method: 'POST',
      body: { page: 1 }
    })
    list.value = Array.isArray(res?.data?.data) ? res.data.data : []
  } catch (error) {
    list.value = []
    errorMessage.value = error?.statusMessage || '关注人数据加载失败，请稍后重试。'
  } finally {
    loading.value = false
  }
}

const rowKey = (item) => item.fuid || item.uid || item.user_id || item.nickname || item.realname

const displayName = (item) => {
  const name = item?.realname || item?.nickname || ''
  if (name) return name
  return item?.fuid ? `用户 ${item.fuid}` : '未知用户'
}

const displayNickname = (item) => item?.nickname || '未设置昵称'

const displayMessage = (item) => {
  if (typeof item?.messages === 'string' && item.messages.trim()) return item.messages.trim()
  if (typeof item?.messages === 'number' && Number.isFinite(item.messages)) return `消息数：${item.messages}`
  return ''
}

const detailLink = (item) => item?.fuid ? `/scores/${item.fuid}` : ''

onMounted(load)
</script>
