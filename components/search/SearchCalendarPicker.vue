<template>
  <div ref="calendarRef" class="relative">
    <button
      type="button"
      class="flex h-12 w-full min-w-[180px] items-center justify-between gap-3 rounded-2xl border border-border bg-white px-4 text-left text-sm transition-colors disabled:cursor-not-allowed disabled:bg-surfaceMuted disabled:text-text-light"
      :class="disabled ? '' : 'hover:border-brand-primary/40'"
      :disabled="disabled"
      @click="toggleCalendar"
    >
      <span class="truncate" :class="modelValue ? 'text-text-main' : 'text-text-light'">
        {{ modelValue || placeholder }}
      </span>
      <svg
        class="h-4 w-4 shrink-0 transition-transform"
        :class="calendarOpen ? 'rotate-180 text-brand-primary' : 'text-text-light'"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m6 9 6 6 6-6" />
      </svg>
    </button>

    <div
      v-if="calendarOpen"
      class="absolute z-30 mt-2 w-[320px] rounded-card border border-border bg-white p-4 shadow-xl"
      :class="alignClass"
    >
      <div class="flex items-center justify-between gap-2">
        <button
          type="button"
          class="h-9 px-3 rounded-btn bg-surfaceMuted text-sm text-text-main transition hover:bg-surfaceSoft disabled:cursor-not-allowed disabled:opacity-50"
          :disabled="isPrevMonthDisabled"
          @click="switchCalendarMonth(-1)"
        >
          上月
        </button>
        <div class="text-sm font-medium text-text-main">{{ calendarTitle }}</div>
        <button
          type="button"
          class="h-9 px-3 rounded-btn bg-surfaceMuted text-sm text-text-main transition hover:bg-surfaceSoft disabled:cursor-not-allowed disabled:opacity-50"
          :disabled="isNextMonthDisabled"
          @click="switchCalendarMonth(1)"
        >
          下月
        </button>
      </div>

      <div class="mt-3 grid grid-cols-7 gap-1 text-center text-xs text-text-light">
        <div v-for="week in weekLabels" :key="week" class="h-7 leading-7">{{ week }}</div>
      </div>

      <div class="grid grid-cols-7 gap-1">
        <button
          v-for="day in calendarDays"
          :key="day.date"
          type="button"
          class="h-9 rounded-btn text-sm transition disabled:cursor-not-allowed"
          :class="[
            day.isSelected ? 'bg-brand-primary text-white hover:bg-brand-primaryHover' : '',
            !day.inCurrentMonth ? 'bg-transparent text-gray-200' : '',
            day.inCurrentMonth && !day.disabled && !day.isSelected ? 'bg-surfaceMuted text-text-main hover:bg-surfaceSoft' : '',
            day.inCurrentMonth && day.disabled ? 'bg-gray-50 text-gray-300' : '',
            day.isToday && !day.isSelected && !day.disabled ? 'border border-brand-primary/30 text-brand-primary' : ''
          ]"
          :disabled="day.disabled"
          @click="selectDate(day.date)"
        >
          {{ day.label }}
        </button>
      </div>

      <div class="mt-3 flex gap-2 border-t border-border pt-3">
        <button
          type="button"
          class="flex-1 h-10 rounded-btn bg-surfaceMuted text-sm text-text-main transition hover:bg-surfaceSoft disabled:cursor-not-allowed disabled:opacity-50"
          :disabled="!modelValue"
          @click="clearDate"
        >
          清空
        </button>
        <button
          type="button"
          class="flex-1 h-10 rounded-btn bg-brand-primary text-sm text-white transition hover:bg-brand-primaryHover disabled:cursor-not-allowed disabled:bg-brand-primary/40"
          :disabled="isTodayDisabled"
          @click="selectToday"
        >
          今天
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  modelValue: {
    type: String,
    default: ''
  },
  placeholder: {
    type: String,
    default: '请选择日期'
  },
  disabled: {
    type: Boolean,
    default: false
  },
  minDate: {
    type: String,
    default: ''
  },
  maxDate: {
    type: String,
    default: ''
  },
  align: {
    type: String,
    default: 'left',
    validator: (value) => ['left', 'right'].includes(value)
  }
})

const emit = defineEmits(['update:modelValue'])

const weekLabels = ['日', '一', '二', '三', '四', '五', '六']
const calendarRef = ref(null)
const calendarOpen = ref(false)

const pad2 = (value) => String(value).padStart(2, '0')
const formatYmd = (date) => `${date.getFullYear()}-${pad2(date.getMonth() + 1)}-${pad2(date.getDate())}`
const formatMonth = (date) => `${date.getFullYear()}-${pad2(date.getMonth() + 1)}`
const parseYmd = (value) => {
  const [year, month, day] = value.split('-').map(Number)
  return new Date(year, month - 1, day)
}
const parseMonth = (value) => parseYmd(`${value}-01`)
const addMonths = (value, offset) => {
  const date = parseMonth(value)
  date.setMonth(date.getMonth() + offset)
  return formatMonth(date)
}

const getDefaultDate = () => {
  const today = formatYmd(new Date())
  if (props.maxDate && today > props.maxDate) return props.maxDate
  if (props.minDate && today < props.minDate) return props.minDate
  return today
}
const getOpenMonth = () => (props.modelValue || getDefaultDate()).slice(0, 7)

const calendarMonth = ref(getOpenMonth())

const alignClass = computed(() => (props.align === 'right' ? 'right-0' : 'left-0'))
const todayValue = computed(() => formatYmd(new Date()))
const calendarTitle = computed(() => {
  const [year, month] = calendarMonth.value.split('-')
  return `${year}年${month}月`
})
const isPrevMonthDisabled = computed(() => props.minDate && calendarMonth.value <= props.minDate.slice(0, 7))
const isNextMonthDisabled = computed(() => props.maxDate && calendarMonth.value >= props.maxDate.slice(0, 7))

const isDateDisabled = (date, inCurrentMonth = true) => {
  if (!inCurrentMonth) return true
  if (props.minDate && date < props.minDate) return true
  if (props.maxDate && date > props.maxDate) return true
  return false
}

const isTodayDisabled = computed(() => isDateDisabled(todayValue.value))

const calendarDays = computed(() => {
  const firstDay = parseMonth(calendarMonth.value)
  const start = new Date(firstDay)
  start.setDate(1 - firstDay.getDay())
  const days = []

  for (let i = 0; i < 42; i += 1) {
    const current = new Date(start)
    current.setDate(start.getDate() + i)
    const date = formatYmd(current)
    const inCurrentMonth = formatMonth(current) === calendarMonth.value
    days.push({
      date,
      label: current.getDate(),
      inCurrentMonth,
      isToday: date === todayValue.value,
      isSelected: date === props.modelValue,
      disabled: isDateDisabled(date, inCurrentMonth)
    })
  }

  return days
})

const closeCalendar = () => {
  calendarOpen.value = false
}

const toggleCalendar = () => {
  if (props.disabled) return
  if (calendarOpen.value) {
    closeCalendar()
    return
  }
  calendarMonth.value = getOpenMonth()
  calendarOpen.value = true
}

const switchCalendarMonth = (offset) => {
  const nextMonth = addMonths(calendarMonth.value, offset)
  if (offset < 0 && props.minDate && nextMonth < props.minDate.slice(0, 7)) return
  if (offset > 0 && props.maxDate && nextMonth > props.maxDate.slice(0, 7)) return
  calendarMonth.value = nextMonth
}

const selectDate = (date) => {
  emit('update:modelValue', date)
  closeCalendar()
}

const clearDate = () => {
  emit('update:modelValue', '')
  closeCalendar()
}

const selectToday = () => {
  if (isTodayDisabled.value) return
  emit('update:modelValue', todayValue.value)
  closeCalendar()
}

const onClickOutside = (event) => {
  if (calendarRef.value && !calendarRef.value.contains(event.target)) {
    closeCalendar()
  }
}

watch(
  () => props.modelValue,
  (value) => {
    if (value) {
      calendarMonth.value = value.slice(0, 7)
      return
    }
    calendarMonth.value = getOpenMonth()
  }
)

onMounted(() => {
  document.addEventListener('click', onClickOutside)
})

onBeforeUnmount(() => {
  document.removeEventListener('click', onClickOutside)
})
</script>
