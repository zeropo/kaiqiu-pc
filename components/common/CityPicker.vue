<template>
  <div>
    <label class="block text-sm text-gray-500 mb-1">城市</label>
    <div class="flex gap-2">
      <input v-model="model" placeholder="如：杭州市" class="flex-1 h-11 px-3 rounded-btn border border-gray-200" />
      <button @click="useLocate" type="button" class="h-11 px-3 rounded-btn border border-gray-200">定位</button>
    </div>
  </div>
</template>

<script setup>
const model = defineModel({ type: String, default: '' })
const { tryGeolocation } = useCity()
const useLocate = async () => {
  await tryGeolocation()
}
</script>

