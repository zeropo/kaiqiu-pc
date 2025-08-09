<template>
  <div class="min-h-screen flex flex-col">
    <header class="sticky top-0 z-40 bg-white/80 backdrop-blur border-b border-gray-100">
      <div class="container flex items-center justify-between h-14">
        <NuxtLink to="/" class="font-semibold tracking-wide">开球网</NuxtLink>
        <nav class="hidden md:flex items-center gap-6 text-sm text-gray-600">
          <NuxtLink to="/matches" active-class="text-black" class="hover:text-black">比赛</NuxtLink>
          <NuxtLink to="/arenas" active-class="text-black" class="hover:text-black">球馆</NuxtLink>
          <NuxtLink to="/coaches" active-class="text-black" class="hover:text-black">教练</NuxtLink>
          <NuxtLink to="/umpires" active-class="text-black" class="hover:text-black">裁判</NuxtLink>
          <NuxtLink to="/points" active-class="text-black" class="hover:text-black">积分</NuxtLink>
          <NuxtLink to="/rankings" active-class="text-black" class="hover:text-black">排行榜</NuxtLink>
          <NuxtLink to="/search" active-class="text-black" class="hover:text-black">搜索</NuxtLink>
        </nav>
        <NuxtLink to="/search" class="md:hidden text-sm text-gray-600">搜索</NuxtLink>
      </div>
    </header>
    <main class="flex-1">
      <slot />
    </main>
    <footer class="border-t border-gray-100 py-8 text-center text-xs text-gray-500">
      <div class="container">数据来源：开球网 | 本站仅做查询展示</div>
    </footer>
  </div>
</template>

<script setup>
</script>

<style scoped>
</style>

