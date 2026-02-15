<template>
  <Teleport to="body">
    <div v-if="open" class="fixed inset-0 z-50 flex items-center justify-center">
      <div class="absolute inset-0 bg-black/40" @click="$emit('close')"></div>
      <div class="relative bg-white rounded-card shadow-card w-[90vw] max-w-xl p-4">
        <slot />
      </div>
    </div>
  </Teleport>
  
</template>

<script setup>
defineProps({ open: Boolean })
defineEmits(['close'])
</script>

