export async function fetchTrainerList($api, { type, city, lat, lng, page, sort } = {}) {
  return await $api('/trainer/lists', { method: 'POST', body: { type, city, lat, lng, page, sort } })
}

export async function fetchTrainerDetail($api, { id }) {
  return await $api('/Trainer/detail', { method: 'GET', params: { id, ump: 0 } })
}

