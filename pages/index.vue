<template>
  <div>
    <section class="bg-surfaceMuted">
      <div class="container py-10 md:py-14">
        <div class="flex flex-col md:flex-row md:items-center gap-4 md:gap-8">
          <div class="flex-1">
            <h1 class="text-2xl md:text-3xl font-semibold mb-2">开球网（网页版）</h1>
            <p class="text-gray-600">查询比赛、球馆、教练、裁判、积分与排行榜。</p>
          </div>
          <NuxtLink to="/search" class="inline-flex items-center justify-center h-11 px-5 rounded-btn bg-brand-primary text-white shadow-card hover:shadow-cardHover transition">开始搜索</NuxtLink>
        </div>
      </div>
    </section>

    <div class="container py-10 space-y-12">
      <section>
        <div class="flex items-center justify-between mb-4">
          <h2 class="text-lg font-semibold">近期赛事</h2>
          <NuxtLink to="/matches" class="text-sm text-gray-500">更多</NuxtLink>
        </div>
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div v-for="n in 4" :key="n" class="h-40 bg-surfaceMuted rounded-card animate-pulse" />
        </div>
      </section>

      <section>
        <div class="flex items-center justify-between mb-4">
          <h2 class="text-lg font-semibold">热门选手</h2>
          <NuxtLink to="/points" class="text-sm text-gray-500">更多</NuxtLink>
        </div>
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div v-for="n in 4" :key="n" class="h-24 bg-surfaceMuted rounded-card animate-pulse" />
        </div>
      </section>
    </div>
  </div>
  
</template>

<script setup>
definePageMeta({ title: '首页' })
</script>

