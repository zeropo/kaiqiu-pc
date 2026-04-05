<template>
  <Teleport to="body">
    <div v-if="open" class="fixed inset-0 z-50 flex items-center justify-center">
      <div class="absolute inset-0 bg-black/40" @click="$emit('close')"></div>
      <div :class="panelClasses" class="relative bg-white rounded-card shadow-card w-[90vw] p-4">
        <slot />
      </div>
    </div>
  </Teleport>
</template>

<script setup>
const props = defineProps({
  open: Boolean,
  panelClass: {
    type: String,
    default: 'max-w-xl'
  }
})
defineEmits(['close'])

const panelClasses = computed(() => props.panelClass || 'max-w-xl')
</script>
