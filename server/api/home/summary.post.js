import { readEventBody } from '../_utils/body'
import { okOrThrow } from '../_utils/form'
import proxy from '../_utils/request'

const HOME_CACHE_MAX_AGE = 60
const HOME_SUMMARY_CACHE_VERSION = 'v2'
const FEATURED_PLAYERS_CITY = '-1'
const FEATURED_PLAYERS_INDEX = 11111
const MATCH_PAGE_LIMIT = 2
const MATCH_END_GRACE_HOURS = 12

const DEFAULT_CITY = '杭州市'
const DEFAULT_LAT = '30.184'
const DEFAULT_LNG = '120.204'

function normalizeText(value) {
  return String(value ?? '').trim()
}

function parseChinaDateTime(value) {
  const text = normalizeText(value)
  if (!text || text === '0') return null

  if (/^\d{10}$/.test(text)) {
    const date = new Date(Number(text) * 1000)
    return Number.isNaN(date.getTime()) ? null : date
  }

  if (/^\d{13}$/.test(text)) {
    const date = new Date(Number(text))
    return Number.isNaN(date.getTime()) ? null : date
  }

  const normalized = text.replace(/\//g, '-').replace(' ', 'T')
  const withTime = /^\d{4}-\d{2}-\d{2}$/.test(normalized) ? `${normalized}T00:00` : normalized
  const date = new Date(`${withTime}+08:00`)
  return Number.isNaN(date.getTime()) ? null : date
}

function parseDistance(match, fallback = Infinity) {
  const value = Number(match?.juli)
  if (Number.isFinite(value)) return value

  const textValue = parseFloat(match?.distance)
  return Number.isFinite(textValue) ? textValue : fallback
}

function parseGrade(match) {
  const value = Number(match?.grade)
  return Number.isFinite(value) && value > 0 ? value : 0
}

function getMatchState(match, now = new Date()) {
  const status = normalizeText(match?.status)
  const ifend = normalizeText(match?.ifend)
  const start = parseChinaDateTime(match?.starttime)
  const deadline = parseChinaDateTime(match?.deadline)
  const end = parseChinaDateTime(match?.endtime)
  const nowTime = now.getTime()

  if (ifend && ifend !== '0') return { ended: true, status: status || '已结束' }
  if (status.includes('积分已计算')) return { ended: true, status }
  if (status.includes('已结束') && !status.includes('报名已结束')) return { ended: true, status }

  if (end && nowTime > end.getTime()) return { ended: true, status: '已结束' }

  if (start) {
    const endGraceTime = start.getTime() + MATCH_END_GRACE_HOURS * 60 * 60 * 1000
    if (nowTime > endGraceTime) return { ended: true, status: '已结束' }
    if (nowTime >= start.getTime()) return { ended: false, status: '比赛中' }
  }

  if (deadline && nowTime > deadline.getTime()) {
    return { ended: false, status: '报名已结束' }
  }

  return { ended: false, status: status || '报名中' }
}

function compareHomeMatches(a, b) {
  const distanceDiff = parseDistance(a) - parseDistance(b)
  if (distanceDiff !== 0) return distanceDiff

  const startA = parseChinaDateTime(a?.starttime)?.getTime() ?? Infinity
  const startB = parseChinaDateTime(b?.starttime)?.getTime() ?? Infinity
  if (startA !== startB) return startA - startB

  const gradeDiff = parseGrade(b) - parseGrade(a)
  if (gradeDiff !== 0) return gradeDiff

  return normalizeText(a?.eventid).localeCompare(normalizeText(b?.eventid))
}

function dedupeByEventId(rows = []) {
  const mapped = new Map()

  rows.forEach((row, index) => {
    const key = normalizeText(row?.eventid) || `${normalizeText(row?.title)}-${normalizeText(row?.starttime)}-${index}`
    const prev = mapped.get(key)
    mapped.set(key, prev ? { ...prev, ...row } : row)
  })

  return Array.from(mapped.values())
}

function buildMatchCards(rows = [], now = new Date()) {
  return dedupeByEventId(rows)
    .map((match) => {
      const state = getMatchState(match, now)
      return {
        ...match,
        status: state.status,
        displayStatus: state.status,
        _homeEnded: state.ended
      }
    })
    .filter((match) => !match._homeEnded)
    .sort(compareHomeMatches)
    .slice(0, 4)
    .map(({ _homeEnded, ...match }) => match)
}

function buildFeaturedUsers(rows = []) {
  const userList = Array.isArray(rows) ? rows : []

  return userList
    .slice()
    .sort((a, b) => (Number(b?.score) || 0) - (Number(a?.score) || 0))
    .slice(0, 4)
}

function buildCacheKey(body = {}) {
  return [
    HOME_SUMMARY_CACHE_VERSION,
    normalizeText(body.city) || DEFAULT_CITY,
    normalizeText(body.lat) || DEFAULT_LAT,
    normalizeText(body.lng) || DEFAULT_LNG
  ].join(':')
}

export default defineCachedEventHandler(async (event) => {
  const body = await readEventBody(event)
  const city = normalizeText(body.city) || DEFAULT_CITY
  const lat = normalizeText(body.lat) || DEFAULT_LAT
  const lng = normalizeText(body.lng) || DEFAULT_LNG

  const matchRequests = Array.from({ length: MATCH_PAGE_LIMIT }, (_, index) => {
    return proxy(event, 'POST', '/match/lists', {
      body: { city, lat, lng, page: index + 1, sort: 2 }
    })
  })

  const [matchResults, userRes] = await Promise.all([
    Promise.all(matchRequests),
    proxy(event, 'POST', '/user/lists', {
      body: {
        city: FEATURED_PLAYERS_CITY,
        now: city,
        sort: 2,
        page: 1,
        index: FEATURED_PLAYERS_INDEX
      }
    })
  ])

  const matchRows = matchResults.flatMap((res) => {
    const checked = okOrThrow(res)
    return Array.isArray(checked?.data?.data) ? checked.data.data : []
  })
  const checkedUserRes = okOrThrow(userRes)

  return {
    matches: buildMatchCards(matchRows),
    users: buildFeaturedUsers(checkedUserRes?.data?.data),
    cachedAt: new Date().toISOString()
  }
}, {
  maxAge: HOME_CACHE_MAX_AGE,
  swr: true,
  getKey: async (event) => buildCacheKey(await readEventBody(event))
})
