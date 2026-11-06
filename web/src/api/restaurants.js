import { api, unwrap } from './client'

export const restaurantsApi = {
  async nearby({ lat, lng, radius = 10, page = 1, limit = 24, cuisine, isVeg } = {}) {
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

  async create(payload) {
    const { data } = unwrap(await api.post('/restaurants', payload))
    return data?.restaurant || data
  },

  async update(id, payload) {
    const { data } = unwrap(await api.patch(`/restaurants/${id}`, payload))
    return data?.restaurant || data
  },

  async toggleOpen(id) {
    const { data } = unwrap(await api.patch(`/restaurants/${id}/toggle-open`))
    return data
  },

  async menu(restaurantId) {
    const { data } = unwrap(await api.get(`/restaurants/${restaurantId}/menu`))
    return data?.menu || []
  },

  // Menu Category operations (Vendor)
  async addCategory(restaurantId, payload) {
    const { data } = unwrap(await api.post(`/restaurants/${restaurantId}/menu/categories`, payload))
    return data
  },

  async updateCategory(restaurantId, categoryId, payload) {
    const { data } = unwrap(await api.patch(`/restaurants/${restaurantId}/menu/categories/${categoryId}`, payload))
    return data
  },

  async deleteCategory(restaurantId, categoryId) {
    const { data } = unwrap(await api.delete(`/restaurants/${restaurantId}/menu/categories/${categoryId}`))
    return data
  },

  // Menu Item operations (Vendor)
  async addItem(restaurantId, payload) {
    const { data } = unwrap(await api.post(`/restaurants/${restaurantId}/menu/items`, payload))
    return data
  },

  async updateItem(restaurantId, itemId, payload) {
    const { data } = unwrap(await api.patch(`/restaurants/${restaurantId}/menu/items/${itemId}`, payload))
    return data?.item || data
  },

  async toggleItemAvailability(restaurantId, itemId) {
    const { data } = unwrap(await api.patch(`/restaurants/${restaurantId}/menu/items/${itemId}/availability`))
    return data
  },

  async deleteItem(restaurantId, itemId) {
    const { data } = unwrap(await api.delete(`/restaurants/${restaurantId}/menu/items/${itemId}`))
    return data
  },

  async reviews(restaurantId, params = {}) {
    const { data, meta } = unwrap(
      await api.get(`/reviews/restaurant/${restaurantId}`, { params }),
    )
    return { reviews: data?.reviews || [], meta }
  },
}
