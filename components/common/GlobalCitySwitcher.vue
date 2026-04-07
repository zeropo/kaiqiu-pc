<template>
  <div class="relative" ref="rootRef">
    <button
      type="button"
      class="inline-flex h-10 items-center gap-2 rounded-full border border-border bg-white px-4 text-sm font-medium text-text-main shadow-sm transition-all duration-smooth hover:border-brand-primary hover:text-brand-primary"
      @click="togglePanel"
    >
      <svg class="h-4 w-4 text-brand-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657 13.414 20.9a1.998 1.998 0 0 1-2.827 0L6.343 16.657a8 8 0 1 1 11.314 0Z"></path>
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"></path>
      </svg>
      <span class="max-w-[112px] truncate">{{ currentCity }}</span>
      <svg class="h-4 w-4 text-text-light transition-transform" :class="open ? 'rotate-180' : ''" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m19 9-7 7-7-7"></path>
      </svg>
    </button>

    <div v-if="open" class="absolute right-0 top-[calc(100%+12px)] z-50 w-[460px] overflow-hidden rounded-[28px] border border-border bg-white shadow-cardHover">
      <div class="border-b border-border bg-surfaceSoft/60 px-5 py-4">
        <p class="text-base font-semibold text-text-main">切换城市</p>
      </div>

      <div v-if="cityLoading && !groupedCities.length" class="space-y-3 p-5">
        <div v-for="item in 6" :key="item" class="h-11 animate-pulse rounded-2xl bg-surfaceSoft"></div>
      </div>

      <div v-else class="flex items-center gap-4 px-4 py-4">
        <div class="flex w-9 shrink-0 self-center flex-col items-center rounded-2xl bg-surfaceSoft/80 py-2">
          <button
            v-for="letter in letterIndex"
            :key="letter"
            type="button"
            class="flex h-5 w-full items-center justify-center rounded-full text-[11px] font-semibold transition-colors"
            :class="resolveLetterClass(letter)"
            @click="scrollToLetter(letter)"
          >
            {{ letter }}
          </button>
        </div>

        <div ref="listRef" class="max-h-[448px] flex-1 overflow-y-auto pr-1" @scroll="handleListScroll">
          <div
            v-for="group in groupedCities"
            :key="group.letter"
            :ref="(el) => setGroupRef(group.letter, el)"
            class="mb-5 last:mb-0"
          >
            <div class="mb-3 flex items-center gap-3">
              <span class="inline-flex h-8 w-8 items-center justify-center rounded-full bg-brand-primary/10 text-sm font-semibold text-brand-primary">{{ group.letter }}</span>
              <div class="h-px flex-1 bg-border"></div>
            </div>

            <div class="flex flex-wrap gap-2">
              <button
                v-for="item in group.list"
                :key="item.id"
                type="button"
                class="rounded-2xl border px-3 py-2 text-sm font-medium transition-all"
                :class="item.name === currentCity
                  ? 'border-brand-primary bg-brand-primary text-white shadow-sm'
                  : 'border-border bg-white text-text-muted hover:border-brand-primary hover:text-brand-primary'"
                @click="handleSelect(item.name)"
              >
                {{ item.name }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
const rootRef = ref(null)
const listRef = ref(null)
const groupRefs = ref({})
const open = ref(false)
const activeLetter = ref('')
const scrollTargetLetter = ref('')
const { city, cityGroups, cityLoading, ensureCityGroups, switchCity } = useCity()

let scrollStopTimer = null

const currentCity = computed(() => city.value || '杭州市')
const groupedCities = computed(() => cityGroups.value || [])
const letterIndex = 'ABCDEFGHJKLMNPQRSTWXYZ'.split('')
const letterSet = computed(() => new Set(groupedCities.value.map((group) => group.letter)))

const setGroupRef = (letter, el) => {
  if (el) {
    groupRefs.value[letter] = el
    return
  }

  delete groupRefs.value[letter]
}

const syncActiveLetter = () => {
  if (!groupedCities.value.length) {
    activeLetter.value = ''
    return
  }

  const container = listRef.value
  if (!container) {
    activeLetter.value = groupedCities.value[0].letter
    return
  }

  const maxScrollTop = container.scrollHeight - container.clientHeight
  if (maxScrollTop <= 0) {
    activeLetter.value = groupedCities.value[0].letter
    return
  }

  if (container.scrollTop >= maxScrollTop - 4) {
    activeLetter.value = groupedCities.value[groupedCities.value.length - 1].letter
    return
  }

  const containerTop = container.getBoundingClientRect().top
  let nextActiveLetter = groupedCities.value[0].letter

  groupedCities.value.forEach((group) => {
    const target = groupRefs.value[group.letter]
    if (!target) return

    const relativeTop = target.getBoundingClientRect().top - containerTop
    if (relativeTop <= 12) {
      nextActiveLetter = group.letter
    }
  })

  activeLetter.value = nextActiveLetter
}

const resolveLetterClass = (letter) => {
  if (!letterSet.value.has(letter)) {
    return 'text-text-light cursor-default'
  }

  if (activeLetter.value === letter) {
    return 'bg-white text-brand-primary shadow-sm'
  }

  return 'text-text-main hover:text-brand-primary'
}

const closePanel = () => {
  open.value = false
}

const togglePanel = async () => {
  open.value = !open.value

  if (!open.value) {
    scrollTargetLetter.value = ''
    return
  }

  await ensureCityGroups()
  await nextTick()
  syncActiveLetter()
}

const scrollToLetter = (letter) => {
  if (!letterSet.value.has(letter)) return

  const container = listRef.value
  const target = groupRefs.value[letter]
  if (!container || !target) return

  if (scrollStopTimer) {
    clearTimeout(scrollStopTimer)
    scrollStopTimer = null
  }

  activeLetter.value = letter
  scrollTargetLetter.value = letter

  const top = target.getBoundingClientRect().top - container.getBoundingClientRect().top + container.scrollTop

  container.scrollTo({
    top,
    behavior: 'smooth'
  })
}

const handleListScroll = () => {
  if (scrollTargetLetter.value) {
    if (scrollStopTimer) {
      clearTimeout(scrollStopTimer)
    }

    scrollStopTimer = setTimeout(() => {
      scrollTargetLetter.value = ''
      syncActiveLetter()
    }, 120)
    return
  }

  syncActiveLetter()
}

const handleSelect = (nextCity) => {
  if (nextCity !== currentCity.value) {
    switchCity(nextCity)
  }
  closePanel()
}

const handleClickOutside = (event) => {
  if (!open.value || !rootRef.value) return
  if (!rootRef.value.contains(event.target)) {
    closePanel()
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
  ensureCityGroups()
})

onBeforeUnmount(() => {
  document.removeEventListener('click', handleClickOutside)
  if (scrollStopTimer) {
    clearTimeout(scrollStopTimer)
  }
})
</script>
