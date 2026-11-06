import { api, unwrap, saveTokens, clearTokens } from './client'

export const authApi = {
  async register(payload) {
    const { data } = unwrap(await api.post('/auth/register', payload))
    return data
  },

  async login(payload) {
    const { data } = unwrap(await api.post('/auth/login', payload))
    if (data?.accessToken) saveTokens(data.accessToken, data.refreshToken)
    return data
  },

  async sendOtp(phone) {
    const { data } = unwrap(await api.post('/auth/otp/send', { phone }))
    return data
  },

  async verifyOtp(phone, otp) {
    const { data } = unwrap(await api.post('/auth/otp/verify', { phone, otp }))
    if (data?.accessToken) saveTokens(data.accessToken, data.refreshToken)
    return data
  },

  async loginWithGoogle(payload) {
    const { data } = unwrap(await api.post('/auth/google', payload))
    if (data?.accessToken) saveTokens(data.accessToken, data.refreshToken)
    return data
  },

  async logout() {
    try {
      await api.post('/auth/logout')
    } finally {
      clearTokens()
    }
  },
}
