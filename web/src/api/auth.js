import { api, unwrap, saveTokens, clearTokens } from './client'

export const authApi = {
  async sendOtp(phone) {
    const { data } = unwrap(await api.post('/auth/otp/send', { phone }))
    return data
  },

  async verifyOtp(phone, otp) {
    const { data } = unwrap(await api.post('/auth/otp/verify', { phone, otp }))
    if (data?.accessToken) saveTokens(data.accessToken, data.refreshToken)
    return data
  },

  async login(payload) {
    const { data } = unwrap(await api.post('/auth/login', payload))
    if (data?.accessToken) saveTokens(data.accessToken, data.refreshToken)
    return data
  },

  async loginWithGoogle(payload) {
    // payload: { email, name, avatar, googleId } decoded from Google credential
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
