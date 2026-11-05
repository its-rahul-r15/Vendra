import { api, unwrap } from './client'

export const restaurantsApi = {
  async nearby({ lat, lng, radius = 8, page = 1, limit = 24, cuisine, isVeg } = {}) {
    const { data, meta } = unwrap(
      await api.get('/restaurants/nearby', {
        params: { lat, lng, radius, page, limit, cuisine, isVeg },
      }),
    )
    return {
      restaurants: data?.restaurants || data?.items || [],
      meta,
    }
  },

  async list(params = {}) {
    const { data, meta } = unwrap(await api.get('/restaurants', { params }))
    return {
      restaurants: data?.restaurants || data?.items || [],
      meta,
    }
  },

  async get(id) {
    const { data } = unwrap(await api.get(`/restaurants/${id}`))
    return data?.restaurant || data
  },

  async menu(restaurantId) {
    const { data } = unwrap(await api.get(`/restaurants/${restaurantId}/menu`))
    return data?.menu || []
  },

  async reviews(restaurantId, params = {}) {
    const { data, meta } = unwrap(
      await api.get(`/reviews/restaurant/${restaurantId}`, { params }),
    )
    return { reviews: data?.reviews || [], meta }
  },
}
