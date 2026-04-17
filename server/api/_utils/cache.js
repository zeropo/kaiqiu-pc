import { createHash } from 'node:crypto'

import { readEventBody } from './body'
import { okOrThrow } from './form'
import proxy from './request'

function stableSerialize(value) {
  if (Array.isArray(value)) {
    return `[${value.map(stableSerialize).join(',')}]`
  }

  if (value && typeof value === 'object') {
    return `{${Object.keys(value).sort().map((key) => `${JSON.stringify(key)}:${stableSerialize(value[key])}`).join(',')}}`
  }

  return JSON.stringify(value)
}

function buildCacheKey(prefix, body) {
  const digest = createHash('sha1').update(stableSerialize(body)).digest('hex')
  return `${prefix}:${digest}`
}

export function createCachedPostProxyHandler(path, { maxAge = 60, keyPrefix = path } = {}) {
  return defineCachedEventHandler(async (event) => {
    const res = await proxy(event, 'POST', path)
    return okOrThrow(res)
  }, {
    maxAge,
    swr: true,
    getKey: async (event) => buildCacheKey(keyPrefix, await readEventBody(event))
  })
}
