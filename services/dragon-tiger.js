export async function fetchLatestTradeDate($api) {
  const res = await $api('/dragon-tiger/latest-trade-date', { method: 'GET' })
  return res.tradeDate
}

export async function fetchPrevTradeDate($api, tradeDate) {
  const res = await $api('/dragon-tiger/prev-trade-date', { method: 'GET', params: { tradeDate } })
  return res.tradeDate
}

export async function fetchNextTradeDate($api, tradeDate) {
  const res = await $api('/dragon-tiger/next-trade-date', { method: 'GET', params: { tradeDate } })
  return res.tradeDate
}

export async function fetchLhbRecords($api, tradeDate) {
  return await $api('/dragon-tiger/lhb-records', { method: 'GET', params: { tradeDate } })
}

