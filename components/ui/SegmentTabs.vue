<template>
  <div
    ref="containerRef"
    :class="[resolvedWrapperClass, containerClass]"
  >
    <span
      aria-hidden="true"
      class="pointer-events-none absolute left-0 top-0 z-0 transition-[transform,width,height,opacity] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]"
      :class="[indicatorBaseClass, indicator.ready ? 'opacity-100' : 'opacity-0']"
      :style="indicatorStyle"
    ></span>

    <button
      v-for="(tab, index) in tabs"
      :key="tab.value"
      :ref="(el) => setTabRef(el, index)"
      type="button"
      :class="[
        resolvedButtonBaseClass,
        modelValue === tab.value
          ? resolvedActiveButtonClass
          : resolvedInactiveButtonClass
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
  variant: {
    type: String,
    default: 'pill'
  },
  tabs: {
    type: Array,
    default: () => []
  },
  wrapperClass: {
    type: String,
    default: ''
  },
  buttonBaseClass: {
    type: String,
    default: ''
  },
  activeButtonClass: {
    type: String,
    default: ''
  },
  inactiveButtonClass: {
    type: String,
    default: ''
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

const isUnderlineVariant = computed(() => props.variant === 'underline')

const containerClass = computed(() => {
  return isUnderlineVariant.value
    ? 'relative isolate overflow-visible'
    : 'relative isolate overflow-hidden'
})

const resolvedWrapperClass = computed(() => {
  if (props.wrapperClass) return props.wrapperClass

  return isUnderlineVariant.value
    ? 'inline-flex w-full items-center gap-6 border-b border-border bg-transparent'
    : 'inline-flex w-full rounded-full bg-surfaceSoft p-1 sm:w-auto'
})

const resolvedButtonBaseClass = computed(() => {
  if (props.buttonBaseClass) return props.buttonBaseClass

  return isUnderlineVariant.value
    ? 'relative z-10 shrink-0 px-1 pb-4 pt-1 text-left text-lg font-semibold transition-colors duration-300 sm:text-xl'
    : 'relative z-10 flex-1 rounded-full px-4 py-2.5 text-sm font-semibold transition-colors duration-300 sm:flex-none'
})

const resolvedActiveButtonClass = computed(() => {
  if (props.activeButtonClass) return props.activeButtonClass
  return isUnderlineVariant.value ? 'text-[#ff9f0a]' : 'text-white'
})

const resolvedInactiveButtonClass = computed(() => {
  if (props.inactiveButtonClass) return props.inactiveButtonClass
  return 'text-text-muted hover:text-text-main'
})

const indicatorBaseClass = computed(() => {
  return isUnderlineVariant.value
    ? 'rounded-full bg-[#ff9f0a] shadow-none'
    : 'rounded-full bg-brand-primary shadow-card'
})

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

  const nextIndicator = isUnderlineVariant.value
    ? (() => {
      const horizontalInset = Math.min(12, Math.max(0, Math.floor(activeButton.offsetWidth * 0.18)))
      const width = Math.max(28, activeButton.offsetWidth - horizontalInset * 2)

      return {
        x: activeButton.offsetLeft + Math.floor((activeButton.offsetWidth - width) / 2),
        y: activeButton.offsetTop + activeButton.offsetHeight - 3,
        width,
        height: 3,
        ready: true
      }
    })()
    : {
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
