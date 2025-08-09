export async function fetchMatchList($api, { city, lat, lng, sort, page } = {}) {
  return await $api('/match/lists', { method: 'POST', body: { city, lat, lng, sort, page } })
}

export async function fetchMatchDetail($api, { id, lat, lng }) {
  return await $api('/enter/detail', { method: 'GET', params: { id, lat, lng } })
}

