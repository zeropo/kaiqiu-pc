import proxy from '../_utils/request'
import { okOrThrow } from '../_utils/form'

const TOP_UID_FIELDS = [
  'Top3ManOfBeat',
  'Top3WomanOfBeat',
  'Top3OfBeat',
  'TopPlayer'
]

function normalizeTopUidValue(value) {
  const text = String(value ?? '').trim()
  if (!text || text === '0') return text

  const hasTrailingComma = text.endsWith(',')
  const uidList = text
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean)

  if (uidList.length < 3) return text

  const normalizedUidList = []
  for (let index = 0; index < uidList.length; index += 3) {
    const chunk = uidList.slice(index, index + 3)
    if (chunk.length === 3) {
      normalizedUidList.push(chunk[2], chunk[1], chunk[0])
      continue
    }
    normalizedUidList.push(...chunk)
  }

  const normalizedText = normalizedUidList.join(',')
  return hasTrailingComma ? `${normalizedText},` : normalizedText
}

function normalizeAdvProfileData(data) {
  if (!data || typeof data !== 'object' || Array.isArray(data)) return data

  const nextData = { ...data }
  TOP_UID_FIELDS.forEach((field) => {
    nextData[field] = normalizeTopUidValue(nextData[field])
  })
  return nextData
}

export default defineEventHandler(async (event) => {
  const res = await proxy(event, 'GET', '/User/adv_profile')
  const result = okOrThrow(res)

  if (!result || typeof result !== 'object') return result

  return {
    ...result,
    data: normalizeAdvProfileData(result.data)
  }
})

