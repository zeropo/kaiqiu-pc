export function useAutoLoadMore(options = {}) {
  const sentinelRef = ref(null)
  const preloadDistance = options.preloadDistance ?? 320
  const canLoadMore = options.canLoadMore ?? ref(false)
  const onLoadMore = options.onLoadMore ?? (() => {})

  let observer = null
  let pendingPromise = null

  const isEnabled = () => Boolean(unref(canLoadMore))

  const isSentinelNearViewport = () => {
    if (!process.client || !sentinelRef.value) return false

    const rect = sentinelRef.value.getBoundingClientRect()
    return rect.top <= window.innerHeight + preloadDistance
  }

  const stopObserver = () => {
    if (!observer) return
    observer.disconnect()
    observer = null
  }

  const maybeLoadMore = async () => {
    if (!process.client || !isEnabled() || pendingPromise) return
    if (!isSentinelNearViewport()) return

    pendingPromise = Promise.resolve(onLoadMore())

    try {
      await pendingPromise
    } finally {
      pendingPromise = null

      await nextTick()

      if (!process.client || !isEnabled() || !isSentinelNearViewport()) return

      requestAnimationFrame(() => {
        maybeLoadMore()
      })
    }
  }

  const startObserver = async () => {
    if (!process.client) return

    await nextTick()
    stopObserver()

    if (!sentinelRef.value || !isEnabled()) return

    observer = new IntersectionObserver((entries) => {
      if (entries.some((entry) => entry.isIntersecting)) {
        maybeLoadMore()
      }
    }, {
      root: null,
      rootMargin: `${preloadDistance}px 0px ${preloadDistance}px 0px`,
      threshold: 0
    })

    observer.observe(sentinelRef.value)

    if (isSentinelNearViewport()) {
      maybeLoadMore()
    }
  }

  watch(sentinelRef, () => {
    startObserver()
  }, { flush: 'post' })

  watch(() => unref(canLoadMore), (value) => {
    if (value) {
      startObserver()
      return
    }

    stopObserver()
  }, {
    immediate: true,
    flush: 'post'
  })

  onMounted(() => {
    startObserver()
  })

  onBeforeUnmount(() => {
    stopObserver()
  })

  return {
    loadMoreSentinel: sentinelRef,
    maybeLoadMore
  }
}
