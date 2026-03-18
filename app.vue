<template>
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
  <Teleport to="body">
    <div id="toasts" class="fixed inset-x-0 top-0 z-50 flex flex-col items-center space-y-2 p-2 pointer-events-none"></div>
  </Teleport>
</template>

<script setup>
useHead({
  link: [
    { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
    { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: '' },
    { rel: 'stylesheet', href: 'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Noto+Sans+SC:wght@300;400;500;600;700&family=Outfit:wght@400;500;600;700&display=swap' }
  ]
})
</script>

<style>
html, body, #__nuxt {
  background: theme('colors.surfaceMuted');
  color: theme('colors.text.main');
  font-family: theme('fontFamily.sans');
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

::selection {
  background-color: theme('colors.brand.primary');
  color: white;
}
</style>
