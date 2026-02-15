<template>
  <img
    :src="currentSrc"
    :alt="alt || ''"
    :class="klass"
    @error="onError"
    loading="lazy"
    decoding="async"
  />
</template>

<script setup>
const props = defineProps({
  src: { type: String, default: '' },
  alt: { type: String, default: '' },
  class: { type: String, default: '' },
  fallback: { type: String, default: '' }
})

const fallbackData =
  'data:image/svg+xml;utf8,' +
  encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="300"><rect width="100%" height="100%" fill="#f3f4f6"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" fill="#9ca3af" font-size="14">no image</text></svg>`
  )

const currentSrc = ref(props.src)
const klass = computed(() => props.class)
const onError = () => {
  if (currentSrc.value !== (props.fallback || fallbackData)) {
    currentSrc.value = props.fallback || fallbackData
  }
}

watch(() => props.src, (v) => { currentSrc.value = v })
</script>

