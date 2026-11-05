import { api, unwrap } from './client'

export const searchApi = {
  async restaurants(params) {
    const { data, meta } = unwrap(await api.get('/search/restaurants', { params }))
    return { restaurants: data?.restaurants || [], meta }
  },

  async items(params) {
    const { data, meta } = unwrap(await api.get('/search/items', { params }))
    return { items: data?.items || data?.menuItems || [], meta }
  },

  async recommended(params = {}) {
    const { data } = unwrap(await api.get('/search/recommended', { params }))
    return data?.items || data?.products || []
  },
}
