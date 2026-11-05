import { api, unwrap } from './client'

export const feedApi = {
  async bootstrap() {
    const { data } = unwrap(await api.get('/config/bootstrap'))
    return data
  },

  async home({ lat, lng, isVeg } = {}) {
    const { data } = unwrap(
      await api.get('/feed/home', {
        params: {
          ...(lat != null && { lat }),
          ...(lng != null && { lng }),
          ...(isVeg != null && { isVeg }),
        },
      }),
    )
    return data
  },

  async banners(section) {
    const { data } = unwrap(
      await api.get('/banners', { params: section ? { section } : undefined }),
    )
    return data?.banners || data?.items || []
  },

  async cuisines() {
    const { data } = unwrap(await api.get('/masters/cuisines'))
    return data?.cuisines || []
  },
}
