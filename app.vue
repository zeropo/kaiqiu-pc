<template>
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
  <Teleport to="body">
    <div id="toasts" class="fixed inset-x-0 top-0 z-50 flex flex-col items-center space-y-2 p-2 pointer-events-none"></div>
  </Teleport>
</template>

<script setup>
</script>

<style>
html, body, #__nuxt {
  background: var(--color-surface);
  color: var(--color-text);
}
</style>

