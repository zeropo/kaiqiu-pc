export async function fetchUserListByScore($api, { city, now, sort = 2, page = 1, index = 0 } = {}) {
  return await $api('/user/lists', { method: 'POST', body: { city, now, sort, page, index } })
}

export async function searchUsers($api, { key, page = 1 } = {}) {
  return await $api('/user/lists', { method: 'GET', params: { key, page } })
}

export async function fetchHotUsers($api) {
  return await $api('/user/hotlists', { method: 'POST' })
}

export async function fetchAdvProfile($api, { uid }) {
  return await $api('/user/adv_profile', { method: 'GET', params: { uid } })
}

export async function fetchUserScores($api, { uid }) {
  return await $api('/user/getUserScores', { method: 'GET', params: { uid } })
}

export async function fetchUserGames($api, { uid, page = 1 } = {}) {
  return await $api('/user/getGames', { method: 'GET', params: { uid, page } })
}

