<template>
  <div
    ref="containerRef"
    :class="[wrapperClass, 'relative isolate overflow-hidden']"
  >
    <span
      aria-hidden="true"
      class="pointer-events-none absolute left-0 top-0 z-0 rounded-full bg-brand-primary shadow-card transition-[transform,width,height,opacity] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]"
      :class="indicator.ready ? 'opacity-100' : 'opacity-0'"
      :style="indicatorStyle"
    ></span>

    <button
      v-for="(tab, index) in tabs"
      :key="tab.value"
      :ref="(el) => setTabRef(el, index)"
      type="button"
      :class="[
        buttonBaseClass,
        modelValue === tab.value
          ? activeButtonClass
          : inactiveButtonClass
      ]"
      @click="emit('update:modelValue', tab.value)"
    >
      {{ tab.label }}
    </button>
  </div>
</template>

<script setup>
const props = defineProps({
  modelValue: {
    type: String,
    required: true
  },
  tabs: {
    type: Array,
    default: () => []
  },
  wrapperClass: {
    type: String,
    default: 'inline-flex w-full rounded-full bg-surfaceSoft p-1 sm:w-auto'
  },
  buttonBaseClass: {
    type: String,
    default: 'relative z-10 flex-1 rounded-full px-4 py-2.5 text-sm font-semibold transition-colors duration-300 sm:flex-none'
  },
  activeButtonClass: {
    type: String,
    default: 'text-white'
  },
  inactiveButtonClass: {
    type: String,
    default: 'text-text-muted hover:text-text-main'
  }
})

const emit = defineEmits(['update:modelValue'])

const containerRef = ref(null)
const buttonRefs = ref([])
const indicator = ref({
  x: 0,
  y: 0,
  width: 0,
  height: 0,
  ready: false
})

let resizeObserver

const activeIndex = computed(() => {
  return props.tabs.findIndex((tab) => tab.value === props.modelValue)
})

const indicatorStyle = computed(() => ({
  width: `${indicator.value.width}px`,
  height: `${indicator.value.height}px`,
  transform: `translate3d(${indicator.value.x}px, ${indicator.value.y}px, 0)`
}))

const setTabRef = (el, index) => {
  buttonRefs.value[index] = el || null
}

const syncIndicator = async () => {
  await nextTick()

  const activeButton = buttonRefs.value[activeIndex.value]
  if (!activeButton) {
    if (indicator.value.ready || indicator.value.width || indicator.value.height) {
      indicator.value = {
        x: 0,
        y: 0,
        width: 0,
        height: 0,
        ready: false
      }
    }
    return
  }

  const nextIndicator = {
    x: activeButton.offsetLeft,
    y: activeButton.offsetTop,
    width: activeButton.offsetWidth,
    height: activeButton.offsetHeight,
    ready: true
  }

  if (
    indicator.value.x === nextIndicator.x &&
    indicator.value.y === nextIndicator.y &&
    indicator.value.width === nextIndicator.width &&
    indicator.value.height === nextIndicator.height &&
    indicator.value.ready === nextIndicator.ready
  ) {
    return
  }

  indicator.value = nextIndicator
}

watch(
  () => [props.modelValue, props.tabs.length],
  () => {
    syncIndicator()
  },
  { immediate: true }
)

onMounted(() => {
  syncIndicator()

  if (typeof ResizeObserver !== 'undefined') {
    resizeObserver = new ResizeObserver(() => {
      syncIndicator()
    })

    if (containerRef.value) {
      resizeObserver.observe(containerRef.value)
    }
  } else if (typeof window !== 'undefined') {
    window.addEventListener('resize', syncIndicator)
  }
})

onBeforeUnmount(() => {
  if (resizeObserver) {
    resizeObserver.disconnect()
  } else if (typeof window !== 'undefined') {
    window.removeEventListener('resize', syncIndicator)
  }
})
</script>
