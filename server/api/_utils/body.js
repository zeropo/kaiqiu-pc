function parseFormEncodedBody(raw = '') {
  const params = new URLSearchParams(raw)
  const parsed = {}

  for (const [key, value] of params.entries()) {
    parsed[key] = value
  }

  return parsed
}

export async function readEventBody(event) {
  if (event.context.requestBody !== undefined) {
    return event.context.requestBody
  }

  const payload = await readBody(event)

  if (!payload) {
    event.context.requestBody = {}
    return event.context.requestBody
  }

  if (typeof payload === 'string') {
    event.context.requestBody = parseFormEncodedBody(payload)
    return event.context.requestBody
  }

  if (payload instanceof URLSearchParams) {
    event.context.requestBody = Object.fromEntries(payload.entries())
    return event.context.requestBody
  }

  if (typeof payload === 'object') {
    event.context.requestBody = payload
    return event.context.requestBody
  }

  event.context.requestBody = {}
  return event.context.requestBody
}
