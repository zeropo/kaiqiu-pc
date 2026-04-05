<template>
  <div
    v-if="tabs.length"
    class="flex flex-wrap items-center justify-center gap-3"
  >
    <button
      v-for="tab in tabs"
      :key="tab.value"
      type="button"
      class="inline-flex min-w-[120px] items-center justify-center rounded-full border px-5 py-2.5 text-sm font-semibold transition-all duration-200"
      :class="modelValue === tab.value
        ? 'border-brand-primary bg-brand-primary text-white shadow-md shadow-brand-primary/20'
        : 'border-border bg-surfaceSoft/80 text-text-muted hover:border-brand-primary/30 hover:text-text-main'"
      @click="emit('update:modelValue', tab.value)"
    >
      {{ tab.label }}
    </button>
  </div>
</template>

<script setup>
defineProps({
  tabs: {
    type: Array,
    default: () => []
  },
  modelValue: {
    type: String,
    default: ''
  }
})

const emit = defineEmits(['update:modelValue'])
</script>
