import axios from 'axios'
import { config } from '@/lib/config'

export const api = axios.create({
  baseURL: config.apiUrl,
  timeout: 20000,
  headers: { 'Content-Type': 'application/json' },
  withCredentials: true,
})

export function getAccessToken() {
  return localStorage.getItem(config.tokenKey)
}

export function getRefreshToken() {
  return localStorage.getItem(config.refreshKey)
}

export function saveTokens(accessToken, refreshToken) {
  if (accessToken) localStorage.setItem(config.tokenKey, accessToken)
  if (refreshToken) localStorage.setItem(config.refreshKey, refreshToken)
}

export function clearTokens() {
  localStorage.removeItem(config.tokenKey)
  localStorage.removeItem(config.refreshKey)
}

api.interceptors.request.use((req) => {
  const token = getAccessToken()
  if (token) {
    req.headers.Authorization = `Bearer ${token}`
  }
  return req
})

let refreshing = false
let queue = []

function flushQueue(error) {
  queue.forEach(({ resolve, reject }) => (error ? reject(error) : resolve()))
  queue = []
}

api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config
    const status = error.response?.status
    const url = original?.url || ''

    if (
      status !== 401 ||
      !original ||
      original._retry ||
      url.includes('/auth/login') ||
      url.includes('/auth/otp') ||
      url.includes('/auth/refresh')
    ) {
      return Promise.reject(normalizeError(error))
    }

    if (refreshing) {
      return new Promise((resolve, reject) => {
        queue.push({ resolve, reject })
      }).then(() => api(original))
    }

    original._retry = true
    refreshing = true

    try {
      const refreshToken = getRefreshToken()
      if (!refreshToken) throw error

      const { data } = await axios.post(
        `${config.apiUrl}/auth/refresh`,
        { refreshToken },
        { withCredentials: true },
      )
      const payload = data?.data || {}
      saveTokens(payload.accessToken, payload.refreshToken || refreshToken)
      flushQueue(null)
      return api(original)
    } catch (err) {
      flushQueue(err)
      clearTokens()
      return Promise.reject(normalizeError(err))
    } finally {
      refreshing = false
    }
  },
)

export function normalizeError(error) {
  const message =
    error?.response?.data?.message ||
    error?.message ||
    'Something went wrong. Please try again.'
  const err = new Error(message)
  err.status = error?.response?.status
  err.code = error?.response?.data?.code
  err.payload = error?.response?.data
  return err
}

export function unwrap(response) {
  return {
    data: response.data?.data ?? response.data,
    meta: response.data?.meta ?? null,
    message: response.data?.message,
  }
}
