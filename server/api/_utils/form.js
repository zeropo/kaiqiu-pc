export function toFormData(body = {}) {
  const pairs = []
  Object.entries(body).forEach(([k, v]) => {
    if (v === undefined || v === null || v === '') return
    pairs.push(`${encodeURIComponent(k)}=${encodeURIComponent(String(v))}`)
  })
  return pairs.join('&')
}

export function okOrThrow(res) {
  if (res && typeof res === 'object' && 'code' in res && res.code !== 1) {
    const err = createError({ statusCode: 500, statusMessage: res.msg || '接口返回异常' })
    throw err
  }
  return res
}

