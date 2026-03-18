<template>
  <div class="min-h-screen flex flex-col bg-surfaceMuted selection:bg-brand-primary selection:text-white">
    <header class="sticky top-0 z-40 bg-white/70 backdrop-blur-xl border-b border-border shadow-header transition-all duration-300">
      <div class="container flex items-center justify-between h-16 md:h-20">
        <!-- Logo -->
        <a href="/" class="flex items-center gap-3 group">
          <div class="w-10 h-10 rounded-full bg-gradient-to-br from-brand-primary to-brand-primaryHover flex items-center justify-center text-white font-bold text-xl shadow-card group-hover:scale-105 transition-transform duration-smooth">
            K
          </div>
          <span class="font-display font-semibold tracking-wide text-xl text-text-main group-hover:text-brand-primary transition-colors">开球网</span>
        </a>
        
        <!-- Desktop Nav -->
        <nav class="hidden md:flex items-center gap-8 text-[15px] font-medium text-text-muted">
          <a v-for="link in links" :key="link.path" :href="link.path" class="relative py-2 hover:text-brand-primary transition-colors after:absolute after:bottom-0 after:left-0 after:h-[2px] after:w-0 after:bg-brand-primary after:transition-all hover:after:w-full">
            {{ link.name }}
          </a>
          
          <a href="/search" class="ml-4 inline-flex items-center justify-center h-10 px-6 rounded-full bg-surfaceSoft text-text-main border border-border hover:border-brand-primary hover:text-brand-primary transition-all duration-smooth font-medium text-sm">
            <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
            搜索
          </a>
        </nav>

        <!-- Mobile Menu Toggle -->
        <button @click="mobileMenuOpen = !mobileMenuOpen" class="md:hidden p-2 text-text-muted hover:text-text-main transition-colors">
          <svg v-if="!mobileMenuOpen" class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"></path></svg>
          <svg v-else class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
        </button>
      </div>

      <!-- Mobile Menu Drawer (Absolute under header) -->
      <transition enter-active-class="transition duration-smooth ease-out" enter-from-class="opacity-0 -translate-y-4" enter-to-class="opacity-100 translate-y-0" leave-active-class="transition duration-smooth ease-in" leave-from-class="opacity-100 translate-y-0" leave-to-class="opacity-0 -translate-y-4">
        <div v-show="mobileMenuOpen" class="md:hidden absolute top-full left-0 right-0 bg-white border-b border-border shadow-cardHover">
          <nav class="flex flex-col py-4 px-6 space-y-4 text-base font-medium text-text-main">
            <a v-for="link in links" :key="link.path" :href="link.path" class="block py-2 border-b border-border/50" @click="mobileMenuOpen = false">
              {{ link.name }}
            </a>
            <a href="/search" class="inline-flex items-center justify-center mt-4 h-12 w-full rounded-btn bg-brand-primary text-white shadow-card active:scale-[0.98] transition-all" @click="mobileMenuOpen = false">
              <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
              全局搜索
            </a>
          </nav>
        </div>
      </transition>
    </header>

    <main class="flex-1 w-full relative">
      <slot />
    </main>

    <footer class="bg-white border-t border-border py-12 text-sm text-text-muted mt-auto">
      <div class="container flex flex-col md:flex-row items-center justify-between gap-6">
        <div class="flex items-center gap-2">
          <div class="w-6 h-6 rounded-full bg-brand-primary flex items-center justify-center text-white font-bold text-xs">K</div>
          <span class="font-display font-medium text-text-main">开球网网页版</span>
        </div>
        <div class="flex gap-6">
          <a href="#" class="hover:text-brand-primary transition">关于我们</a>
          <a href="#" class="hover:text-brand-primary transition">隐私政策</a>
          <a href="#" class="hover:text-brand-primary transition">服务条款</a>
        </div>
        <div class="text-xs text-text-light text-center md:text-right">
          © 2026 Kaiqiu PC.<br/>此站仅为查询数据演示，非官方应用。
        </div>
      </div>
    </footer>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const mobileMenuOpen = ref(false)

const links = [
  { name: '比赛', path: '/matches' },
  { name: '教练', path: '/coaches' },
  { name: '球馆', path: '/arenas' },
  { name: '积分', path: '/scores' },
  { name: '排行', path: '/rankings' },
  { name: '裁判', path: '/umpires' }
]
</script>

<style scoped>
</style>
