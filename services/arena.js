export async function fetchArenaList($api, { city, lat, lng, page, sort } = {}) {
  return await $api('/arena/lists', { method: 'POST', body: { city, lat, lng, page, sort } })
}

export async function fetchArenaDetail($api, { id, lat, lng }) {
  return await $api('/arena/detail', { method: 'GET', params: { id, lat, lng } })
}

export async function fetchArenaTrainers($api, { id, page } = {}) {
  return await $api('/arena/trainer_list', { method: 'POST', body: { id, page } })
}

export async function fetchArenaMatches($api, { id, page } = {}) {
  return await $api('/arena/match_list', { method: 'POST', body: { id, page } })
}

