import { create } from 'zustand'
import { authApi, usersApi, getAccessToken, clearTokens } from '@/api'

export const useAuthStore = create((set, get) => ({
  user: null,
  bootstrapped: false,
  loading: false,
  error: null,

  async bootstrap() {
    if (!getAccessToken()) {
      set({ user: null, bootstrapped: true })
      return null
    }
    try {
      const user = await usersApi.me()
      set({ user, bootstrapped: true, error: null })
      return user
    } catch {
      clearTokens()
      set({ user: null, bootstrapped: true })
      return null
    }
  },

  async sendOtp(phone) {
    set({ loading: true, error: null })
    try {
      const data = await authApi.sendOtp(phone)
      set({ loading: false })
      return data
    } catch (error) {
      set({ loading: false, error: error.message })
      throw error
    }
  },

  async verifyOtp(phone, otp) {
    set({ loading: true, error: null })
    try {
      const data = await authApi.verifyOtp(phone, otp)
      set({ user: data.user, loading: false })
      return data
    } catch (error) {
      set({ loading: false, error: error.message })
      throw error
    }
  },

  async logout() {
    await authApi.logout()
    set({ user: null })
  },

  setUser(user) {
    set({ user })
  },
}))
