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
  const data = await $fetch(url)
  const first = data.result.data[0]
  return { tradeDate: first.TRADE_DATE.slice(0, 10) }
})

