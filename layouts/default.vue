<template>
  <div class="min-h-screen flex flex-col">
    <header class="sticky top-0 z-40 bg-white/80 backdrop-blur border-b border-gray-100">
      <div class="container flex items-center justify-between h-14">
        <a href="/" class="font-semibold tracking-wide">开球网</a>
        <nav class="hidden md:flex items-center gap-6 text-sm text-gray-600">
          <a href="/matches" class="hover:text-black">比赛</a>
          <a href="/coaches" class="hover:text-black">教练</a>
          <a href="/arenas" class="hover:text-black">球馆</a>
          <a href="/scores" class="hover:text-black">积分</a>
          <a href="/rankings" class="hover:text-black">排行榜</a>
          <a href="/umpires" class="hover:text-black">裁判</a>
          <a href="/search" class="hover:text-black">搜索</a>
        </nav>
        <a href="/search" class="md:hidden text-sm text-gray-600">搜索</a>
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

