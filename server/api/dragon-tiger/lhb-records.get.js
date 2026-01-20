const BASE_URL = 'https://datacenter-web.eastmoney.com/api/data/v1/get'
const BUY_REPORT = 'RPT_BILLBOARD_DAILYDETAILSBUY'
const DAILY_REPORT = 'RPT_DAILYBILLBOARD_DETAILS'
const BUY_COLUMNS = 'ALL'
const DAILY_COLUMNS = 'SECURITY_CODE,SECURITY_NAME_ABBR,TRADE_DATE'

const buildParams = (extra) => {
  const params = new URLSearchParams({
    pageNumber: '1',
    pageSize: '200',
    sortColumns: 'TRADE_DATE',
    sortTypes: '-1',
    source: 'WEB',
    client: 'WEB',
    ...extra
  })
  return params.toString()
}

const fetchNames = async (tradeDate) => {
  const filter = `(TRADE_DATE='${tradeDate}')`
  const url = `${BASE_URL}?${buildParams({
    reportName: DAILY_REPORT,
    columns: DAILY_COLUMNS,
    filter,
    pageSize: '5000',
    sortColumns: 'SECURITY_CODE',
    sortTypes: '1'
  })}`
  const data = await $fetch(url)
  const rows = data.result.data
  const map = {}
  for (const row of rows) map[row.SECURITY_CODE] = row.SECURITY_NAME_ABBR
  return map
}

export default defineEventHandler(async (event) => {
  const { tradeDate } = getQuery(event)
  if (!tradeDate) throw createError({ statusCode: 400, statusMessage: '缺少tradeDate' })
  const nameMap = await fetchNames(tradeDate)

  const filter = `(TRADE_DATE='${tradeDate}')`
  const url = `${BASE_URL}?${buildParams({
    reportName: BUY_REPORT,
    columns: BUY_COLUMNS,
    filter,
    pageSize: '5000',
    sortColumns: 'BUY',
    sortTypes: '-1'
  })}`
  const data = await $fetch(url)
  const rows = data.result.data
  return rows.map((row) => ({
    date: row.TRADE_DATE.slice(0, 10),
    code: row.SECURITY_CODE,
    name: nameMap[row.SECURITY_CODE] || '',
    deptName: row.OPERATEDEPT_NAME,
    buyAmt: Number(row.BUY),
    sellAmt: row.SELL == null ? 0 : Number(row.SELL)
  }))
})

