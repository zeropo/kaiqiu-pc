export async function fetchTopList($api, { city } = {}) {
  return await $api('/Top/lists', { method: 'POST', body: { city } })
}

export async function fetchTopDetail($api, { tid, city } = {}) {
  return await $api('/Top/getTop100Data', { method: 'GET', params: { tid, city } })
}

