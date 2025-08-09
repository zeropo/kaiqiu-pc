export async function fetchUmpireList($api, { level, city, page } = {}) {
  return await $api('/umpire/lists', { method: 'POST', body: { level, city, page } })
}

export async function fetchUmpireDetail($api, { id }) {
  return await $api('/Trainer/detail', { method: 'GET', params: { id, ump: 1 } })
}

