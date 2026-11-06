import { api, unwrap } from './client'

export const ordersApi = {
  async fees() {
    const { data } = unwrap(await api.get('/orders/fees/current'))
    return data?.config
  },

  async place(payload) {
    const { data } = unwrap(await api.post('/orders', payload))
    return data
  },

  async mine(params = {}) {
    const { data, meta } = unwrap(await api.get('/orders/mine', { params }))
    return { orders: data?.orders || [], meta }
  },

  async get(id) {
    const { data } = unwrap(await api.get(`/orders/${id}`))
    return data?.order || data
  },

  async cancel(id, body = {}) {
    const { data } = unwrap(await api.patch(`/orders/${id}/cancel`, body))
    return data?.order
  },

  // Vendor endpoints
  async getRestaurantOrders(restaurantId, params = {}) {
    const { data, meta } = unwrap(await api.get(`/orders/restaurant/${restaurantId}`, { params }))
    return { orders: data?.orders || [], meta }
  },

  async updateStatus(orderId, status, payload = {}) {
    const { data } = unwrap(await api.patch(`/orders/${orderId}/status`, { status, ...payload }))
    return data?.order || data
  },
}
