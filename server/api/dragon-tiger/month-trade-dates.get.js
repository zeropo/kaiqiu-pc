const BASE_URL = 'https://datacenter-web.eastmoney.com/api/data/v1/get'
const DAILY_REPORT = 'RPT_DAILYBILLBOARD_DETAILS'
const DAILY_COLUMNS = 'TRADE_DATE'

const FETCH_OPTIONS = {
  responseType: 'json',
  headers: {
    Accept: 'application/json, text/plain, */*',
    Referer: 'https://data.eastmoney.com/',
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
  }
}

const buildParams = (extra) => {
  const params = new URLSearchParams({
    pageNumber: '1',
    pageSize: '10000',
    sortColumns: 'TRADE_DATE',
    sortTypes: '-1',
    source: 'WEB',
    client: 'WEB',
    ...extra
  })
  return params.toString()
}

const pad2 = (n) => String(n).padStart(2, '0')
const formatYmd = (d) => `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`

const getNextMonthStart = (month) => {
  const [year, mon] = month.split('-').map(Number)
  return formatYmd(new Date(year, mon, 1))
}

export default defineEventHandler(async (event) => {
  const { month } = getQuery(event)
  const value = Array.isArray(month) ? month[0] : month
  if (!value) throw createError({ statusCode: 400, statusMessage: '缺少month' })
  if (!/^\d{4}-\d{2}$/.test(value)) throw createError({ statusCode: 400, statusMessage: 'month格式错误' })

  const monthStart = `${value}-01`
  const nextMonthStart = getNextMonthStart(value)
  const filter = `(TRADE_DATE>='${monthStart} 00:00:00')(TRADE_DATE<'${nextMonthStart} 00:00:00')`
  const url = `${BASE_URL}?${buildParams({ reportName: DAILY_REPORT, columns: DAILY_COLUMNS, filter })}`
  try {
    const data = await $fetch(url, FETCH_OPTIONS)
    const rows = data && data.result && data.result.data ? data.result.data : []
    const tradeDates = [...new Set(rows.map((row) => row.TRADE_DATE.slice(0, 10)))].sort()
    return { tradeDates }
  } catch (e) {
    throw createError({ statusCode: 502, statusMessage: e && e.message ? e.message : '上游接口异常' })
  }
})
