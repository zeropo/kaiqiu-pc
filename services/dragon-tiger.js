export async function fetchLatestTradeDate($api) {
  const res = await $api('/dragon-tiger/latest-trade-date', { method: 'GET' })
  return res.tradeDate
}

export async function fetchLhbRecords($api, tradeDate) {
  return await $api('/dragon-tiger/lhb-records', { method: 'GET', params: { tradeDate } })
}

