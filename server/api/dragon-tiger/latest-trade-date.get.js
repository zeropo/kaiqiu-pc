const BASE_URL = 'https://datacenter-web.eastmoney.com/api/data/v1/get'
const DAILY_REPORT = 'RPT_DAILYBILLBOARD_DETAILS'
const DAILY_COLUMNS = 'SECURITY_CODE,SECURITY_NAME_ABBR,TRADE_DATE'

const buildParams = (extra) => {
  const params = new URLSearchParams({
    pageNumber: '1',
    pageSize: '1',
    sortColumns: 'TRADE_DATE',
    sortTypes: '-1',
    source: 'WEB',
    client: 'WEB',
    ...extra
  })
  return params.toString()
}

export default defineEventHandler(async () => {
  const url = `${BASE_URL}?${buildParams({ reportName: DAILY_REPORT, columns: DAILY_COLUMNS })}`
  try {
    const data = await $fetch(url, {
      responseType: 'json',
      headers: {
        Accept: 'application/json, text/plain, */*',
        Referer: 'https://data.eastmoney.com/',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      }
    })
    const rows = data && data.result && data.result.data ? data.result.data : []
    if (rows.length === 0) throw new Error('东财返回空数据')
    return { tradeDate: rows[0].TRADE_DATE.slice(0, 10) }
  } catch (e) {
    throw createError({ statusCode: 502, statusMessage: e && e.message ? e.message : '上游接口异常' })
  }
})

