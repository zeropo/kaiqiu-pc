export async function fetchMatchList($api, { city, cityName, lat, lng, sort, page } = {}) {
  return await $api('/match/lists', { method: 'POST', body: { city, cityName, lat, lng, sort, page } })
}

export async function fetchMatchDetail($api, { id, lat, lng }) {
  return await $api('/enter/detail', { method: 'GET', params: { id, lat, lng } })
}

export async function fetchMatchMemberDetail($api, { id, matchId }) {
  return await $api('/enter/get_member_detail', {
    method: 'GET',
    params: {
      id,
      match_id: matchId
    }
  })
}
