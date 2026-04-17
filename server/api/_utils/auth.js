import { useRuntimeConfig } from '#imports'
import { createError } from 'h3'
import { deleteCookie, getCookie, setCookie } from 'h3'

import { toFormData } from './form'

const TOKEN_COOKIE = 'kq_auth_token'
const USER_ID_COOKIE = 'kq_auth_user_id'
const READY_COOKIE = 'kq_auth_ready'
const COOKIE_MAX_AGE = 60 * 60 * 24 * 365
const SHARED_AUTH_MAX_AGE = 60 * 30 * 1000

let sharedAuth = null
let sharedAuthExpiresAt = 0
let sharedAuthPromise = null

function buildCookieOptions(httpOnly = true) {
  return {
    path: '/',
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    httpOnly,
    maxAge: COOKIE_MAX_AGE
  }
}

function setReadyCookie(event, value = '1') {
  setCookie(event, READY_COOKIE, value, buildCookieOptions(false))
}

function getSharedKqAuth() {
  if (!sharedAuth || Date.now() >= sharedAuthExpiresAt) {
    sharedAuth = null
    sharedAuthExpiresAt = 0
    return null
  }

  return sharedAuth
}

function setSharedKqAuth(auth) {
  if (!auth?.token) return

  sharedAuth = {
    token: auth.token,
    userId: auth.userId || '',
    username: auth.username || '',
    authenticated: true
  }
  sharedAuthExpiresAt = Date.now() + SHARED_AUTH_MAX_AGE
}

export function clearKqAuth(event) {
  sharedAuth = null
  sharedAuthExpiresAt = 0
  sharedAuthPromise = null
  deleteCookie(event, TOKEN_COOKIE, { path: '/' })
  deleteCookie(event, USER_ID_COOKIE, { path: '/' })
  deleteCookie(event, READY_COOKIE, { path: '/' })
}

export function getStoredKqAuth(event) {
  const token = getCookie(event, TOKEN_COOKIE)
  const userId = getCookie(event, USER_ID_COOKIE)

  if (!token) return null

  return {
    token,
    userId: userId || '',
    username: '',
    authenticated: true
  }
}

function persistKqAuth(event, auth) {
  setSharedKqAuth(auth)
  setCookie(event, TOKEN_COOKIE, auth.token, buildCookieOptions(true))

  if (auth.userId) {
    setCookie(event, USER_ID_COOKIE, auth.userId, buildCookieOptions(true))
  } else {
    deleteCookie(event, USER_ID_COOKIE, { path: '/' })
  }

  setReadyCookie(event)
}

function getSilentLoginConfig() {
  const config = useRuntimeConfig()
  const auth = config.kqSilentAuth || {}

  return {
    baseUrl: config.kqBaseUrl,
    account: auth.account,
    password: auth.password,
    openId: auth.openId
  }
}

export function buildKqAuthHeaders(auth) {
  if (!auth?.token) return {}

  return auth.userId
    ? { token: auth.token, user_id: auth.userId }
    : { token: auth.token }
}

export async function loginKq(event) {
  const config = getSilentLoginConfig()

  if (!config.account || !config.password || !config.openId) {
    throw createError({
      statusCode: 500,
      statusMessage: '开球网静默登录配置缺失'
    })
  }

  const response = await $fetch(`${config.baseUrl}/user/login`, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    body: toFormData({
      account: config.account,
      password: config.password,
      open_id: config.openId
    })
  })

  const userinfo = response?.data?.userinfo

  if (response?.code !== 1 || !userinfo?.token) {
    throw createError({
      statusCode: 500,
      statusMessage: response?.msg || '开球网静默登录失败'
    })
  }

  const auth = {
    token: userinfo.token,
    userId: userinfo.user_id || userinfo.id || '',
    username: userinfo.username || '',
    authenticated: true,
    response
  }

  persistKqAuth(event, auth)

  return auth
}

export async function ensureKqAuth(event, { force = false, throwOnError = false } = {}) {
  const existing = force ? null : getStoredKqAuth(event)

  if (existing?.token) {
    setSharedKqAuth(existing)
    setReadyCookie(event)
    return existing
  }

  const shared = force ? null : getSharedKqAuth()

  if (shared?.token) {
    setReadyCookie(event)
    return shared
  }

  try {
    if (!sharedAuthPromise) {
      sharedAuthPromise = loginKq(event).finally(() => {
        sharedAuthPromise = null
      })
    }

    return await sharedAuthPromise
  } catch (error) {
    clearKqAuth(event)

    if (throwOnError) throw error

    return null
  }
}

export function buildSilentLoginPayload(auth) {
  return {
    code: 1,
    msg: '登录成功',
    time: String(Math.floor(Date.now() / 1000)),
    data: {
      authenticated: true,
      user_id: auth?.userId || '',
      username: auth?.username || ''
    }
  }
}
