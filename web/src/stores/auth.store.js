import { create } from 'zustand'
import { authApi, usersApi, vendorsApi, getAccessToken, clearTokens } from '@/api'

export const useAuthStore = create((set, get) => ({
  user: null,
  vendorStatus: null, // null | 'none' | 'pending' | 'approved' | 'active_seller'
  bootstrapped: false,
  loading: false,
  error: null,

  async bootstrap() {
    if (!getAccessToken()) {
      set({ user: null, vendorStatus: null, bootstrapped: true })
      return null
    }
    try {
      const user = await usersApi.me()
      set({ user, bootstrapped: true, error: null })
      get().checkVendorStatus().catch(() => {})
      return user
    } catch {
      clearTokens()
      set({ user: null, vendorStatus: null, bootstrapped: true })
      return null
    }
  },

  async login(payload) {
    set({ loading: true, error: null })
    try {
      const data = await authApi.login(payload)
      set({ user: data.user, loading: false })
      get().checkVendorStatus().catch(() => {})
      return data
    } catch (error) {
      set({ loading: false, error: error.message })
      throw error
    }
  },

  async register(payload) {
    set({ loading: true, error: null })
    try {
      const data = await authApi.register(payload)
      set({ loading: false })
      return data
    } catch (error) {
      set({ loading: false, error: error.message })
      throw error
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
      get().checkVendorStatus().catch(() => {})
      return data
    } catch (error) {
      set({ loading: false, error: error.message })
      throw error
    }
  },

  async loginWithGoogle(googlePayload) {
    set({ loading: true, error: null })
    try {
      const data = await authApi.loginWithGoogle(googlePayload)
      set({ user: data.user, loading: false })
      get().checkVendorStatus().catch(() => {})
      return data
    } catch (error) {
      set({ loading: false, error: error.message })
      throw error
    }
  },

  async checkVendorStatus() {
    const user = get().user
    if (!user) {
      set({ vendorStatus: null })
      return null
    }

    if (['restaurant_owner', 'merchant_owner'].includes(user.role)) {
      set({ vendorStatus: 'active_seller' })
      return 'active_seller'
    }

    try {
      const app = await vendorsApi.myApplication()
      if (app) {
        const status = app.approval?.status || app.status || 'pending'
        set({ vendorStatus: status })
        return status
      }
    } catch {
      // No application found
    }

    set({ vendorStatus: 'none' })
    return 'none'
  },

  async logout() {
    try {
      await authApi.logout()
    } finally {
      clearTokens()
      set({ user: null, vendorStatus: null })
    }
  },

  setUser(user) {
    set({ user })
  },
}))
