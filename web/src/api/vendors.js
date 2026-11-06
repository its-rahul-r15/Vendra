import { api, unwrap } from './client'

export const vendorsApi = {
  async list({ vertical, type, isOpen, page = 1, limit = 24, lat, lng, radiusM } = {}) {
    const { data, meta } = unwrap(
      await api.get('/vendors', {
        params: { vertical, type, isOpen, page, limit, lat, lng, radiusM },
      }),
    )
    return {
      vendors: data?.vendors || data?.items || [],
      meta,
    }
  },

  async get(id) {
    const { data } = unwrap(await api.get(`/vendors/${id}`))
    return data?.vendor || data
  },

  async apply(payload) {
    const { data, message } = unwrap(await api.post('/vendors/apply', payload))
    return { vendor: data?.vendor || data, message }
  },

  async myApplication() {
    const { data } = unwrap(await api.get('/vendors/my/application'))
    return data?.application || data?.vendor || data
  },

  async myRestaurants() {
    const { data } = unwrap(await api.get('/restaurants/owner/mine'))
    return data?.restaurants || []
  },
}

