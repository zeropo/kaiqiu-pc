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

export async function fetchMatchGroups($api, { eventId, itemId }) {
  return await $api('/match/get_groups', {
    method: 'GET',
    params: {
      eventid: eventId,
      itemid: itemId
    }
  })
}

export async function fetchMatchAllHonors($api, { eventId }) {
  return await $api('/match/get_all_honors', {
    method: 'GET',
    params: {
      eventid: eventId
    }
  })
}

export async function fetchMatchIncrementResult($api, { eventId, itemId, posttime = 0 }) {
  return await $api('/match/getIncrementResult', {
    method: 'GET',
    params: {
      eventid: eventId,
      itemid: itemId,
      posttime
    }
  })
}

export async function fetchMatchScoreChange($api, { eventid }) {
  return await $api('/match/getScoreChange2', {
    method: 'GET',
    params: { eventid }
  })
}

export async function fetchMatchGameIdByPlayers($api, { eventId, itemId, uid1, uid2 }) {
  return await $api('/match/getGameidByUIDAndMatchItem', {
    method: 'GET',
    params: {
      eventid: eventId,
      itemid: itemId,
      uid1,
      uid2
    }
  })
}

export async function fetchMatchGameDetail($api, { gameId }) {
  return await $api('/match/getGameDetail', {
    method: 'GET',
    params: {
      gameid: gameId
    }
  })
}
