<template>
  <div class="container py-16">
    <h1 class="text-2xl font-semibold mb-2">出错了</h1>
    <p class="text-gray-600 mb-6">{{ message }}</p>
    <NuxtLink to="/" class="text-brand-primary">返回首页</NuxtLink>
  </div>
</template>

<script setup>
const props = defineProps({ error: Object })
const message = computed(() => props.error?.message || '网络异常或页面不存在')
</script>

